import MaterialSelector from "@/components/MaterialSelector";
import { Materials } from "@/lib/materials";
import { CircleData, Connection, LineData, Material } from "@/lib/types";
import { Canvas, Circle, Line, vec } from "@shopify/react-native-skia";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { runOnJS, useSharedValue } from "react-native-reanimated";

const overlaps = (
  x: number,
  y: number,
  nodes: CircleData[],
  excludeIndex: number = -1
) => {
  "worklet";
  let result: number | undefined = undefined;
  for (let i = 0; i < nodes.length; i++) {
    if (i === excludeIndex) continue;

    const n = nodes[i];
    const distance = Math.sqrt(Math.pow(x - n.x, 2) + Math.pow(y - n.y, 2));
    if (distance < n.r) {
      result = i;
      break;
    }
  }
  return result;
};

export default function App() {
  const [nodes, setNodes] = useState<CircleData[]>([
    { x: 150, y: 250, r: 13 },
    { x: 630, y: 250, r: 13 },
  ]);
  const [connections, setConnections] = useState<Connection[]>([]);

  const sharedNodes = useSharedValue(nodes);
  useEffect(() => {
    sharedNodes.value = nodes;
  }, [nodes]);

  function addConnection(from: number, to: number) {
    setConnections((conns) => {
      if (from === to) return conns;
      if (
        conns.some(
          (c) =>
            (c.from === from && c.to === to) || (c.from === to && c.to === from)
        )
      ) {
        return conns;
      }

      console.log("Connecting node", from, "to", to);
      return [...conns, { from, to, material: selectedMaterial }];
    });
  }

  function addNode(fromIndex: number, newNode: CircleData) {
    setNodes((currentNodes) => {
      const newIndex = currentNodes.length;
      setConnections((currentConns) => [
        ...currentConns,
        { from: fromIndex, to: newIndex, material: selectedMaterial },
      ]);
      return [...currentNodes, newNode];
    });
  }

  const line: LineData = {
    p1: useSharedValue(vec(0, 0)),
    p2: useSharedValue(vec(0, 0)),
    strokeWidth: 10,
  };

  const selectedNode = useSharedValue<number | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material>(
    Materials.ROAD
  );

  const gesture = Gesture.Pan()
    .onStart((e) => {
      "worklet";
      const nodeIndex = overlaps(e.x, e.y, sharedNodes.value);

      if (nodeIndex !== undefined) {
        selectedNode.value = nodeIndex;
        const startNode = sharedNodes.value[nodeIndex];
        line.p1.value = vec(startNode.x, startNode.y);
        line.p2.value = vec(startNode.x, startNode.y);
      } else {
        return;
      }
    })
    .onChange((e) => {
      "worklet";
      if (selectedNode.value === null) return;
      line.p2.value = vec(e.x, e.y);
    })
    .onEnd((e) => {
      "worklet";
      if (selectedNode.value === null) return;

      const fromIndex = selectedNode.value;

      line.p1.value = vec(0, 0);
      line.p2.value = vec(0, 0);
      selectedNode.value = null;

      const targetIndex = overlaps(e.x, e.y, sharedNodes.value, fromIndex);

      if (targetIndex !== undefined) {
        runOnJS(addConnection)(fromIndex, targetIndex);
      } else {
        const newNode: CircleData = {
          x: e.x,
          y: e.y,
          r: 13,
        };
        sharedNodes.value = [...sharedNodes.value, newNode];
        runOnJS(addNode)(fromIndex, newNode);
      }
    });

  return (
    <View style={{ flex: 1 }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GestureDetector gesture={gesture}>
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
              <Circle
                key={i}
                cx={node.x}
                cy={node.y}
                r={node.r}
                color="orange"
              />
            ))}

            <Line p1={line.p1} p2={line.p2} strokeWidth={10} color="red" />
          </Canvas>
        </GestureDetector>
      </GestureHandlerRootView>

      <View>
        <MaterialSelector
          onMaterialSelect={(material) => setSelectedMaterial(material)}
        />
      </View>
    </View>
  );
}
