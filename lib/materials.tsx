import { Material } from "./types";

export const Materials: { [key: string]: Material } = {
  ROAD: {
    name: "Road",
    color: "red",
    stiffness: 1,
    durability: 2000,
    collideWithCar: true,
    lengthPenaltyFactor: 0.45,
    pricePerUnit: 1,
  },
  STEEL: {
    name: "Steel",
    color: "green",
    stiffness: 1,
    durability: 3000,
    lengthPenaltyFactor: 0.4,
    pricePerUnit: 1,
  },
  WOOD: {
    name: "Wood",
    color: "blue",
    stiffness: 0.2,
    durability: 0.5,
    lengthPenaltyFactor: 0.1,
    pricePerUnit: 5,
  },
  GRASS: {
    name: "Grass",
    color: "green",
    stiffness: 0,
    durability: 0,
    lengthPenaltyFactor: 0,
    pricePerUnit: 0,
  },
  WATER: {
    name: "Water",
    color: "blue",
    stiffness: 0,
    durability: 0,
    lengthPenaltyFactor: 0,
    pricePerUnit: 0,
  },
};
