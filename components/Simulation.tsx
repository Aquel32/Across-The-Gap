import { CalculateBounds, EndMarker } from "@/lib/canvasHelper";
import { CarSettings, Connection, MapElement, NodeData } from "@/lib/types";
import {
  Circle,
  Group,
  Image,
  Line,
  Rect,
  SkPoint,
  useImage,
  vec,
} from "@shopify/react-native-skia";
import Matter, { Vector } from "matter-js";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import {
  SharedValue,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import CameraView from "./CameraView";

export default function Simulation({
  nodes,
  connections,
  mapElements,
  endCollision,
  carSettings,
  onEnd,
}: {
  nodes: NodeData[];
  connections: Connection[];
  mapElements: MapElement[];
  endCollision: { x: number; y: number; width: number; height: number };
  carSettings: CarSettings;
  onEnd: () => void;
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

  const bounds = CalculateBounds(mapElements);

  const carData = useSharedValue<{
    body: { position: SkPoint; angle: number };
    frontWheel: { position: SkPoint; angle: number };
    rearWheel: { position: SkPoint; angle: number };
  }>({
    body: {
      position: vec(carSettings.startTransform.x, carSettings.startTransform.y),
      angle: carSettings.startTransform.angle,
    },
    frontWheel: { position: vec(50, 50), angle: 0 },
    rearWheel: { position: vec(50, 50), angle: 0 },
  });

  useEffect(() => {
    Matter.World.clear(world, false);
    Matter.Engine.clear(engine);
    timePassed.value = 0;
    maxForce.value = 0;
    internalConstraintsForces.value = connections.map((c) => 0);

    brokenBeams.value = [];

    const carCollisionFilter = 3;
    const carGroup = -1;
    const mapGroup = -2;

    function createCar() {
      const frontWheel = Matter.Bodies.circle(
        carData.value.body.position.x +
          carSettings.width / 2 -
          carSettings.wheelRadius,
        carData.value.body.position.y +
          carSettings.height / 2 +
          carSettings.wheelOffsetY,
        carSettings.wheelRadius,
        {
          mass: carSettings.mass / 3,
          restitution: 0.5,
          friction: 0.3,
          collisionFilter: { mask: carCollisionFilter, group: carGroup },
          label: "carPart",
        }
      );
      const rearWheel = Matter.Bodies.circle(
        carData.value.body.position.x -
          carSettings.width / 2 +
          carSettings.wheelRadius,
        carData.value.body.position.y +
          carSettings.height / 2 +
          carSettings.wheelOffsetY,
        carSettings.wheelRadius,
        {
          mass: carSettings.mass / 3,
          restitution: 0.5,
          friction: 0.7,
          collisionFilter: { mask: carCollisionFilter, group: carGroup },
          label: "carPart",
        }
      );

      const body = Matter.Bodies.rectangle(
        carData.value.body.position.x,
        carData.value.body.position.y,
        carSettings.width,
        carSettings.height,
        {
          mass: carSettings.mass / 3,
          restitution: 0.5,
          friction: 0.7,
          collisionFilter: { mask: carCollisionFilter, group: carGroup },
          label: "carPart",
        }
      );

      const frontWheelConstraint = Matter.Constraint.create({
        bodyA: body,
        pointA: {
          x: carSettings.width / 2 - carSettings.wheelRadius,
          y: carSettings.height / 2 + carSettings.wheelOffsetY,
        },
        bodyB: frontWheel,
        pointB: { x: 0, y: 0 },
        length: 0,
        stiffness: 0.9,
      });

      const rearWheelConstraint = Matter.Constraint.create({
        bodyA: body,
        pointA: {
          x: -carSettings.width / 2 + carSettings.wheelRadius,
          y: carSettings.height / 2 + carSettings.wheelOffsetY,
        },
        bodyB: rearWheel,
        pointB: { x: 0, y: 0 },
        length: 0,
        stiffness: 0.9,
      });
      Matter.World.add(world, [
        body,
        frontWheel,
        rearWheel,
        frontWheelConstraint,
        rearWheelConstraint,
      ]);
      return {
        body,
        frontWheel,
        rearWheel,
      };
    }

    const carBody = createCar();

    const initialBodies = nodes.map((node) => {
      return Matter.Bodies.circle(node.x, node.y, 5, {
        restitution: 0.8,
        friction: 0.01,
        isStatic: node.isStatic ?? false,
        mass: 100,
        collisionFilter: { group: carGroup },
        label: "node",
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

    mapElements.forEach((elem) => {
      const body = Matter.Bodies.rectangle(
        elem.x + elem.width / 2,
        elem.y + elem.height / 2,
        elem.width,
        elem.height,
        {
          angle: elem.angle,
          isStatic: true,
          collisionFilter: {
            category: carCollisionFilter,
            group: mapGroup,
          },
          label: "mapElement",
        }
      );
      Matter.World.add(world, body);
    });

    const endCollisionBody = Matter.Bodies.rectangle(
      endCollision.x + endCollision.width / 2,
      endCollision.y + endCollision.height / 2,
      endCollision.width,
      endCollision.height,
      {
        isStatic: true,
        isSensor: true,
        collisionFilter: {
          category: carCollisionFilter,
        },
        label: "endCollision",
      }
    );
    Matter.World.add(world, endCollisionBody);

    let animationFrame: number;

    const externalForceToAdd: Vector[] = connections.map((c) => ({
      x: 0,
      y: 0,
    }));
    const onCollisionActive = (
      event: Matter.IEventCollision<Matter.Engine>
    ) => {
      event.pairs.forEach((pair) => {
        if (
          (pair.bodyA.label === "endCollision" &&
            pair.bodyB.label === "carPart") ||
          (pair.bodyB.label === "endCollision" &&
            pair.bodyA.label === "carPart")
        ) {
          onEnd();
          return;
        }

        let beamBody: Matter.Body | null = null;
        let carPart: Matter.Body | null = null;
        if (
          pair.bodyA.label === "carPart" &&
          pair.bodyB.label !== "mapElement"
        ) {
          beamBody = pair.bodyB;
          carPart = pair.bodyA;
        } else if (
          pair.bodyB.label === "carPart" &&
          pair.bodyA.label !== "mapElement"
        ) {
          beamBody = pair.bodyA;
          carPart = pair.bodyB;
        }

        if (!beamBody || !carPart) return;
        const beamIndex = connectionsBodies.current.findIndex(
          (e) => e === beamBody
        );
        if (beamIndex == -1) return;
        if (brokenBeams.value.includes(beamIndex)) return;

        const normal = pair.collision.normal;
        const carMomentum = Vector.mult(carPart.velocity, carPart.mass);
        const impactMagnitude = Math.abs(Vector.dot(carMomentum, normal));
        const forceVector = Vector.mult(normal, impactMagnitude);
        const forcePerNode = Vector.div(forceVector, 2);
        externalForceToAdd[beamIndex] = {
          x: Math.abs(forcePerNode.x),
          y: Math.abs(forcePerNode.y),
        };
      });
    };

    const onBeforeUpdate = (event: Matter.IEvent<Matter.Engine>) => {
      connections.forEach((conn, index) => {
        if (timePassed.value < 60 * 1) return;
        if (brokenBeams.value.includes(index)) return;
        const maxStrength =
          conn.material.durability /
          (1 +
            connectionsConstraints.current[index].length *
              conn.material.lengthPenaltyFactor) **
            2;
        if (
          internalConstraintsForces.value[index] > maxStrength ||
          isNaN(internalConstraintsForces.value[index]) == true
        ) {
          console.log(
            isNaN(internalConstraintsForces.value[index]),
            "Breaking beam at index:",
            index,
            " with force:",
            internalConstraintsForces.value[index]
          );
          brokenBeams.value = [...brokenBeams.value, index];
          Matter.World.remove(world, connectionsConstraints.current[index]);
          Matter.World.remove(world, connectionsBodies.current[index]);
        }
      });

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
      });
    };

    const onAfterUpdate = (event: Matter.IEvent<Matter.Engine>) => {
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

      let forces = connectionsConstraints.current.map((conn, index) => {
        if (brokenBeams.value.includes(index)) return 0;
        return getConstraintForce(conn) / maxForce.value;
      });
      internalConstraintsForces.value = forces;
    };

    Matter.Events.on(engine, "collisionActive", onCollisionActive);
    Matter.Events.on(engine, "beforeUpdate", onBeforeUpdate);
    Matter.Events.on(engine, "afterUpdate", onAfterUpdate);

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

      Matter.Body.setAngularVelocity(
        carBody.rearWheel,
        carSettings.acceleration
      );
      carData.value = {
        body: {
          position: vec(carBody.body.position.x, carBody.body.position.y),
          angle: carBody.body.angle,
        },
        frontWheel: {
          position: vec(
            carBody.frontWheel.position.x,
            carBody.frontWheel.position.y
          ),
          angle: carBody.frontWheel.angle,
        },
        rearWheel: {
          position: vec(
            carBody.rearWheel.position.x,
            carBody.rearWheel.position.y
          ),
          angle: carBody.rearWheel.angle,
        },
      };

      animationFrame = requestAnimationFrame(update);
    };

    update();

    return () => {
      cancelAnimationFrame(animationFrame);

      Matter.Events.off(engine, "collisionActive", onCollisionActive);
      Matter.Events.off(engine, "beforeUpdate", onBeforeUpdate);
      Matter.Events.off(engine, "afterUpdate", onAfterUpdate);

      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <CameraView bounds={bounds}>
        {mapElements.map((elem, index) => (
          <Rect
            key={index}
            rect={{
              x: elem.x,
              y: elem.y,
              width: elem.width,
              height: elem.height,
            }}
            color={elem.material.color}
          />
        ))}

        {connections.map((conn, index) => {
          return (
            <PhysicsBasedLine
              key={index}
              conn={conn}
              index={index}
              nodePositions={nodePositions}
              forces={internalConstraintsForces}
              brokenBeams={brokenBeams}
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
        <PhysicsBasedCar carData={carData} carSettings={carSettings} />
        <EndMarker position={endCollision} />
      </CameraView>
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
  brokenBeams,
}: {
  conn: Connection;
  index: number;
  nodePositions: SharedValue<SkPoint[]>;
  forces: SharedValue<number[]>;
  brokenBeams: SharedValue<number[]>;
}) => {
  const p1 = useDerivedValue(() => {
    return nodePositions.value[conn.from];
  }, [nodePositions, conn.from]);

  const p2 = useDerivedValue(() => {
    return nodePositions.value[conn.to];
  }, [nodePositions, conn.to]);

  const opacity = useDerivedValue(() => {
    const broken = brokenBeams.value.includes(index);
    const force = isNaN(forces.value[index]) ? 0 : forces.value[index];
    return broken ? 0 : 1.5 - force;
  }, [index, forces, brokenBeams]);

  return (
    <Line
      p1={p1}
      p2={p2}
      strokeWidth={10}
      color={conn.material.color}
      opacity={opacity}
      style={"stroke"}
    />
  );
};

const PhysicsBasedCar = ({
  carData,
  carSettings,
}: {
  carData: SharedValue<{
    body: { position: SkPoint; angle: number };
    frontWheel: { position: SkPoint; angle: number };
    rearWheel: { position: SkPoint; angle: number };
  }>;
  carSettings: CarSettings;
}) => {
  const carBodyImage = useImage(require("@/assets/images/body.png"));
  const carWheelImage = useImage(require("@/assets/images/wheel.png"));
  const rect = {
    x: -carSettings.width / 2,
    y: -carSettings.height / 2,
    width: carSettings.width,
    height: carSettings.height,
  };

  const rectTransform = useDerivedValue(() => {
    return [
      { translateX: carData.value.body.position.x },
      { translateY: carData.value.body.position.y },
      { rotate: carData.value.body.angle },
    ];
  }, [carData]);

  const rearWheel_cx = -carSettings.width / 2 + carSettings.wheelOffsetX + 1;
  const frontWheel_cx =
    carSettings.width / 2 -
    2 * carSettings.wheelRadius -
    carSettings.wheelOffsetX;
  const wheels_cy =
    carSettings.height / 2 - carSettings.wheelRadius + carSettings.wheelOffsetY;

  const frontWheelRotate = useDerivedValue(() => {
    return [{ rotate: carData.value.frontWheel.angle }];
  });
  const rearWheelRotate = useDerivedValue(() => {
    return [{ rotate: carData.value.rearWheel.angle }];
  });

  const frontWheelOrigin = {
    x: frontWheel_cx + carSettings.wheelRadius,
    y: wheels_cy + carSettings.wheelRadius,
  };
  const rearWheelOrigin = {
    x: rearWheel_cx + carSettings.wheelRadius,
    y: wheels_cy + carSettings.wheelRadius,
  };

  return (
    <Group transform={rectTransform}>
      <Image
        image={carWheelImage}
        fit="contain"
        x={frontWheel_cx}
        y={wheels_cy}
        width={carSettings.wheelRadius * 2}
        height={carSettings.wheelRadius * 2}
        transform={frontWheelRotate}
        origin={frontWheelOrigin}
      />
      <Image
        image={carWheelImage}
        fit="contain"
        x={rearWheel_cx}
        y={wheels_cy}
        width={carSettings.wheelRadius * 2}
        height={carSettings.wheelRadius * 2}
        transform={rearWheelRotate}
        origin={rearWheelOrigin}
      />
      <Image image={carBodyImage} fit="contain" rect={rect} />
    </Group>
  );
};
