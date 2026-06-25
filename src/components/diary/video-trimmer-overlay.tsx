import { StyleSheet, View } from "react-native";

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
    <View style={styles.overlay} pointerEvents="box-none">
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

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: "rgba(0,0,0,0.58)",
  },
});
