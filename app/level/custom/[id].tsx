import Button from "@/components/Button";
import CarMenu from "@/components/CarMenu";
import Level from "@/components/Level";
import LevelCreator from "@/components/LevelCreator";
import { useSFX } from "@/components/SFXProvider";
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
import { AntDesign, FontAwesome, Foundation } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Image, Text, View } from "react-native";
import {
  ArrowLeftEndOnRectangleIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  BanknotesIcon,
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  CursorArrowRippleIcon,
  PauseIcon,
  PlayIcon,
  PuzzlePieceIcon,
  TrashIcon,
} from "react-native-heroicons/outline";
import Modal from "react-native-modal";

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
  const sfx = useSFX();
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
  const [endCollision, setEndCollision] = useState(DEFAULT_LEVEL.endCollision);
  const [budget, setBudget] = useState<number>(DEFAULT_LEVEL.budget);
  const [newLevel, setNewLevel] = useState<LevelData>(DEFAULT_LEVEL);

  const [changesMade, setChangesMade] = useState<boolean>(false);

  useEffect(() => {
    async function loadLevels() {
      const data = await loadFileAsync("custom_levels.json");

      if (data === "") return;
      const parsedLevels = JSON.parse(data) as LevelData[];
      setLevels(parsedLevels);

      if (!parsedLevels[index.current]) {
        setChangesMade(true);
        return;
      }
      setNodes(parsedLevels[index.current].nodes);
      setMapElements(parsedLevels[index.current].mapElements);
      setCarSettings(parsedLevels[index.current].carSettings);
      setBudget(parsedLevels[index.current].budget);
      setEndCollision(parsedLevels[index.current].endCollision);
      setTimeout(() => setChangesMade(false), 100);
    }
    loadLevels();
  }, []);

  useEffect(() => {
    setNewLevel({
      nodes: nodes,
      mapElements: mapElements,
      carSettings: carSettings,
      budget: budget,
      connections: newLevel.connections,
      endCollision: endCollision,
    });
    setChangesMade(true);
  }, [nodes, mapElements, carSettings, budget, endCollision]);

  function saveLevel() {
    if (Levels[index.current]) {
      setLevels((levels) => {
        const updatedLevels = [...levels];
        updatedLevels[index.current] = newLevel;
        saveFileAsync("custom_levels.json", JSON.stringify(updatedLevels));
        return updatedLevels;
      });
      setChangesMade(false);
      return;
    }

    setLevels((levels) => {
      index.current = levels.length;
      const updatedLevels = [...levels, newLevel];
      saveFileAsync("custom_levels.json", JSON.stringify(updatedLevels));
      return updatedLevels;
    });
    setChangesMade(false);
  }

  function deleteLevel() {
    if (!Levels[index.current]) {
      router.back();
      return;
    }

    setLevels((levels) => {
      const updatedLevels = levels.filter((_, i) => i !== index.current);
      saveFileAsync("custom_levels.json", JSON.stringify(updatedLevels));
      router.back();
      return updatedLevels;
    });
  }

  function clearLevel() {
    setNodes([]);
    setMapElements([]);
    setCarSettings(DEFAULT_LEVEL.carSettings);
    setSelectedMaterial(Materials.ROAD);
    setMode("create");
    setBudget(DEFAULT_LEVEL.budget);
    setEndCollision(DEFAULT_LEVEL.endCollision);
    setChangesMade(true);
  }

  function backToCustoms() {
    if (changesMade) {
      setNotSavedModalVisible(true);
      return;
    }

    router.back();
  }

  function setMaterial(material: Material) {
    setSelectedMaterial(material);
    setMenu("none");
  }

  useEffect(() => {
    setMenu("none");
  }, [running]);

  const [deleteLevelModalVisible, setDeleteLevelModalVisible] = useState(false);
  const [clearLevelModalVisible, setClearLevelModalVisible] = useState(false);
  const [notSavedModalVisible, setNotSavedModalVisible] = useState(false);

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
            endCollision={endCollision}
            setEndCollision={setEndCollision}
            mode={mode}
            menu={menu}
            setMenu={setMenu}
            selectedMaterial={selectedMaterial}
            running={running}
          />

          <View className="flex flex-row w-full justify-between items-center px-10 py-1">
            <View className="flex flex-row justify-start gap-3 w-40 relative">
              <Button
                className={`bg-[#2b2d42] px-4 py-2 rounded`}
                onPress={() =>
                  setMenu((prev) => (prev === "settings" ? "none" : "settings"))
                }
                sound="click"
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
                    onPress={() => backToCustoms()}
                    hapticStyle={"Soft"}
                    sound="click"
                  >
                    <ArrowLeftEndOnRectangleIcon color={"white"} />
                  </Button>
                  <Button
                    className={`bg-[#2b2d42] px-4 py-2 rounded items-center`}
                    onPress={() => saveLevel()}
                    hapticStyle={"Heavy"}
                    sound="success"
                  >
                    <FontAwesome name="save" size={24} color="white" />
                  </Button>
                  <Button
                    className={`bg-[#2b2d42] px-4 py-2 rounded items-center`}
                    onPress={() => setDeleteLevelModalVisible(true)}
                    hapticStyle={"Heavy"}
                    sound="click"
                  >
                    <Foundation name="page-delete" size={24} color="white" />
                  </Button>
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

            <View className="flex flex-row justify-center gap-1">
              <Button
                className={`bg-[#c1121f] px-4 py-2 rounded`}
                onPress={() => setMode("create")}
                sound="click"
              >
                <PuzzlePieceIcon color={"white"} />
              </Button>
              <Button
                className={`bg-[#c1121f] px-4 py-2 rounded`}
                onPress={() => setMode("arch")}
                sound="click"
              >
                <AntDesign name="sisternode" size={24} color="white" />
              </Button>
              <Button
                className={`bg-[#c1121f] px-4 py-2 rounded`}
                onPress={() => setMode("delete")}
                sound="click"
              >
                <FontAwesome name="remove" size={24} color="white" />
              </Button>
              <Button
                className={`bg-[#e9c46a] px-4 py-2 rounded`}
                onPress={() => setMode("move")}
                sound="click"
              >
                <CursorArrowRippleIcon color={"white"} />
              </Button>
              <Button
                className={`bg-[#e9c46a] px-4 py-2 rounded`}
                onPress={() => setMode("resize")}
                sound="click"
              >
                <ArrowTopRightOnSquareIcon color={"white"} />
              </Button>
              <Button
                className={`bg-[#e9c46a] px-4 py-2 rounded`}
                onPress={() => setMode("rotate")}
                sound="click"
              >
                <ArrowPathIcon color={"white"} />
              </Button>
              <View className="flex flex-row gap-3 relative">
                <Button
                  className={`bg-[#2b2d42] px-4 py-2 rounded`}
                  onPress={() =>
                    setMenu((prev) =>
                      prev === "materials" ? "none" : "materials"
                    )
                  }
                  hapticStyle={"Heavy"}
                  sound="click"
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
                      className={`bg-gray-400 px-4 py-2 rounded`}
                      onPress={() => setMaterial(Materials.ROAD)}
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

            <View className="flex flex-row justify-end gap-3 w-40">
              <View className="flex flex-row gap-3 w-40 justify-end">
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
          </View>

          <View className="w-full absolute top-0 justify-center items-center">
            <Button
              className={`flex flex-row items-center gap-2 py-2 px-5 w-34 bg-gray-300 ${menu == "money" ? "" : "rounded-b-lg"} `}
              onPress={() =>
                setMenu((prev) => (prev === "money" ? "none" : "money"))
              }
              sound="click"
            >
              <BanknotesIcon color={"green"} width={20} height={20} />
              <Text className="text-black w-12">{budget}$</Text>
            </Button>

            <Text className="text-black">
              {changesMade ? "Unsaved changes" : "Level saved"}
            </Text>

            {menu == "money" && (
              <View className="p-3 bg-gray-300 rounded-lg">
                <Slider
                  value={budget}
                  onValueChange={(e) => {
                    setBudget(e);
                    sfx.playHaptic("Soft");
                  }}
                  step={1000}
                  style={{ width: 200, height: 40 }}
                  minimumValue={1000}
                  maximumValue={20000}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="#000000"
                />
              </View>
            )}
          </View>

          {menu == "car" && (
            <CarMenu
              carSettings={carSettings}
              setCarSettings={setCarSettings}
              setMenu={setMenu}
            />
          )}

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
              isVisible={deleteLevelModalVisible}
              animationIn="slideInUp"
              animationOut="slideOutDown"
              backdropColor="transparent"
            >
              <View className="bg-white p-5 rounded-lg flex items-center">
                <Text>Are you sure you want to delete level?</Text>
                <View className="flex flex-row gap-5 m-10">
                  <Button
                    className="bg-red-500 px-4 py-2 rounded"
                    onPress={() => setDeleteLevelModalVisible(false)}
                    hapticStyle="Heavy"
                    sound="error"
                  >
                    <Text>No</Text>
                  </Button>
                  <Button
                    className="bg-green-500 px-4 py-2 rounded"
                    onPress={() => {
                      deleteLevel();
                      setDeleteLevelModalVisible(false);
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
              isVisible={notSavedModalVisible}
              animationIn="slideInUp"
              animationOut="slideOutDown"
              backdropColor="transparent"
            >
              <View className="bg-white p-5 rounded-lg flex items-center">
                <Text>
                  Are you sure you want to leave level without saving?
                </Text>
                <View className="flex flex-row gap-5 m-10">
                  <Button
                    className="bg-red-500 px-4 py-2 rounded"
                    onPress={() => setNotSavedModalVisible(false)}
                    hapticStyle="Heavy"
                    sound="error"
                  >
                    <Text>No</Text>
                  </Button>
                  <Button
                    className="bg-green-500 px-4 py-2 rounded"
                    onPress={() => {
                      router.back();
                      setNotSavedModalVisible(false);
                    }}
                    hapticStyle="Heavy"
                    sound="success"
                  >
                    <Text>Yes</Text>
                  </Button>
                </View>
              </View>
            </Modal>
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
