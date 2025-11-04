import { Connection, NodeData } from "@/lib/types";
import {
  Canvas,
  Circle,
  Line,
  Rect,
  SkPoint,
  vec,
} from "@shopify/react-native-skia";
import Matter from "matter-js";
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

  const carData = useSharedValue<{ position: SkPoint; angle: number }>({
    position: vec(300, 100),
    angle: 0,
  });

  useEffect(() => {
    Matter.World.clear(world, false);

    const carCollisionFilter = Matter.Body.nextCategory();
    const carBody = Matter.Bodies.rectangle(
      carData.value.position.x,
      carData.value.position.y,
      CAR_WIDTH,
      CAR_HEIGHT,
      {
        restitution: 0.5,
        friction: 0.3,
        collisionFilter: { mask: carCollisionFilter }
      }
    );
    Matter.World.add(world, carBody);

    const initialBodies = nodes.map((node) => {
      return Matter.Bodies.circle(node.x, node.y, 5, {
        restitution: 0.8,
        friction: 0.01,
        isStatic: node.isStatic ?? false,
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
          collisionFilter: { category: conn.material.collideWithCar === true ? carCollisionFilter : undefined }
        }
      );
    });
    connectionsBodies.current = constraintsCollisions;
    Matter.World.add(world, constraintsCollisions);

    const ground = Matter.Bodies.rectangle(width / 2, height, width, 70, {
      isStatic: true,
      collisionFilter: { category: carCollisionFilter }
    });
    Matter.World.add(world, ground);

    let animationFrame: number;

    const update = () => {
      Matter.Engine.update(engine, 1000 / 60);

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
          return (
            <PhysicsBasedLine
              key={index}
              conn={conn}
              nodePositions={nodePositions}
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
  nodePositions,
}: {
  conn: Connection;
  nodePositions: SharedValue<SkPoint[]>;
}) => {
  const p1 = useDerivedValue(() => {
    return nodePositions.value[conn.from];
  }, [nodePositions, conn.from]);

  const p2 = useDerivedValue(() => {
    return nodePositions.value[conn.to];
  }, [nodePositions, conn.to]);

  return (
    <Line
      p1={p1}
      p2={p2}
      strokeWidth={10}
      color={conn.material.color}
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
