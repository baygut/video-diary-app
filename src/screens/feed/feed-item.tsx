import { Ionicons } from "@expo/vector-icons";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";

import type { Diary } from "@/api";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";

type FeedItemProps = {
  bottomInset: number;
  entry: Diary;
  height: number;
  isActive: boolean;
  onOpen: (id: string) => void;
  topInset: number;
};

function formatEntryDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function FeedItem({
  bottomInset,
  entry,
  height,
  isActive,
  onOpen,
  topInset,
}: FeedItemProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isDescriptionExpanded, setDescriptionExpanded] = useState(false);
  const player = useVideoPlayer(
    { contentType: "progressive", uri: entry.uploadUri },
    (p) => {
      p.loop = true;
      p.muted = false;
      p.audioMixingMode = "auto";
    },
  );
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  useEffect(() => {
    if (isActive) {
      player.play();
      return;
    }

    player.pause();
  }, [isActive, player]);

  function togglePlayback() {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  }

  function toggleDescription() {
    if (!entry.description) return;
    setDescriptionExpanded((value) => !value);
  }

  const overlayBottom = Math.max(18, bottomInset + 18);
  const overlayTop = Math.max(16, topInset + 12);

  return (
    <View className="overflow-hidden bg-app-video" style={{ height }}>
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        nativeControls={false}
        contentFit="cover"
        fullscreenOptions={{ enable: false }}
        playsInline
      />

      <Pressable
        accessibilityLabel={isPlaying ? "Pause video" : "Play video"}
        accessibilityRole="button"
        style={StyleSheet.absoluteFill}
        onPress={togglePlayback}
      >
        {!isPlaying ? (
          <View className="absolute left-1/2 top-1/2 h-[72px] w-[72px] -translate-x-9 -translate-y-9 items-center justify-center rounded-full bg-app-play/90">
            <Ionicons color={theme.onPlay} name="play" size={34} />
          </View>
        ) : null}
      </Pressable>

      <View
        className="absolute left-5 right-[86px] gap-1.5"
        style={{
          bottom: overlayBottom,
          maxHeight: Math.max(168, height - overlayTop - overlayBottom),
        }}
      >
        <ThemedText className="text-white/80" type="small">
          {formatEntryDate(entry.createdAt)}
        </ThemedText>
        <ThemedText className="text-[28px] font-bold leading-9 text-white">
          {entry.name}
        </ThemedText>
        {entry.description ? (
          <Pressable
            accessibilityLabel={t("diary.description")}
            accessibilityRole="button"
            onPress={toggleDescription}
            className="gap-1"
          >
            <ThemedText
              className="text-base leading-6 text-white/88"
              numberOfLines={isDescriptionExpanded ? undefined : 3}
            >
              {entry.description}
            </ThemedText>
            {entry.description.length > 110 ? (
              <ThemedText type="small" className="font-semibold text-white">
                {isDescriptionExpanded ? t("common.less") : t("common.more")}
              </ThemedText>
            ) : null}
          </Pressable>
        ) : (
          <ThemedText className="text-base text-white/65" numberOfLines={1}>
            {t("diary.noDescription")}
          </ThemedText>
        )}
      </View>

      <View className="absolute right-4 gap-3.5" style={{ bottom: overlayBottom + 12 }}>
        <Pressable
          accessibilityLabel={t("common.view")}
          accessibilityRole="button"
          className="h-[52px] w-[52px] items-center justify-center rounded-full border border-app-on-dark/30 bg-app-on-dark/20"
          onPress={() => onOpen(entry.id)}
        >
          <Ionicons color={theme.onDark} name="open-outline" size={24} />
        </Pressable>
      </View>
    </View>
  );
}
