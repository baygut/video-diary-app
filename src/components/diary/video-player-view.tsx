/* eslint-disable react-hooks/immutability, react-hooks/refs */
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { cssInterop } from "nativewind";
import { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { cn } from "@/utils/cn";
import { debugLog } from "@/utils/debug-log";

import { VideoPlaybackOverlayButton } from "./video-playback-overlay-button";
import type { VideoSegmentProps } from "./video-segment-types";
import { VideoTrimmerOverlay } from "./video-trimmer-overlay";

cssInterop(VideoView, { className: "style" });

export type { VideoSegmentProps } from "./video-segment-types";

type VideoPlayerViewProps = {
  uri: string;
  uris?: string[];
  variant?: "card" | "preview" | "detail";
  segmentProps?: VideoSegmentProps;
};

export function VideoPlayerView(props: VideoPlayerViewProps) {
  const key = props.uris?.join("|") ?? props.uri;
  return <VideoPlayerViewInner key={key} {...props} />;
}

function VideoPlayerViewInner({
  uri,
  uris,
  variant = "card",
  segmentProps,
}: VideoPlayerViewProps) {
  const [loadError, setLoadError] = useState<{
    message: string;
    uri: string;
  } | null>(null);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const uriKey = uris?.join("|") ?? uri;
  const candidates = useMemo(() => {
    const list = uriKey.split("|").filter(Boolean);
    return Array.from(new Set(list.length ? list : [uri]));
  }, [uri, uriKey]);

  const activeUri = candidates[sourceIndex] ?? uri;
  const errorMessage = loadError?.uri === activeUri ? loadError.message : null;
  const isPreview = variant === "preview";

  const player = useVideoPlayer(null, (p) => {
    p.muted = isPreview;
    p.audioMixingMode = isPreview ? "mixWithOthers" : "auto";
  });
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const segmentRef = useRef(segmentProps);
  useEffect(() => {
    segmentRef.current = segmentProps;
  });

  const lastSeekRef = useRef<number | null>(null);
  const seekToStartRef = useRef<(() => void) | null>(null);
  seekToStartRef.current = () => {
    const seg = segmentRef.current;
    if (!seg) return;
    lastSeekRef.current = seg.startTime;
    player.currentTime = seg.startTime;
    setCurrentTime(seg.startTime);
    if (!player.playing) player.play();
  };

  useEffect(() => {
    if (!isPreview) return;
    seekToStartRef.current?.();
  }, [isPreview, segmentProps?.startTime, segmentProps?.segmentSeconds]);

  useEffect(() => {
    if (!isPreview) return;
    player.timeUpdateEventInterval = 0.08;

    const sub = player.addListener("timeUpdate", ({ currentTime }) => {
      const seg = segmentRef.current;
      if (!seg) return;
      setCurrentTime(currentTime);
      if (currentTime >= seg.startTime + seg.segmentSeconds) {
        lastSeekRef.current = seg.startTime;
        player.currentTime = seg.startTime;
        setCurrentTime(seg.startTime);
      }
    });

    return () => {
      sub.remove();
    };
  }, [isPreview, player]);

  useEffect(() => {
    let mounted = true;

    debugLog("player.replaceAsync.start", {
      activeUri,
      sourceIndex,
      candidates,
      isPreview,
    });

    player
      .replaceAsync({ contentType: "progressive", uri: activeUri })
      .then(() => debugLog("player.replaceAsync.success", { activeUri }))
      .catch((error) => {
        if (!mounted) return;
        const message =
          error instanceof Error ? error.message : "Video could not be loaded.";
        debugLog("player.replaceAsync.error", { activeUri, message });
        setLoadError({ uri: activeUri, message });
        if (sourceIndex < candidates.length - 1) setSourceIndex((c) => c + 1);
      });

    return () => {
      mounted = false;
    };
  }, [activeUri, candidates, isPreview, player, sourceIndex]);

  useEffect(() => {
    const statusSub = player.addListener(
      "statusChange",
      ({ error, oldStatus, status }) => {
        debugLog("player.statusChange", {
          activeUri,
          oldStatus,
          status,
          error: error?.message,
        });
        if (status === "error") {
          setLoadError({
            uri: activeUri,
            message: error?.message ?? "Video could not be loaded.",
          });
          if (sourceIndex < candidates.length - 1) setSourceIndex((c) => c + 1);
        }
      },
    );

    const sourceSub = player.addListener("sourceLoad", (payload) => {
      debugLog("player.sourceLoad", {
        activeUri,
        duration: payload.duration,
        availableVideoTracks: payload.availableVideoTracks,
        availableAudioTracks: payload.availableAudioTracks,
      });
      const seg = segmentRef.current;
      if (isPreview && seg) {
        lastSeekRef.current = seg.startTime;
        player.currentTime = seg.startTime;
        setCurrentTime(seg.startTime);
        player.play();
      }
    });

    return () => {
      statusSub.remove();
      sourceSub.remove();
    };
  }, [activeUri, candidates, isPreview, player, sourceIndex]);

  function togglePreviewPlayback() {
    const seg = segmentRef.current;
    if (seg) {
      const segmentEnd = seg.startTime + seg.segmentSeconds;
      const outsideSegment =
        player.currentTime < seg.startTime || player.currentTime >= segmentEnd;
      if (outsideSegment) {
        player.currentTime = seg.startTime;
        setCurrentTime(seg.startTime);
      }
    }

    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  }

  function scrubPreviewPlayback(nextTime: number) {
    const seg = segmentRef.current;
    const clamped = seg
      ? Math.min(
          Math.max(nextTime, seg.startTime),
          seg.startTime + seg.segmentSeconds,
        )
      : Math.max(0, nextTime);

    player.currentTime = clamped;
    setCurrentTime(clamped);
  }

  return (
    <View
      className={cn(
        "w-full overflow-hidden bg-app-video",
        variant === "preview" && "max-h-[360px]",
        variant === "card" && "aspect-[16/10]",
        variant === "detail" && "aspect-video min-h-[240px]",
      )}
    >
      <VideoView
        key={activeUri}
        className="h-full w-full"
        player={player}
        nativeControls={!isPreview}
        contentFit="contain"
        fullscreenOptions={{ enable: !isPreview }}
        playsInline
      />

      {isPreview && segmentProps ? (
        <>
          <VideoPlaybackOverlayButton
            isPlaying={isPlaying}
            onPress={togglePreviewPlayback}
          />
          <VideoTrimmerOverlay
            {...segmentProps}
            currentTime={currentTime}
            onChangeCurrentTime={scrubPreviewPlayback}
          />
        </>
      ) : null}

      {errorMessage ? (
        <View className="absolute inset-x-4 bottom-4 rounded-xl bg-black/75 p-3">
          <ThemedText type="small" className="text-white">
            {errorMessage}
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}
