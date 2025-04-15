import { SettingsProvider } from "@/context/SettingsContext";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}
