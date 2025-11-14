import {
  overlaps,
  overlapsRectangle,
  overlapsStaticCar,
} from "@/lib/canvasHelper";
import {
  CarSettings,
  MapElement,
  Material,
  Menus,
  Modes,
  NodeData,
} from "@/lib/types";
import { Circle, Group, Rect, SkRect } from "@shopify/react-native-skia";
import React, { useEffect } from "react";
import { View } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  SharedValue,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";
import CameraView from "./CameraView";
import { useSFX } from "./SFXProvider";

export default function LevelCreator({
  nodes,
  setNodes,
  carSettings,
  mapElements,
  setMapElements,
  endCollision,
  setEndCollision,
  mode,
  menu,
  setMenu,
  selectedMaterial,
  running,
}: {
  nodes: NodeData[];
  setNodes: React.Dispatch<React.SetStateAction<NodeData[]>>;
  carSettings: CarSettings;
  mapElements: MapElement[];
  setMapElements: React.Dispatch<React.SetStateAction<MapElement[]>>;
  endCollision: SkRect;
  setEndCollision: React.Dispatch<React.SetStateAction<SkRect>>;
  mode: Modes;
  menu: Menus;
  setMenu: React.Dispatch<React.SetStateAction<Menus>>;
  selectedMaterial: Material;
  running: boolean;
}) {
  const sfx = useSFX();

  const enableCameraTransform = useSharedValue<boolean>(true);
  const cameraTransform = useSharedValue<{
    translateX: number;
    translateY: number;
    scale: number;
  }>({ translateX: 0, translateY: 0, scale: 1 });

  const sharedMapElements = useSharedValue<MapElement[]>([...mapElements]);
  useEffect(() => {
    sharedMapElements.value = [...mapElements];
  }, [mapElements]);
  const sharedNodes = useSharedValue<NodeData[]>([...nodes]);
  useEffect(() => {
    sharedNodes.value = [...nodes];
  }, [nodes]);

  const sharedEndCollision = useSharedValue<SkRect>({
    x: endCollision.x,
    y: endCollision.y,
    width: endCollision.width,
    height: endCollision.height,
  });
  useEffect(() => {
    sharedEndCollision.value = {
      x: endCollision.x,
      y: endCollision.y,
      width: endCollision.width,
      height: endCollision.height,
    };
  }, [endCollision]);

  const selectedElement = useSharedValue<number | undefined>(undefined);
  const selectedNode = useSharedValue<number | undefined>(undefined);
  const selectedEnd = useSharedValue<boolean>(false);

  function addNode(newNode: NodeData) {
    sfx.playSound("click");
    setNodes((current) => [...current, newNode]);
  }

  function addElement(newElement: MapElement) {
    sfx.playSound("click");
    setMapElements((current) => [...current, newElement]);
  }

  function removeNode(nodeIndex: number) {
    sfx.playSound("click");
    setNodes((currentNodes) => currentNodes.filter((_, i) => i !== nodeIndex));
  }

  function removeElement(elementIndex: number) {
    sfx.playSound("click");
    setMapElements((currentElements) =>
      currentElements.filter((_, i) => i !== elementIndex)
    );
  }

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      "worklet";
      runOnJS(setMenu)("none");
      if (mode == "delete" || mode == "create") return;
      enableCameraTransform.value = false;

      const worldX =
        (e.x - cameraTransform.value.translateX) / cameraTransform.value.scale;
      const worldY =
        (e.y - cameraTransform.value.translateY) / cameraTransform.value.scale;

      if (overlapsRectangle(worldX, worldY, endCollision)) {
        if (mode == "move") {
          selectedEnd.value = true;
        }
        return;
      }

      const nodeIndex = overlaps(
        worldX,
        worldY,
        sharedNodes.value,
        cameraTransform.value
      );

      if (nodeIndex !== undefined) {
        selectedNode.value = nodeIndex;
        runOnJS(sfx.playSound)("click");
        selectedElement.value = undefined;
        return;
      }

      const elementIndex = sharedMapElements.value.findIndex((elem) => {
        return (
          worldX >= elem.x &&
          worldX <= elem.x + elem.width &&
          worldY >= elem.y &&
          worldY <= elem.y + elem.height
        );
      });

      if (elementIndex === -1) {
        selectedElement.value = undefined;
        selectedNode.value = undefined;
        enableCameraTransform.value = true;
        return;
      }
      selectedElement.value = elementIndex;
      runOnJS(sfx.playSound)("click");
    })
    .onChange((e) => {
      "worklet";
      const worldX =
        (e.x - cameraTransform.value.translateX) / cameraTransform.value.scale;
      const worldY =
        (e.y - cameraTransform.value.translateY) / cameraTransform.value.scale;

      if (selectedEnd.value) {
        if (mode == "move") {
          enableCameraTransform.value = false;
          sharedEndCollision.value = {
            x: worldX - endCollision.width / 2,
            y: worldY - endCollision.height / 2,
            width: endCollision.width,
            height: endCollision.height,
          };
        }
        return;
      }

      if (mode == "move" && selectedElement.value !== undefined) {
        const elem = sharedMapElements.value[selectedElement.value!];
        const newElements = [...mapElements];
        newElements[selectedElement.value!] = {
          ...elem,
          x: worldX - elem.width / 2,
          y: worldY - elem.height / 2,
        };
        sharedMapElements.value = newElements;
      } else if (mode == "move" && selectedNode.value !== undefined) {
        const elem = sharedNodes.value[selectedNode.value!];
        const newElements = [...nodes];
        newElements[selectedNode.value!] = {
          ...elem,
          x: worldX,
          y: worldY,
        };
        sharedNodes.value = newElements;
      }

      if (selectedNode.value !== undefined) return;

      if (mode == "resize") {
        const elem = sharedMapElements.value[selectedElement.value!];
        const newWidth = Math.max(10, worldX - elem.x);
        const newHeight = Math.max(10, worldY - elem.y);
        const newElements = [...mapElements];
        newElements[selectedElement.value!] = {
          ...elem,
          width: newWidth,
          height: newHeight,
        };
        sharedMapElements.value = newElements;
      }
      if (mode == "rotate") {
        const elem = sharedMapElements.value[selectedElement.value!];
        const centerX = elem.x + elem.width / 2;
        const centerY = elem.y + elem.height / 2;
        const angle = Math.atan2(worldY - centerY, worldX - centerX);
        const newElements = [...mapElements];
        newElements[selectedElement.value!] = {
          ...elem,
          angle: angle,
        };
        sharedMapElements.value = newElements;
      }
    })
    .onEnd((e) => {
      "worklet";
      enableCameraTransform.value = true;

      if (selectedElement.value !== undefined) {
        runOnJS(setMapElements)(sharedMapElements.value);
      } else if (selectedNode.value !== undefined) {
        runOnJS(setNodes)(sharedNodes.value);
      } else if (selectedEnd.value) {
        runOnJS(setEndCollision)(sharedEndCollision.value);
        selectedEnd.value = false;
      }
    });

  const tapGesture = Gesture.Tap().onEnd((e) => {
    "worklet";

    const worldX =
      (e.x - cameraTransform.value.translateX) / cameraTransform.value.scale;
    const worldY =
      (e.y - cameraTransform.value.translateY) / cameraTransform.value.scale;

    if (overlapsStaticCar(worldX, worldY, carSettings)) {
      runOnJS(sfx.playSound)("error");
      runOnJS(setMenu)(menu == "car" ? "none" : "car");
      return;
    }

    if (mode == "create") {
      const newElement: MapElement = {
        x: worldX - 50,
        y: worldY - 10,
        width: 100,
        height: 20,
        angle: 0,
        material: selectedMaterial,
      };
      runOnJS(addElement)(newElement);
    } else if (mode == "delete") {
      const nodeIndex = overlaps(
        worldX,
        worldY,
        sharedNodes.value,
        cameraTransform.value
      );

      if (nodeIndex !== undefined) {
        runOnJS(removeNode)(nodeIndex);
        return;
      }

      const elementIndex = sharedMapElements.value.findIndex((elem) => {
        return (
          worldX >= elem.x &&
          worldX <= elem.x + elem.width &&
          worldY >= elem.y &&
          worldY <= elem.y + elem.height
        );
      });

      if (elementIndex !== -1) {
        runOnJS(removeElement)(elementIndex);
      }
    } else if (mode == "arch") {
      //Using arch for node creation
      const newNode: NodeData = {
        x: worldX,
        y: worldY,
        r: 13,
        isStatic: true,
      };
      runOnJS(addNode)(newNode);
    }
  });

  const composedGesture = Gesture.Simultaneous(tapGesture, panGesture);

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        otherGestures={composedGesture}
        enableTransform={enableCameraTransform}
        transform={cameraTransform}
      >
        {mapElements.map((elem, index) => (
          <DynamicMapElement
            key={index}
            sharedMapElements={sharedMapElements}
            index={index}
          />
        ))}

        {nodes.map((node, i) => (
          <DynamicCircle key={i} sharedNodes={sharedNodes} index={i} />
        ))}

        <Car {...carSettings} />

        <DynamicRect sharedRect={sharedEndCollision} />
      </CameraView>
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

function DynamicRect({ sharedRect }: { sharedRect: SharedValue<SkRect> }) {
  const rect = useDerivedValue(() => {
    return sharedRect.value;
  }, [sharedRect]);

  return <Rect rect={rect} color={"orange"} />;
}

function DynamicMapElement({
  sharedMapElements,
  index,
}: {
  sharedMapElements: SharedValue<MapElement[]>;
  index: number;
}) {
  const elementData = useDerivedValue(() => {
    return sharedMapElements.value[index];
  }, [sharedMapElements, index]);

  const transform = useDerivedValue(() => {
    const elem = elementData.value;
    if (!elem) return [];

    const centerX = elem.x + elem.width / 2;
    const centerY = elem.y + elem.height / 2;

    return [
      { translateX: centerX },
      { translateY: centerY },
      { rotate: elem.angle },
    ];
  }, [elementData]);

  const rect = useDerivedValue<SkRect>(() => {
    const elem = elementData.value;
    if (!elem) return { x: 0, y: 0, width: 0, height: 0 };

    return {
      x: -elem.width / 2,
      y: -elem.height / 2,
      width: elem.width,
      height: elem.height,
    };
  }, [elementData]);

  const color = useDerivedValue(() => {
    const elem = elementData.value;
    return elem ? elem.material.color : "transparent";
  }, [elementData]);

  return (
    <Group transform={transform}>
      <Rect rect={rect} color={color} />
    </Group>
  );
}

function DynamicCircle({
  sharedNodes,
  index,
}: {
  sharedNodes: SharedValue<NodeData[]>;
  index: number;
}) {
  const cx = useDerivedValue(() => {
    return sharedNodes.value[index]?.x ?? 0;
  }, [sharedNodes, index]);
  const cy = useDerivedValue(() => {
    return sharedNodes.value[index]?.y ?? 0;
  }, [sharedNodes, index]);
  const r = useDerivedValue(() => {
    return sharedNodes.value[index]?.r ?? 0;
  }, [sharedNodes, index]);

  return <Circle cx={cx} cy={cy} r={r} color={"orange"} />;
}
