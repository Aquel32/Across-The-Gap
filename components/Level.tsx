import Editor from "@/components/Editor";
import MaterialSelector from "@/components/MaterialSelector";
import Simulation from "@/components/Simulation";
import { Materials } from "@/lib/materials";
import { CarSettings, Connection, MapElement, NodeData } from "@/lib/types";
import { router } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import {
  ArrowLeftEndOnRectangleIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
} from "react-native-heroicons/outline";

export default function Level({
  INITIAL_NODES,
  INITIAL_CONNECTIONS,
  MAP_ELEMENTS,
  END_COLLISION,
  CAR_SETTINGS,
}: {
  INITIAL_NODES: NodeData[];
  INITIAL_CONNECTIONS: Connection[];
  MAP_ELEMENTS: MapElement[];
  END_COLLISION: { x: number; y: number; width: number; height: number };
  CAR_SETTINGS: CarSettings;
}) {
  const [running, setRunning] = useState<boolean>(false);
  const [selectedMaterial, setSelectedMaterial] = useState(Materials.ROAD);

  const [nodes, setNodes] = useState<NodeData[]>(INITIAL_NODES);
  const [connections, setConnections] =
    useState<Connection[]>(INITIAL_CONNECTIONS);

  function clearLevel() {
    setNodes(INITIAL_NODES);
    setConnections(INITIAL_CONNECTIONS);
    setSelectedMaterial(Materials.ROAD);
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
          clearLevel={clearLevel}
          running={running}
          selectedMaterial={selectedMaterial}
          mapElements={MAP_ELEMENTS}
          carSettings={CAR_SETTINGS}
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
            className={`bg-red-500 px-4 py-2 rounded`}
            onPress={clearLevel}
            disabled={running}
          >
            <TrashIcon color={"white"} />
          </TouchableOpacity>
        </View>

        <MaterialSelector
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
