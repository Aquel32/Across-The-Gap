import { Text, TouchableOpacity, View } from "react-native";

import Levels from "@/assets/levels.json";
import { router } from "expo-router";
import {
  ArrowLeftEndOnRectangleIcon,
  BanknotesIcon,
  RocketLaunchIcon,
  TruckIcon,
} from "react-native-heroicons/outline";

export default function Campaign() {
  return (
    <View className="w-full h-full flex justify-center items-center">
      {Levels.map((level, index) => (
        <TouchableOpacity
          key={index}
          onPress={() =>
            router.push({
              pathname: "/level/[id]",
              params: { id: String(index + 1) },
            })
          }
          className="bg-gray-300 w-40 h-40 rounded items-center justify-center"
        >
          <Text className="text-2xl">Level {index + 1}</Text>
          <View className="m-2">
            <View className="flex flex-row gap-1 items-center">
              <BanknotesIcon color={"green"} width={20} height={20} />
              <Text>{level.budget}$</Text>
            </View>
            <View className="flex flex-row gap-1 items-center">
              <TruckIcon color={"chocolate"} width={20} height={20} />
              <Text>{level.carSettings.mass}t</Text>
            </View>
            <View className="flex flex-row gap-1 items-center">
              <RocketLaunchIcon
                color={"cornflowerblue"}
                width={20}
                height={20}
              />
              <Text>{level.carSettings.acceleration}m/s</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <View className="flex flex-row w-full justify-between items-center px-10 py-1 absolute bottom-0">
        <View className="flex flex-row justify-start gap-3 w-40">
          <TouchableOpacity
            className={`bg-gray-500 px-4 py-2 rounded`}
            onPress={() => router.back()}
          >
            <ArrowLeftEndOnRectangleIcon color={"white"} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
