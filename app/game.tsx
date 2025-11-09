import Editor from "@/components/Editor";
import MaterialSelector from "@/components/MaterialSelector";
import Simulation from "@/components/Simulation";
import { Materials } from "@/lib/materials";
import { CarSettings, Connection, MapElement, NodeData } from "@/lib/types";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const INITIAL_NODES: NodeData[] = [
  { x: -100, y: 150, r: 13, isStatic: true },
  { x: 150, y: 150, r: 13, isStatic: true },
  { x: 630, y: 150, r: 13, isStatic: true },
  { x: 1000, y: 150, r: 13, isStatic: true },
];

const INITIAL_CONNECTIONS: Connection[] = [
  { from: 0, to: 1, material: Materials.ROAD },
  { from: 2, to: 3, material: Materials.ROAD },
];

const GROUND_ELEMENTS: MapElement[] = [
  {
    x: -300,
    y: 300,
    width: 1600,
    height: 50,
    angle: 0,
    material: Materials.STEEL,
  },
  {
    x: 900,
    y: 200,
    width: 300,
    height: 20,
    angle: -0.3,
    material: Materials.WOOD,
  },
];

const DefaultCarSettings: CarSettings = {
  startTransform: { x: 0, y: 0, angle: 0 },
  width: 80,
  height: 20,
  mass: 15,
  acceleration: 0.4,
  wheelRadius: 15,
  wheelOffsetY: 20,
};

export default function App() {
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
          mapElements={GROUND_ELEMENTS}
          endCollision={{ x: 0, y: 0, width: 100, height: 100 }}
          carSettings={DefaultCarSettings}
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
          mapElements={GROUND_ELEMENTS}
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
