import { Materials } from "@/lib/materials";
import { Material } from "@/lib/types";
import { Text, TouchableOpacity, View } from "react-native";

export default function MaterialSelector({
  onMaterialSelect,
  disabled,
}: {
  onMaterialSelect: (material: Material) => void;
  disabled: boolean;
}) {
  return (
    <View className="flex flex-row gap-3 items-center justify-center">
      <TouchableOpacity
        className={`bg-red-500 px-4 py-2 rounded w-20 items-center`}
        onPress={() => onMaterialSelect(Materials.ROAD)}
        disabled={disabled}
      >
        <Text>{Materials.ROAD.name}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`bg-green-500 px-4 py-2 rounded w-20 items-center`}
        onPress={() => onMaterialSelect(Materials.STEEL)}
        disabled={disabled}
      >
        <Text>{Materials.STEEL.name}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`bg-blue-500 px-4 py-2 rounded w-20 items-center`}
        onPress={() => onMaterialSelect(Materials.WOOD)}
        disabled={disabled}
      >
        <Text>{Materials.WOOD.name}</Text>
      </TouchableOpacity>
    </View>
  );
}
