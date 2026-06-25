/* eslint-disable react-hooks/immutability */
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";

type SegmentRangeTrimmerProps = {
  disabled?: boolean;
  durationSeconds: number;
  startTime: number;
  segmentSeconds: number;
  minSegmentSeconds: number;
  maxSegmentSeconds: number;
  playheadSeconds?: number;
  onChangePlayhead?: (v: number) => void;
  onChangeStart: (v: number) => void;
  onChangeSegmentSeconds: (v: number) => void;
};

function formatTimeLabel(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoSegmentRangeTrimmer({
  disabled,
  durationSeconds,
  startTime,
  segmentSeconds,
  minSegmentSeconds,
  maxSegmentSeconds,
  playheadSeconds,
  onChangePlayhead,
  onChangeStart,
  onChangeSegmentSeconds,
}: SegmentRangeTrimmerProps) {
  const dur = Math.max(1, durationSeconds);
  const endTime = Math.min(durationSeconds, startTime + segmentSeconds);
  const clampedPlayhead = Math.min(
    Math.max(playheadSeconds ?? startTime, startTime),
    endTime,
  );

  const leftPct = useSharedValue(startTime / dur);
  const widthPct = useSharedValue(segmentSeconds / dur);
  const playheadPct = useSharedValue(clampedPlayhead / dur);

  const startLeft = useSharedValue(0);
  const startWidth = useSharedValue(0);
  const startPlayhead = useSharedValue(0);
  const trackWidthSV = useSharedValue(0);

  useEffect(() => {
    leftPct.value = withTiming(startTime / dur, { duration: 60 });
  }, [dur, leftPct, startTime]);

  useEffect(() => {
    widthPct.value = withTiming(segmentSeconds / dur, { duration: 60 });
  }, [dur, segmentSeconds, widthPct]);

  useEffect(() => {
    playheadPct.value = withTiming(clampedPlayhead / dur, { duration: 60 });
  }, [clampedPlayhead, dur, playheadPct]);

  const highlightStyle = useAnimatedStyle(() => ({
    left: `${leftPct.value * 100}%`,
    width: `${widthPct.value * 100}%`,
  }));

  const leftHandleStyle = useAnimatedStyle(() => ({
    left: `${leftPct.value * 100}%`,
  }));

  const rightHandleStyle = useAnimatedStyle(() => ({
    left: `${(leftPct.value + widthPct.value) * 100}%`,
  }));

  const playheadStyle = useAnimatedStyle(() => ({
    left: `${playheadPct.value * 100}%`,
  }));

  const leftGesture = Gesture.Pan()
    .enabled(!disabled)
    .hitSlop({ top: 16, bottom: 16, left: 18, right: 18 })
    .onBegin(() => {
      "worklet";
      startLeft.value = leftPct.value;
      startWidth.value = widthPct.value;
    })
    .onUpdate(({ translationX }) => {
      "worklet";
      const w = trackWidthSV.value;
      if (!w) return;
      const delta = translationX / w;
      const right = startLeft.value + startWidth.value;
      const minW = minSegmentSeconds / dur;
      const maxW = Math.min(maxSegmentSeconds, dur) / dur;
      const minLeft = Math.max(0, right - maxW);
      const maxLeft = Math.max(0, right - minW);
      const next = Math.min(Math.max(minLeft, startLeft.value + delta), maxLeft);
      const nextWidth = right - next;

      leftPct.value = next;
      widthPct.value = nextWidth;
      playheadPct.value = Math.min(Math.max(playheadPct.value, next), right);
      runOnJS(onChangeStart)(Math.round(next * dur));
      runOnJS(onChangeSegmentSeconds)(Math.round(nextWidth * dur));
    });

  const rightGesture = Gesture.Pan()
    .enabled(!disabled)
    .hitSlop({ top: 16, bottom: 16, left: 18, right: 18 })
    .onBegin(() => {
      "worklet";
      startWidth.value = widthPct.value;
    })
    .onUpdate(({ translationX }) => {
      "worklet";
      const w = trackWidthSV.value;
      if (!w) return;
      const delta = translationX / w;
      const minW = minSegmentSeconds / dur;
      const maxW = Math.min(maxSegmentSeconds, dur - leftPct.value * dur) / dur;
      const next = Math.min(Math.max(minW, startWidth.value + delta), maxW);
      const right = leftPct.value + next;

      widthPct.value = next;
      playheadPct.value = Math.min(
        Math.max(playheadPct.value, leftPct.value),
        right,
      );
      runOnJS(onChangeSegmentSeconds)(Math.round(next * dur));
    });

  const playheadGesture = Gesture.Pan()
    .enabled(!disabled && Boolean(onChangePlayhead))
    .hitSlop({ top: 18, bottom: 18, left: 18, right: 18 })
    .onBegin(() => {
      "worklet";
      startPlayhead.value = playheadPct.value;
    })
    .onUpdate(({ translationX }) => {
      "worklet";
      const w = trackWidthSV.value;
      if (!w) return;
      const delta = translationX / w;
      const min = leftPct.value;
      const max = leftPct.value + widthPct.value;
      const next = Math.min(Math.max(min, startPlayhead.value + delta), max);

      playheadPct.value = next;
      if (onChangePlayhead) runOnJS(onChangePlayhead)(next * dur);
    });

  return (
    <View style={styles.root}>
      <View style={styles.labels}>
        <ThemedText type="small" className="text-white/70 tabular-nums">
          {formatTimeLabel(startTime)}
        </ThemedText>
        <ThemedText type="small" className="text-white font-semibold">
          {segmentSeconds}s
        </ThemedText>
        <ThemedText type="small" className="text-white/70 tabular-nums">
          {formatTimeLabel(endTime)}
        </ThemedText>
      </View>

      <View
        style={styles.trackWrap}
        onLayout={(e) => {
          trackWidthSV.value = e.nativeEvent.layout.width;
        }}
      >
        <View style={styles.track} />
        <Animated.View style={[styles.highlight, highlightStyle]} />
        <Animated.View style={[styles.highlightBorder, highlightStyle]} />

        {onChangePlayhead ? (
          <GestureDetector gesture={playheadGesture}>
            <Animated.View style={[styles.playheadWrap, playheadStyle]}>
              <View style={styles.playheadThumb} />
              <View style={styles.playheadStem} />
            </Animated.View>
          </GestureDetector>
        ) : null}

        <GestureDetector gesture={leftGesture}>
          <Animated.View
            style={[styles.handleWrap, styles.handleLeft, leftHandleStyle]}
          >
            <View style={styles.handleRail} />
          </Animated.View>
        </GestureDetector>

        <GestureDetector gesture={rightGesture}>
          <Animated.View
            style={[styles.handleWrap, styles.handleRight, rightHandleStyle]}
          >
            <View style={styles.handleRail} />
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  trackWrap: {
    height: 44,
    justifyContent: "center",
  },
  track: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  highlight: {
    position: "absolute",
    top: 10,
    bottom: 10,
    backgroundColor: "rgba(251, 191, 36, 0.18)",
    borderRadius: 8,
  },
  highlightBorder: {
    position: "absolute",
    top: 8,
    bottom: 8,
    borderColor: "rgba(251, 191, 36, 0.95)",
    borderWidth: 2,
    borderRadius: 10,
  },
  handleWrap: {
    position: "absolute",
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  handleLeft: {
    transform: [{ translateX: -22 }],
  },
  handleRight: {
    transform: [{ translateX: -22 }],
  },
  handleRail: {
    width: 10,
    height: 34,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.32)",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
  },
  playheadWrap: {
    position: "absolute",
    width: 34,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateX: -17 }],
    zIndex: 3,
  },
  playheadThumb: {
    position: "absolute",
    top: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.35)",
    backgroundColor: "#FACC15",
  },
  playheadStem: {
    width: 4,
    height: 32,
    borderRadius: 2,
    backgroundColor: "#FACC15",
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
});
