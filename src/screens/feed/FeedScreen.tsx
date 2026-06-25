import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useIsFocused, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  useWindowDimensions,
  View,
  type ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Diary } from "@/api";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { useDiaries } from "@/hooks/queries";

import { FeedItem } from "./feed-item";

export function FeedScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
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
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
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
      <View className="flex-1 items-center justify-center gap-3 bg-app-video px-6">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-app-video px-6">
        <ThemedText themeColor="textSecondary">{t("common.error")}</ThemedText>
      </View>
    );
  }

  if (!feedItems.length) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-app-video px-6">
        <Ionicons color={theme.iconMuted} name="film-outline" size={42} />
        <ThemedText themeColor="textSecondary" className="text-center">
          {t("diary.empty")}
        </ThemedText>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-app-video">
      <FlashList
        data={feedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FeedItem
            bottomInset={insets.bottom}
            entry={item}
            height={itemHeight}
            isActive={isFocused && item.id === activeEntryId}
            onOpen={openEntry}
            topInset={insets.top}
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
