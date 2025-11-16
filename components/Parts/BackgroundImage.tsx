import { CameraBounds } from "@/lib/types";
import { Image, useImage } from "@shopify/react-native-skia";

export default function BackgroundImage({ bounds }: { bounds: CameraBounds }) {
  const backgroundImage = useImage(require("@/assets/images/bg.jpg"));

  return (
    <Image
      image={backgroundImage}
      fit="cover"
      rect={{
        x: bounds.minX,
        y: bounds.minY,
        width: bounds.maxX - bounds.minX,
        height: bounds.maxY - bounds.minY,
      }}
    />
  );
}
