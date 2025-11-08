import { Material } from "./types";

export const Materials: { [key: string]: Material } = {
  ROAD: {
    name: "Road",
    color: "red",
    stiffness: 1,
    durability: 1.2,
    collideWithCar: true,
  },
  STEEL: { name: "Steel", color: "green", stiffness: 1, durability: 1.5 },
  WOOD: { name: "Wood", color: "blue", stiffness: 0.2, durability: 0.5 },
};
