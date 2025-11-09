import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import {
  Cog6ToothIcon,
  PencilSquareIcon,
  PlayIcon,
} from "react-native-heroicons/outline";

export default function Menu() {
  return (
    <>
      <View className="w-full h-full flex justify-center items-center">
        <Text className="text-5xl">Across The Gap</Text>

        <View className="mt-10 flex flex-col gap-2">
          <TouchableOpacity
            className={`bg-green-500 px-4 py-2 rounded items-center`}
            onPress={() => router.push("/campaign")}
          >
            <PlayIcon color={"white"} />
          </TouchableOpacity>

          <View className="flex flex-row gap-2">
            <TouchableOpacity
              className={`bg-gray-500 px-4 py-2 rounded items-center`}
              onPress={() => {}}
            >
              <Cog6ToothIcon color={"white"} />
            </TouchableOpacity>

            <TouchableOpacity
              className={`bg-amber-500 px-4 py-2 rounded`}
              onPress={() => router.push("/game")}
            >
              <PencilSquareIcon color={"white"} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}
