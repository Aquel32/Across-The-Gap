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

export type Modes =
  | "move"
  | "create"
  | "delete"
  | "arch"
  | "chain"
  | "mesh"
  | "none";
export type Menus = "mode" | "tools" | "materials" | "none";
