import { createContext, ReactNode, useContext } from "react";
export type ImageName = "carBody" | "carWheel" | "background";

interface ImagesContextType {
  getImageFile: (name: ImageName) => any;
}

const imageFiles: Record<ImageName, any> = {
  carBody: require("@/assets/images/body.png"),
  carWheel: require("@/assets/images/wheel.png"),
  background: require("@/assets/images/bg.jpg"),
};

const ImagesContext = createContext<ImagesContextType | undefined>(undefined);

export default function ImagesProvider({ children }: { children: ReactNode }) {
  const files = Object.fromEntries(
    Object.entries(imageFiles).map(([name, file]) => {
      return [name, file];
    })
  ) as Record<ImageName, any>;

  function getImageFile(name: ImageName) {
    return files[name];
  }
  return (
    <ImagesContext.Provider value={{ getImageFile }}>
      {children}
    </ImagesContext.Provider>
  );
}

export function useLoadedImages() {
  const context = useContext(ImagesContext);
  if (context === undefined) {
    throw new Error("useLoadedImages musi być używane wewnątrz ImagesProvider");
  }
  return context;
}
