import { View } from "react-native";

import type { VideoSegmentProps } from "./video-segment-types";
import { VideoSegmentRangeTrimmer } from "./video-segment-range-trimmer";

type VideoTrimmerOverlayProps = VideoSegmentProps & {
  currentTime: number;
  disabled?: boolean;
  onChangeCurrentTime: (value: number) => void;
};

export function VideoTrimmerOverlay({
  disabled,
  currentTime,
  segmentSeconds,
  maxSegmentSeconds,
  minSegmentSeconds = 1,
  durationSeconds,
  startTime,
  onChangeCurrentTime,
  onChangeSegmentSeconds,
  onChangeStart,
}: VideoTrimmerOverlayProps) {
  return (
    <View
      className="absolute inset-x-0 bottom-0 bg-app-overlay/60 px-3 pb-3.5 pt-3.5"
      pointerEvents="box-none"
    >
      <VideoSegmentRangeTrimmer
        disabled={disabled}
        durationSeconds={durationSeconds}
        startTime={startTime}
        segmentSeconds={segmentSeconds}
        minSegmentSeconds={minSegmentSeconds}
        maxSegmentSeconds={maxSegmentSeconds}
        playheadSeconds={currentTime}
        onChangePlayhead={onChangeCurrentTime}
        onChangeStart={onChangeStart}
        onChangeSegmentSeconds={onChangeSegmentSeconds}
      />
    </View>
  );
}
