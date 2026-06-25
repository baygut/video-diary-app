import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";

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
        "min-h-[220px] items-center justify-center overflow-hidden rounded-lg bg-app-element",
        selectedVideo && "mb-1 min-h-[260px]",
      )}
      onPress={onPress}
      disabled={disabled}
    >
      {selectedVideo ? (
        <VideoPlayerView variant="preview" uri={selectedVideo.uri} />
      ) : (
        <ThemedText themeColor="textSecondary">
          {t("diary.selectVideo")}
        </ThemedText>
      )}
    </Pressable>
  );
}
