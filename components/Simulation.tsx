import { Connection, NodeData } from "@/lib/types";
import { Canvas, Circle, Line, vec } from "@shopify/react-native-skia";
import { View } from "react-native";

export default function Simulation({
  nodes,
  connections,
}: {
  nodes: NodeData[];
  connections: Connection[];
}) {
  return (
    <View style={{ flex: 1 }}>
      <Canvas style={{ flex: 1 }}>
        {connections.map((conn, index) => {
          const fromNode = nodes[conn.from];
          const toNode = nodes[conn.to];
          if (!fromNode || !toNode) return null;
          return (
            <Line
              key={index}
              p1={vec(fromNode.x, fromNode.y)}
              p2={vec(toNode.x, toNode.y)}
              strokeWidth={10}
              color={conn.material.color}
              style={"stroke"}
            />
          );
        })}

        {nodes.map((node, i) => (
          <Circle key={i} cx={node.x} cy={node.y} r={node.r} color="orange" />
        ))}
      </Canvas>
    </View>
  );
}
