import { Material } from "./types";

export const Materials: { [key: string]: Material } = {
  ROAD: { name: "Road", color: "red", stiffness: 0.5, durability: 1, collideWithCar: true },
  STEEL: { name: "Steel", color: "green", stiffness: 0.6, durability: 1 },
  WOOD: { name: "Wood", color: "blue", stiffness: 0.2, durability: 1 },
};
