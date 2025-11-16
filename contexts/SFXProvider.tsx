import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
export type SoundName = "click" | "success" | "error";

interface SFXContextType {
  playSound: (name: SoundName) => void;
  playHaptic: (style: "Heavy" | "Medium" | "Light" | "Rigid" | "Soft") => void;
  sfxVolume: number;
  setSfxVolume: React.Dispatch<React.SetStateAction<number>>;
}

const soundFiles: Record<SoundName, any> = {
  click: require("@/assets/sounds/click.wav"),
  success: require("@/assets/sounds/success.wav"),
  error: require("@/assets/sounds/error.wav"),
};

const SFXContext = createContext<SFXContextType | undefined>(undefined);

export default function SFXProvider({ children }: { children: ReactNode }) {
  const players = Object.fromEntries(
    Object.entries(soundFiles).map(([name, file]) => {
      return [name, useAudioPlayer(file)];
    })
  ) as Record<SoundName, ReturnType<typeof useAudioPlayer>>;

  async function playSound(name: SoundName) {
    const sound = players[name];
    if (sound) {
      try {
        sound.volume = sfxVolume;
        await sound.seekTo(0);
        await sound.play();
      } catch (error) {}
    }
  }

  function playHaptic(style: "Heavy" | "Medium" | "Light" | "Rigid" | "Soft") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle[style]);
  }

  const [sfxVolume, setSfxVolume] = useState<number>(0.5);

  useEffect(() => {
    Object.values(players).forEach((player) => {
      player.volume = sfxVolume;
      player.muted = sfxVolume === 0;
    });
  }, [sfxVolume]);

  return (
    <SFXContext.Provider
      value={{
        playSound,
        playHaptic,
        sfxVolume,
        setSfxVolume,
      }}
    >
      {children}
    </SFXContext.Provider>
  );
}

export function useSFX() {
  const context = useContext(SFXContext);
  if (context === undefined) {
    throw new Error("useAudio musi być używane wewnątrz AudioProvider");
  }
  return context;
}
