import Editor from "@/components/Editor";
import Simulation from "@/components/Simulation";
import { Materials } from "@/lib/materials";
import {
  CarSettings,
  Connection,
  MapElement,
  Menus,
  Modes,
  NodeData,
} from "@/lib/types";
import { router } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import {
  ArrowLeftEndOnRectangleIcon,
  Cog6ToothIcon,
  PauseIcon,
  PlayIcon,
} from "react-native-heroicons/outline";
import ToolsBar from "./ToolsBar";

export default function Level({
  INITIAL_NODES,
  INITIAL_CONNECTIONS,
  MAP_ELEMENTS,
  END_COLLISION,
  CAR_SETTINGS,
  BUDGET,
}: {
  INITIAL_NODES: NodeData[];
  INITIAL_CONNECTIONS: Connection[];
  MAP_ELEMENTS: MapElement[];
  END_COLLISION: { x: number; y: number; width: number; height: number };
  CAR_SETTINGS: CarSettings;
  BUDGET: number;
}) {
  const [menu, setMenu] = useState<Menus>("none");
  const [mode, setMode] = useState<Modes>("create");
  const [budget, setBudget] = useState<number>(BUDGET);

  const [running, setRunning] = useState<boolean>(false);
  const [selectedMaterial, setSelectedMaterial] = useState(Materials.ROAD);

  const [nodes, setNodes] = useState<NodeData[]>(INITIAL_NODES);
  const [connections, setConnections] =
    useState<Connection[]>(INITIAL_CONNECTIONS);

  function clearLevel() {
    setNodes(INITIAL_NODES);
    setConnections(INITIAL_CONNECTIONS);
    setSelectedMaterial(Materials.ROAD);
    setBudget(BUDGET);
  }

  function closeMenus() {
    setMenu("none");
  }

  return (
    <View style={{ flex: 1 }}>
      {running ? (
        <Simulation
          nodes={[...nodes]}
          connections={[...connections]}
          mapElements={MAP_ELEMENTS}
          endCollision={END_COLLISION}
          carSettings={CAR_SETTINGS}
        />
      ) : (
        <Editor
          nodes={nodes}
          connections={connections}
          setNodes={setNodes}
          setConnections={setConnections}
          mode={mode}
          running={running}
          selectedMaterial={selectedMaterial}
          mapElements={MAP_ELEMENTS}
          carSettings={CAR_SETTINGS}
          budget={budget}
          setBudget={setBudget}
          closeMenus={closeMenus}
        />
      )}
      <View className="flex flex-row w-full justify-between items-center px-10 py-1">
        <View className="flex flex-row justify-start gap-3 w-40">
          <TouchableOpacity
            className={`bg-gray-500 px-4 py-2 rounded`}
            onPress={() => router.back()}
            disabled={running}
          >
            <ArrowLeftEndOnRectangleIcon color={"white"} />
          </TouchableOpacity>
          <TouchableOpacity
            className={`bg-gray-500 px-4 py-2 rounded`}
            onPress={() => setMenu("settings")}
            disabled={running}
          >
            <Cog6ToothIcon color={"white"} />
          </TouchableOpacity>
        </View>

        <ToolsBar
          menu={menu}
          setMenu={setMenu}
          clearLevel={clearLevel}
          mode={mode}
          setMode={setMode}
          onMaterialSelect={(material) => setSelectedMaterial(material)}
          disabled={running}
        />

        <View className="flex flex-row gap-3 w-40 justify-end">
          <TouchableOpacity
            className={`bg-green-500 px-4 py-2 rounded`}
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
  );
}
