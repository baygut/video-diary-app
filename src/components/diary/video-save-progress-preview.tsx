import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";

type VideoSaveProgressPreviewProps = {
  progress: number;
  uri: string;
};

export function VideoSaveProgressPreview({
  progress,
  uri,
}: VideoSaveProgressPreviewProps) {
  const { t } = useTranslation();
  const animatedProgress = useSharedValue(progress);
  const player = useVideoPlayer(
    { contentType: "progressive", uri },
    (p) => {
      p.loop = true;
      p.muted = true;
      p.audioMixingMode = "mixWithOthers";
    },
  );
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 260 });
  }, [animatedProgress, progress]);

  useEffect(() => {
    if (!isPlaying) player.play();
  }, [isPlaying, player]);

  const videoStyle = useAnimatedStyle(() => ({
    filter: [
      {
        blur: interpolate(animatedProgress.value, [0, 1], [16, 0]),
      },
    ],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.max(4, animatedProgress.value * 100)}%`,
  }));

  return (
    <View className="overflow-hidden rounded-2xl border border-app-selected bg-app-video">
      <Animated.View style={[styles.preview, videoStyle]}>
        <VideoView
          player={player}
          nativeControls={false}
          contentFit="cover"
          fullscreenOptions={{ enable: false }}
          playsInline
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View className="absolute inset-x-4 bottom-4 gap-2 rounded-xl bg-black/60 p-3">
        <View className="flex-row items-center justify-between gap-3">
          <ThemedText type="smallBold" className="text-white">
            {t("diary.uploading")}
          </ThemedText>
          <ThemedText type="small" className="text-white/80">
            {Math.round(progress * 100)}%
          </ThemedText>
        </View>
        <View className="h-2 overflow-hidden rounded-full bg-white/20">
          <Animated.View
            className="h-full rounded-full bg-white"
            style={progressStyle}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    aspectRatio: 16 / 10,
  },
});
