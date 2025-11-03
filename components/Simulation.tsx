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

  const bodiesPositions = useSharedValue<
    { x: number; y: number; angle: number; length: number }[]
  >(
    connections.map((conn, index) => {
      const from = nodes[conn.from];
      const to = nodes[conn.to];
      const distance = Math.sqrt(
        Math.pow(Math.abs(from.x - to.x), 2) +
          Math.pow(Math.abs(from.y - to.y), 2)
      );
      const angle = Math.atan2(to.y - from.y, to.x - from.x);

      return {
        x: (from.x + to.x) / 2,
        y: (from.y + to.y) / 2,
        angle,
        length: distance,
      };
    })
  );

  const bodies = useRef<Matter.Body[]>([]);

  const carPositions = useSharedValue<SkPoint>(vec(300, 20));

  useEffect(() => {
    Matter.World.clear(world, false);

    const carBody = Matter.Bodies.rectangle(
      carPositions.value.x,
      carPositions.value.y,
      CAR_WIDTH,
      CAR_HEIGHT,
      {
        restitution: 0.5,
        friction: 0.3,
      }
    );
    Matter.World.add(world, carBody);

    // const initialBodies = nodes.map((node) => {
    //   return Matter.Bodies.circle(node.x, node.y, node.r, {
    //     restitution: 0.8,
    //     friction: 0.01,
    //     isStatic: node.isStatic ?? false,
    //   });
    // });
    // bodies.current = initialBodies;
    // Matter.World.add(world, initialBodies);

    // //invisible links
    // const initialConstraints = connections.map((conn) => {
    //   return Matter.Constraint.create({
    //     bodyA: initialBodies[conn.from],
    //     bodyB: initialBodies[conn.to],
    //     stiffness: conn.material.stiffness,
    //   });
    // });
    // Matter.World.add(world, initialConstraints);

    const initialBodies = connections.map((conn, index) => {
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
        distance,
        10,
        {
          angle: angle,
          isStatic: conn.isStatic === true,
        }
      );
    });
    bodies.current = initialBodies;

    Matter.World.add(world, initialBodies);

    const ground = Matter.Bodies.rectangle(width / 2, height, width, 70, {
      isStatic: true,
    });
    Matter.World.add(world, ground);

    let animationFrame: number;

    const update = () => {
      Matter.Engine.update(engine, 1000 / 60);

      bodiesPositions.value = bodies.current.map((body, index) => {
        return {
          x: body.position.x,
          y: body.position.y,
          angle: body.angle,
          length: bodiesPositions.value[index].length,
        };
      });

      carPositions.value = vec(carBody.position.x, carBody.position.y);

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
            <PhysicsBasedRect
              key={index}
              conn={conn}
              index={index}
              bodies={bodiesPositions}
            />
          );
        })}
        {/* {connections.map((conn, index) => {
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
        <PhysicsBasedCar carPosition={carPositions} /> */}
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

const PhysicsBasedRect = ({
  conn,
  index,
  bodies,
}: {
  conn: Connection;
  index: number;
  bodies: SharedValue<
    {
      x: number;
      y: number;
      angle: number;
      length: number;
    }[]
  >;
}) => {
  const rect = useDerivedValue(() => {
    return {
      x: -bodies.value[index].length / 2,
      y: -10 / 2,
      width: bodies.value[index].length,
      height: 10,
    };
  }, [bodies, conn.from]);

  const transform = useDerivedValue(() => {
    const body = bodies.value[index];
    return [
      { translateX: body.x },
      { translateY: body.y },
      { rotate: body.angle },
    ];
  }, [bodies, conn.to]);

  return <Rect rect={rect} transform={transform} color={conn.material.color} />;
};

const PhysicsBasedCar = ({
  carPosition,
}: {
  carPosition: SharedValue<SkPoint>;
}) => {
  const xPosition = useDerivedValue(() => {
    return carPosition.value.x - CAR_WIDTH / 2;
  }, [carPosition]);

  const yPosition = useDerivedValue(() => {
    return carPosition.value.y - CAR_HEIGHT / 2;
  }, [carPosition]);

  return (
    <Rect x={xPosition} y={yPosition} width={CAR_WIDTH} height={CAR_HEIGHT} />
  );
};
