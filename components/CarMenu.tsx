import { CarSettings, Menus } from "@/lib/types";
import Slider from "@react-native-community/slider";
import { Text, View } from "react-native";
import { XMarkIcon } from "react-native-heroicons/outline";
import Button from "./Button";

export default function CarMenu({
  carSettings,
  setCarSettings,
  setMenu,
}: {
  carSettings: CarSettings;
  setCarSettings?: React.Dispatch<React.SetStateAction<CarSettings>>;
  setMenu: React.Dispatch<React.SetStateAction<Menus>>;
}) {
  return (
    <View className="absolute w-full h-full flex items-center justify-center">
      <View className="bg-gray-300 rounded-lg p-10 relative">
        <Text className="font-bold text-center mb-4">CAR SETTINGS</Text>
        <View className="flex flex-row items-center justify-between">
          <Text className="text-black w-32 text-right">MASS</Text>
          <Slider
            value={carSettings.mass}
            onValueChange={(e) =>
              setCarSettings && setCarSettings({ ...carSettings, mass: e })
            }
            step={1}
            style={{ width: 200, height: 3 }}
            minimumValue={1}
            maximumValue={30}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            disabled={!setCarSettings}
          />
          <Text className="text-black w-12">{carSettings.mass}t</Text>
        </View>
        <View className="flex flex-row items-center justify-between">
          <Text className="text-black w-32 text-right">ACCELERATION</Text>
          <Slider
            value={carSettings.acceleration}
            onValueChange={(e) =>
              setCarSettings &&
              setCarSettings({ ...carSettings, acceleration: e })
            }
            step={0.1}
            style={{ width: 200, height: 3 }}
            minimumValue={0.1}
            maximumValue={2}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            disabled={!setCarSettings}
          />
          <Text className="text-black w-12">
            {carSettings.acceleration.toFixed(1)}m/s
          </Text>
        </View>
        <Button
          className="bg-amber-500 p-1 rounded mt-5 absolute bottom-0 right-0"
          onPress={() => setMenu("none")}
          hapticStyle={"Light"}
          sound="success"
        >
          <XMarkIcon color={"white"} />
        </Button>
      </View>
    </View>
  );
}
