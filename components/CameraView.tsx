import { Canvas, Group } from "@shopify/react-native-skia";
import { useEffect } from "react";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  GestureType,
  SimultaneousGesture,
} from "react-native-gesture-handler";
import {
  SharedValue,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

export default function CameraView({
  children,
  otherGestures,
  enableTransform,
  transform,
}: {
  children: React.ReactNode;
  otherGestures?: GestureType | SimultaneousGesture;
  enableTransform?: SharedValue<boolean>;
  transform?: SharedValue<{
    translateX: number;
    translateY: number;
    scale: number;
  }>;
}) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  useEffect(() => {
    if (!transform) return;

    scale.value = transform.value.scale;
    savedScale.value = transform.value.scale;

    translateX.value = transform.value.translateX;
    translateY.value = transform.value.translateY;
    savedTranslateX.value = transform.value.translateX;
    savedTranslateY.value = transform.value.translateY;
  }, []);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (enableTransform?.value === false) return;
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
      if (transform) {
        transform.value = {
          translateX: translateX.value,
          translateY: translateY.value,
          scale: scale.value,
        };
      }
    })
    .onEnd(() => {
      if (enableTransform?.value === false) return;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      if (enableTransform?.value === false) return;
      scale.value = savedScale.value * e.scale;

      translateX.value =
        e.focalX - (e.focalX - savedTranslateX.value) * e.scale;
      translateY.value =
        e.focalY - (e.focalY - savedTranslateY.value) * e.scale;

      if (transform) {
        transform.value = {
          translateX: translateX.value,
          translateY: translateY.value,
          scale: scale.value,
        };
      }
    })
    .onEnd((e) => {
      if (enableTransform?.value === false) return;
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const gestures: GestureType[] = [panGesture, pinchGesture];
  if (otherGestures) {
    gestures.push(otherGestures as GestureType);
  }
  const composedGesture = Gesture.Simultaneous(...gestures);

  const animatedTransform = useDerivedValue(() => {
    return [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ];
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={composedGesture}>
        <Canvas style={{ flex: 1 }}>
          <Group transform={animatedTransform}>{children}</Group>
        </Canvas>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
