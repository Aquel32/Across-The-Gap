import "../global.css";

import SFXProvider from "@/contexts/SFXProvider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <SFXProvider>
        <Stack screenOptions={{ orientation: "landscape" }}>
          <Stack.Screen name="menu" options={{ headerShown: false }} />
          <Stack.Screen name="campaign" options={{ headerShown: false }} />
          <Stack.Screen name="customs" options={{ headerShown: false }} />
          <Stack.Screen name="level/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="level/custom/[id]"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </SFXProvider>
    </>
  );
}
