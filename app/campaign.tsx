import { Text, TouchableOpacity, View } from "react-native";

import Levels from "@/assets/levels.json";
import { router } from "expo-router";

export default function Campaign() {
  return (
    <View className="w-full h-full flex justify-center items-center">
      {Levels.map((level, index) => (
        <TouchableOpacity
          key={index}
          className="mb-4"
          onPress={() =>
            router.push({
              pathname: "/level/[id]",
              params: { id: String(index + 1) },
            })
          }
        >
          <Text className="text-2xl">Level {index + 1}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
