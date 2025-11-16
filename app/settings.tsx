import Button from "@/components/Parts/Button";
import GameOptions from "@/components/Parts/GameOptions";
import { router } from "expo-router";
import { View } from "react-native";
import { ArrowLeftEndOnRectangleIcon } from "react-native-heroicons/outline";

export default function SettingsScreen() {
  return (
    <View className="flex-1">
      <View className="flex items-center justify-center h-full gap-10">
        <GameOptions />

        <Button
          className="bg-gray-500 px-10 py-2 rounded items-center"
          onPress={() => router.back()}
          sound="click"
        >
          <ArrowLeftEndOnRectangleIcon color={"white"} />
        </Button>
      </View>
    </View>
  );
}
