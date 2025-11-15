import Button from "@/components/Button";
import { router } from "expo-router";
import { Text, View } from "react-native";
import {
  Cog6ToothIcon,
  PencilSquareIcon,
  PlayIcon,
} from "react-native-heroicons/outline";

export default function Menu() {
  return (
    <>
      <View className="w-full h-full flex justify-center items-center">
        <Text className="text-4xl font-medium">Across The Gap</Text>

        <View className="mt-10 flex flex-col gap-2">
          <Button
            className={`bg-green-500 px-4 py-2 rounded items-center`}
            onPress={() => router.push("/campaign")}
            hapticStyle={"Light"}
            sound="click"
          >
            <PlayIcon color={"white"} />
          </Button>

          <View className="flex flex-row gap-2">
            <Button
              className="bg-gray-500 px-4 py-2 rounded items-center"
              onPress={() => router.push("/options")}
              hapticStyle={"Heavy"}
              sound="error"
            >
              <Cog6ToothIcon color={"white"} />
            </Button>

            <Button
              className="bg-amber-500 px-4 py-2 rounded"
              onPress={() => router.push("/customs")}
              hapticStyle={"Light"}
              sound="click"
            >
              <PencilSquareIcon color={"white"} />
            </Button>
          </View>
        </View>
      </View>
    </>
  );
}
