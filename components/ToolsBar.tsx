import { Materials } from "@/lib/materials";
import { Material, Menus, Modes } from "@/lib/types";
import { Text, TouchableOpacity, View } from "react-native";
import {
  BarsArrowUpIcon,
  BoltSlashIcon,
  ChevronUpIcon,
  CursorArrowRippleIcon,
  EllipsisHorizontalIcon,
  LinkIcon,
  TrashIcon
} from "react-native-heroicons/outline";

export default function ToolsBar({
  menu,
  setMenu,
  clearLevel,
  mode,
  setMode,
  onMaterialSelect,
  disabled,
}: {
  menu: Menus;
  setMenu: React.Dispatch<React.SetStateAction<Menus>>;
  clearLevel: () => void;
  mode: Modes;
  setMode: React.Dispatch<React.SetStateAction<Modes>>;
  onMaterialSelect: (material: Material) => void;
  disabled: boolean;
}) {
  return (
    <>
      <View className="flex flex-row gap-3 items-center justify-center relative">
        <TouchableOpacity
          className={`bg-[#c1121f] px-4 py-2 rounded items-center`}
          onPress={() => setMode("move")}
          disabled={disabled}
        >
          <CursorArrowRippleIcon color={"white"} />
        </TouchableOpacity>
        <TouchableOpacity
          className={`bg-[#c1121f] px-4 py-2 rounded items-center`}
          onPress={() => setMode("create")}
          disabled={disabled}
        >
          <LinkIcon color={"white"} />
        </TouchableOpacity>
        <TouchableOpacity
          className={`bg-[#c1121f] px-4 py-2 rounded items-center`}
          onPress={() => setMode("delete")}
          disabled={disabled}
        >
          <BoltSlashIcon color={"white"} />
        </TouchableOpacity>
        <TouchableOpacity
          className={`bg-[#e9c46a] px-4 py-2 rounded items-center`}
          onPress={() => setMode("arch")}
          disabled={disabled}
        >
          <ChevronUpIcon color={"white"} />
        </TouchableOpacity>
        <TouchableOpacity
          className={`bg-[#e9c46a] px-4 py-2 rounded items-center`}
          onPress={() => setMode("chain")}
          disabled={disabled}
        >
          <EllipsisHorizontalIcon color={"white"} />
        </TouchableOpacity>
        <TouchableOpacity
          className={`bg-[#003049] px-4 py-2 rounded items-center`}
          onPress={() => setMenu("materials")}
          disabled={disabled}
        >
          <BarsArrowUpIcon color={"white"} />
        </TouchableOpacity>

        {menu != "none" && (
          <View className="bottom-0 flex flex-row items-center justify-center absolute w-full">
            <View className="bottom-12 bg-white p-4 rounded shadow-lg gap-4 flex flex-row justify-evenly items-center">
              {menu == "mode" && (
                <>
                  <TouchableOpacity
                    className={`bg-gray-500 w-20 h-20 rounded items-center justify-center`}
                    onPress={() => setMode("move")}
                    disabled={disabled}
                  >
                    <Text>MOVE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`bg-gray-500 w-20 h-20 rounded items-center justify-center`}
                    onPress={() => setMode("create")}
                    disabled={disabled}
                  >
                    <Text>CREATE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`bg-gray-500 w-20 h-20 rounded items-center justify-center`}
                    onPress={() => setMode("delete")}
                    disabled={disabled}
                  >
                    <Text>DELETE</Text>
                  </TouchableOpacity>

                </>
              )}
              {menu == "tools" && (
                <>
                  <TouchableOpacity
                    className={`bg-${Materials.ROAD.color}-500 w-20 h-20 rounded items-center justify-center`}
                    onPress={() => setMode("arch")}
                    disabled={disabled}
                  >
                    <Text>ARCH</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`bg-${Materials.STEEL.color}-500 w-20 h-20 rounded items-center justify-center`}
                    onPress={() => setMode("chain")}
                    disabled={disabled}
                  >
                    <Text>CHAIN</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`bg-${Materials.WOOD.color}-500 w-20 h-20 rounded items-center justify-center`}
                    onPress={() => setMode("mesh")}
                    disabled={disabled}
                  >
                    <Text>MESH</Text>
                  </TouchableOpacity>
                </>
              )}
              {menu == "materials" && (
                <>
                  <TouchableOpacity
                    className={`bg-${Materials.ROAD.color}-500 w-20 h-20 rounded items-center justify-center`}
                    onPress={() => onMaterialSelect(Materials.ROAD)}
                    disabled={disabled}
                  >
                    <Text>{Materials.ROAD.name}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`bg-${Materials.STEEL.color}-500 w-20 h-20 rounded items-center justify-center`}
                    onPress={() => onMaterialSelect(Materials.STEEL)}
                    disabled={disabled}
                  >
                    <Text>{Materials.STEEL.name}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`bg-${Materials.WOOD.color}-500 w-20 h-20 rounded items-center justify-center`}
                    onPress={() => onMaterialSelect(Materials.WOOD)}
                    disabled={disabled}
                  >
                    <Text>{Materials.WOOD.name}</Text>
                  </TouchableOpacity>
                </>
              )}
              {menu == "settings" &&
                <>
                  <TouchableOpacity
                    className={`bg-gray-500 w-20 h-20 rounded items-center justify-center`}
                    onPress={clearLevel}
                    disabled={disabled}
                  >
                    <TrashIcon color={"white"} />
                  </TouchableOpacity>
                </>}
            </View>
          </View>
        )}
      </View>
    </>
  );
}
