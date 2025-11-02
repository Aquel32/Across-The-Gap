export interface NodeData {
  x: number;
  y: number;
  r: number;
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
