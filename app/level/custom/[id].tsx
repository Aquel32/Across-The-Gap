import Level from "@/components/Level";
import LevelCreator from "@/components/LevelCreator";
import { Materials } from "@/lib/materials";
import { loadFileAsync, saveFileAsync } from "@/lib/storage";
import { LevelData, MapElement, Menus, Modes, NodeData } from "@/lib/types";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import {
  ArrowLeftOnRectangleIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  AtSymbolIcon,
  BarsArrowUpIcon,
  BoltSlashIcon,
  Cog6ToothIcon,
  CursorArrowRippleIcon,
  PauseIcon,
  PlayIcon,
  PuzzlePieceIcon,
} from "react-native-heroicons/outline";

const DEFAULT_LEVEL: LevelData = {
  nodes: [
    { x: 150, y: 150, r: 13, isStatic: true },
    { x: 630, y: 150, r: 13, isStatic: true },
  ],
  connections: [],
  mapElements: [
    {
      x: -300,
      y: 300,
      width: 1300,
      height: 100,
      angle: 0,
      material: Materials.WATER,
    },
    {
      x: -300,
      y: 150,
      width: 450,
      height: 250,
      angle: 0,
      material: Materials.GRASS,
    },
    {
      x: 630,
      y: 150,
      width: 370,
      height: 250,
      angle: 0,
      material: Materials.GRASS,
    },
  ],
  endCollision: { x: 950, y: 100, width: 100, height: 100 },
  carSettings: {
    startTransform: { x: 50, y: 100, angle: 0 },
    width: 80,
    height: 30,
    mass: 12,
    acceleration: 0.3,
    wheelRadius: 15,
    wheelOffsetY: 20,
  },
  budget: 13000,
};

export default function NewLevel() {
  const [Levels, setLevels] = useState<LevelData[]>([]);

  const params = useLocalSearchParams<{ id: string }>();
  const index = useRef(Number(params.id) - 1);

  const [menu, setMenu] = useState<Menus>("none");
  const [mode, setMode] = useState<Modes>("create");

  const [running, setRunning] = useState<boolean>(false);
  const [selectedMaterial, setSelectedMaterial] = useState(Materials.ROAD);
  const [nodes, setNodes] = useState<NodeData[]>(DEFAULT_LEVEL.nodes);
  const [mapElements, setMapElements] = useState<MapElement[]>(
    DEFAULT_LEVEL.mapElements
  );
  const [carSettings, setCarSettings] = useState(DEFAULT_LEVEL.carSettings);
  const [newLevel, setNewLevel] = useState<LevelData>(DEFAULT_LEVEL);

  useEffect(() => {
    async function loadLevels() {
      const data = await loadFileAsync("custom_levels.json");

      if (data === "") return;
      const parsedLevels = JSON.parse(data) as LevelData[];
      setLevels(parsedLevels);

      if (!parsedLevels[index.current]) return;
      setNodes(parsedLevels[index.current].nodes);
      setMapElements(parsedLevels[index.current].mapElements);
      setCarSettings(parsedLevels[index.current].carSettings);
    }
    loadLevels();
  }, []);

  useEffect(() => {
    setNewLevel({
      nodes: nodes,
      mapElements: mapElements,
      carSettings: carSettings,
      budget: newLevel.budget,
      connections: newLevel.connections,
      endCollision: newLevel.endCollision,
    });
  }, [nodes, mapElements, carSettings]);

  function saveLevel() {
    console.log(index.current, Levels[index.current]);
    if (Levels[index.current]) {
      setLevels((levels) => {
        const updatedLevels = [...levels];
        updatedLevels[index.current] = newLevel;
        saveFileAsync("custom_levels.json", JSON.stringify([updatedLevels]));
        return updatedLevels;
      });

      return;
    }

    setLevels((levels) => {
      index.current = levels.length;
      const updatedLevels = [...levels, newLevel];
      saveFileAsync("custom_levels.json", JSON.stringify(updatedLevels));
      return updatedLevels;
    });
  }

  return (
    <View style={{ flex: 1 }}>
      {running === false ? (
        <>
          <LevelCreator
            nodes={nodes}
            setNodes={setNodes}
            carSettings={carSettings}
            mapElements={mapElements}
            setMapElements={setMapElements}
            mode={mode}
            menu={menu}
            setMenu={setMenu}
            selectedMaterial={selectedMaterial}
            running={running}
          />

          <View className="flex flex-row w-full justify-between items-center px-10 py-1">
            <View className="flex flex-row justify-start gap-3 w-40">
              <TouchableOpacity
                className={`bg-[#2b2d42] px-4 py-2 rounded`}
                onPress={() => router.back()}
              >
                <ArrowLeftOnRectangleIcon color={"white"} />
              </TouchableOpacity>
              <TouchableOpacity
                className={`bg-[#2b2d42] px-4 py-2 rounded`}
                onPress={() => {}}
              >
                <Cog6ToothIcon color={"white"} />
              </TouchableOpacity>
              <TouchableOpacity
                className={`bg-[#2b2d42] px-4 py-2 rounded`}
                onPress={saveLevel}
              >
                <Cog6ToothIcon color={"white"} />
              </TouchableOpacity>
            </View>
            <View className="flex flex-row justify-center gap-3 w-40">
              <TouchableOpacity
                className={`bg-[#2b2d42] px-4 py-2 rounded`}
                onPress={() => setMode("create")}
              >
                <PuzzlePieceIcon color={"white"} />
              </TouchableOpacity>
              <TouchableOpacity
                className={`bg-[#2b2d42] px-4 py-2 rounded`}
                onPress={() => setMode("arch")}
              >
                <AtSymbolIcon color={"white"} />
              </TouchableOpacity>
              <TouchableOpacity
                className={`bg-[#2b2d42] px-4 py-2 rounded`}
                onPress={() => setMode("move")}
              >
                <CursorArrowRippleIcon color={"white"} />
              </TouchableOpacity>
              <TouchableOpacity
                className={`bg-[#2b2d42] px-4 py-2 rounded`}
                onPress={() => setMode("resize")}
              >
                <ArrowTopRightOnSquareIcon color={"white"} />
              </TouchableOpacity>
              <TouchableOpacity
                className={`bg-[#2b2d42] px-4 py-2 rounded`}
                onPress={() => setMode("rotate")}
              >
                <ArrowPathIcon color={"white"} />
              </TouchableOpacity>
              <TouchableOpacity
                className={`bg-[#2b2d42] px-4 py-2 rounded`}
                onPress={() => setMode("delete")}
              >
                <BoltSlashIcon color={"white"} />
              </TouchableOpacity>
              <TouchableOpacity
                className={`bg-[#003049] px-4 py-2 rounded items-center`}
                onPress={() => setMenu("materials")}
              >
                <BarsArrowUpIcon color={"white"} />
              </TouchableOpacity>
            </View>
            <View className="flex flex-row justify-end gap-3 w-40">
              <View className="flex flex-row gap-3 w-40 justify-end">
                <TouchableOpacity
                  className={`bg-[#588157] px-4 py-2 rounded`}
                  onPress={() => setRunning((r) => !r)}
                >
                  {running ? (
                    <PauseIcon color={"white"} />
                  ) : (
                    <PlayIcon color={"white"} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {menu != "none" && (
            <View className="bottom-0 flex flex-row items-center justify-center absolute w-full">
              <View className="bottom-12 bg-white p-4 rounded shadow-lg gap-4 flex flex-row justify-evenly items-center">
                {menu == "materials" && (
                  <>
                    <TouchableOpacity
                      className={`bg-${Materials.ROAD.color}-500 w-20 h-20 rounded items-center justify-center`}
                      onPress={() => setSelectedMaterial(Materials.ROAD)}
                    >
                      <Text>{Materials.ROAD.name}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`bg-${Materials.STEEL.color}-500 w-20 h-20 rounded items-center justify-center`}
                      onPress={() => setSelectedMaterial(Materials.STEEL)}
                    >
                      <Text>{Materials.STEEL.name}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`bg-${Materials.WOOD.color}-500 w-20 h-20 rounded items-center justify-center`}
                      onPress={() => setSelectedMaterial(Materials.WOOD)}
                    >
                      <Text>{Materials.WOOD.name}</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          )}
        </>
      ) : (
        <Level
          INITIAL_NODES={nodes}
          INITIAL_CONNECTIONS={[]}
          MAP_ELEMENTS={mapElements}
          END_COLLISION={{ x: 0, y: 0, width: 100, height: 20 }}
          CAR_SETTINGS={carSettings}
          BUDGET={1000}
          parentTesting={running}
          setParentTesting={setRunning}
        />
      )}
    </View>
  );
}
