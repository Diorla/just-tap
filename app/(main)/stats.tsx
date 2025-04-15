import TapHeatmap from "@/components/TapHeatmap";
import { useTapData } from "@/context/tap-context";
import { TapSession, TapData } from "@/models/TapData";
import calculateTapStatistics from "@/scripts/calculate-tap-statistics";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";

const StatsScreen = () => {
  const { back } = useRouter();
  const { getAllTaps, getAllSessions, getTapsBySession, clearAllData } =
    useTapData();

  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<TapSession[]>([]);
  const [allTaps, setAllTaps] = useState<TapData[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  // Load all data from storage
  const loadData = async () => {
    setIsLoading(true);
    try {
      const taps = await getAllTaps();
      const sessionsList = await getAllSessions();

      setAllTaps(taps);
      setSessions(sessionsList.sort((a, b) => b.startTime - a.startTime)); // Sort newest first

      if (sessionsList.length > 0) {
        setSelectedSession(sessionsList[0].id); // Select the newest session by default
      }
    } catch (error) {
      console.error("Error loading stats data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get statistics for all taps
  const getAllStats = () => {
    return calculateTapStatistics(allTaps);
  };

  // Get statistics for selected session
  const getSessionStats = () => {
    if (!selectedSession) return calculateTapStatistics([]);

    const sessionTaps = allTaps.filter(
      (tap) => tap.sessionId === selectedSession
    );

    // Log for debugging
    console.log(
      `Calculating stats for session ${selectedSession} with ${sessionTaps.length} taps`
    );

    return calculateTapStatistics(sessionTaps);
  };

  // Format timestamp to readable date/time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Format duration between start and end time
  const formatDuration = (start: number, end: number | null) => {
    if (!end) return "Ongoing";
    const durationMs = end - start;
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  // Format tap speed
  const formatSpeed = (speed: number) => {
    if (speed === 0) return "-";
    return speed.toFixed(2);
  };

  // Handle clearing all data
  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all tap data? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Data",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            loadData();
          },
        },
      ]
    );
  };

  const stats = getAllStats();
  const sessionStats = getSessionStats();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading stats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tap Statistics</Text>

      <ScrollView style={styles.contentContainer}>
        {/* Overall Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Statistics</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{allTaps.length}</Text>
              <Text style={styles.statLabel}>Total Taps</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{sessions.length}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatSpeed(stats.averageSpeed)}
              </Text>
              <Text style={styles.statLabel}>Taps/sec</Text>
            </View>
          </View>
        </View>

        {/* Session Selector */}
        {sessions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session Details</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sessionSelectorContainer}
            >
              {sessions.map((session) => (
                <TouchableOpacity
                  key={session.id}
                  style={[
                    styles.sessionButton,
                    selectedSession === session.id &&
                      styles.selectedSessionButton,
                  ]}
                  onPress={() => setSelectedSession(session.id)}
                >
                  <Text
                    style={[
                      styles.sessionButtonText,
                      selectedSession === session.id &&
                        styles.selectedSessionButtonText,
                    ]}
                  >
                    {new Date(session.startTime).toLocaleTimeString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Selected Session Stats */}
            {selectedSession && (
              <View style={styles.sessionStats}>
                {sessions.find((s) => s.id === selectedSession) && (
                  <>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionInfoLabel}>Started:</Text>
                      <Text style={styles.sessionInfoValue}>
                        {formatTime(
                          sessions.find((s) => s.id === selectedSession)!
                            .startTime
                        )}
                      </Text>
                    </View>

                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionInfoLabel}>Duration:</Text>
                      <Text style={styles.sessionInfoValue}>
                        {formatDuration(
                          sessions.find((s) => s.id === selectedSession)!
                            .startTime,
                          sessions.find((s) => s.id === selectedSession)!
                            .endTime
                        )}
                      </Text>
                    </View>

                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionInfoLabel}>Taps:</Text>
                      <Text style={styles.sessionInfoValue}>
                        {
                          sessions.find((s) => s.id === selectedSession)!
                            .tapCount
                        }
                      </Text>
                    </View>

                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                          {formatSpeed(sessionStats.averageSpeed)}
                        </Text>
                        <Text style={styles.statLabel}>Taps/sec</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                          {formatSpeed(sessionStats.fastestTap)}
                        </Text>
                        <Text style={styles.statLabel}>Fastest Tap</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                          {sessionStats.averageDistance > 0
                            ? sessionStats.averageDistance.toFixed(1)
                            : "-"}
                        </Text>
                        <Text style={styles.statLabel}>Avg. Distance</Text>
                      </View>
                    </View>
                  </>
                )}
              </View>
            )}
          </View>
        )}

        {/* Heat Map Visualization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tap Distribution</Text>
          {selectedSession ? (
            <TapHeatmap
              taps={allTaps.filter((tap) => tap.sessionId === selectedSession)}
            />
          ) : (
            <View style={styles.heatmapPlaceholder}>
              <Text style={styles.placeholderText}>
                Select a session to view tap distribution
              </Text>
            </View>
          )}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleClearData}
          >
            <Text style={styles.dangerButtonText}>Clear All Tap Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.backButton} onPress={back}>
        <Text style={styles.backButtonText}>Back to Tapping</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 25,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  sessionSelectorContainer: {
    paddingVertical: 10,
  },
  sessionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    marginRight: 10,
  },
  selectedSessionButton: {
    backgroundColor: "#007AFF",
  },
  sessionButtonText: {
    color: "#666",
    fontSize: 14,
  },
  selectedSessionButtonText: {
    color: "#fff",
  },
  sessionStats: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  sessionInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sessionInfoLabel: {
    fontSize: 16,
    color: "#666",
  },
  sessionInfoValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  heatmapPlaceholder: {
    height: 200,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#999",
    fontSize: 16,
  },
  dangerButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  dangerButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    margin: 20,
    borderRadius: 10,
  },
  backButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});

export default StatsScreen;
