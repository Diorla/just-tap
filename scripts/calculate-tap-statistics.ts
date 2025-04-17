import { TapData } from "../models/TapData";

// Calculate statistics from tap data

export default function calculateTapStatistics(taps: TapData[]) {
  if (taps.length === 0)
    return {
      totalTaps: 0,
      averageSpeed: 0,
      fastestTap: 0,
      slowestTap: 0,
      averageDistance: 0,
    };

  // Sort taps by timestamp
  const sortedTaps = [...taps].sort((a, b) => a.timestamp - b.timestamp);

  // Calculate time between taps
  const tapIntervals: number[] = [];
  for (let i = 1; i < sortedTaps.length; i++) {
    const interval = sortedTaps[i].timestamp - sortedTaps[i - 1].timestamp;
    // Only include reasonable intervals (more than 50ms, less than 5 seconds)
    if (interval >= 50 && interval <= 5000) {
      tapIntervals.push(interval);
    }
  }

  // Calculate distances between consecutive taps
  const tapDistances: number[] = [];
  for (let i = 1; i < sortedTaps.length; i++) {
    const distance = Math.sqrt(
      Math.pow(sortedTaps[i].x - sortedTaps[i - 1].x, 2) +
        Math.pow(sortedTaps[i].y - sortedTaps[i - 1].y, 2)
    );
    tapDistances.push(distance);
  }

  // Calculate statistics
  const totalTaps = taps.length;

  let averageSpeed = 0;
  let fastestTap = 0;
  let slowestTap = 0;

  if (tapIntervals.length > 0) {
    // Average speed (taps per second)
    const avgInterval =
      tapIntervals.reduce((sum, interval) => sum + interval, 0) /
      tapIntervals.length;
    averageSpeed = 1000 / avgInterval;

    // Slowest tap (lowest taps per second)
    const maxInterval = Math.max(...tapIntervals);
    // Fastest tap (highest taps per second)
    const minInterval = Math.min(...tapIntervals);

    fastestTap = 1000 / maxInterval;

    slowestTap = 1000 / minInterval;
  }

  // Average distance between taps
  const averageDistance =
    tapDistances.length > 0
      ? tapDistances.reduce((sum, dist) => sum + dist, 0) / tapDistances.length
      : 0;

  return {
    totalTaps,
    averageSpeed: parseFloat(averageSpeed.toFixed(2)),
    fastestTap: parseFloat(fastestTap.toFixed(2)),
    slowestTap: parseFloat(slowestTap.toFixed(2)),
    averageDistance: parseFloat(averageDistance.toFixed(2)),
  };
}
