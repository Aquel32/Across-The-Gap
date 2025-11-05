import { Connection, NodeData } from "@/lib/types";
import {
  Canvas,
  Circle,
  Line,
  Rect,
  SkPoint,
  vec,
} from "@shopify/react-native-skia";
import Matter, { Events, Vector } from "matter-js";
import { useEffect, useRef, useState } from "react";
import { Dimensions, View } from "react-native";
import {
  SharedValue,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

const CAR_WIDTH = 80;
const CAR_HEIGHT = 40;

const { height, width } = Dimensions.get("window");

export default function Simulation({
  nodes,
  connections,
}: {
  nodes: NodeData[];
  connections: Connection[];
}) {
  const [engine] = useState(() =>
    Matter.Engine.create({ gravity: { x: 0, y: 1 } })
  );
  const [world] = useState(() => engine.world);

  const nodePositions = useSharedValue(nodes.map((n) => vec(n.x, n.y)));
  const nodeBodies = useRef<Matter.Body[]>([]);

  const connectionsConstraints = useRef<Matter.Constraint[]>([]);
  const connectionsBodies = useRef<Matter.Body[]>([]);
  const internalConstraintsForces = useSharedValue<number[]>(
    connections.map((c) => 0)
  );

  const brokenBeams = useSharedValue<number[]>([]);
  const timePassed = useSharedValue<number>(0);
  const maxForce = useSharedValue<number>(0);

  const carData = useSharedValue<{ position: SkPoint; angle: number }>({
    position: vec(50, 100),
    angle: 0,
  });

  useEffect(() => {
    Matter.World.clear(world, false);
    brokenBeams.value = []

    const carCollisionFilter = Matter.Body.nextCategory();
    const carBody = Matter.Bodies.rectangle(
      carData.value.position.x,
      carData.value.position.y,
      CAR_WIDTH,
      CAR_HEIGHT,
      {
        mass: 5,
        restitution: 0.5,
        friction: 0.3,
        collisionFilter: { mask: carCollisionFilter },
      }
    );
    Matter.World.add(world, carBody);

    const initialBodies = nodes.map((node) => {
      return Matter.Bodies.circle(node.x, node.y, 5, {
        restitution: 0.8,
        friction: 0.01,
        isStatic: node.isStatic ?? false,
        mass: 100,
      });
    });
    nodeBodies.current = initialBodies;
    Matter.World.add(world, initialBodies);

    const initialConstraints = connections.map((conn) => {
      return Matter.Constraint.create({
        bodyA: initialBodies[conn.from],
        bodyB: initialBodies[conn.to],
        stiffness: conn.material.stiffness,
      });
    });
    connectionsConstraints.current = initialConstraints;
    Matter.World.add(world, initialConstraints);

    const constraintsCollisions = connections.map((conn) => {
      const from = nodes[conn.from];
      const to = nodes[conn.to];

      const distance = Math.sqrt(
        Math.pow(Math.abs(from.x - to.x), 2) +
        Math.pow(Math.abs(from.y - to.y), 2)
      );

      const angle = Math.atan2(to.y - from.y, to.x - from.x);
      return Matter.Bodies.rectangle(
        (from.x + to.x) / 2,
        (from.y + to.y) / 2,
        distance - 10,
        5,
        {
          angle,
          isStatic: true,
          collisionFilter: {
            category:
              conn.material.collideWithCar === true
                ? carCollisionFilter
                : undefined,
          },
        }
      );
    });
    connectionsBodies.current = constraintsCollisions;
    Matter.World.add(world, constraintsCollisions);

    const ground = Matter.Bodies.rectangle(width / 2, height, width, 70, {
      isStatic: true,
      mass: 1,
      collisionFilter: { category: carCollisionFilter },
    });
    Matter.World.add(world, ground);

    let animationFrame: number;

    const externalForceToAdd: Vector[] = connections.map((c) => ({ x: 0, y: 0 }));
    Events.on(engine, "collisionActive", (event) => {
      event.pairs.forEach((pair) => {

        let beamBody: Matter.Body | null = null;
        if (pair.bodyA === carBody && pair.bodyB !== ground) {
          beamBody = pair.bodyB;
        } else if (pair.bodyB === carBody && pair.bodyA !== ground) {
          beamBody = pair.bodyA;
        }

        if (!beamBody) return
        const beamIndex = connectionsBodies.current.findIndex((e) => e === pair.bodyB);
        if (beamIndex == -1) return;
        const conn = connections[beamIndex];
        if (brokenBeams.value.includes(beamIndex)) return;

        const normal = pair.collision.normal;
        const carMomentum = Vector.mult(carBody.velocity, carBody.mass);
        const impactMagnitude = Math.abs(Vector.dot(carMomentum, normal));
        const forceVector = Vector.mult(normal, (impactMagnitude * 5) / 30);
        const forcePerNode = Vector.div(forceVector, 2);
        externalForceToAdd[beamIndex] = { x: Math.abs(forcePerNode.x), y: Math.abs(forcePerNode.y) }
      });
    });

    Events.on(engine, 'beforeUpdate', (event) => {
      connections.forEach((conn, index) => {
        if (timePassed.value < 60 * 5) return;
        if (brokenBeams.value.includes(index)) return;
        if (internalConstraintsForces.value[index] == Infinity) return;
        if (internalConstraintsForces.value[index] > conn.material.durability) {
          console.log(`connection ${index} broke!`)
          // brokenBeams.value.push(index);
          // Matter.World.remove(world, connectionsBodies.current[index]);
          // Matter.World.remove(world, connectionsConstraints.current[index]);
        }
      })

      externalForceToAdd.forEach((force, i) => {
        if (brokenBeams.value.includes(i)) return;
        const nodeA = nodeBodies.current[connections[i].from];
        const nodeB = nodeBodies.current[connections[i].to];

        if (!nodeA.isStatic) {
          Matter.Body.applyForce(nodeA, nodeA.position, force);
        }
        if (!nodeB.isStatic) {
          Matter.Body.applyForce(nodeB, nodeB.position, force);
        }
      })
    })

    Events.on(engine, "afterUpdate", function (event) {
      function getConstraintCurrentLength(constraint: Matter.Constraint) {
        const worldPointA = Vector.add(
          constraint.bodyA!.position,
          Vector.rotate(constraint.pointA!, constraint.bodyA!.angle)
        );

        const worldPointB = Vector.add(
          constraint.bodyB!.position,
          Vector.rotate(constraint.pointB!, constraint.bodyB!.angle)
        );

        const delta = Vector.sub(worldPointA, worldPointB);
        return Vector.magnitude(delta);
      }

      function getConstraintForce(constraint: Matter.Constraint) {
        const displacement =
          getConstraintCurrentLength(constraint) - constraint.length;
        const force = Math.abs(constraint.stiffness * displacement) * 50;

        if (Math.abs(force) > maxForce.value) {
          maxForce.value = Math.abs(force);
        }

        return force;
      }

      let forces = connectionsConstraints.current.map(
        (c) => getConstraintForce(c) / maxForce.value
      );
      internalConstraintsForces.value = forces;
    });

    const update = () => {
      Matter.Engine.update(engine, 1000 / 60);
      timePassed.value++;
      const newPositions = nodeBodies.current.map((node) => {
        return vec(node.position.x, node.position.y);
      });
      nodePositions.value = newPositions;
      connectionsBodies.current.forEach((beamBody, index) => {
        const posA = connectionsConstraints.current[index].bodyA!.position;
        const posB = connectionsConstraints.current[index].bodyB!.position;

        const angle = Math.atan2(posB.y - posA.y, posB.x - posA.x);
        Matter.Body.setPosition(beamBody, {
          x: (posA.x + posB.x) / 2,
          y: (posA.y + posB.y) / 2,
        });
        Matter.Body.setAngle(beamBody, angle);
      });

      Matter.Body.setVelocity(carBody, { x: 1, y: carBody.velocity.y });
      carData.value = {
        position: vec(carBody.position.x, carBody.position.y),
        angle: carBody.angle,
      };

      animationFrame = requestAnimationFrame(update);
    };

    update();

    return () => {
      cancelAnimationFrame(animationFrame);
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
    };
  }, [engine, world, nodes, connections]);

  return (
    <View style={{ flex: 1 }}>
      <Canvas style={{ flex: 1 }}>
        {connections.map((conn, index) => {
          if (brokenBeams.value.includes(index)) return;
          return (
            <PhysicsBasedLine
              key={index}
              conn={conn}
              index={index}
              nodePositions={nodePositions}
              forces={internalConstraintsForces}
            />
          );
        })}

        {nodes.map((node, i) => (
          <PhysicsBasedCircle
            key={i}
            r={5}
            index={i}
            nodePositions={nodePositions}
          />
        ))}
        <PhysicsBasedCar carData={carData} />
      </Canvas>
    </View>
  );
}

const PhysicsBasedCircle = ({
  r,
  index,
  nodePositions,
}: {
  r: number;
  index: number;
  nodePositions: SharedValue<SkPoint[]>;
}) => {
  const derivedCx = useDerivedValue(() => {
    return nodePositions.value[index]?.x ?? 0;
  }, [nodePositions, index]);

  const derivedCy = useDerivedValue(() => {
    return nodePositions.value[index]?.y ?? 0;
  }, [nodePositions, index]);
  return <Circle cx={derivedCx} cy={derivedCy} r={r} color="orange" />;
};

const PhysicsBasedLine = ({
  conn,
  index,
  nodePositions,
  forces,
}: {
  conn: Connection;
  index: number;
  nodePositions: SharedValue<SkPoint[]>;
  forces: SharedValue<number[]>;
}) => {
  const p1 = useDerivedValue(() => {
    return nodePositions.value[conn.from];
  }, [nodePositions, conn.from]);

  const p2 = useDerivedValue(() => {
    return nodePositions.value[conn.to];
  }, [nodePositions, conn.to]);

  const n = useDerivedValue(() => {
    return forces.value[index];
  }, [index, forces]);

  return (
    <Line
      p1={p1}
      p2={p2}
      strokeWidth={10}
      color={conn.material.color}
      opacity={n}
      style={"stroke"}
    />
  );
};

const PhysicsBasedCar = ({
  carData,
}: {
  carData: SharedValue<{ position: SkPoint; angle: number }>;
}) => {
  const rect = {
    x: -CAR_WIDTH / 2,
    y: -CAR_HEIGHT / 2,
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
  };

  const transform = useDerivedValue(() => {
    return [
      { translateX: carData.value.position.x },
      { translateY: carData.value.position.y },
      { rotate: carData.value.angle },
    ];
  }, [carData]);

  return <Rect rect={rect} transform={transform} />;
};
