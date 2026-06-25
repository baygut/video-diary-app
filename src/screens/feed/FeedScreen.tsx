import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useIsFocused, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type ViewToken,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Diary } from "@/api";
import { ThemedText } from "@/components/themed-text";
import { useDiaries } from "@/hooks/queries";

function formatEntryDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

type FeedItemProps = {
  entry: Diary;
  height: number;
  isActive: boolean;
  onOpen: (id: string) => void;
};

function FeedItem({ entry, height, isActive, onOpen }: FeedItemProps) {
  const { t } = useTranslation();
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

  return (
    <View style={[styles.item, { height }]}>
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
          <View style={styles.playBadge}>
            <Ionicons color="#111827" name="play" size={34} />
          </View>
        ) : null}
      </Pressable>

      <View pointerEvents="none" style={styles.topScrim} />
      <View pointerEvents="none" style={styles.bottomScrim} />

      <View style={styles.meta}>
        <ThemedText className="text-white/80" type="small">
          {formatEntryDate(entry.createdAt)}
        </ThemedText>
        <ThemedText className="text-[28px] font-bold leading-9 text-white">
          {entry.name}
        </ThemedText>
        {entry.description ? (
          <ThemedText className="text-base leading-6 text-white/88" numberOfLines={3}>
            {entry.description}
          </ThemedText>
        ) : (
          <ThemedText className="text-base text-white/65" numberOfLines={1}>
            {t("diary.noDescription")}
          </ThemedText>
        )}
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityLabel={t("common.view")}
          accessibilityRole="button"
          style={styles.actionButton}
          onPress={() => onOpen(entry.id)}
        >
          <Ionicons color="#FFFFFF" name="open-outline" size={24} />
        </Pressable>
      </View>
    </View>
  );
}

export function FeedScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { data: diaries, isError, isPending } = useDiaries();
  const [activeId, setActiveId] = useState<string | null>(null);
  const isFocused = useIsFocused();
  const itemHeight = Math.max(320, height - insets.bottom);

  const feedItems = useMemo(() => {
    if (!diaries) return [];
    return [...diaries].sort((left, right) => {
      return (
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime()
      );
    });
  }, [diaries]);

  const activeEntryId = activeId ?? feedItems[0]?.id ?? null;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<Diary>[] }) => {
      const firstVisible = viewableItems.find((item) => item.isViewable);
      if (firstVisible?.item?.id) {
        setActiveId(firstVisible.item.id);
      }
    },
    [],
  );

  function openEntry(id: string) {
    router.push(`/diary/${id}`);
  }

  if (isPending) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerState}>
        <ThemedText themeColor="textSecondary">{t("common.error")}</ThemedText>
      </View>
    );
  }

  if (!feedItems.length) {
    return (
      <View style={styles.centerState}>
        <Ionicons color="#60646C" name="film-outline" size={42} />
        <ThemedText themeColor="textSecondary" className="text-center">
          {t("diary.empty")}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlashList
        data={feedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FeedItem
            entry={item}
            height={itemHeight}
            isActive={isFocused && item.id === activeEntryId}
            onOpen={openEntry}
          />
        )}
        pagingEnabled
        snapToInterval={itemHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        showsVerticalScrollIndicator={false}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 70,
          minimumViewTime: 120,
        }}
        onViewableItemsChanged={onViewableItemsChanged}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  item: {
    backgroundColor: "#000000",
    overflow: "hidden",
  },
  topScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: "rgba(0,0,0,0.24)",
  },
  bottomScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 260,
    backgroundColor: "rgba(0,0,0,0.46)",
  },
  meta: {
    position: "absolute",
    left: 20,
    right: 86,
    bottom: 34,
    gap: 6,
  },
  actions: {
    position: "absolute",
    right: 16,
    bottom: 46,
    gap: 14,
  },
  actionButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  playBadge: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 72,
    height: 72,
    marginLeft: -36,
    marginTop: -36,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(250, 204, 21, 0.92)",
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
    backgroundColor: "#000000",
  },
});
