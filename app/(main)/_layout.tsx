import { SettingsProvider } from "@/context/SettingsContext";
import { TapDataProvider } from "@/context/tap-context";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <TapDataProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </TapDataProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}
