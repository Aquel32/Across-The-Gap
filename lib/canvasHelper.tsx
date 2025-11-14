import { Connection, NodeData } from "./types";

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
    if (distance < n.r) {
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
