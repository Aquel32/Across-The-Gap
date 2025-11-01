import { SkPoint, vec } from "@shopify/react-native-skia";
import {
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import { SharedValue } from "react-native-reanimated";
import Touchable, { useGestureHandler } from "react-native-skia-gesture";
import { runOnJS } from "react-native-worklets";

export interface CircleData {
  x: number;
  y: number;
  r: number;
}

export interface LineData {
  p1: SharedValue<SkPoint>;
  p2: SharedValue<SkPoint>;
  strokeWidth: number;
}

export interface Connection {
  from: number;
  to: number;
}

export default function Node({
  node,
  index,
  line,
  nodes,
  connections,
  addConnection,
}: {
  node: CircleData;
  index: number;
  line: LineData;
  nodes: CircleData[];
  connections: Connection[];
  addConnection: (from: number, to: number) => void;
}) {
  function overlaps(x: number, y: number) {
    "worklet";
    let result: number | undefined = undefined;
    nodes.forEach((node, index) => {
      const closestX = Math.max(node.x, Math.min(x, node.x + node.r));
      const closestY = Math.max(node.y, Math.min(y, node.y + node.r));
      const distanceX = x - closestX;
      const distanceY = y - closestY;
      const distanceSquared = distanceX * distanceX + distanceY * distanceY;
      if (distanceSquared < 30 * 30) {
        result = index;
      }
    });
    return result;
  }

  const circleGesture = useGestureHandler({
    onStart: (
      touchInfo: GestureStateChangeEvent<PanGestureHandlerEventPayload>
    ) => {
      "worklet";
      line.p1.value = vec(node.x, node.y);
      line.p2.value = vec(node.x, node.y);
    },
    onActive: (
      touchInfo: GestureUpdateEvent<PanGestureHandlerEventPayload>
    ) => {
      "worklet";
      line.p2.value = vec(touchInfo.absoluteX, touchInfo.absoluteY);
    },
    onEnd: (
      touchInfo: GestureStateChangeEvent<PanGestureHandlerEventPayload>
    ) => {
      "worklet";
      line.p1.value = vec(0, 0);
      line.p2.value = vec(0, 0);

      const target = overlaps(touchInfo.absoluteX, touchInfo.absoluteY);
      if (target != undefined && target !== index) {
        console.log("Connecting node", index, "to", target);
        runOnJS(addConnection)(index, target);
      }
    },
  });

  return (
    <Touchable.Circle
      key={index}
      cx={node.x}
      cy={node.y}
      r={node.r}
      color="blue"
      {...circleGesture}
    />
  );
}
