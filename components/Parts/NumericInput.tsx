import { useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ChevronDownIcon, ChevronUpIcon } from "react-native-heroicons/outline";

export default function NumericInput(
    { min, max, step, onChange, defaultValue }:
        { min: number, max: number, step: number, onChange: (newValue: number) => void, defaultValue?: number }
) {
    const [value, setValue] = useState(defaultValue ? defaultValue : 0)
    const pressing = useRef(false)

    function updateValue(newValue: number) {
        setValue((current) => {
            let v = current + newValue;
            if (v < min) {
                v = min;
            }
            else if (v > max) {
                v = max;
            }
            onChange(v);
            return v;
        });
    }

    function longPress(pressValue: number) {
        pressing.current = true;

        function pressAction() {
            updateValue(pressValue);

            if (pressing.current === true) {
                setTimeout(pressAction, 100);
            }
        }

        pressAction();
    }


    return <View className="flex flex-row">
        <View className="bg-white justify-center px-5 rounded-l-lg">
            <Text>
                {value}
            </Text>
        </View>
        <View className="flex flex-col">
            <TouchableOpacity
                className="p-2 bg-white rounded-tr-lg"
                onPress={() => updateValue(step)}
                onLongPress={() => longPress(step)}
                onPressOut={() => pressing.current = false}
            >
                <ChevronUpIcon size={14} />
            </TouchableOpacity>
            <TouchableOpacity
                className="p-2 bg-white rounded-br-lg"
                onPress={() => updateValue(-step)}
                onLongPress={() => longPress(-step)}
                onPressOut={() => pressing.current = false}

            >
                <ChevronDownIcon size={14} />
            </TouchableOpacity>
        </View>
    </View >
}