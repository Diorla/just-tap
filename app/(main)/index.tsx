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
  TouchableOpacity,
  Modal,
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

  // Web menu modal state
  const [webMenuVisible, setWebMenuVisible] = useState(false);

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
      // "Buy me a coffee ☕",
      // "Exit App",
    ];

    // Determine platform and show appropriate menu
    if (Platform.OS === "ios") {
      // iOS platform - use ActionSheetIOS
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
      // Web platform - show custom modal menu
      setWebMenuVisible(true);
    }
  };

  // Handle ActionSheet selection
  const handleActionSheetSelection = (index: number) => {
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
        } else if (Platform.OS === "web") {
          // For web, we might just close the tab or show a confirmation
          if (window.confirm("Are you sure you want to exit?")) {
            window.close();
          }
        }
        break;
      default:
        break;
    }

    // Hide web menu if it's visible
    if (Platform.OS === "web") {
      setWebMenuVisible(false);
    }
  };

  // Render web-specific menu component
  const renderWebMenu = () => {
    if (!webMenuVisible) return null;

    const options = [
      "Settings",
      "View Stats",
      "New Session",
      // "Buy me a coffee ☕",
      // "Exit App",
    ];

    return (
      <Modal
        visible={webMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setWebMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setWebMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.webMenuContainer}>
                <Text style={styles.webMenuTitle}>Menu</Text>
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.webMenuItem,
                      option === "Exit App" && styles.webMenuDestructiveItem,
                    ]}
                    onPress={() => {
                      if (webMenuVisible) {
                        handleActionSheetSelection(index + 1);
                        setWebMenuVisible(false);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.webMenuItemText,
                        option === "Exit App" && styles.webMenuDestructiveText,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.webMenuItem, styles.webMenuCancelItem]}
                  onPress={() => setWebMenuVisible(false)}
                >
                  <Text style={styles.webMenuCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
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

  // Add keyboard event listener for web
  useEffect(() => {
    if (Platform.OS === "web") {
      const handleKeyPress = (event: KeyboardEvent) => {
        // Open menu on 'M' key press (for example)
        if (event.key === "m" || event.key === "M") {
          showActionSheet();
        }
      };

      window.addEventListener("keydown", handleKeyPress);

      return () => {
        window.removeEventListener("keydown", handleKeyPress);
      };
    }
  }, []);

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
          <Text style={styles.instruction}>
            {Platform.OS === "web"
              ? "Two-finger long press or press 'M' key for menu"
              : "Two-finger long press for menu"}
          </Text>
          {renderRipples()}
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* Render web menu */}
      {Platform.OS !== "ios" && renderWebMenu()}
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
  // Web menu styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  webMenuContainer: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    // Add shadow for web
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  webMenuTitle: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  webMenuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  webMenuItemText: {
    fontSize: 16,
    textAlign: "center",
    color: "#007AFF",
  },
  webMenuDestructiveItem: {
    borderBottomWidth: 0,
  },
  webMenuDestructiveText: {
    color: "#FF3B30",
  },
  webMenuCancelItem: {
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 0,
    borderTopWidth: 6,
    borderTopColor: "#e0e0e0",
  },
  webMenuCancelText: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
});

export default TapAppAlternative;
