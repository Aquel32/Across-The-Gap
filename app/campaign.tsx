import { ScrollView, Text, View } from "react-native";

import Levels from "@/assets/levels.json";
import Button from "@/components/Parts/Button";
import { loadFileAsync } from "@/lib/storage";
import { LevelTake } from "@/lib/types";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeftEndOnRectangleIcon,
  BanknotesIcon,
  RocketLaunchIcon,
  TruckIcon,
} from "react-native-heroicons/outline";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function CampaignScreen() {
  const [takesData, setTakesData] = useState<LevelTake[]>(
    Levels.map(() => ({ done: false }))
  );

  const [completed, setCompleted] = useState<number>(0);

  async function loadLevels() {
    const data = await loadFileAsync("level_takes.json");

    if (data === "") return;
    setTakesData((prev) => {
      const parsedData = JSON.parse(data) as LevelTake[];
      const result = takesData.map((take, index) => {
        return parsedData[index] || take;
      });

      result.forEach((take, index) => {
        if (take.done) {
          setCompleted((last) => index + 1);
        }
      });

      return result;
    });
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
    <View className="w-full h-full flex justify-center items-center">
      <Text className="text-4xl font-medium mb-4">CAMPAIGN</Text>
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
              {Levels.map((level, index) => (
                <Button
                  key={index}
                  onPress={() =>
                    router.push({
                      pathname: "/level/[id]",
                      params: { id: String(index + 1) },
                    })
                  }
                  hapticStyle={"Soft"}
                  sound="click"
                  className="bg-gray-300 w-40 h-40 rounded items-center justify-center"
                  disabled={index > completed}
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
                      <Text>
                        {level.carSettings.acceleration.toFixed(1)}m/s
                      </Text>
                    </View>
                  </View>
                  {takesData[index].done && (
                    <Text className="text-green-600 font-bold">COMPLETED</Text>
                  )}
                  {index > completed && (
                    <Text className="text-red-600 font-bold">LOCKED</Text>
                  )}
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
        <Text>Progress: {((completed / Levels.length) * 100).toFixed(0)}%</Text>
      </View>
    </View>
  );
}
