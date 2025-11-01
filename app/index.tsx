import Node, { CircleData, Connection, LineData } from "@/components/Node";
import { Line, vec } from "@shopify/react-native-skia";
import { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import Touchable from "react-native-skia-gesture";

export default function App() {
  const [nodes, setNodes] = useState<CircleData[]>([
    { x: 150, y: 150, r: 30 },
    { x: 300, y: 250, r: 30 },
    { x: 500, y: 200, r: 30 },
  ]);

  const [connections, setConnections] = useState<Connection[]>([]);

  function addConnection(from: number, to: number) {
    setConnections((conns) => [...conns, { from, to }]);
  }

  const line: LineData = {
    p1: useSharedValue(vec(0, 0)),
    p2: useSharedValue(vec(0, 0)),
    strokeWidth: 10,
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Touchable.Canvas style={{ flex: 1 }}>
        {connections.map((conn, index) => {
          const fromNode = nodes[conn.from];
          const toNode = nodes[conn.to];
          return (
            <Line
              key={index}
              p1={vec(fromNode.x, fromNode.y)}
              p2={vec(toNode.x, toNode.y)}
              strokeWidth={5}
              color={"green"}
              style={"stroke"}
            />
          );
        })}

        {nodes.map((node, index) => {
          return (
            <Node
              key={index}
              node={node}
              index={index}
              line={line}
              nodes={nodes}
              connections={connections}
              addConnection={addConnection}
            />
          );
        })}

        <Line {...line} color={"red"} style={"stroke"} />
      </Touchable.Canvas>
    </GestureHandlerRootView>
  );
}
