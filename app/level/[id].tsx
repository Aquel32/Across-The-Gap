import { useLocalSearchParams } from "expo-router";

import Levels from "@/assets/levels.json";
import Level from "@/components/Level";
import { Materials } from "@/lib/materials";
import { Connection, MapElement, NodeData } from "@/lib/types";

export default function LevelScreen() {
  const params = useLocalSearchParams<{ id: string }>();

  const level = Levels[Number(params.id) - 1];

  const nodes: NodeData[] = level.nodes;
  const connections: Connection[] = [];

  // level.connections.forEach((conn) => {
  //   const material = (Materials as any)[conn.material];

  //   connections.push({
  //     from: conn.from,
  //     to: conn.to,
  //     material: material,
  //   });
  // });

  const mapElements: MapElement[] = [];
  level.mapElements.forEach((elem) => {
    const material = (Materials as any)[elem.material];
    mapElements.push({
      x: elem.x,
      y: elem.y,
      width: elem.width,
      height: elem.height,
      angle: elem.angle,
      material: material,
    });
  });

  return (
    <Level
      INITIAL_NODES={nodes}
      INITIAL_CONNECTIONS={connections}
      MAP_ELEMENTS={mapElements}
      END_COLLISION={level.endCollision}
      CAR_SETTINGS={level.carSettings}
    />
  );
}
