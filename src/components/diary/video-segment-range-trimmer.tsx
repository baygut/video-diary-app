/* eslint-disable react-hooks/immutability */
import { useEffect } from "react";
import { View } from "react-native";
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
    <View className="gap-2">
      <View className="flex-row justify-between px-0.5">
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
        className="h-11 justify-center"
        onLayout={(e) => {
          trackWidthSV.value = e.nativeEvent.layout.width;
        }}
      >
        <View className="absolute inset-x-0 h-1.5 rounded-full bg-app-on-dark/20" />
        <Animated.View
          className="absolute bottom-[9px] top-[9px] bg-app-video"
          style={highlightStyle}
        />
        <Animated.View
          className="absolute bottom-2 top-2 border-2 border-app-on-dark"
          style={highlightStyle}
        />

        {onChangePlayhead ? (
          <GestureDetector gesture={playheadGesture}>
            <Animated.View
              className="absolute z-[3] h-11 w-[34px] -translate-x-[17px] items-center justify-center"
              style={playheadStyle}
            >
              <View className="absolute top-0 h-[18px] w-[18px] rounded-full border-2 border-app-handle-border/35 bg-app-play" />
              <View className="h-8 w-1 rounded-full bg-app-play shadow" />
            </Animated.View>
          </GestureDetector>
        ) : null}

        <GestureDetector gesture={leftGesture}>
          <Animated.View
            className="absolute h-11 w-[34px] -translate-x-[34px] items-center justify-center"
            style={leftHandleStyle}
          >
            <View className="h-[38px] w-[34px] items-center justify-center rounded-l border-2 border-r-0 border-app-on-dark bg-app-on-dark/90 shadow">
              <View className="h-6 w-0.5 rounded-full bg-app-icon-muted/55" />
            </View>
          </Animated.View>
        </GestureDetector>

        <GestureDetector gesture={rightGesture}>
          <Animated.View
            className="absolute h-11 w-[34px] items-center justify-center"
            style={rightHandleStyle}
          >
            <View className="h-[38px] w-[34px] items-center justify-center rounded-r border-2 border-l-0 border-app-on-dark bg-app-on-dark/90 shadow">
              <View className="h-6 w-0.5 rounded-full bg-app-icon-muted/55" />
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}
