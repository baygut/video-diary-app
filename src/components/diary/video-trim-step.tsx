import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { AppButton } from "@/components/app-button";
import type { SelectedVideo } from "@/utils/video-files";

import { VideoPlayerView } from "./video-player-view";

type VideoTrimStepProps = {
  disabled?: boolean;
  onChangeSegmentSeconds: (value: number) => void;
  onChangeStart: (value: number) => void;
  onNext: () => void;
  segmentSeconds: number;
  selectedVideo: SelectedVideo;
  startTime: number;
};

export function VideoTrimStep({
  disabled,
  onChangeSegmentSeconds,
  onChangeStart,
  onNext,
  segmentSeconds,
  selectedVideo,
  startTime,
}: VideoTrimStepProps) {
  const { t } = useTranslation();

  const maxStart = Math.max(0, selectedVideo.durationSeconds - segmentSeconds);
  const maxSegmentSeconds = Math.min(
    30,
    Math.max(1, Math.floor(selectedVideo.durationSeconds)),
  );

  // Clamp startTime if segmentSeconds shrinks
  useEffect(() => {
    if (startTime > maxStart) {
      onChangeStart(maxStart);
    }
  }, [maxStart, onChangeStart, startTime]);

  return (
    <View className="flex-1 gap-5">
      <View className="overflow-hidden rounded-2xl border border-app-selected">
        <VideoPlayerView
          variant="preview"
          uri={selectedVideo.playbackUri}
          segmentProps={{
            segmentSeconds,
            maxSegmentSeconds,
            durationSeconds: selectedVideo.durationSeconds,
            startTime,
            onChangeSegmentSeconds,
            onChangeStart,
          }}
        />
      </View>

      <AppButton
        label={t("common.next")}
        onPress={onNext}
        disabled={disabled}
      />
    </View>
  );
}
