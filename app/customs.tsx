import { Text, View } from "react-native";

import Button from "@/components/Button";
import { loadFileAsync } from "@/lib/storage";
import { LevelData } from "@/lib/types";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeftEndOnRectangleIcon,
  BanknotesIcon,
  RocketLaunchIcon,
  TruckIcon,
} from "react-native-heroicons/outline";

export default function Customs() {
  const [Levels, setLevels] = useState<LevelData[]>([]);

  async function loadLevels() {
    const data = await loadFileAsync("custom_levels.json");

    if (data === "") return;
    setLevels(JSON.parse(data) as LevelData[]);
  }

  useEffect(() => {
    loadLevels();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLevels();
    }, [])
  );

  return (
    <View className="w-full h-full flex flex-row gap-5 justify-center items-center">
      {Levels.map((level, index) => (
        <Button
          key={index}
          onPress={() =>
            router.push({
              pathname: "/level/custom/[id]",
              params: { id: String(index + 1) },
            })
          }
          className="bg-gray-300 w-40 h-40 rounded items-center justify-center"
          hapticStyle={"Heavy"}
          sound="click"
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
        </Button>
      ))}
      <Button
        onPress={() =>
          router.push({
            pathname: "/level/custom/[id]",
            params: { id: "new" },
          })
        }
        className="bg-gray-300 w-40 h-40 rounded items-center justify-center"
        hapticStyle={"Heavy"}
        sound="click"
      >
        <Text className="text-2xl">Create Level</Text>
      </Button>

      <View className="flex flex-row w-full justify-between items-center px-10 py-1 absolute bottom-0">
        <View className="flex flex-row justify-start gap-3 w-40">
          <Button
            className={`bg-gray-500 px-4 py-2 rounded`}
            onPress={() => router.back()}
            hapticStyle={"Heavy"}
            sound="click"
          >
            <ArrowLeftEndOnRectangleIcon color={"white"} />
          </Button>
        </View>
      </View>
    </View>
  );
}
