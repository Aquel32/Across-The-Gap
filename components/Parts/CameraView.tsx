import { CameraBounds, CameraTransform } from "@/lib/types";
import { Canvas, Group, SkSize } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { ViewStyle } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  GestureType,
  SimultaneousGesture,
} from "react-native-gesture-handler";
import {
  SharedValue,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

const clamp = (value: number, min: number, max: number) => {
  "worklet";
  return Math.max(min, Math.min(value, max));
};

const MAX_ZOOM_SCALE = 5;

export default function CameraView({
  children,
  otherGestures,
  enableTransform,
  transform,
  bounds,
  style,
}: {
  children: React.ReactNode;
  otherGestures?: GestureType | SimultaneousGesture;
  enableTransform?: SharedValue<boolean>;
  transform?: SharedValue<CameraTransform>;
  bounds?: CameraBounds;
  style?: ViewStyle;
}) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const canvasSize = useSharedValue<SkSize>({ width: 0, height: 0 });

  useEffect(() => {
    if (!transform) return;
    scale.value = transform.value.scale;
    savedScale.value = transform.value.scale;
    translateX.value = transform.value.translateX;
    translateY.value = transform.value.translateY;
    savedTranslateX.value = transform.value.translateX;
    savedTranslateY.value = transform.value.translateY;
  }, [transform]);

  const applyClampedTransform = (
    newTranslateX: number,
    newTranslateY: number,
    newScale: number
  ) => {
    "worklet";
    if (
      !bounds ||
      canvasSize.value.width === 0 ||
      canvasSize.value.height === 0
    ) {
      scale.value = newScale;
      translateX.value = newTranslateX;
      translateY.value = newTranslateY;
    } else {
      const worldWidth = bounds.maxX - bounds.minX;
      const worldHeight = bounds.maxY - bounds.minY;

      const minScaleX = canvasSize.value.width / worldWidth;
      const minScaleY = canvasSize.value.height / worldHeight;
      const minScale = Math.max(minScaleX, minScaleY);

      const clampedScale = clamp(newScale, minScale, MAX_ZOOM_SCALE);

      const maxTranslateX = -bounds.minX * clampedScale;
      const minTranslateX = canvasSize.value.width - bounds.maxX * clampedScale;

      const maxTranslateY = -bounds.minY * clampedScale;
      const minTranslateY =
        canvasSize.value.height - bounds.maxY * clampedScale;
      let clampedTranslateX, clampedTranslateY;

      if (minTranslateX > maxTranslateX) {
        clampedTranslateX = (minTranslateX + maxTranslateX) / 2;
      } else {
        clampedTranslateX = clamp(newTranslateX, minTranslateX, maxTranslateX);
      }

      if (minTranslateY > maxTranslateY) {
        clampedTranslateY = (minTranslateY + maxTranslateY) / 2;
      } else {
        clampedTranslateY = clamp(newTranslateY, minTranslateY, maxTranslateY);
      }

      scale.value = clampedScale;
      translateX.value = clampedTranslateX;
      translateY.value = clampedTranslateY;
    }

    if (transform) {
      transform.value = {
        translateX: translateX.value,
        translateY: translateY.value,
        scale: scale.value,
      };
    }
  };

  useAnimatedReaction(
    () => {
      return canvasSize.value;
    },
    (currentSize, previousSize) => {
      if (currentSize.width > 0 && previousSize?.width === 0 && bounds) {
        ("worklet");
        applyClampedTransform(translateX.value, translateY.value, scale.value);

        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
        savedScale.value = scale.value;
      }
    },
    [bounds, applyClampedTransform]
  );

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      "worklet";
      if (enableTransform?.value === false) return;

      const newTranslateX = savedTranslateX.value + e.translationX;
      const newTranslateY = savedTranslateY.value + e.translationY;
      applyClampedTransform(newTranslateX, newTranslateY, scale.value);
    })
    .onEnd(() => {
      "worklet";
      if (enableTransform?.value === false) return;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      "worklet";
      if (enableTransform?.value === false) return;
      const newScale = savedScale.value * e.scale;
      const newTranslateX =
        e.focalX - (e.focalX - savedTranslateX.value) * e.scale;
      const newTranslateY =
        e.focalY - (e.focalY - savedTranslateY.value) * e.scale;
      applyClampedTransform(newTranslateX, newTranslateY, newScale);
    })
    .onEnd(() => {
      "worklet";
      if (enableTransform?.value === false) return;
      if (bounds && canvasSize.value.width === 0) {
        return;
      }
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
    <GestureHandlerRootView style={[{ flex: 1 }, style]}>
      <GestureDetector gesture={composedGesture}>
        <Canvas style={{ flex: 1 }} onSize={canvasSize}>
          <Group transform={animatedTransform}>{children}</Group>
        </Canvas>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
