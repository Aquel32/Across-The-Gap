import { Connection, NodeData } from "@/lib/types";
import { Canvas, Circle, Line, SkPoint, vec } from "@shopify/react-native-skia";
import Matter from "matter-js";
import { useEffect, useRef, useState } from "react";
import { Dimensions, View } from "react-native";
import {
  SharedValue,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

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
  const bodies = useRef<Matter.Body[]>([]);

  useEffect(() => {
    Matter.World.clear(world, false);

    const initialBodies = nodes.map((node) => {
      return Matter.Bodies.circle(node.x, node.y, node.r, {
        restitution: 0.8,
        friction: 0.01,
        isStatic: node.isStatic ?? false,
      });
    });

    const initialConstraints = connections.map((conn) => {
      return Matter.Constraint.create({
        bodyA: initialBodies[conn.from],
        bodyB: initialBodies[conn.to],
        stiffness: conn.material.stiffness,
      });
    });
    Matter.World.add(world, initialConstraints);

    bodies.current = initialBodies;
    Matter.World.add(world, initialBodies);

    const ground = Matter.Bodies.rectangle(width / 2, height, width, 70, {
      isStatic: true,
    });
    Matter.World.add(world, ground);

    let animationFrame: number;

    const update = () => {
      Matter.Engine.update(engine, 1000 / 60);

      const newPositions = bodies.current.map((body) => {
        return vec(body.position.x, body.position.y);
      });

      nodePositions.value = newPositions;
      animationFrame = requestAnimationFrame(update);
    };

    update();

    return () => {
      cancelAnimationFrame(animationFrame);
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
    };
  }, [engine, world, nodes]);

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
