import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Menu() {
  return (
    <>
      <View className="w-full h-full flex justify-center items-center">
        <Text className="text-5xl">Across The Gap</Text>

        <View className="mt-10 flex gap-2">
          <TouchableOpacity
            className={`bg-red-500 px-4 py-2 rounded`}
            onPress={() => router.push("/campaign")}
          >
            <Text className="text-center">CAMPAIGN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`bg-red-500 px-4 py-2 rounded`}
            onPress={() => router.push("/game")}
          >
            <Text className="text-center">EDITOR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`bg-red-500 px-4 py-2 rounded`}
            onPress={() => router.push("/game")}
          >
            <Text className="text-center">SETTINGS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
