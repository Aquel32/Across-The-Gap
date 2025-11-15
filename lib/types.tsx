export interface NodeData {
  x: number;
  y: number;
  r: number;
  isStatic?: boolean;
}

export interface Connection {
  from: number;
  to: number;
  material: Material;
  value?: number;
}

export interface MapElement {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  material: Material;
}

export interface Material {
  name: string;
  color: string;
  stiffness: number;
  collideWithCar?: boolean;
  durability: number;
  lengthPenaltyFactor: number;
  pricePerUnit: number;
}

export interface CarSettings {
  startTransform: { x: number; y: number; angle: number };
  width: number;
  height: number;
  mass: number;
  acceleration: number;
  wheelRadius: number;
  wheelOffsetY: number;
}

export interface LevelData {
  nodes: NodeData[];
  connections: Connection[];
  mapElements: MapElement[];
  endCollision: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  carSettings: CarSettings;
  budget: number;
}

export interface LevelTake {
  done: boolean;
}

export type Modes =
  | "move"
  | "create"
  | "delete"
  | "arch"
  | "chain"
  | "mesh"
  | "resize"
  | "rotate"
  | "none";
export type Menus =
  | "mode"
  | "tools"
  | "materials"
  | "settings"
  | "none"
  | "money"
  | "car";

export interface CameraBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minScale?: number;
  maxScale?: number;
}

export type CameraTransform = {
  translateX: number;
  translateY: number;
  scale: number;
};
