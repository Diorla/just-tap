import { TapSession, TapData } from "@/models/TapData";

// Define the tap data context interface
export default interface TapDataContextType {
  currentSession: TapSession | null;
  startNewSession: () => void;
  endCurrentSession: () => void;
  addTap: (x: number, y: number) => void;
  getAllTaps: () => Promise<TapData[]>;
  getTapsBySession: (sessionId: string) => Promise<TapData[]>;
  getAllSessions: () => Promise<TapSession[]>;
  clearAllData: () => Promise<void>;
}
