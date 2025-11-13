import Editor from "@/components/Editor";
import Simulation from "@/components/Simulation";
import { Materials } from "@/lib/materials";
import {
  CarSettings,
  Connection,
  MapElement,
  Material,
  Menus,
  Modes,
  NodeData,
} from "@/lib/types";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import {
  ArrowLeftEndOnRectangleIcon,
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  BoltSlashIcon,
  CakeIcon,
  ChevronUpIcon,
  CursorArrowRippleIcon,
  EllipsisHorizontalIcon,
  LinkIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
  WrenchIcon,
} from "react-native-heroicons/outline";

export default function Level({
  INITIAL_NODES,
  INITIAL_CONNECTIONS,
  MAP_ELEMENTS,
  END_COLLISION,
  CAR_SETTINGS,
  BUDGET,
  parentTesting,
  setParentTesting,
}: {
  INITIAL_NODES: NodeData[];
  INITIAL_CONNECTIONS: Connection[];
  MAP_ELEMENTS: MapElement[];
  END_COLLISION: { x: number; y: number; width: number; height: number };
  CAR_SETTINGS: CarSettings;
  BUDGET: number;
  parentTesting?: boolean;
  setParentTesting?: React.Dispatch<React.SetStateAction<boolean>>;
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
    setMode("create");
  }

  function closeMenus() {
    setMenu("none");
  }

  function setMaterial(material: Material) {
    setSelectedMaterial(material);
    closeMenus();
  }

  useEffect(() => {
    setMenu("none");
  }, [mode]);

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
          setMode={setMode}
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
                onPress={() => clearLevel()}
              >
                <TrashIcon color={"white"} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="flex flex-row gap-1">
          <TouchableOpacity
            className={`bg-[#c1121f] px-4 py-2 rounded items-center`}
            onPress={() => setMode("move")}
            disabled={running}
          >
            <CursorArrowRippleIcon color={"white"} />
          </TouchableOpacity>
          <TouchableOpacity
            className={`bg-[#c1121f] px-4 py-2 rounded items-center`}
            onPress={() => setMode("create")}
            disabled={running}
          >
            <LinkIcon color={"white"} />
          </TouchableOpacity>
          <TouchableOpacity
            className={`bg-[#c1121f] px-4 py-2 rounded items-center`}
            onPress={() => setMode("delete")}
            disabled={running}
          >
            <BoltSlashIcon color={"white"} />
          </TouchableOpacity>
          <TouchableOpacity
            className={`bg-[#e9c46a] px-4 py-2 rounded items-center`}
            onPress={() => setMode("arch")}
            disabled={running}
          >
            <ChevronUpIcon color={"white"} />
          </TouchableOpacity>
          <TouchableOpacity
            className={`bg-[#e9c46a] px-4 py-2 rounded items-center`}
            onPress={() => setMode("chain")}
            disabled={running}
          >
            <EllipsisHorizontalIcon color={"white"} />
          </TouchableOpacity>
          <View className="flex flex-row gap-3 relative">
            <TouchableOpacity
              className={`bg-[#2b2d42] px-4 py-2 rounded`}
              onPress={() =>
                setMenu((prev) => (prev === "materials" ? "none" : "materials"))
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

        <View className="flex flex-row gap-3 w-40 justify-end">
          {parentTesting && setParentTesting && (
            <TouchableOpacity
              className={`bg-[#588157] px-4 py-2 rounded`}
              onPress={() => setParentTesting((r) => !r)}
            >
              <WrenchIcon color={"white"} />
            </TouchableOpacity>
          )}

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
  );
}
