import { Connection, MapElement, Material, NodeData } from "@/lib/types";
import { Circle, Line, Rect, vec } from "@shopify/react-native-skia";
import React, { useEffect } from "react";
import { View } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { runOnJS, useSharedValue } from "react-native-reanimated";
import CameraView from "./CameraView";

const overlaps = (
  x: number,
  y: number,
  nodes: NodeData[],
  transform: {
    translateX: number;
    translateY: number;
    scale: number;
  },
  excludeIndex: number = -1
) => {
  "worklet";
  let result: number | undefined = undefined;
  for (let i = 0; i < nodes.length; i++) {
    if (i === excludeIndex) continue;

    const n = nodes[i];

    const worldX = (x - transform.translateX) / transform.scale;
    const worldY = (y - transform.translateY) / transform.scale;

    const distance = Math.sqrt(
      Math.pow(worldX - n.x, 2) + Math.pow(worldY - n.y, 2)
    );
    if (distance < n.r) {
      result = i;
      break;
    }
  }
  return result;
};

export default function Editor({
  nodes,
  connections,
  setNodes,
  setConnections,
  clearLevel,
  running,
  selectedMaterial,
  mapElements,
}: {
  nodes: NodeData[];
  connections: Connection[];
  setNodes: React.Dispatch<React.SetStateAction<NodeData[]>>;
  setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
  clearLevel: () => void;
  running: boolean;
  selectedMaterial: Material;
  mapElements: MapElement[];
}) {
  const enableCameraTransform = useSharedValue<boolean>(true);
  const cameraTransform = useSharedValue<{
    translateX: number;
    translateY: number;
    scale: number;
  }>({ translateX: 0, translateY: 0, scale: 1 });

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

      //check if new connections intersects with existing one, if so create node at intersection point

      console.log("Connecting node", from, "to", to);
      return [...conns, { from, to, material: selectedMaterial }];
    });
  }

  function addNode(fromIndex: number, newNode: NodeData) {
    setNodes((currentNodes) => {
      const newIndex = currentNodes.length;
      setConnections((currentConns) => [
        ...currentConns,
        { from: fromIndex, to: newIndex, material: selectedMaterial },
      ]);
      return [...currentNodes, newNode];
    });
  }

  const line = {
    p1: useSharedValue(vec(0, 0)),
    p2: useSharedValue(vec(0, 0)),
    strokeWidth: 10,
  };

  const selectedNode = useSharedValue<number | null>(null);

  const gesture = Gesture.Pan()
    .onStart((e) => {
      "worklet";
      if (running) return;
      const nodeIndex = overlaps(
        e.x,
        e.y,
        sharedNodes.value,
        cameraTransform.value
      );

      if (nodeIndex !== undefined) {
        enableCameraTransform.value = false;
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
      if (running) return;
      if (selectedNode.value === null) return;
      line.p2.value = vec(
        (e.x - cameraTransform.value.translateX) / cameraTransform.value.scale,
        (e.y - cameraTransform.value.translateY) / cameraTransform.value.scale
      );
    })
    .onEnd((e) => {
      "worklet";
      enableCameraTransform.value = true;
      if (running) return;
      if (selectedNode.value === null) return;

      const fromIndex = selectedNode.value;

      line.p1.value = vec(0, 0);
      line.p2.value = vec(0, 0);
      selectedNode.value = null;

      const targetIndex = overlaps(
        e.x,
        e.y,
        sharedNodes.value,
        cameraTransform.value,
        fromIndex
      );

      if (targetIndex !== undefined) {
        runOnJS(addConnection)(fromIndex, targetIndex);
      } else {
        const newNode: NodeData = {
          x:
            (e.x - cameraTransform.value.translateX) /
            cameraTransform.value.scale,
          y:
            (e.y - cameraTransform.value.translateY) /
            cameraTransform.value.scale,
          r: 13,
        };
        sharedNodes.value = [...sharedNodes.value, newNode];
        runOnJS(addNode)(fromIndex, newNode);
      }
    });

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        otherGestures={gesture}
        enableTransform={enableCameraTransform}
        transform={cameraTransform}
      >
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

        <Line
          p1={line.p1}
          p2={line.p2}
          strokeWidth={10}
          color={selectedMaterial.color}
        />

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
      </CameraView>
    </View>
  );
}
