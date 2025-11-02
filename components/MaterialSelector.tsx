import { Text, TouchableOpacity, View } from "react-native";

export interface Material {
  name: string;
  color: string;
}

export default function MaterialSelector({
  onMaterialSelect,
}: {
  onMaterialSelect: (material: Material) => void;
}) {
  return (
    <View className="flex flex-row gap-3 items-center justify-center w-full">
      <TouchableOpacity
        className="bg-blue-500 px-4 py-2 rounded"
        onPress={() => onMaterialSelect({ name: "Material 1", color: "blue" })}
      >
        <Text>Material 1</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-green-500 px-4 py-2 rounded"
        onPress={() => onMaterialSelect({ name: "Material 2", color: "green" })}
      >
        <Text>Material 2</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-yellow-500 px-4 py-2 rounded"
        onPress={() =>
          onMaterialSelect({ name: "Material 3", color: "yellow" })
        }
      >
        <Text>Material 3</Text>
      </TouchableOpacity>
    </View>
  );
}
