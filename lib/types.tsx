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

export interface Material {
  name: string;
  color: string;
  stiffness: number;
  collideWithCar?: boolean;
  durability: number;
}
