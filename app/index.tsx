import { Canvas, Rect } from "@shopify/react-native-skia";
import { Dimensions, GestureResponderEvent } from "react-native";

export default function App() {
  const size = Dimensions.get("window");

  function onTouchStart(event: GestureResponderEvent) {
    const { locationX, locationY } = event.nativeEvent;
    console.log(event.nativeEvent);
  }
  function onTouchMove(event: GestureResponderEvent) {
    const { locationX, locationY } = event.nativeEvent;
  }
  function onTouchEnd(event: GestureResponderEvent) {
    const { locationX, locationY } = event.nativeEvent;
  }

  return (
    <Canvas
      style={{ flex: 1 }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <Rect color="cyan" x={100} y={100} width={20} height={20} />
      <Rect color="cyan" x={500} y={100} width={20} height={20} />
    </Canvas>
  );
}
