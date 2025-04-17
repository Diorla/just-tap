import { useSettings } from "@/context/SettingsContext";
import { useTapData } from "@/context/tap-context";
import { useRouter } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Animated,
  Vibration,
  ActionSheetIOS,
  Platform,
  Alert,
  BackHandler,
  PanResponder,
  GestureResponderEvent,
} from "react-native";

// Interface for ripple objects
interface Ripple {
  id: number;
  startX: number;
  startY: number;
  animation: Animated.Value;
}

const TapAppAlternative = () => {
  const { push } = useRouter();
  const { settings } = useSettings();
  const { addTap, currentSession, startNewSession } = useTapData();
  // State to keep track of tap count
  // Stats state

  // Ripple effect state
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleId = useRef(0);

  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  // Animation value for feedback effect
  const animatedScale = useRef(new Animated.Value(1)).current;

  // Clean up completed ripple animations
  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        // Remove ripples that have completed their animation
        setRipples((prevRipples) => prevRipples.slice(1));
      }, 1000); // Ripple duration

      return () => clearTimeout(timer);
    }
  }, [ripples]);

  // Pan responder to detect multi-touch
  const panResponder = useRef(
    PanResponder.create({
      // Initialize pan responder
      onStartShouldSetPanResponder: (evt) => {
        // Don't activate for single touches (allow those to pass through)
        return evt.nativeEvent.touches.length >= 2;
      },
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderGrant: (evt) => {
        // When two or more fingers touch
        if (evt.nativeEvent.touches.length >= 2) {
          // Start a timer for long press
          const longPressTimer = setTimeout(() => {
            showActionSheet();
          }, 800); // 800ms for long press
          setLongPressTimer(longPressTimer);
        }
      },
      onPanResponderRelease: () => {
        // Clear the timer if touch is released before long press is triggered
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          setLongPressTimer(null);
        }
      },
      onPanResponderTerminate: () => {
        // Also clear timer if gesture is terminated for any reason
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          setLongPressTimer(null);
        }
      },
    })
  ).current;

  // Handle tap events
  const handleTap = (event: GestureResponderEvent) => {
    // Get the tap location - using pageX/Y for absolute position instead of locationX/Y
    const pageX = event.nativeEvent.pageX;
    const pageY = event.nativeEvent.pageY;

    // Create and animate ripple effect if enabled
    if (settings.rippleEffect) {
      const newRipple = {
        id: rippleId.current,
        startX: pageX,
        startY: pageY,
        animation: new Animated.Value(0),
      };

      // Increment ID for next ripple
      rippleId.current += 1;

      // Add new ripple to state
      setRipples((prevRipples) => [...prevRipples, newRipple]);

      // Start ripple animation
      Animated.timing(newRipple.animation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }

    addTap(pageX, pageY);

    // Optional: Vibrate for haptic feedback if enabled
    if (settings.hapticFeedback) {
      Vibration.vibrate(10);
    }

    // Animate scale for visual feedback if enabled
    if (settings.visualFeedback) {
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
    }
  };

  // Show ActionSheet
  const showActionSheet = () => {
    // Vibrate to indicate action sheet trigger
    Vibration.vibrate(50);

    const options = [
      "Cancel",
      "Settings",
      "View Stats",
      "New Session",
      "Buy me a coffee ☕",
      "Exit App",
    ];
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.indexOf("Cancel"),
          destructiveButtonIndex: options.indexOf("Exit App"),
        },
        (buttonIndex) => {
          handleActionSheetSelection(buttonIndex);
        }
      );
    } else {
      // For Android, use Alert as a simple alternative
      Alert.alert(
        "Menu",
        "Select an option",
        [
          { text: "Cancel", style: "cancel" },
          ...options.map((item) => ({
            text: item,
            onPress: () => handleActionSheetSelection(options.indexOf(item)),
          })),
        ],
        { cancelable: true }
      );
    }
  };

  // Handle ActionSheet selection
  const handleActionSheetSelection = (index: number) => {
    console.log("index", index);
    switch (index) {
      case 1:
        push("/settings");
        break;
      case 2:
        push("/stats");
        break;
      case 3:
        startNewSession();
        break;
      case 4:
        push("https://buymeacoffee.com/diorla");
        break;
      case 5: // Exit App
        if (Platform.OS === "android") {
          BackHandler.exitApp();
        }
        break;
      default:
        break;
    }
  };

  // Render ripple effects
  const renderRipples = () => {
    return ripples.map((ripple) => {
      // Calculate ripple size and opacity based on animation value
      const rippleScale = ripple.animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 4], // Scale to 4x for a larger ripple
      });

      const opacity = ripple.animation.interpolate({
        inputRange: [0, 0.3, 1],
        outputRange: [0.4, 0.2, 0],
      });

      return (
        <Animated.View
          key={ripple.id}
          style={[
            styles.ripple,
            {
              position: "absolute",
              left: ripple.startX,
              top: ripple.startY,
              opacity,
              transform: [
                { translateX: -25 }, // Half of initial ripple size (50px)
                { translateY: -25 }, // Half of initial ripple size (50px)
                { scale: rippleScale },
              ],
            },
          ]}
        />
      );
    });
  };

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      <TouchableWithoutFeedback onPress={handleTap}>
        <Animated.View
          style={[styles.container, { transform: [{ scale: animatedScale }] }]}
        >
          {settings.showCounter && (
            <View style={styles.counterContainer}>
              <Text style={styles.counter}>
                {currentSession?.tapCount || 0}
              </Text>
              {currentSession && (
                <Text style={styles.sessionInfo}>
                  Session:{" "}
                  {new Date(currentSession.startTime).toLocaleTimeString()}
                </Text>
              )}
            </View>
          )}
          <Text style={styles.instruction}>Two-finger long press for menu</Text>
          {renderRipples()}
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden", // Keep ripples contained within the container
  },
  counterContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  counter: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#333",
    opacity: 0.3,
  },
  sessionInfo: {
    fontSize: 12,
    color: "#666",
    opacity: 0.5,
    marginTop: 5,
  },
  instruction: {
    position: "absolute",
    bottom: 40,
    fontSize: 14,
    color: "#777",
    opacity: 0.5,
  },
  ripple: {
    width: 50, // Smaller initial size for more accurate positioning
    height: 50, // Smaller initial size for more accurate positioning
    borderRadius: 25, // Half of width/height
    backgroundColor: "#007AFF", // Same blue as the back button
  },
});

export default TapAppAlternative;
