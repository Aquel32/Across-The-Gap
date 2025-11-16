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
import { FontAwesome, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import {
  ArrowLeftEndOnRectangleIcon,
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  CursorArrowRippleIcon,
  LinkIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
  WrenchIcon,
} from "react-native-heroicons/outline";
import Modal from "react-native-modal";
import Button from "./Parts/Button";

export default function Level({
  INITIAL_NODES,
  INITIAL_CONNECTIONS,
  MAP_ELEMENTS,
  END_COLLISION,
  CAR_SETTINGS,
  BUDGET,
  parentTesting,
  setParentTesting,
  saveTake,
}: {
  INITIAL_NODES: NodeData[];
  INITIAL_CONNECTIONS: Connection[];
  MAP_ELEMENTS: MapElement[];
  END_COLLISION: { x: number; y: number; width: number; height: number };
  CAR_SETTINGS: CarSettings;
  BUDGET: number;
  parentTesting?: boolean;
  setParentTesting?: React.Dispatch<React.SetStateAction<boolean>>;
  saveTake?: () => void;
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

  function onEnd() {
    setRunning(false);
    setEndModalVisible(true);
  }

  function acceptEnding() {
    if (parentTesting && setParentTesting) {
      setRunning(false);
      return;
    }

    if (saveTake) {
      saveTake();
    }

    router.back();
  }

  useEffect(() => {
    setMenu("none");
  }, [mode, running]);

  const [clearLevelModalVisible, setClearLevelModalVisible] = useState(false);
  const [endModalVisible, setEndModalVisible] = useState(false);

  const [ready, setReady] = useState(true);

  return (
    <View style={{ flex: 1 }}>
      {running ? (
        <Simulation
          nodes={nodes}
          connections={connections}
          mapElements={MAP_ELEMENTS}
          endCollision={END_COLLISION}
          carSettings={CAR_SETTINGS}
          onEnd={onEnd}
        />
      ) : (
        <Editor
          nodes={nodes}
          connections={connections}
          setNodes={setNodes}
          setConnections={setConnections}
          mode={mode}
          setMode={setMode}
          menu={menu}
          setMenu={setMenu}
          running={running}
          selectedMaterial={selectedMaterial}
          mapElements={MAP_ELEMENTS}
          carSettings={CAR_SETTINGS}
          budget={budget}
          setBudget={setBudget}
          closeMenus={closeMenus}
          endCollision={END_COLLISION}
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
            sound="click"
          >
            {menu === "settings" ? (
              <BarsArrowDownIcon color={"white"} />
            ) : (
              <BarsArrowUpIcon color={"white"} />
            )}
          </Button>

          {menu === "settings" && (
            <View className="absolute bottom-14 flex flex-col gap-2">
              {parentTesting !== true && (
                <Button
                  className={`bg-[#2b2d42] px-4 py-2 rounded`}
                  onPress={() => router.back()}
                  hapticStyle={"Soft"}
                  sound="click"
                >
                  <ArrowLeftEndOnRectangleIcon color={"white"} />
                </Button>
              )}
              <Button
                className={`bg-[#2b2d42] px-4 py-2 rounded`}
                onPress={() => setClearLevelModalVisible(true)}
                hapticStyle={"Heavy"}
                sound="click"
              >
                <TrashIcon color={"white"} />
              </Button>
            </View>
          )}
        </View>

        <View className="flex flex-row gap-1">
          <Button
            className={`bg-[#c1121f] px-4 py-2 rounded items-center justify-center`}
            onPress={() => setMode("move")}
            disabled={running}
            selected={mode == "move"}
            selectedColor="bg-red-900"
            sound="click"
          >
            <CursorArrowRippleIcon color={"white"} />
          </Button>
          <Button
            className={`bg-[#c1121f] px-4 py-2 rounded items-center justify-center`}
            onPress={() => setMode("create")}
            disabled={running}
            selected={mode === "create"}
            selectedColor="bg-red-900"
            sound="click"
          >
            <LinkIcon color={"white"} />
          </Button>
          <Button
            className={`bg-[#c1121f] px-4 py-2 rounded items-center justify-center`}
            onPress={() => setMode("delete")}
            disabled={running}
            selected={mode == "delete"}
            selectedColor="bg-red-900"
            sound="click"
          >
            <FontAwesome name="unlink" size={24} color="white" />
          </Button>
          <Button
            className={`bg-[#e9c46a] px-4 py-2 rounded items-center justify-center`}
            onPress={() => setMode("arch")}
            disabled={running}
            selected={mode === "arch"}
            selectedColor="bg-yellow-600"
            sound="click"
          >
            <View>
              <FontAwesome6 name="bezier-curve" size={24} color="white" />
            </View>
          </Button>
          <Button
            className={`bg-[#e9c46a] px-2 rounded items-center justify-center`}
            onPress={() => setMode("chain")}
            disabled={running}
            selected={mode === "chain"}
            selectedColor="bg-yellow-600"
            sound="click"
          >
            <Ionicons name="analytics-outline" size={38} color="white" />
          </Button>
          <View className="flex flex-row gap-3 relative">
            <Button
              className={`bg-gray-400 px-4 py-2 rounded`}
              onPress={() =>
                setMenu((prev) => (prev === "materials" ? "none" : "materials"))
              }
              disabled={running}
              sound="click"
            >
              {selectedMaterial === Materials.ROAD && (
                <FontAwesome
                  name="road"
                  size={24}
                  color={Materials.ROAD.color}
                />
              )}
              {selectedMaterial === Materials.STEEL && (
                <Image
                  source={require("@/assets/images/steel.png")}
                  style={{ width: 26, height: 24 }}
                />
              )}
              {selectedMaterial === Materials.WOOD && (
                <Image
                  source={require("@/assets/images/wood.png")}
                  style={{ width: 26, height: 26 }}
                />
              )}
            </Button>

            {menu === "materials" && (
              <View className="absolute bottom-14 flex flex-col gap-2">
                <Button
                  className={`bg-gray-400 px-4 py-2 rounded`}
                  onPress={() => setMaterial(Materials.ROAD)}
                  selected={selectedMaterial === Materials.ROAD}
                  selectedColor="bg-gray-600"
                  sound="click"
                >
                  <FontAwesome
                    name="road"
                    size={24}
                    color={Materials.ROAD.color}
                  />
                </Button>
                <Button
                  className={`bg-gray-400 px-4 py-2 rounded`}
                  onPress={() => setMaterial(Materials.STEEL)}
                  selected={selectedMaterial === Materials.STEEL}
                  selectedColor="bg-gray-600"
                  sound="click"
                >
                  <Image
                    source={require("@/assets/images/steel.png")}
                    style={{ width: 24, height: 24 }}
                  />
                </Button>
                <Button
                  className={`bg-gray-400 px-4 py-2 rounded`}
                  onPress={() => setMaterial(Materials.WOOD)}
                  selected={selectedMaterial === Materials.WOOD}
                  selectedColor="bg-gray-600"
                  sound="click"
                >
                  <Image
                    source={require("@/assets/images/wood.png")}
                    style={{ width: 24, height: 24 }}
                  />
                </Button>
              </View>
            )}
          </View>
        </View>

        <View className="flex flex-row gap-3 w-40 justify-end">
          {parentTesting && setParentTesting && (
            <Button
              className={`bg-amber-500 px-4 py-2 rounded`}
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
            onPress={() => {
              setRunning((r) => !r);
              setReady(false);
              setTimeout(() => setReady(true), 200);
            }}
            hapticStyle={"Heavy"}
            sound="success"
            disabled={!ready}
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
            <Text>Are you sure you want to clear level?</Text>
            <View className="flex flex-row gap-5 m-10">
              <Button
                className="bg-red-500 px-4 py-2 rounded"
                onPress={() => setClearLevelModalVisible(false)}
                hapticStyle="Heavy"
                sound="error"
              >
                <Text>No</Text>
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
                <Text>Yes</Text>
              </Button>
            </View>
          </View>
        </Modal>
        <Modal
          isVisible={endModalVisible}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          backdropColor="transparent"
        >
          <View className="bg-white p-5 rounded-lg flex items-center">
            <Text>YOU HAVE COMPLETED THE LEVEL</Text>
            <View className="flex flex-row gap-5 m-10">
              <Button
                className="bg-green-500 px-4 py-2 rounded"
                onPress={() => {
                  acceptEnding();
                  setEndModalVisible(false);
                }}
                hapticStyle="Heavy"
                sound="success"
              >
                <Text>FINISH</Text>
              </Button>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
