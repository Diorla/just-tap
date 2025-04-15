import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from "react-native";

const SettingsScreen = () => {
  const { back } = useRouter();
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [visualFeedback, setVisualFeedback] = useState(true);
  const [showCounter, setShowCounter] = useState(true);
  const [rippleEffect, setRippleEffect] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <ScrollView style={styles.settingsContainer}>
        <View style={styles.setting}>
          <Text style={styles.settingText}>Haptic Feedback</Text>
          <Switch value={hapticFeedback} onValueChange={setHapticFeedback} />
        </View>

        <View style={styles.setting}>
          <Text style={styles.settingText}>Visual Feedback</Text>
          <Switch value={visualFeedback} onValueChange={setVisualFeedback} />
        </View>

        <View style={styles.setting}>
          <Text style={styles.settingText}>Show Counter</Text>
          <Switch value={showCounter} onValueChange={setShowCounter} />
        </View>

        <View style={styles.setting}>
          <Text style={styles.settingText}>Ripple Effect</Text>
          <Switch value={rippleEffect} onValueChange={setRippleEffect} />
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          Tap Counter v1.0.0{"\n"}A simple app for continuous tapping.
        </Text>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  settingsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  setting: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  settingText: {
    fontSize: 16,
  },
  divider: {
    height: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },
  aboutText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
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

export default SettingsScreen;
