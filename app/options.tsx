import Button from "@/components/Button";
import Options from "@/components/Options";
import { router } from "expo-router";
import { View } from "react-native";
import { ArrowLeftEndOnRectangleIcon } from "react-native-heroicons/outline";

export default function OptionsScreen() {
    return <View className="flex-1">
        <View className="flex items-center justify-center h-full">
            <Options />
        </View>

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
}