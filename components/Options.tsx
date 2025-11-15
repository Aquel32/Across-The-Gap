import { saveFileAsync } from "@/lib/storage";
import Slider from "@react-native-community/slider";
import { useState } from "react";
import { Text, View } from "react-native";
import { TrashIcon } from "react-native-heroicons/outline";
import Modal from "react-native-modal";
import Button from "./Button";
import { useSFX } from "./SFXProvider";

export default function Options() {
  const sfx = useSFX();

  const [resetDataModalState, changeResetDataModalState] = useState(false);
  function resetData() {
    saveFileAsync("custom_levels.json", "[]");
    changeResetDataModalState(false);
  }

  return (
    <View className="">
      <View className="flex flex-col items-center justify-center">
        <View>
          <Text className="ml-4 font-bold">SFX Volume</Text>
          <Slider
            value={sfx.volume}
            onValueChange={(e) => sfx.setVolume(e)}
            step={0.05}
            style={{ width: 200, height: 40 }}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
          />
        </View>
        <View>
          <Text className="ml-4 font-bold">Music Volume</Text>
          <Slider
            value={sfx.volume}
            onValueChange={(e) => sfx.setVolume(e)}
            step={0.05}
            style={{ width: 200, height: 40 }}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
          />
        </View>
        <View className="flex flex-row items-center gap-3 bg-gray-300 px-4 py-2 rounded mt-3">
          <Text className="w-20">RESET{"\n"}STORAGE</Text>
          <Button
            className="bg-red-500 px-4 py-2 rounded"
            onPress={() => changeResetDataModalState(true)}
            hapticStyle={"Light"}
            sound="click"
          >
            <TrashIcon color={"white"} />
          </Button>
        </View>
      </View>

      <View style={{ flex: 1 }} className="absolute">
        <Modal
          isVisible={resetDataModalState}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          backdropColor="transparent"
        >
          <View className="bg-white p-5 rounded-lg flex items-center">
            <Text className="text-xl">
              Are you sure you want to reset all data?
            </Text>
            <Text className="font-bold">This action cannot be undone.</Text>
            <View className="flex flex-row gap-5 m-10">
              <Button
                className="bg-green-500 px-4 py-2 rounded"
                onPress={() => changeResetDataModalState(false)}
                hapticStyle="Heavy"
                sound="error"
              >
                <Text>No</Text>
              </Button>
              <Button
                className="bg-red-500 px-4 py-2 rounded"
                onPress={() => {
                  resetData();
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
    </View>
  );
}
