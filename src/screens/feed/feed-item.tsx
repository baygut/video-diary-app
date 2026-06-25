import { Ionicons } from "@expo/vector-icons";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  StyleSheet,
  View,
  type NativeSyntheticEvent,
  type TextLayoutEventData,
} from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

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

type FeedDescriptionProps = {
  description: string;
};

function formatEntryDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function FeedDescription({ description }: FeedDescriptionProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isExpanded, setExpanded] = useState(false);
  const [isExpandable, setExpandable] = useState(false);
  const descriptionTransition = LinearTransition.duration(220);

  function toggleDescription() {
    if (!isExpandable) return;
    setExpanded((value) => !value);
  }

  function handleDescriptionLayout(
    event: NativeSyntheticEvent<TextLayoutEventData>,
  ) {
    const nextIsExpandable = event.nativeEvent.lines.length > 3;
    setExpandable((value) =>
      value === nextIsExpandable ? value : nextIsExpandable,
    );
  }

  return (
    <Animated.View layout={descriptionTransition} className="overflow-hidden">
      <Pressable
        accessibilityLabel={t("diary.description")}
        accessibilityRole="button"
        hitSlop={8}
        onPress={toggleDescription}
        className="gap-1.5"
      >
        <ThemedText
          accessible={false}
          className="absolute left-0 right-0 text-base leading-6 text-white opacity-0"
          onTextLayout={handleDescriptionLayout}
        >
          {description}
        </ThemedText>
        <ThemedText
          className="text-base leading-6 text-white"
          numberOfLines={isExpanded ? undefined : 3}
        >
          {description}
        </ThemedText>
        {isExpandable ? (
          <View className="flex-row items-center gap-1">
            <ThemedText type="small" className="font-semibold text-white">
              {isExpanded ? t("common.showLess") : t("common.showMore")}
            </ThemedText>
            <Ionicons
              color={theme.onDark}
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={15}
            />
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
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

  const overlayBottom = Math.max(26, bottomInset + 28);
  const overlayTop = Math.max(16, topInset + 12);
  const descriptionTransition = LinearTransition.duration(220);

  return (
    <View className="overflow-hidden bg-app-video" style={{ height }}>
      <VideoView
        style={[StyleSheet.absoluteFill, { zIndex: 0 }]}
        player={player}
        nativeControls={false}
        contentFit="cover"
        fullscreenOptions={{ enable: false }}
        playsInline
      />

      <Pressable
        accessibilityLabel={isPlaying ? "Pause video" : "Play video"}
        accessibilityRole="button"
        style={[StyleSheet.absoluteFill, { zIndex: 2 }]}
        onPress={togglePlayback}
      >
        {!isPlaying ? (
          <View className="absolute left-1/2 top-1/2 h-[72px] w-[72px] -translate-x-9 -translate-y-9 items-center justify-center rounded-full bg-app-play/90">
            <Ionicons color={theme.onPlay} name="play" size={34} />
          </View>
        ) : null}
      </Pressable>

      <Animated.View
        layout={descriptionTransition}
        className="absolute left-4 right-4 flex-row items-end gap-3 rounded-2xl bg-black/55 px-4 py-3"
        style={{
          bottom: overlayBottom,
          maxHeight: Math.max(168, height - overlayTop - overlayBottom),
          zIndex: 3,
        }}
      >
        <View className="flex-1 gap-1.5">
          <ThemedText className="text-white/80" type="small">
            {formatEntryDate(entry.createdAt)}
          </ThemedText>
          <ThemedText className="text-[28px] font-bold leading-9 text-white">
            {entry.name}
          </ThemedText>
          {entry.description ? (
            <FeedDescription
              key={`${entry.id}-${entry.description}`}
              description={entry.description}
            />
          ) : (
            <ThemedText className="text-base text-white/75" numberOfLines={1}>
              {t("diary.noDescription")}
            </ThemedText>
          )}
        </View>
        <Pressable
          accessibilityLabel={t("common.view")}
          accessibilityRole="button"
          className="h-[52px] w-[52px] items-center justify-center rounded-full border border-app-on-dark/30 bg-app-on-dark/20"
          onPress={() => onOpen(entry.id)}
        >
          <Ionicons color={theme.onDark} name="open-outline" size={24} />
        </Pressable>
      </Animated.View>
    </View>
  );
}
