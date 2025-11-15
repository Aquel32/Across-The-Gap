import { Circle, SkPoint } from "@shopify/react-native-skia";
import {
  CameraBounds,
  CarSettings,
  Connection,
  MapElement,
  NodeData,
} from "./types";

const NODES_OVERLAP_SNAP_DISTANCE = 10;
export const overlaps = (
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

    if (distance < n.r + NODES_OVERLAP_SNAP_DISTANCE) {
      result = i;
      break;
    }
  }
  return result;
};

export const overlapsConnection = (
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

export const overlapsStaticCar = (
  x: number,
  y: number,
  carSettings: CarSettings
) => {
  "worklet";
  if (
    x >= carSettings.startTransform.x - carSettings.width / 2 &&
    x <= carSettings.startTransform.x + carSettings.width / 2 &&
    y >= carSettings.startTransform.y - carSettings.height / 2 &&
    y <= carSettings.startTransform.y + carSettings.height / 2
  ) {
    return true;
  }

  return false;
};

export const overlapsRectangle = (
  x: number,
  y: number,
  rect: { x: number; y: number; width: number; height: number }
) => {
  "worklet";
  if (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height
  ) {
    return true;
  }

  return false;
};

export function EndMarker({ position }: { position: SkPoint }) {
  return <Circle cx={position.x} cy={position.y} r={10} color="orange" />;
}

export function CalculateBounds(mapElements: MapElement[]) {
  const bounds: CameraBounds = {
    minX: 0,
    maxX: 0,
    minY: -400,
    maxY: 0,
  };

  mapElements.forEach((elem) => {
    bounds.minX = Math.min(bounds.minX, elem.x);
    bounds.maxX = Math.max(bounds.maxX, elem.x + elem.width);
    bounds.maxY = Math.max(bounds.maxY, elem.y + elem.height);
  });

  return bounds;
}
