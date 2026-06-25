import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LayoutChangeEvent, Pressable, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { AppButton } from "@/components/app-button";
import { ThemedText } from "@/components/themed-text";
import type { SelectedVideo } from "@/utils/video-files";

import { VideoPlayerView } from "./video-player-view";

const SEGMENT_SECONDS = 5;

type VideoTrimStepProps = {
  disabled?: boolean;
  onChangeStart: (value: number) => void;
  onNext: () => void;
  selectedVideo: SelectedVideo;
  startTime: number;
};

function formatSeconds(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function VideoTrimStep({
  disabled,
  onChangeStart,
  onNext,
  selectedVideo,
  startTime,
}: VideoTrimStepProps) {
  const { t } = useTranslation();
  const [trackWidth, setTrackWidth] = useState(0);
  const maxStart = Math.max(0, selectedVideo.durationSeconds - SEGMENT_SECONDS);
  const endTime = Math.min(
    selectedVideo.durationSeconds,
    startTime + SEGMENT_SECONDS,
  );
  const windowWidth = selectedVideo.durationSeconds
    ? Math.max(12, (SEGMENT_SECONDS / selectedVideo.durationSeconds) * 100)
    : 100;
  const windowLeft = maxStart
    ? (startTime / maxStart) * (100 - windowWidth)
    : 0;

  const selectionStyle = useAnimatedStyle(() => ({
    left: `${windowLeft}%`,
    width: `${windowWidth}%`,
  }));

  function onTrackLayout(event: LayoutChangeEvent) {
    setTrackWidth(event.nativeEvent.layout.width);
  }

  function onTrackPress(locationX: number) {
    if (!trackWidth || disabled) return;

    const usableWidth = Math.max(1, trackWidth);
    const ratio = Math.min(1, Math.max(0, locationX / usableWidth));
    onChangeStart(Math.round(ratio * maxStart));
  }

  return (
    <View className="flex-1 gap-5">
      <VideoPlayerView variant="preview" uri={selectedVideo.playbackUri} />

      <View className="gap-3">
        <View className="flex-row justify-between">
          <ThemedText type="smallBold">{t("diary.cropSegment")}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {formatSeconds(startTime)} - {formatSeconds(endTime)}
          </ThemedText>
        </View>

        <Pressable
          className="h-12 justify-center rounded-lg bg-app-element px-3"
          onLayout={onTrackLayout}
          onPress={(event) => onTrackPress(event.nativeEvent.locationX)}
          disabled={disabled}
        >
          <View className="h-2 overflow-hidden rounded-full bg-app-selected">
            <Animated.View
              className="absolute h-2 rounded-full bg-teal-700"
              style={selectionStyle}
            />
          </View>
          <Animated.View
            className="absolute top-2 h-8 rounded-lg border-2 border-white bg-teal-700/40"
            style={selectionStyle}
          />
        </Pressable>

        <ThemedText type="small" themeColor="textSecondary">
          {t("diary.cropHint")}
        </ThemedText>
      </View>

      <AppButton
        label={t("common.next")}
        onPress={onNext}
        disabled={disabled}
      />
    </View>
  );
}

export { SEGMENT_SECONDS };
