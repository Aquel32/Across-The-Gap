import { Materials } from "./materials";
import { LevelData } from "./types";

export const DEFAULT_LEVEL: LevelData = {
  nodes: [
    { x: 150, y: 150, r: 13, isStatic: true },
    { x: 630, y: 150, r: 13, isStatic: true },
  ],
  connections: [],
  mapElements: [
    {
      x: -300,
      y: 300,
      width: 1300,
      height: 100,
      angle: 0,
      material: Materials.WATER,
    },
    {
      x: -300,
      y: 150,
      width: 450,
      height: 250,
      angle: 0,
      material: Materials.GRASS,
    },
    {
      x: 630,
      y: 150,
      width: 370,
      height: 250,
      angle: 0,
      material: Materials.GRASS,
    },
  ],
  endCollision: { x: 950, y: 100, width: 100, height: 100 },
  carSettings: {
    startTransform: { x: 50, y: 100, angle: 0 },
    width: 140,
    height: 45,
    mass: 12,
    acceleration: 0.3,
    wheelRadius: 13,
    wheelOffsetY: -8,
    wheelOffsetX: 16,
  },
  budget: 13000,
};

export const NODES_OVERLAP_SNAP_DISTANCE = 10;
