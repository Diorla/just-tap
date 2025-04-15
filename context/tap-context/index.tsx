import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TapData, TapSession, generateId } from "@/models/TapData";
import TapDataContextType from "./TapDataContextType";

// Create the context with a default value
const TapDataContext = createContext<TapDataContextType>({
  currentSession: null,
  startNewSession: () => {},
  endCurrentSession: () => {},
  addTap: () => {},
  getAllTaps: async () => [],
  getTapsBySession: async () => [],
  getAllSessions: async () => [],
  clearAllData: async () => {},
});

// Storage keys
const TAPS_STORAGE_KEY = "tapData";
const SESSIONS_STORAGE_KEY = "tapSessions";

// Create a provider component
export const TapDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentSession, setCurrentSession] = useState<TapSession | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize when component mounts
  useEffect(() => {
    const initialize = async () => {
      try {
        // Create a new session when the app starts
        await startNewSession();
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize tap data:", error);
        setIsInitialized(true);
      }
    };

    initialize();

    // End session when component unmounts
    return () => {
      if (currentSession) {
        endCurrentSession();
      }
    };
  }, []);

  // Start a new tapping session
  const startNewSession = async (): Promise<void> => {
    try {
      const sessionId = generateId();
      const newSession: TapSession = {
        id: sessionId,
        startTime: Date.now(),
        endTime: null,
        tapCount: 0,
      };

      // Store the new session
      const storedSessions = await getAllSessions();
      await AsyncStorage.setItem(
        SESSIONS_STORAGE_KEY,
        JSON.stringify([...storedSessions, newSession])
      );

      setCurrentSession(newSession);
    } catch (error) {
      console.error("Failed to start new session:", error);
    }
  };

  // End the current tapping session
  const endCurrentSession = async (): Promise<void> => {
    if (!currentSession) return;

    try {
      // Update the session end time
      const updatedSession: TapSession = {
        ...currentSession,
        endTime: Date.now(),
      };

      // Update the session in storage
      const storedSessions = await getAllSessions();
      const updatedSessions = storedSessions.map((session) =>
        session.id === currentSession.id ? updatedSession : session
      );

      await AsyncStorage.setItem(
        SESSIONS_STORAGE_KEY,
        JSON.stringify(updatedSessions)
      );

      setCurrentSession(null);
    } catch (error) {
      console.error("Failed to end session:", error);
    }
  };

  // Add a new tap to the current session
  const addTap = async (x: number, y: number): Promise<void> => {
    if (!currentSession) return;

    try {
      const newTap: TapData = {
        id: generateId(),
        x,
        y,
        timestamp: Date.now(),
        sessionId: currentSession.id,
      };

      // Store the tap
      const storedTaps = await getAllTaps();

      // const lastTap =
      //   storedTaps.length > 0 ? storedTaps[storedTaps.length - 1] : null;

      // if (lastTap && newTap.timestamp - lastTap.timestamp < 50) {
      //   return; // Skip this tap - it's too close to the previous one
      // }

      await AsyncStorage.setItem(
        TAPS_STORAGE_KEY,
        JSON.stringify([...storedTaps, newTap])
      );

      // Update the session tap count
      const updatedSession: TapSession = {
        ...currentSession,
        tapCount: currentSession.tapCount + 1,
      };

      // Update the session in storage
      const storedSessions = await getAllSessions();
      const updatedSessions = storedSessions.map((session) =>
        session.id === currentSession.id ? updatedSession : session
      );

      await AsyncStorage.setItem(
        SESSIONS_STORAGE_KEY,
        JSON.stringify(updatedSessions)
      );

      setCurrentSession(updatedSession);
    } catch (error) {
      console.error("Failed to add tap:", error);
    }
  };

  // Get all taps from storage
  const getAllTaps = async (): Promise<TapData[]> => {
    try {
      const storedTaps = await AsyncStorage.getItem(TAPS_STORAGE_KEY);
      return storedTaps ? JSON.parse(storedTaps) : [];
    } catch (error) {
      console.error("Failed to get all taps:", error);
      return [];
    }
  };

  // Get taps for a specific session
  const getTapsBySession = async (sessionId: string): Promise<TapData[]> => {
    try {
      const allTaps = await getAllTaps();
      return allTaps.filter((tap) => tap.sessionId === sessionId);
    } catch (error) {
      console.error("Failed to get taps by session:", error);
      return [];
    }
  };

  // Get all sessions from storage
  const getAllSessions = async (): Promise<TapSession[]> => {
    try {
      const storedSessions = await AsyncStorage.getItem(SESSIONS_STORAGE_KEY);
      return storedSessions ? JSON.parse(storedSessions) : [];
    } catch (error) {
      console.error("Failed to get all sessions:", error);
      return [];
    }
  };

  // Clear all tap data
  const clearAllData = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(TAPS_STORAGE_KEY);
      await AsyncStorage.removeItem(SESSIONS_STORAGE_KEY);
      setCurrentSession(null);
      await startNewSession();
    } catch (error) {
      console.error("Failed to clear all data:", error);
    }
  };

  // Only render children once initialized
  if (!isInitialized) {
    return null; // Or a loading indicator
  }

  return (
    <TapDataContext.Provider
      value={{
        currentSession,
        startNewSession,
        endCurrentSession,
        addTap,
        getAllTaps,
        getTapsBySession,
        getAllSessions,
        clearAllData,
      }}
    >
      {children}
    </TapDataContext.Provider>
  );
};

// Create a custom hook for using the tap data context
export const useTapData = () => useContext(TapDataContext);

export default TapDataContext;
