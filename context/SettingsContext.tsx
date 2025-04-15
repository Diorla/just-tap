import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the settings interface
interface Settings {
  hapticFeedback: boolean;
  visualFeedback: boolean;
  showCounter: boolean;
  rippleEffect: boolean;
}

// Default settings
const defaultSettings: Settings = {
  hapticFeedback: true,
  visualFeedback: true,
  showCounter: true,
  rippleEffect: true,
};

// Define the context interface
interface SettingsContextType {
  settings: Settings;
  updateSetting: (key: keyof Settings, value: boolean) => void;
  loadSettings: () => Promise<void>;
}

// Create the context with a default value
const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSetting: () => {},
  loadSettings: async () => {},
});

// Create a provider component
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from storage when component mounts
  useEffect(() => {
    loadSettings();
  }, []);

  // Load settings from AsyncStorage
  const loadSettings = async (): Promise<void> => {
    try {
      const storedSettings = await AsyncStorage.getItem("appSettings");
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
      setIsLoaded(true);
    } catch (error) {
      console.error("Failed to load settings from storage:", error);
      setIsLoaded(true);
    }
  };

  // Update a specific setting
  const updateSetting = async (
    key: keyof Settings,
    value: boolean
  ): Promise<void> => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);

    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem(
        "appSettings",
        JSON.stringify(updatedSettings)
      );
    } catch (error) {
      console.error("Failed to save settings to storage:", error);
    }
  };

  // Only render children once settings have been loaded
  if (!isLoaded) {
    return null; // Or a loading indicator
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        loadSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// Create a custom hook for using the settings context
export const useSettings = () => useContext(SettingsContext);

export default SettingsContext;
