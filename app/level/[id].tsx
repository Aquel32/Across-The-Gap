import { useLocalSearchParams } from "expo-router";

import Levels from "@/assets/levels.json";
import Level from "@/components/Level";
import { DEFAULT_LEVEL } from "@/lib/defaultValues";
import { Materials } from "@/lib/materials";
import { loadFileAsync, saveFileAsync } from "@/lib/storage";
import {
  CarSettings,
  Connection,
  LevelTake,
  MapElement,
  NodeData,
} from "@/lib/types";
import { useEffect, useState } from "react";

export default function LevelScreen() {
  const params = useLocalSearchParams<{ id: string }>();

  const index = Number(params.id) - 1;
  const level = Levels[index];

  const [nodes, setNodes] = useState<NodeData[]>(level.nodes);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [carSettings, setCarSettings] = useState<CarSettings>({
    ...level.carSettings,
    width: DEFAULT_LEVEL.carSettings.width,
    height: DEFAULT_LEVEL.carSettings.height,
    wheelRadius: DEFAULT_LEVEL.carSettings.wheelRadius,
    wheelOffsetY: DEFAULT_LEVEL.carSettings.wheelOffsetY,
    wheelOffsetX: DEFAULT_LEVEL.carSettings.wheelOffsetX,
  });

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

  const [takesData, setTakesData] = useState<LevelTake[]>(
    Levels.map(() => ({ nodes: [], connections: [], done: false }))
  );

  async function loadLevels() {
    const data = await loadFileAsync("level_takes.json");

    if (data === "") return;
    setTakesData(JSON.parse(data) as LevelTake[]);
  }

  useEffect(() => {
    loadLevels();
  }, []);

  function saveTake(takeNodes: NodeData[], takeConnections: Connection[]) {
    setTakesData((takes) => {
      const updatedTakes = [...takes];
      updatedTakes[index] = {
        done: true,
      };
      saveFileAsync("level_takes.json", JSON.stringify(updatedTakes));
      return updatedTakes;
    });
  }

  return (
    <Level
      INITIAL_NODES={nodes}
      INITIAL_CONNECTIONS={connections}
      MAP_ELEMENTS={mapElements}
      END_COLLISION={level.endCollision}
      CAR_SETTINGS={carSettings}
      BUDGET={level.budget}
      saveTake={saveTake}
    />
  );
}
