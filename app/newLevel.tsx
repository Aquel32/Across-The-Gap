import Level from "@/components/Level";
import LevelCreator from "@/components/LevelCreator";
import { Materials } from "@/lib/materials";
import { MapElement, Menus, Modes, NodeData } from "@/lib/types";
import { router } from "expo-router";
import { useState } from "react";
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

export default function NewLevel() {
  const [menu, setMenu] = useState<Menus>("none");
  const [mode, setMode] = useState<Modes>("create");

  const [running, setRunning] = useState<boolean>(false);
  const [selectedMaterial, setSelectedMaterial] = useState(Materials.ROAD);

  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [mapElements, setMapElements] = useState<MapElement[]>([]);

  const [carSettings, setCarSettings] = useState({
    startTransform: { x: 50, y: 100, angle: 0 },
    width: 80,
    height: 30,
    mass: 12,
    acceleration: 0.3,
    wheelRadius: 15,
    wheelOffsetY: 20,
  });

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
