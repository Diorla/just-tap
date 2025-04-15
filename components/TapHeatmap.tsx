import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { TapData } from "@/models/TapData";

interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
}

interface TapHeatmapProps {
  taps: TapData[];
  width?: number;
  height?: number;
}

const heatmapWidth = Dimensions.get("window").width - 60;
const heatmapHeight =
  (Dimensions.get("window").height / Dimensions.get("window").width) *
  heatmapWidth;

const TapHeatmap: React.FC<TapHeatmapProps> = ({
  taps,
  width = heatmapWidth,
  height = heatmapHeight,
}) => {
  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPoint[]>([]);

  useEffect(() => {
    if (taps.length === 0) return;

    // Get screen dimensions to normalize coordinates
    const screenWidth = Dimensions.get("window").width;
    const screenHeight = Dimensions.get("window").height;

    // Process taps into heatmap points with normalized coordinates
    const points: { [key: string]: HeatmapPoint } = {};

    taps.forEach((tap) => {
      // Normalize coordinates to percentage of screen dimensions
      const normalizedX = (tap.x / screenWidth) * width;
      const normalizedY = (tap.y / screenHeight) * height;

      // Create a grid by rounding to nearest 10 pixels
      const gridSize = 20;
      const gridX = Math.floor(normalizedX / gridSize) * gridSize;
      const gridY = Math.floor(normalizedY / gridSize) * gridSize;

      const key = `${gridX}-${gridY}`;

      if (points[key]) {
        // Increase intensity for existing point
        points[key].intensity += 1;
      } else {
        // Create new point
        points[key] = {
          x: gridX,
          y: gridY,
          intensity: 1,
        };
      }
    });

    // Convert points object to array
    setHeatmapPoints(Object.values(points));
  }, [taps, width, height]);

  if (taps.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.noDataText}>No tap data available</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      {heatmapPoints.map((point, index) => {
        // Calculate color intensity (red to yellow gradient based on intensity)
        const maxIntensity = Math.max(...heatmapPoints.map((p) => p.intensity));
        const intensity = Math.min(1, point.intensity / maxIntensity);
        const size = 10 + intensity * 15; // Size between 10-25px

        // Create a gradient from blue (low) to red (high)
        const r = Math.round(255 * intensity);
        const g = Math.round(100 * (1 - intensity));
        const b = Math.round(255 * (1 - intensity));
        const opacity = 0.4 + intensity * 0.4; // Opacity between 0.4-0.8

        return (
          <View
            key={index}
            style={[
              styles.heatPoint,
              {
                left: point.x,
                top: point.y,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacity})`,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    position: "relative",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  heatPoint: {
    position: "absolute",
    transform: [{ translateX: -5 }, { translateY: -5 }], // Offset by half of the minimum size
  },
  noDataText: {
    color: "#999",
    fontSize: 16,
  },
});

export default TapHeatmap;
