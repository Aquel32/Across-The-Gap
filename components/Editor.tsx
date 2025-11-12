import {
  CarSettings,
  Connection,
  MapElement,
  Material,
  Modes,
  NodeData,
} from "@/lib/types";
import {
  Text as CanvasText,
  Circle,
  Group,
  Line,
  matchFont,
  Rect,
  SkFont,
  vec,
} from "@shopify/react-native-skia";
import React, { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { ArrowPathRoundedSquareIcon, PlusIcon } from "react-native-heroicons/outline";
import BanknotesIcon from "react-native-heroicons/outline/BanknotesIcon";
import {
  runOnJS,
  SharedValue,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import CameraView from "./CameraView";
import NumericInput from "./NumericInput";

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

const overlapsConnection = (
  x: number,
  y: number,
  nodes: NodeData[],
  connections: Connection[],
  transform: {
    translateX: number;
    translateY: number;
    scale: number;
  },
  touchRadius: number = 10,
  excludeIndex: number = -1
) => {
  "worklet";
  const worldX = (x - transform.translateX) / transform.scale;
  const worldY = (y - transform.translateY) / transform.scale;

  const touchRadiusSq = touchRadius * touchRadius;

  let result: number | undefined = undefined;

  for (let i = 0; i < connections.length; i++) {
    if (i === excludeIndex) continue;

    const c = connections[i];
    const n1 = nodes[c.from];
    const n2 = nodes[c.to];

    if (!n1 || !n2) continue;

    const dx = n2.x - n1.x;
    const dy = n2.y - n1.y;

    const lenSq = dx * dx + dy * dy;

    const apx = worldX - n1.x;
    const apy = worldY - n1.y;

    let t;
    if (lenSq === 0) {
      t = 0;
    } else {
      const dot = apx * dx + apy * dy;
      t = dot / lenSq;

      t = Math.max(0, Math.min(1, t));
    }

    const closestX = n1.x + t * dx;
    const closestY = n1.y + t * dy;

    const distSq =
      Math.pow(worldX - closestX, 2) + Math.pow(worldY - closestY, 2);

    if (distSq < touchRadiusSq) {
      result = i;
      break;
    }
  }

  return result;
};

const calculatePrice = (length: number, material: Material) => {
  "worklet";
  return Math.round(length * material.pricePerUnit);
};

export default function Editor({
  nodes,
  connections,
  setNodes,
  setConnections,
  mode,
  setMode,
  running,
  selectedMaterial,
  mapElements,
  carSettings,
  budget,
  setBudget,
  closeMenus,
}: {
  nodes: NodeData[];
  connections: Connection[];
  setNodes: React.Dispatch<React.SetStateAction<NodeData[]>>;
  setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
  mode: Modes;
  setMode: React.Dispatch<React.SetStateAction<Modes>>;
  running: boolean;
  selectedMaterial: Material;
  mapElements: MapElement[];
  carSettings: CarSettings;
  budget: number;
  setBudget: React.Dispatch<React.SetStateAction<number>>;
  closeMenus: () => void;
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

  const sharedConnections = useSharedValue(connections);
  useEffect(() => {
    sharedConnections.value = connections;
  }, [connections]);

  useEffect(() => {
    setGeneratingChain(false);
    setTemporaryChainNodes([]);
  }, [mode])


  const [temporaryChainNodes, setTemporaryChainNodes] = useState<
    { x: number; y: number }[]
  >([]);

  const MAX_CHAIN_SEGMENT_LENGTH = useRef(100);
  const [generatingChain, setGeneratingChain] = useState(false);
  const chainData = useSharedValue<{ from: number, tox: number, toy: number, to?: number | undefined }>({ from: -1, tox: 0, toy: 0 })

  const lastPrice = useSharedValue(0);
  const lastPriceTextFont = matchFont({
    fontFamily: "Helvetica",
    fontSize: 14,
  });

  useEffect(() => {
    if (generatingChain == true) return;

    line.p1.value = { x: 0, y: 0 };
    line.p2.value = { x: 0, y: 0 };
  }, [generatingChain])

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

  function createChain() {
    if (generatingChain == false) return;

    setMode("create");
    setGeneratingChain(false);
    setTemporaryChainNodes([]);

    const fromNode = nodes[chainData.value.from];

    const finalPosition = { x: chainData.value.tox, y: chainData.value.toy };

    if (chainData.value.to !== undefined) {
      finalPosition.x = nodes[chainData.value.to].x;
      finalPosition.y = nodes[chainData.value.to].y;
    }

    const distance = Math.sqrt(
      Math.pow(fromNode.x - finalPosition.x, 2) +
      Math.pow(fromNode.y - finalPosition.y, 2)
    );

    let segments = Math.max(1, Math.ceil(distance / MAX_CHAIN_SEGMENT_LENGTH.current));

    const segmentLength = distance / segments;
    const angle = Math.atan2(
      finalPosition.y - fromNode.y,
      finalPosition.x - fromNode.x
    );

    if (chainData.value.to !== undefined) {
      segments--;
    }

    let lastNodeIndex = chainData.value.from;
    for (let i = 1; i <= segments; i++) {
      const newX = fromNode.x + i * segmentLength * Math.cos(angle);
      const newY = fromNode.y + i * segmentLength * Math.sin(angle);
      const newNode: NodeData = {
        x: newX,
        y: newY,
        r: 13,
      };
      addNode(lastNodeIndex, newNode);
      lastNodeIndex = nodes.length + i - 1;
    }

    if (chainData.value.to !== undefined) {
      setConnections((currentConns) => [
        ...currentConns,
        { from: lastNodeIndex, to: chainData.value.to!, material: selectedMaterial },
      ]);
    }

  }

  function generateChainPreview(from: number, toX: number, toY: number) {
    setTemporaryChainNodes([]);

    const fromNode = nodes[from];

    const finalPosition = { x: toX, y: toY };

    const distance = Math.sqrt(
      Math.pow(fromNode.x - finalPosition.x, 2) +
      Math.pow(fromNode.y - finalPosition.y, 2)
    );

    let segments = Math.max(1, Math.ceil(distance / MAX_CHAIN_SEGMENT_LENGTH.current));

    const segmentLength = distance / segments;
    const angle = Math.atan2(
      finalPosition.y - fromNode.y,
      finalPosition.x - fromNode.x
    );

    for (let i = 1; i <= segments; i++) {
      const newX = fromNode.x + i * segmentLength * Math.cos(angle);
      const newY = fromNode.y + i * segmentLength * Math.sin(angle);
      setTemporaryChainNodes((current) => [...current, { x: newX, y: newY }]);
    }
  }

  const line = {
    p1: useSharedValue(vec(0, 0)),
    p2: useSharedValue(vec(0, 0)),
    strokeWidth: 10,
  };

  function deleteNode(nodeIndex: number) {
    setNodes((currentNodes) => {
      return currentNodes.filter((_, i) => i !== nodeIndex);
    });

    setConnections((currentConns) => {
      const filtered = currentConns.filter(
        (conn) => conn.from !== nodeIndex && conn.to !== nodeIndex
      );

      return filtered.map((conn) => ({
        ...conn,
        from: conn.from > nodeIndex ? conn.from - 1 : conn.from,
        to: conn.to > nodeIndex ? conn.to - 1 : conn.to,
      }));
    });
  }

  function deleteConnection(connectionIndex: number) {
    const nodesToCheck = [];
    nodesToCheck.push(connections[connectionIndex].from);
    nodesToCheck.push(connections[connectionIndex].to);

    const distance = Math.sqrt(
      Math.pow(
        nodes[connections[connectionIndex].from].x -
        nodes[connections[connectionIndex].to].x,
        2
      ) +
      Math.pow(
        nodes[connections[connectionIndex].from].y -
        nodes[connections[connectionIndex].to].y,
        2
      )
    );
    setBudget(budget + calculatePrice(distance, selectedMaterial));

    setConnections((currentConns) => {
      const newConnections = currentConns.filter(
        (_, i) => i !== connectionIndex
      );

      return newConnections;
    });

    let lastDeleted: number | undefined = undefined;
    nodesToCheck.forEach((nodeIndex) => {
      const stillConnected = connections.some(
        (conn, i) =>
          i !== connectionIndex &&
          (conn.from === nodeIndex || conn.to === nodeIndex)
      );

      if (!stillConnected && nodes[nodeIndex].isStatic !== true) {
        let ind = nodeIndex;
        if (lastDeleted !== undefined && nodeIndex > lastDeleted) {
          lastDeleted = nodeIndex;
          ind = ind - 1;
        }

        lastDeleted = ind;
        deleteNode(ind);
      }
    });
  }

  const selectedNode = useSharedValue<number | null>(null);

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      "worklet";
      runOnJS(closeMenus)();
      if (running) return;
      if (mode == "delete") return;

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

        if (mode == "chain") {
          runOnJS(setGeneratingChain)(true);
        }
      }
    })
    .onChange((e) => {
      "worklet";
      if (mode == "delete") return;
      if (running) return;
      if (selectedNode.value === null) return;

      const worldX =
        (e.x - cameraTransform.value.translateX) / cameraTransform.value.scale;
      const worldY =
        (e.y - cameraTransform.value.translateY) / cameraTransform.value.scale;

      if (mode == "create" || mode == "chain") {
        line.p2.value = vec(worldX, worldY);
        const distance = Math.sqrt(
          Math.pow(worldX - line.p1.value.x, 2) +
          Math.pow(worldY - line.p1.value.y, 2)
        );
        lastPrice.value = calculatePrice(distance, selectedMaterial);
      }

      if (mode == "create") {
      } else if (mode == "move") {
        if (nodes[selectedNode.value].isStatic) return;
        const newX = worldX;
        const newY = worldY;
        const newNodes = [...nodes];
        newNodes[selectedNode.value] = {
          ...newNodes[selectedNode.value],
          x: newX,
          y: newY,
        };
        runOnJS(setNodes)(newNodes);
        // calculate refund
      } else if (mode == "chain") {
        runOnJS(setGeneratingChain)(true);
        runOnJS(generateChainPreview)(selectedNode.value, worldX, worldY);
      }
    })
    .onEnd((e) => {
      "worklet";
      enableCameraTransform.value = true;
      if (mode == "delete") return;
      if (running) return;
      if (selectedNode.value === null) return;

      const worldX =
        (e.x - cameraTransform.value.translateX) / cameraTransform.value.scale;
      const worldY =
        (e.y - cameraTransform.value.translateY) / cameraTransform.value.scale;

      const fromIndex = selectedNode.value;


      selectedNode.value = null;

      if (lastPrice.value > budget) {
        lastPrice.value = 0;
        return;
      }

      runOnJS(setBudget)(budget - lastPrice.value);
      lastPrice.value = 0;

      const targetIndex = overlaps(
        e.x,
        e.y,
        sharedNodes.value,
        cameraTransform.value,
        fromIndex
      );

      if (mode != "chain") {
        runOnJS(setTemporaryChainNodes)([]);
        line.p1.value = vec(0, 0);
        line.p2.value = vec(0, 0);
      }

      if (mode == "create") {
        if (targetIndex !== undefined) {
          runOnJS(addConnection)(fromIndex, targetIndex);
        } else {
          const newNode: NodeData = {
            x: worldX,
            y: worldY,
            r: 13,
          };
          sharedNodes.value = [...sharedNodes.value, newNode];
          runOnJS(addNode)(fromIndex, newNode);
        }
      } else if (mode == "move") {
        if (targetIndex !== undefined) {
          const connsToUpdate = connections.filter(
            (conn) => conn.from === fromIndex || conn.to === fromIndex
          );
          connsToUpdate.forEach((conn) => {
            const otherNodeIndex =
              conn.from === fromIndex ? conn.to : conn.from;
            runOnJS(addConnection)(otherNodeIndex, targetIndex);
          });

          runOnJS(deleteNode)(fromIndex);
        }
      }
      else if (mode == "chain") {
        chainData.value.from = fromIndex;
        chainData.value.tox = worldX;
        chainData.value.toy = worldY;
        chainData.value.to = targetIndex ? targetIndex : undefined;
      }
      console.log(chainData.value);
    });

  const tapGesture = Gesture.Tap().onEnd((e) => {
    "worklet";
    if (mode !== "delete" || running) return;

    const connectionIndex = overlapsConnection(
      e.x,
      e.y,
      sharedNodes.value,
      sharedConnections.value,
      cameraTransform.value
    );

    if (connectionIndex !== undefined) {
      runOnJS(deleteConnection)(connectionIndex);
      return;
    }
  });

  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        otherGestures={composedGesture}
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

        <Car {...carSettings} />

        <CurrentPriceIndicator
          price={lastPrice}
          font={lastPriceTextFont}
          line={line}
        />

        {temporaryChainNodes.map((node, index) => (
          <Circle key={index} cx={node.x} cy={node.y} r={13} color="orange" />
        ))}
      </CameraView>

      <View className="w-full absolute top-0 justify-center items-center">
        <View className="p-2 px-5 bg-gray-300 rounded-b-lg flex flex-row items-center gap-1">
          <BanknotesIcon color={"green"} width={20} height={20} />
          <Text className="text-center text-black">{budget}$</Text>
        </View>
      </View>

      {(mode == "chain" || mode == "arch") &&
        <View className="absolute right-0 top-[50%] justify-center items-center rounded-l-lg bg-gray-300 py-4">
          <View className="p-2 px-5  flex flex-row items-center gap-1">
            <NumericInput min={60} max={300} step={10} defaultValue={MAX_CHAIN_SEGMENT_LENGTH.current} onChange={(newValue) => {
              MAX_CHAIN_SEGMENT_LENGTH.current = newValue;
              if (generatingChain == true) {
                generateChainPreview(chainData.value.from, chainData.value.tox, chainData.value.toy);

              }
            }} />
          </View>
          <View className="flex flex-row gap-5">
            <TouchableOpacity
              onPress={() => createChain()}>
              <PlusIcon color={"white"} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setGeneratingChain(false);
                setTemporaryChainNodes([])
                line.p2.value = { x: 0, y: 0 }
                line.p1.value = { x: 0, y: 0 }
              }}>
              <ArrowPathRoundedSquareIcon color={"white"} />
            </TouchableOpacity>
          </View>
        </View>
      }
    </View>
  );
}

function Car(carSettings: CarSettings) {
  const rectBody = {
    x: -carSettings.width / 2,
    y: -carSettings.height / 2,
    width: carSettings.width,
    height: carSettings.height,
  };

  const rearWheel_cx = -carSettings.width / 2 + carSettings.wheelRadius;
  const frontWheel_cx = carSettings.width / 2 - carSettings.wheelRadius;
  const wheels_cy = carSettings.height / 2 + carSettings.wheelOffsetY;

  return (
    <Group
      transform={[
        {
          translateX: carSettings.startTransform.x,
        },
        {
          translateY: carSettings.startTransform.y,
        },
      ]}
    >
      <Rect rect={rectBody} color="black" />

      <Circle
        cx={rearWheel_cx}
        cy={wheels_cy}
        r={carSettings.wheelRadius}
        color="black"
      />

      <Circle
        cx={frontWheel_cx}
        cy={wheels_cy}
        r={carSettings.wheelRadius}
        color="black"
      />
    </Group>
  );
}

function CurrentPriceIndicator({
  price,
  font,
  line,
}: {
  price: SharedValue<number>;
  font: SkFont;
  line: {
    p1: SharedValue<{ x: number; y: number }>;
    p2: SharedValue<{ x: number; y: number }>;
  };
}) {
  const priceText = useDerivedValue(() => {
    return price.value.toString() + "$";
  }, [price]);

  const midPointX = useDerivedValue(() => {
    return (line.p1.value.x + line.p2.value.x) / 2;
  }, [line]);

  const midPointY = useDerivedValue(() => {
    return (line.p1.value.y + line.p2.value.y) / 2 - 20;
  }, [line]);

  const opacity = useDerivedValue(() => {
    return price.value > 0 ? 1 : 0;
  }, [price]);

  return (
    <CanvasText
      x={midPointX}
      y={midPointY}
      text={priceText}
      font={font}
      color="black"
      opacity={opacity}
    />
  );
}
