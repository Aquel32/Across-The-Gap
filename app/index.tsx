import { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";

import Touchable, { useGestureHandler } from "react-native-skia-gesture";

interface Circle {
  x: number;
  y: number;
  r: number;
}

export default function App() {
  const [objects, setObjects] = useState<Circle[]>([
    { x: 50, y: 50, r: 10 },
    { x: 150, y: 150, r: 20 },
    { x: 250, y: 250, r: 30 },
  ]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Touchable.Canvas style={{ flex: 1 }}>
        {objects.map((obj, index) => {
          const cx = useSharedValue(obj.x);
          const cy = useSharedValue(obj.y);

          const circleGesture = useGestureHandler({
            onStart: () => {
              "worklet"; // Remember the 'worklet' keyword
              cx.value = obj.x;
              cy.value = obj.y;
            },
            onActive: ({ translationX, translationY }) => {
              "worklet";
              cx.value = obj.x + translationX;
              cy.value = obj.y + translationY;
            },
            onEnd: () => {
              "worklet";
              cx.value = obj.x;
              cy.value = obj.y;
            },
          });

          return (
            <Touchable.Circle
              key={index}
              cx={cx}
              cy={cy}
              r={obj.r}
              color="blue"
              {...circleGesture}
            />
          );
        })}
      </Touchable.Canvas>
    </GestureHandlerRootView>
  );
}
