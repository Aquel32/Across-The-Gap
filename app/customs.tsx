import { ScrollView, Text, View } from "react-native";

import Button from "@/components/Button";
import { loadFileAsync } from "@/lib/storage";
import { LevelData } from "@/lib/types";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeftEndOnRectangleIcon,
  BanknotesIcon,
  PlusIcon,
  RocketLaunchIcon,
  TruckIcon,
} from "react-native-heroicons/outline";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

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
      <View className="w-full h-full flex justify-center items-center">
        <View className="flex flex-row justify-center items-center">
          <SafeAreaProvider>
            <SafeAreaView className="w-[60%] ml-[20%]" edges={[]}>
              <ScrollView
                horizontal={true}
                className="py-3"
                contentContainerStyle={{
                  flexGrow: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 18,
                }}
                persistentScrollbar={true}
              >
                {Levels.length === 0 && (
                  <View className="w-120 h-40 items-center justify-center">
                    <Text className="text-lg text-gray-500">
                      No custom levels found. Create one by pressing the "+"
                      button
                    </Text>
                  </View>
                )}
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
                    hapticStyle={"Soft"}
                    sound="click"
                  >
                    <Text className="text-2xl">Custom {index + 1}</Text>
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
                        <Text>
                          {level.carSettings.acceleration.toFixed(1)}m/s
                        </Text>
                      </View>
                    </View>
                  </Button>
                ))}
              </ScrollView>
            </SafeAreaView>
          </SafeAreaProvider>
        </View>

        <View className="flex flex-row items-center justify-between w-[60%] mt-4">
          <Button
            className="bg-gray-500 px-10 py-2 rounded items-center"
            onPress={() => router.back()}
            sound="click"
          >
            <ArrowLeftEndOnRectangleIcon color={"white"} />
          </Button>
          <Button
            className="bg-green-500 px-10 py-2 rounded items-center"
            onPress={() =>
              router.push({
                pathname: "/level/custom/[id]",
                params: { id: "new" },
              })
            }
            hapticStyle={"Soft"}
            sound="click"
          >
            <PlusIcon color={"white"} />
          </Button>
        </View>
      </View>
    </View>
  );
}
