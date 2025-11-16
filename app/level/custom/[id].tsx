import Button from "@/components/Button";
import Level from "@/components/Level";
import LevelCreator from "@/components/LevelCreator";
import LevelSettings from "@/components/LevelSettings";
import { useSFX } from "@/components/SFXProvider";
import { DEFAULT_LEVEL } from "@/lib/defaultValues";
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
import {
  AntDesign,
  FontAwesome,
  FontAwesome5,
  Foundation,
  MaterialIcons,
} from "@expo/vector-icons";
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
  Cog6ToothIcon,
  CursorArrowRippleIcon,
  PauseIcon,
  PlayIcon,
  PuzzlePieceIcon,
  TrashIcon,
} from "react-native-heroicons/outline";
import Modal from "react-native-modal";

export default function NewLevel() {
  const sfx = useSFX();
  const [Levels, setLevels] = useState<LevelData[]>([]);

  const params = useLocalSearchParams<{ id: string }>();
  const index = useRef(Number(params.id) - 1);

  const [menu, setMenu] = useState<Menus>("none");
  const [mode, setMode] = useState<Modes>("move");

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
    setMode("move");
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
                <View className="absolute bottom-14 flex flex-col gap-2">
                  <Button
                    className={`bg-[#2b2d42] px-4 py-2 rounded`}
                    onPress={() => backToCustoms()}
                    hapticStyle={"Soft"}
                    sound="click"
                  >
                    <ArrowLeftEndOnRectangleIcon color={"white"} />
                  </Button>
                  <Button
                    className={`bg-[#2b2d42] px-4 py-2 rounded`}
                    onPress={() => setMenu("levelSettings")}
                    hapticStyle={"Soft"}
                    sound="click"
                  >
                    <Cog6ToothIcon color={"white"} />
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
                selected={mode === "create"}
                selectedColor="bg-red-900"
                sound="click"
              >
                <PuzzlePieceIcon color={"white"} />
              </Button>
              <Button
                className={`bg-[#c1121f] px-4 py-2 rounded`}
                onPress={() => setMode("arch")}
                selected={mode === "arch"}
                selectedColor="bg-red-900"
                sound="click"
              >
                <AntDesign name="sisternode" size={24} color="white" />
              </Button>
              <Button
                className={`bg-[#c1121f] px-4 py-2 rounded`}
                onPress={() => setMode("delete")}
                selected={mode === "delete"}
                selectedColor="bg-red-900"
                sound="click"
              >
                <FontAwesome name="remove" size={24} color="white" />
              </Button>
              <Button
                className={`bg-[#e9c46a] px-4 py-2 rounded`}
                onPress={() => setMode("move")}
                selected={mode === "move"}
                selectedColor="bg-yellow-600"
                sound="click"
              >
                <CursorArrowRippleIcon color={"white"} />
              </Button>
              <Button
                className={`bg-[#e9c46a] px-4 py-2 rounded`}
                onPress={() => setMode("resize")}
                selected={mode === "resize"}
                selectedColor="bg-yellow-600"
                sound="click"
              >
                <ArrowTopRightOnSquareIcon color={"white"} />
              </Button>
              <Button
                className={`bg-[#e9c46a] px-4 py-2 rounded`}
                onPress={() => setMode("rotate")}
                selected={mode === "rotate"}
                selectedColor="bg-[#c7a248]"
                sound="click"
              >
                <ArrowPathIcon color={"white"} />
              </Button>
              <View className="flex flex-row gap-3 relative">
                <Button
                  className={`bg-gray-400 px-4 py-2 rounded items-center justify-center`}
                  onPress={() =>
                    setMenu((prev) =>
                      prev === "materials" ? "none" : "materials"
                    )
                  }
                  hapticStyle={"Heavy"}
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
                  {selectedMaterial === Materials.GRASS && (
                    <MaterialIcons name="grass" size={26} color="black" />
                  )}
                  {selectedMaterial === Materials.WATER && (
                    <FontAwesome5 name="water" size={23} color="black" />
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
                    <Button
                      className={`bg-gray-400 px-4 py-2 rounded`}
                      onPress={() => setMaterial(Materials.GRASS)}
                      selected={selectedMaterial === Materials.GRASS}
                      selectedColor="bg-gray-600"
                      sound="click"
                    >
                      <MaterialIcons name="grass" size={24} color="black" />
                    </Button>
                    <Button
                      className={`bg-gray-400 px-4 py-2 rounded`}
                      onPress={() => setMaterial(Materials.WATER)}
                      selected={selectedMaterial === Materials.WATER}
                      selectedColor="bg-gray-600"
                      sound="click"
                    >
                      <FontAwesome5 name="water" size={22} color="black" />
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
              className={`flex flex-row items-center gap-2 py-2 px-5 w-34 bg-gray-300 ${menu == "levelSettings" ? "" : "rounded-b-lg"} `}
              onPress={() =>
                setMenu((prev) =>
                  prev === "levelSettings" ? "none" : "levelSettings"
                )
              }
              sound="click"
            >
              <BanknotesIcon color={"green"} width={20} height={20} />
              <Text className="text-black w-12">{budget}$</Text>
            </Button>

            <Text className="text-black">
              {changesMade ? "Unsaved changes" : "Level saved"}
            </Text>
          </View>

          {menu == "levelSettings" && (
            <LevelSettings
              carSettings={carSettings}
              setCarSettings={setCarSettings}
              budget={budget}
              setBudget={setBudget}
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
