import Level from "@/components/Level";
import LevelCreator from "@/components/LevelCreator";
import { Materials } from "@/lib/materials";
import { loadFileAsync, saveFileAsync } from "@/lib/storage";
import {
  LevelData,
  MapElement,
  Material,
  Menus,
  Modes,
  NodeData,
} from "@/lib/types";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import {
  ArchiveBoxArrowDownIcon,
  ArchiveBoxXMarkIcon,
  ArrowLeftEndOnRectangleIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  AtSymbolIcon,
  BanknotesIcon,
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  BoltSlashIcon,
  CakeIcon,
  CursorArrowRippleIcon,
  PauseIcon,
  PlayIcon,
  PuzzlePieceIcon,
  TrashIcon,
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
    if (Levels[index.current]) {
      setLevels((levels) => {
        const updatedLevels = [...levels];
        updatedLevels[index.current] = newLevel;
        saveFileAsync("custom_levels.json", JSON.stringify(updatedLevels));
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

  function deleteLevel() {
    if (!Levels[index.current]) return;

    setLevels((levels) => {
      const updatedLevels = levels.filter((_, i) => i !== index.current);
      saveFileAsync("custom_levels.json", JSON.stringify(updatedLevels));
      router.back();
      return updatedLevels;
    });
  }

  function clearLevel() {}

  function setMaterial(material: Material) {
    setSelectedMaterial(material);
    setMenu("none");
  }

  useEffect(() => {
    setMenu("none");
  }, [running]);

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
            <View className="flex flex-row justify-start gap-3 w-40 relative">
              <TouchableOpacity
                className={`bg-[#2b2d42] px-4 py-2 rounded`}
                onPress={() =>
                  setMenu((prev) => (prev === "settings" ? "none" : "settings"))
                }
              >
                {menu === "settings" ? (
                  <BarsArrowDownIcon color={"white"} />
                ) : (
                  <BarsArrowUpIcon color={"white"} />
                )}
              </TouchableOpacity>

              {menu === "settings" && (
                <View className="absolute bottom-12 flex flex-col gap-2">
                  <TouchableOpacity
                    className={`bg-[#2b2d42] px-4 py-2 rounded`}
                    onPress={() => router.back()}
                  >
                    <ArrowLeftEndOnRectangleIcon color={"white"} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`bg-[#2b2d42] px-4 py-2 rounded`}
                    onPress={() => saveLevel()}
                  >
                    <ArchiveBoxArrowDownIcon color={"white"} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`bg-[#2b2d42] px-4 py-2 rounded`}
                    onPress={() => deleteLevel()}
                  >
                    <ArchiveBoxXMarkIcon color={"white"} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`bg-[#2b2d42] px-4 py-2 rounded`}
                    onPress={() => clearLevel()}
                  >
                    <TrashIcon color={"white"} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View className="flex flex-row justify-center gap-1">
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
              <View className="flex flex-row gap-3 relative">
                <TouchableOpacity
                  className={`bg-[#2b2d42] px-4 py-2 rounded`}
                  onPress={() =>
                    setMenu((prev) =>
                      prev === "materials" ? "none" : "materials"
                    )
                  }
                >
                  {menu === "materials" ? (
                    <BarsArrowDownIcon color={"white"} />
                  ) : (
                    <BarsArrowUpIcon color={"white"} />
                  )}
                </TouchableOpacity>

                {menu === "materials" && (
                  <View className="absolute bottom-12 flex flex-col gap-2">
                    <TouchableOpacity
                      className={`bg-[#2b2d42] px-4 py-2 rounded`}
                      onPress={() => setMaterial(Materials.ROAD)}
                    >
                      <CakeIcon color={Materials.ROAD.color} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`bg-[#2b2d42] px-4 py-2 rounded`}
                      onPress={() => setMaterial(Materials.STEEL)}
                    >
                      <CakeIcon color={Materials.STEEL.color} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`bg-[#2b2d42] px-4 py-2 rounded`}
                      onPress={() => setMaterial(Materials.WOOD)}
                    >
                      <CakeIcon color={Materials.WOOD.color} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
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

          <View className="w-full absolute top-0 justify-center items-center">
            <View className="p-2 px-5 bg-gray-300 rounded-b-lg flex flex-row items-center gap-1">
              <BanknotesIcon color={"green"} width={20} height={20} />
              <Text className="text-center text-black">{newLevel.budget}$</Text>
            </View>
          </View>
        </>
      ) : (
        <Level
          INITIAL_NODES={newLevel.nodes}
          INITIAL_CONNECTIONS={newLevel.connections}
          MAP_ELEMENTS={newLevel.mapElements}
          END_COLLISION={newLevel.endCollision}
          CAR_SETTINGS={newLevel.carSettings}
          BUDGET={newLevel.budget}
          parentTesting={running}
          setParentTesting={setRunning}
        />
      )}
    </View>
  );
}
