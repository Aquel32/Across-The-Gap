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
import { Text, View } from "react-native";
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
import Modal from "react-native-modal";
import Button from "./Button";

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
  }, [mode, running]);

  const [clearLevelModalVisible, setClearLevelModalVisible] = useState(false);

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
          <Button
            className={`bg-[#2b2d42] px-4 py-2 rounded`}
            onPress={() =>
              setMenu((prev) => (prev === "settings" ? "none" : "settings"))
            }
            disabled={running}
            hapticStyle={"Heavy"}
            sound="success"
          >
            {menu === "settings" ? (
              <BarsArrowDownIcon color={"white"} />
            ) : (
              <BarsArrowUpIcon color={"white"} />
            )}
          </Button>

          {menu === "settings" && (
            <View className="absolute bottom-12 flex flex-col gap-2">
              <Button
                className={`bg-[#2b2d42] px-4 py-2 rounded`}
                onPress={() => router.back()}
                hapticStyle={"Heavy"}
                sound="success"
              >
                <ArrowLeftEndOnRectangleIcon color={"white"} />
              </Button>
              <Button
                className={`bg-[#2b2d42] px-4 py-2 rounded`}
                onPress={() => setClearLevelModalVisible(true)}
                hapticStyle={"Heavy"}
                sound="success"
              >
                <TrashIcon color={"white"} />
              </Button>
            </View>
          )}
        </View>

        <View className="flex flex-row gap-1">
          <Button
            className={`bg-[#c1121f] px-4 py-2 rounded items-center`}
            onPress={() => setMode("move")}
            disabled={running}
            hapticStyle={"Heavy"}
            sound="success"
          >
            <CursorArrowRippleIcon color={"white"} />
          </Button>
          <Button
            className={`bg-[#c1121f] px-4 py-2 rounded items-center`}
            onPress={() => setMode("create")}
            disabled={running}
            hapticStyle={"Heavy"}
            sound="success"
          >
            <LinkIcon color={"white"} />
          </Button>
          <Button
            className={`bg-[#c1121f] px-4 py-2 rounded items-center`}
            onPress={() => setMode("delete")}
            disabled={running}
            hapticStyle={"Heavy"}
            sound="success"
          >
            <BoltSlashIcon color={"white"} />
          </Button>
          <Button
            className={`bg-[#e9c46a] px-4 py-2 rounded items-center`}
            onPress={() => setMode("arch")}
            disabled={running}
            hapticStyle={"Heavy"}
            sound="success"
          >
            <ChevronUpIcon color={"white"} />
          </Button>
          <Button
            className={`bg-[#e9c46a] px-4 py-2 rounded items-center`}
            onPress={() => setMode("chain")}
            disabled={running}
            hapticStyle={"Heavy"}
            sound="success"
          >
            <EllipsisHorizontalIcon color={"white"} />
          </Button>
          <View className="flex flex-row gap-3 relative">
            <Button
              className={`bg-[#2b2d42] px-4 py-2 rounded`}
              onPress={() =>
                setMenu((prev) => (prev === "materials" ? "none" : "materials"))
              }
              disabled={running}
              hapticStyle={"Heavy"}
              sound="success"
            >
              {menu === "materials" ? (
                <BarsArrowDownIcon color={"white"} />
              ) : (
                <BarsArrowUpIcon color={"white"} />
              )}
            </Button>

            {menu === "materials" && (
              <View className="absolute bottom-12 flex flex-col gap-2">
                <Button
                  className={`bg-[#2b2d42] px-4 py-2 rounded`}
                  onPress={() => setMaterial(Materials.ROAD)}
                  hapticStyle={"Heavy"}
                  sound="success"
                >
                  <CakeIcon color={Materials.ROAD.color} />
                </Button>
                <Button
                  className={`bg-[#2b2d42] px-4 py-2 rounded`}
                  onPress={() => setMaterial(Materials.STEEL)}
                  hapticStyle={"Heavy"}
                  sound="success"
                >
                  <CakeIcon color={Materials.STEEL.color} />
                </Button>
                <Button
                  className={`bg-[#2b2d42] px-4 py-2 rounded`}
                  onPress={() => setMaterial(Materials.WOOD)}
                  hapticStyle={"Heavy"}
                  sound="success"
                >
                  <CakeIcon color={Materials.WOOD.color} />
                </Button>
              </View>
            )}
          </View>
        </View>

        <View className="flex flex-row gap-3 w-40 justify-end">
          {parentTesting && setParentTesting && (
            <Button
              className={`bg-[#588157] px-4 py-2 rounded`}
              onPress={() => setParentTesting((r) => !r)}
              disabled={running}
              hapticStyle={"Heavy"}
              sound="success"
            >
              <WrenchIcon color={"white"} />
            </Button>
          )}

          <Button
            className={`bg-[#588157] px-4 py-2 rounded`}
            onPress={() => setRunning((r) => !r)}
            hapticStyle={"Heavy"}
            sound="success"
          >
            {running ? (
              <PauseIcon color={"white"} />
            ) : (
              <PlayIcon color={"white"} />
            )}
          </Button>
        </View>
      </View>

      <View style={{ flex: 1 }} className="absolute">
        <Modal
          isVisible={clearLevelModalVisible}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          backdropColor="transparent"
        >
          <View className="bg-white p-5 rounded-lg flex items-center">
            <Text>CZY NAPEWNO WYCZYŚCIĆ POZIOM?</Text>
            <View className="flex flex-row gap-5 m-10">
              <Button
                className="bg-red-500 px-4 py-2 rounded"
                onPress={() => setClearLevelModalVisible(false)}
                hapticStyle="Heavy"
                sound="error"
              >
                <Text>NIE</Text>
              </Button>
              <Button
                className="bg-green-500 px-4 py-2 rounded"
                onPress={() => {
                  clearLevel();
                  setClearLevelModalVisible(false);
                }}
                hapticStyle="Heavy"
                sound="success"
              >
                <Text>TAK</Text>
              </Button>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
