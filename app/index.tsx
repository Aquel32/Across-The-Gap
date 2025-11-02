import Editor from "@/components/Editor";
import MaterialSelector from "@/components/MaterialSelector";
import Simulation from "@/components/Simulation";
import { Materials } from "@/lib/materials";
import { Connection, NodeData } from "@/lib/types";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const INITIAL_NODES: NodeData[] = [
  { x: 150, y: 250, r: 13 },
  //{ x: 630, y: 250, r: 13 },
];

export default function App() {
  const [running, setRunning] = useState<boolean>(false);
  const [selectedMaterial, setSelectedMaterial] = useState(Materials.ROAD);

  const [nodes, setNodes] = useState<NodeData[]>(INITIAL_NODES);
  const [connections, setConnections] = useState<Connection[]>([]);

  function clearLevel() {
    setNodes(INITIAL_NODES);
    setConnections([]);
    setSelectedMaterial(Materials.ROAD);
  }

  return (
    <View style={{ flex: 1 }}>
      {running ? (
        <Simulation nodes={[...nodes]} connections={[...connections]} />
      ) : (
        <Editor
          nodes={nodes}
          connections={connections}
          setNodes={setNodes}
          setConnections={setConnections}
          clearLevel={clearLevel}
          running={running}
          selectedMaterial={selectedMaterial}
        />
      )}
      <View className="flex flex-row w-full justify-between items-center px-10 pb-1">
        <TouchableOpacity
          className={`bg-red-500 px-4 py-2 rounded`}
          onPress={clearLevel}
        >
          <Text>CLEAR</Text>
        </TouchableOpacity>
        <MaterialSelector
          onMaterialSelect={(material) => setSelectedMaterial(material)}
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
