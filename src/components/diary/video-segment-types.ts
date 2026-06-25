export type VideoSegmentProps = {
  segmentSeconds: number;
  maxSegmentSeconds: number;
  minSegmentSeconds?: number;
  durationSeconds: number;
  startTime: number;
  onChangeSegmentSeconds: (value: number) => void;
  onChangeStart: (value: number) => void;
};
