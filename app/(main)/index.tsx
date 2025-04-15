import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Animated,
  Vibration,
} from "react-native";

const TapApp = () => {
  // State to keep track of tap count
  const [tapCount, setTapCount] = useState(0);

  // Animation value for feedback effect
  const animatedScale = useRef(new Animated.Value(1)).current;

  // Handle tap events
  const handleTap = () => {
    // Increment tap count
    setTapCount((prevCount) => prevCount + 1);

    // Optional: Vibrate for haptic feedback
    Vibration.vibrate(10);

    // Animate scale for visual feedback
    Animated.sequence([
      Animated.timing(animatedScale, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <Animated.View
        style={[styles.container, { transform: [{ scale: animatedScale }] }]}
      >
        <Text style={styles.counter}>{tapCount}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  counter: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#333",
    opacity: 0.3,
  },
});

export default TapApp;
