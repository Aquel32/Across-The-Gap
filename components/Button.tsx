import { TouchableOpacity } from "react-native";
import { useSFX } from "./SFXProvider";

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
  children,
}: {
  className: string;
  hapticStyle?: "Heavy" | "Medium" | "Light" | "Rigid" | "Soft";
  sound?: "click" | "success" | "error";
  onPress: () => void;
  disabled?: boolean;
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
      className={className}
      onPress={handlePress}
      disabled={disabled}
    >
      {children}
    </TouchableOpacity>
  );
}
