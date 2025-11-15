import {
  CalculateBounds,
  EndMarker,
  overlaps,
  overlapsConnection,
  overlapsStaticCar,
} from "@/lib/canvasHelper";
import {
  CarSettings,
  Connection,
  MapElement,
  Material,
  Menus,
  Modes,
  NodeData,
} from "@/lib/types";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
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
import { Text, View } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { PlusIcon } from "react-native-heroicons/outline";
import BanknotesIcon from "react-native-heroicons/outline/BanknotesIcon";
import {
  runOnJS,
  SharedValue,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import Button from "./Button";
import CameraView from "./CameraView";
import CarMenu from "./CarMenu";
import { useSFX } from "./SFXProvider";

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
  menu,
  setMenu,
  running,
  selectedMaterial,
  mapElements,
  carSettings,
  budget,
  setBudget,
  closeMenus,
  endCollision,
}: {
  nodes: NodeData[];
  connections: Connection[];
  setNodes: React.Dispatch<React.SetStateAction<NodeData[]>>;
  setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
  mode: Modes;
  setMode: React.Dispatch<React.SetStateAction<Modes>>;
  menu: Menus;
  setMenu: React.Dispatch<React.SetStateAction<Menus>>;
  running: boolean;
  selectedMaterial: Material;
  mapElements: MapElement[];
  carSettings: CarSettings;
  budget: number;
  setBudget: React.Dispatch<React.SetStateAction<number>>;
  closeMenus: () => void;
  endCollision: { x: number; y: number; width: number; height: number };
}) {
  const sfx = useSFX();

  const bounds = CalculateBounds(mapElements);

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
    lastPrice.value = 0;
  }, [mode]);

  const [temporaryChainNodes, setTemporaryChainNodes] = useState<
    { x: number; y: number; value: number }[]
  >([]);
  const [temporaryChainsOrigin, setTemporaryChainsOrigin] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const MAX_CHAIN_SEGMENT_LENGTH = useRef(100);
  const ARCH_HEIGHT = useRef(30);
  const [generatingChain, setGeneratingChain] = useState(false);
  const chainData = useSharedValue<{
    from: number;
    tox: number;
    toy: number;
    to?: number | undefined;
  }>({ from: -1, tox: 0, toy: 0 });

  const lastPrice = useSharedValue(0);
  const lastPriceTextFont = matchFont({
    fontFamily: "Helvetica",
    fontSize: 14,
  });

  useEffect(() => {
    if (generatingChain == true) return;

    line.p1.value = { x: 0, y: 0 };
    line.p2.value = { x: 0, y: 0 };
  }, [generatingChain]);

  function addConnection(
    from: number,
    to: number,
    value: number,
    dontTakeFromBudget?: boolean,
    returnIfDuplicate?: boolean
  ) {
    setConnections((conns) => {
      if (from === to) return conns;

      const index = conns.findIndex(
        (c) =>
          (c.from === from && c.to === to) || (c.from === to && c.to === from)
      );

      if (index !== -1) {
        const newConns = [...conns];
        newConns[index] = {
          ...newConns[index],
          value,
        };
        if (returnIfDuplicate == true) {
          setBudget((prev) => prev + value);
        }
        dontTakeFromBudget = true;
        return newConns;
      }

      console.log("Connecting node", from, "to", to, "with value", value);
      return [...conns, { from, to, material: selectedMaterial, value: value }];
    });

    sfx.playSound("click");
    sfx.playHaptic("Light");

    if (dontTakeFromBudget === true) return;
    setBudget((prev) => prev - value);
  }

  function addNode(newNode: NodeData) {
    setNodes((currentNodes) => {
      console.log("Adding node at", newNode.x, newNode.y);
      return [...currentNodes, newNode];
    });
    sfx.playSound("click");
    sfx.playHaptic("Light");
  }

  function createChain() {
    if (lastPrice.value > budget) {
      lastPrice.value = 0;
      line.p1.value = vec(0, 0);
      line.p2.value = vec(0, 0);

      setTemporaryChainNodes([]);
      setGeneratingChain(false);

      runOnJS(sfx.playSound)("error");
      runOnJS(sfx.playHaptic)("Heavy");
      return;
    }

    if (generatingChain == false) {
      sfx.playSound("error");
      sfx.playHaptic("Heavy");
      return;
    }

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

    let segments = Math.max(
      1,
      Math.ceil(distance / MAX_CHAIN_SEGMENT_LENGTH.current)
    );

    const segmentLength = distance / segments;
    const angle = Math.atan2(
      finalPosition.y - fromNode.y,
      finalPosition.x - fromNode.x
    );

    if (chainData.value.to !== undefined) {
      segments--;
    }

    let archChange = 0;
    if (mode == "arch") {
      archChange++;
    }

    const perpAngleX = Math.sin(angle);
    const perpAngleY = -Math.cos(angle);

    let lastNodeIndex = chainData.value.from;
    for (let i = 1; i <= segments; i++) {
      const chordX = fromNode.x + i * segmentLength * Math.cos(angle);
      const chordY = fromNode.y + i * segmentLength * Math.sin(angle);

      const archProgress = i / (segments + archChange);
      const heightFromArch =
        mode === "arch"
          ? ARCH_HEIGHT.current * Math.sin(archProgress * Math.PI)
          : 0;

      const newX = chordX + heightFromArch * perpAngleX;
      const newY = chordY + heightFromArch * perpAngleY;
      const newNode: NodeData = {
        x: newX,
        y: newY,
        r: 13,
      };
      addNode(newNode);
      const newIndex = nodes.length + i - 1;
      addConnection(lastNodeIndex, newIndex, temporaryChainNodes[i - 1].value);
      lastNodeIndex = newIndex;
    }

    if (chainData.value.to !== undefined) {
      addConnection(
        lastNodeIndex,
        chainData.value.to,
        temporaryChainNodes[segments].value
      );
    }

    setMode("create");
    setGeneratingChain(false);
    setTemporaryChainNodes([]);
    lastPrice.value = 0;
  }

  function generateChainPreview(from: number, toX: number, toY: number) {
    const fromNode = nodes[from];
    setTemporaryChainsOrigin({ x: fromNode.x, y: fromNode.y });

    const finalPosition = { x: toX, y: toY };

    const distance = Math.sqrt(
      Math.pow(fromNode.x - toX, 2) + Math.pow(fromNode.y - toY, 2)
    );

    let segments = Math.max(
      1,
      Math.ceil(distance / MAX_CHAIN_SEGMENT_LENGTH.current)
    );

    const segmentLength = distance / segments;
    const angle = Math.atan2(
      finalPosition.y - fromNode.y,
      finalPosition.x - fromNode.x
    );

    const perpAngleX = Math.sin(angle);
    const perpAngleY = -Math.cos(angle);

    let lastX = fromNode.x;
    let lastY = fromNode.y;

    let price = 0;
    let archStep = -Math.floor(segments / 2) + 1;
    const newTemporaryNodes: { x: number; y: number; value: number }[] = [];
    for (let i = 1; i <= segments; i++) {
      const chordX = fromNode.x + i * segmentLength * Math.cos(angle);
      const chordY = fromNode.y + i * segmentLength * Math.sin(angle);

      const archProgress = i / segments;
      const heightFromArch =
        mode === "arch"
          ? ARCH_HEIGHT.current * Math.sin(archProgress * Math.PI)
          : 0;

      const newX = chordX + heightFromArch * perpAngleX;
      const newY = chordY + heightFromArch * perpAngleY;

      if (i == Math.round(segments / 2)) {
        line.p1.value = vec(newX, newY);
        line.p2.value = vec(newX, newY);
      }

      let value = 0;
      if (i - 1 == -1) {
        const distanceFromPrevious = Math.sqrt(
          Math.pow(fromNode.x - newX, 2) + Math.pow(fromNode.y - newY, 2)
        );

        value = calculatePrice(distanceFromPrevious, selectedMaterial);
      } else {
        const distanceFromPrevious = Math.sqrt(
          Math.pow(lastX - newX, 2) + Math.pow(lastY - newY, 2)
        );
        value = calculatePrice(distanceFromPrevious, selectedMaterial);
      }
      price += value;

      newTemporaryNodes.push({ x: newX, y: newY, value: value });
      archStep++;

      lastX = newX;
      lastY = newY;
    }
    //lastPrice.value = price;
    setTemporaryChainNodes(newTemporaryNodes);
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
      const filtered = currentConns.filter((conn, i) => {
        if (conn.from !== nodeIndex && conn.to !== nodeIndex) {
          return true;
        }
        setBudget((prev) => prev + currentConns[i].value!);
        return false;
      });

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

    setBudget((prev) => prev + connections[connectionIndex].value!);

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

    sfx.playSound("click");
    sfx.playHaptic("Light");
  }

  function moveNode(nodeIndex: number, newX: number, newY: number) {
    "worklet";

    const connsToUpdate = connections.filter(
      (conn) => conn.from === nodeIndex || conn.to === nodeIndex
    );
    const vals = connsToUpdate.map((c) => c.value);

    let totalValueDifference = 0;
    connsToUpdate.forEach((conn, i) => {
      const otherNodeIndex = conn.from === nodeIndex ? conn.to : conn.from;

      const newDistance = Math.sqrt(
        Math.pow(sharedNodes.value[otherNodeIndex].x - newX, 2) +
          Math.pow(sharedNodes.value[otherNodeIndex].y - newY, 2)
      );
      const newValue = calculatePrice(newDistance, conn.material);
      const valueDifference = newValue - conn.value!;
      totalValueDifference += valueDifference;

      vals[i] = newValue;
    });

    if (budget - totalValueDifference < 0) {
      runOnJS(sfx.playSound)("error");
      runOnJS(sfx.playHaptic)("Heavy");
      return;
    }

    connsToUpdate.forEach((conn, i) => {
      const otherNodeIndex = conn.from === nodeIndex ? conn.to : conn.from;
      runOnJS(addConnection)(otherNodeIndex, nodeIndex, vals[i]!, true, false);
    });

    runOnJS(setBudget)(budget - totalValueDifference);

    const newNodes = [...nodes];
    newNodes[nodeIndex] = {
      ...newNodes[nodeIndex],
      x: newX,
      y: newY,
    };
    runOnJS(setNodes)(newNodes);
  }

  function mergeNodes(targetIndex: number, fromIndex: number) {
    "worklet";
    const connsToUpdate = connections.filter(
      (conn) => conn.from === fromIndex || conn.to === fromIndex
    );

    connsToUpdate.forEach((conn) => {
      const otherNodeIndex = conn.from === fromIndex ? conn.to : conn.from;

      const newDistance = Math.sqrt(
        Math.pow(
          sharedNodes.value[otherNodeIndex].x -
            sharedNodes.value[targetIndex].x,
          2
        ) +
          Math.pow(
            sharedNodes.value[otherNodeIndex].y -
              sharedNodes.value[targetIndex].y,
            2
          )
      );
      const newValue = calculatePrice(newDistance, conn.material);
      const valueDifference = conn.value! - newValue;

      conn.value = newValue;

      runOnJS(addConnection)(
        otherNodeIndex,
        targetIndex,
        newValue,
        false,
        true
      );
    });
    runOnJS(deleteNode)(fromIndex);
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

        if (mode == "chain" || mode == "arch") {
          runOnJS(setGeneratingChain)(true);
        }

        if (mode == "move") {
          if (nodes[nodeIndex].isStatic) {
            runOnJS(sfx.playSound)("error");
          } else {
            runOnJS(sfx.playSound)("click");
          }
          runOnJS(sfx.playHaptic)("Light");
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

      if (mode == "create") {
        line.p2.value = vec(worldX, worldY);
        const distance = Math.sqrt(
          Math.pow(worldX - line.p1.value.x, 2) +
            Math.pow(worldY - line.p1.value.y, 2)
        );
        lastPrice.value = calculatePrice(distance, selectedMaterial);
      }

      if (mode == "move") {
        if (nodes[selectedNode.value].isStatic) return;

        moveNode(selectedNode.value, worldX, worldY);

        // calculate refund
      } else if (mode == "chain" || mode == "arch") {
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
        line.p1.value = vec(0, 0);
        line.p2.value = vec(0, 0);
        runOnJS(sfx.playSound)("error");
        runOnJS(sfx.playHaptic)("Heavy");
        return;
      }

      const targetIndex = overlaps(
        e.x,
        e.y,
        sharedNodes.value,
        cameraTransform.value,
        fromIndex
      );

      if (mode == "create") {
        if (targetIndex !== undefined) {
          //here calculate distance from fromIndex to targetIndex
          const fromNode = sharedNodes.value[fromIndex];
          const toNode = sharedNodes.value[targetIndex];
          const distance = Math.sqrt(
            Math.pow(toNode.x - fromNode.x, 2) +
              Math.pow(toNode.y - fromNode.y, 2)
          );
          const price = calculatePrice(distance, selectedMaterial);
          runOnJS(addConnection)(fromIndex, targetIndex, price);
        } else {
          const newNode: NodeData = {
            x: worldX,
            y: worldY,
            r: 13,
          };
          sharedNodes.value = [...sharedNodes.value, newNode];
          runOnJS(addNode)(newNode);
          runOnJS(addConnection)(
            fromIndex,
            sharedNodes.value.length - 1,
            lastPrice.value
          );
        }
      } else if (mode == "move") {
        if (targetIndex !== undefined) {
          mergeNodes(targetIndex, fromIndex);
        }
        if (nodes[fromIndex].isStatic !== true) {
          runOnJS(sfx.playSound)("click");
          runOnJS(sfx.playHaptic)("Light");
        }
      } else if (mode == "chain" || mode == "arch") {
        chainData.value.from = fromIndex;
        chainData.value.tox = worldX;
        chainData.value.toy = worldY;
        chainData.value.to = targetIndex ? targetIndex : undefined;
      }

      if (mode != "chain" && mode != "arch") {
        runOnJS(setTemporaryChainNodes)([]);
        lastPrice.value = 0;
      }
      line.p1.value = vec(0, 0);
      line.p2.value = vec(0, 0);
    });

  const tapGesture = Gesture.Tap().onEnd((e) => {
    "worklet";
    const worldX =
      (e.x - cameraTransform.value.translateX) / cameraTransform.value.scale;
    const worldY =
      (e.y - cameraTransform.value.translateY) / cameraTransform.value.scale;

    if (overlapsStaticCar(worldX, worldY, carSettings)) {
      runOnJS(sfx.playSound)("click");
      runOnJS(setMenu)(menu == "car" ? "none" : "car");
      return;
    }

    if (mode !== "delete" || running) return;

    const connectionIndex = overlapsConnection(
      e.x,
      e.y,
      sharedNodes.value,
      sharedConnections.value,
      cameraTransform.value
    );

    line.p1.value = vec(0, 0);
    line.p2.value = vec(0, 0);

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
        bounds={bounds}
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
          selectedNode={selectedNode}
          isGeneratingChain={generatingChain}
        />

        <TemporaryChainPreview
          temporaryChainNodes={temporaryChainNodes}
          origin={temporaryChainsOrigin}
          selectedMaterial={selectedMaterial}
        />

        <EndMarker position={endCollision} />
      </CameraView>

      <View className="w-full absolute top-0 justify-center items-center">
        <View className="p-2 px-5 bg-gray-300 rounded-b-lg flex flex-row items-center gap-1">
          <BanknotesIcon color={"green"} width={20} height={20} />
          <Text className="text-center text-black">{budget}$</Text>
        </View>
      </View>

      {(mode == "chain" || mode == "arch") && (
        <View className="absolute right-0 bottom-[0%] justify-center items-center bg-gray-300 pb-2 pr-2 rounded-tl-xl">
          <View className="flex flex-row items-center gap-1 ">
            <Slider
              value={MAX_CHAIN_SEGMENT_LENGTH.current}
              onValueChange={(newValue) => {
                MAX_CHAIN_SEGMENT_LENGTH.current = newValue;
                sfx.playHaptic("Soft");
                if (generatingChain == true) {
                  generateChainPreview(
                    chainData.value.from,
                    chainData.value.tox,
                    chainData.value.toy
                  );
                }
              }}
              step={5}
              style={{ width: 200, height: 40 }}
              minimumValue={60}
              maximumValue={200}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
            />
            <MaterialCommunityIcons
              name="map-marker-distance"
              size={24}
              color="white"
            />
          </View>
          {mode == "arch" && (
            <View className="  flex flex-row items-center gap-1">
              <Slider
                value={ARCH_HEIGHT.current}
                onValueChange={(newValue) => {
                  ARCH_HEIGHT.current = newValue;
                  sfx.playHaptic("Soft");
                  if (generatingChain == true) {
                    generateChainPreview(
                      chainData.value.from,
                      chainData.value.tox,
                      chainData.value.toy
                    );
                  }
                }}
                step={5}
                style={{ width: 200, height: 40 }}
                minimumValue={-150}
                maximumValue={150}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#000000"
              />
              <MaterialCommunityIcons
                name="angle-acute"
                size={24}
                color="white"
              />
            </View>
          )}
          <View className="flex flex-row gap-5">
            <Button
              className="bg-green-500 p-2 rounded-xl"
              onPress={() => createChain()}
              disabled={lastPrice.value > budget || generatingChain == false}
            >
              <PlusIcon color={"white"} />
            </Button>
            <Button
              className="bg-red-500 p-2 rounded-xl"
              onPress={() => {
                setGeneratingChain(false);
                setTemporaryChainNodes([]);
                line.p2.value = { x: 0, y: 0 };
                line.p1.value = { x: 0, y: 0 };
              }}
              disabled={lastPrice.value > budget || generatingChain == false}
              sound="click"
              hapticStyle="Light"
            >
              <MaterialIcons name="cancel" size={24} color="white" />
            </Button>
          </View>
        </View>
      )}

      {menu == "car" && <CarMenu carSettings={carSettings} setMenu={setMenu} />}
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
  selectedNode,
  isGeneratingChain,
}: {
  price: SharedValue<number>;
  font: SkFont;
  line: {
    p1: SharedValue<{ x: number; y: number }>;
    p2: SharedValue<{ x: number; y: number }>;
  };
  selectedNode: SharedValue<number | null>;
  isGeneratingChain: boolean;
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
    return price.value > 0 &&
      (isGeneratingChain === true || selectedNode.value !== null)
      ? 1
      : 0;
  }, [price, isGeneratingChain, selectedNode]);

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

function TemporaryChainPreview({
  origin,
  temporaryChainNodes,
  selectedMaterial,
}: {
  origin: { x: number; y: number } | null;
  temporaryChainNodes: { x: number; y: number; value: number }[];
  selectedMaterial: Material;
}) {
  return (
    <>
      {origin && temporaryChainNodes.length > 0 && (
        <Line
          p1={origin}
          p2={temporaryChainNodes[0]}
          strokeWidth={10}
          color={selectedMaterial.color}
          style={"stroke"}
        />
      )}
      {temporaryChainNodes.map((node, index) => {
        const nextNode = temporaryChainNodes[index + 1] ?? undefined;

        return (
          <Group key={index}>
            {nextNode !== undefined && (
              <Line
                p1={node}
                p2={nextNode}
                strokeWidth={10}
                color={selectedMaterial.color}
                style={"stroke"}
              />
            )}
            <Circle cx={node.x} cy={node.y} r={13} color="orange" />
          </Group>
        );
      })}
    </>
  );
}
