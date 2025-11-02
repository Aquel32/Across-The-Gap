import { SkPoint } from "@shopify/react-native-skia";
import { SharedValue } from "react-native-reanimated";

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
  material: Material;
}

export interface Material {
  name: string;
  color: string;
}
