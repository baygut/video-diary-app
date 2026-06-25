import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Alert, Image, Pressable, View } from "react-native";

import type { Diary } from "@/api";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { cn } from "@/utils/cn";

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
  const colorScheme = useColorScheme();

  function confirmDelete() {
    Alert.alert(
      t("diary.deleteConfirmTitle"),
      t("diary.deleteConfirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => onDelete(entry.id),
        },
      ],
    );
  }

  return (
    <Pressable
      className={cn(
        "overflow-hidden rounded-2xl border border-app-selected bg-app-element",
        isDeleting && "opacity-60",
      )}
      disabled={isDeleting}
      onPress={() => onOpen?.(entry.id)}
    >
      <Image
        source={{ uri: entry.thumbnailUri }}
        className="h-48 w-full"
        resizeMode="cover"
      />

      <View className="gap-2 p-4">
        <View className="flex-row items-start gap-3">
          <View className="flex-1 gap-1">
            <ThemedText
              type="default"
              numberOfLines={2}
              className="font-semibold"
            >
              {entry.name}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {formatEntryDate(entry.createdAt)}
            </ThemedText>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("common.delete")}
            className="h-9 w-9 items-center justify-center rounded-full bg-app-danger-muted"
            disabled={isDeleting}
            onPress={(event) => {
              event.stopPropagation();
              confirmDelete();
            }}
          >
            <Ionicons
              color={colorScheme === "dark" ? "#F87171" : "#DC2626"}
              name="trash-outline"
              size={18}
            />
          </Pressable>
        </View>

        {entry.description ? (
          <ThemedText themeColor="textSecondary" numberOfLines={2}>
            {entry.description}
          </ThemedText>
        ) : null}
      </View>
    </Pressable>
  );
}
