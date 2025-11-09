import Editor from "@/components/Editor";
import MaterialSelector from "@/components/MaterialSelector";
import Simulation from "@/components/Simulation";
import { Materials } from "@/lib/materials";
import { Connection, MapElement, NodeData } from "@/lib/types";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Level({
  INITIAL_NODES,
  INITIAL_CONNECTIONS,
  MAP_ELEMENTS,
  END_COLLISION,
}: {
  INITIAL_NODES: NodeData[];
  INITIAL_CONNECTIONS: Connection[];
  MAP_ELEMENTS: MapElement[];
  END_COLLISION: { x: number; y: number; width: number; height: number };
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
        />
      )}
      <View className="flex flex-row w-full justify-between items-center px-10 pb-1">
        <TouchableOpacity
          className={`bg-red-500 px-4 py-2 rounded`}
          onPress={clearLevel}
          disabled={running}
        >
          <Text>CLEAR</Text>
        </TouchableOpacity>
        <MaterialSelector
          onMaterialSelect={(material) => setSelectedMaterial(material)}
          disabled={running}
        />
        <TouchableOpacity
          className={`bg-green-500 px-4 py-2 rounded`}
          onPress={() => setRunning((r) => !r)}
        >
          <Text>{running ? "STOP" : "RUN"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
