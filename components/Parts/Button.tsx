import { useSFX } from "@/contexts/SFXProvider";
import { TouchableOpacity } from "react-native";

const soundFiles = {
  click: require("@/assets/sounds/click.wav"),
  success: require("@/assets/sounds/success.wav"),
  error: require("@/assets/sounds/error.wav"),
};

export default function Button({
  className,
  hapticStyle,
  sound,
  onPress,
  disabled,
  selected,
  selectedColor,
  children,
}: {
  className: string;
  hapticStyle?: "Heavy" | "Medium" | "Light" | "Rigid" | "Soft";
  sound?: "click" | "success" | "error";
  onPress: () => void;
  disabled?: boolean;
  selected?: boolean;
  selectedColor?: string;
  children: React.ReactNode;
}) {
  const sfx = useSFX();

  function handlePress() {
    onPress();
    if (hapticStyle) {
      sfx.playHaptic(hapticStyle);
    }
    if (sound) {
      sfx.playSound(sound);
    }
  }

  return (
    <TouchableOpacity
      className={`${selected === true ? selectedColor! : ""} ${className} ${disabled ? "opacity-50" : ""} `}
      onPress={handlePress}
      disabled={disabled}
    >
      {children}
    </TouchableOpacity>
  );
}
