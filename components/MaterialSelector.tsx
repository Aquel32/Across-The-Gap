import { Materials } from "@/lib/materials";
import { Material } from "@/lib/types";
import { Text, TouchableOpacity, View } from "react-native";

export default function MaterialSelector({
  onMaterialSelect,
}: {
  onMaterialSelect: (material: Material) => void;
}) {
  return (
    <View className="flex flex-row gap-3 items-center justify-center">
      <TouchableOpacity
        className={`bg-red-500 px-4 py-2 rounded`}
        onPress={() => onMaterialSelect(Materials.ROAD)}
      >
        <Text>{Materials.ROAD.name}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`bg-green-500 px-4 py-2 rounded`}
        onPress={() => onMaterialSelect(Materials.STEEL)}
      >
        <Text>{Materials.STEEL.name}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`bg-blue-500 px-4 py-2 rounded`}
        onPress={() => onMaterialSelect(Materials.WOOD)}
      >
        <Text>{Materials.WOOD.name}</Text>
      </TouchableOpacity>
    </View>
  );
}
