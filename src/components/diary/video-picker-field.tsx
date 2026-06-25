import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { cn } from "@/utils/cn";
import type { SelectedVideo } from "@/utils/video-files";

import { VideoPlayerView } from "./video-player-view";

type VideoPickerFieldProps = {
  disabled?: boolean;
  selectedVideo: SelectedVideo | null;
  onPress: () => void;
};

export function VideoPickerField({
  disabled,
  selectedVideo,
  onPress,
}: VideoPickerFieldProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      className={cn(
        "min-h-[240px] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-app-selected bg-app-element",
        selectedVideo && "border-solid",
        disabled && "opacity-60",
      )}
      onPress={onPress}
      disabled={disabled}
    >
      {selectedVideo ? (
        <VideoPlayerView variant="preview" uri={selectedVideo.uri} />
      ) : (
        <View className="items-center gap-3 px-6 py-10">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-app-accent-muted">
            <Ionicons color="#0F766E" name="videocam-outline" size={28} />
          </View>
          <ThemedText type="smallBold">{t("diary.selectVideo")}</ThemedText>
          <ThemedText themeColor="textSecondary" type="small" className="text-center">
            {t("diary.selectVideoHint")}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}
