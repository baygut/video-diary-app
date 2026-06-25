import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import type { Diary } from "@/api";
import { AppButton } from "@/components/app-button";
import { ThemedText } from "@/components/themed-text";

import { VideoPlayerView } from "./video-player-view";

type DiaryCardProps = {
  entry: Diary;
  isDeleting: boolean;
  onDelete: (id: string) => void;
  onOpen?: (id: string) => void;
};

function formatEntryDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function DiaryCard({
  entry,
  isDeleting,
  onDelete,
  onOpen,
}: DiaryCardProps) {
  const { t } = useTranslation();

  return (
    <Pressable className="overflow-hidden rounded-lg bg-app-element">
      <VideoPlayerView uri={entry.uploadUri} />

      <View className="gap-2 p-4">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1 gap-1">
            <ThemedText type="default" numberOfLines={2} className="shrink">
              {entry.name}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {formatEntryDate(entry.createdAt)}
            </ThemedText>
          </View>

          <AppButton
            variant="secondary"
            label={t("common.view")}
            onPress={() => {
              onOpen?.(entry.id);
            }}
          />

          <AppButton
            variant="danger"
            label={isDeleting ? t("common.loading") : t("common.delete")}
            onPress={(event) => {
              event.stopPropagation();
              onDelete(entry.id);
            }}
            disabled={isDeleting}
            className="min-h-9"
          />
        </View>

        {entry.description ? (
          <ThemedText themeColor="textSecondary" className="shrink">
            {entry.description}
          </ThemedText>
        ) : null}
      </View>
    </Pressable>
  );
}
