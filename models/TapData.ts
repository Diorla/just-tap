// TapData model to represent individual tap events
export interface TapData {
  id: string;
  x: number;
  y: number;
  timestamp: number;
  sessionId: string;
}

// TapSession model to represent a single tapping session
export interface TapSession {
  id: string;
  startTime: number;
  endTime: number | null;
  tapCount: number;
}

// Generate a unique ID000000000000000000000
export const generateId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};
