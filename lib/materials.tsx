import { Material } from "./types";

export const Materials: { [key: string]: Material } = {
  ROAD: { name: "Road", color: "red", stiffness: 0.5, collideWithCar: true },
  STEEL: { name: "Steel", color: "green", stiffness: 0.6 },
  WOOD: { name: "Wood", color: "blue", stiffness: 0.2 },
};
