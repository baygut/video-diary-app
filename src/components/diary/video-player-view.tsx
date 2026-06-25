import { useVideoPlayer, VideoView } from "expo-video";
import { cssInterop } from "nativewind";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { debugLog } from "@/utils/debug-log";

cssInterop(VideoView, { className: "style" });

type VideoPlayerViewProps = {
  uri: string;
  uris?: string[];
  variant?: "card" | "preview";
};

export function VideoPlayerView(props: VideoPlayerViewProps) {
  const key = props.uris?.join("|") ?? props.uri;
  return <VideoPlayerViewInner key={key} {...props} />;
}

function VideoPlayerViewInner({
  uri,
  uris,
  variant = "card",
}: VideoPlayerViewProps) {
  const [loadError, setLoadError] = useState<{
    message: string;
    uri: string;
  } | null>(null);
  const [sourceIndex, setSourceIndex] = useState(0);
  const uriKey = uris?.join("|") ?? uri;
  const candidates = useMemo(() => {
    const candidateUris = uriKey.split("|").filter(Boolean);
    return Array.from(new Set(candidateUris.length ? candidateUris : [uri]));
  }, [uri, uriKey]);
  const activeUri = candidates[sourceIndex] ?? uri;
  const errorMessage = loadError?.uri === activeUri ? loadError.message : null;
  const isPreview = variant === "preview";
  const player = useVideoPlayer(null, (videoPlayer) => {
    videoPlayer.muted = isPreview;
    videoPlayer.audioMixingMode = isPreview ? "mixWithOthers" : "auto";
  });

  useEffect(() => {
    let isMounted = true;

    debugLog("player.replaceAsync.start", {
      activeUri,
      candidateIndex: sourceIndex,
      candidates,
      isPreview,
      source: { contentType: "progressive", uri: activeUri },
    });
    player
      .replaceAsync({ contentType: "progressive", uri: activeUri })
      .then(() => {
        debugLog("player.replaceAsync.success", { activeUri });
      })
      .catch((error) => {
        if (isMounted) {
          const message =
            error instanceof Error
              ? error.message
              : "Video could not be loaded.";
          debugLog("player.replaceAsync.error", { activeUri, message });
          setLoadError({
            uri: activeUri,
            message,
          });

          if (sourceIndex < candidates.length - 1) {
            setSourceIndex((current) => current + 1);
          }
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeUri, candidates, isPreview, player, sourceIndex]);

  useEffect(() => {
    const statusSubscription = player.addListener(
      "statusChange",
      ({ error, oldStatus, status }) => {
        debugLog("player.statusChange", {
          activeUri,
          candidates,
          isPreview,
          oldStatus,
          status,
          error: error?.message,
        });
        if (status === "error") {
          setLoadError({
            uri: activeUri,
            message: error?.message ?? "Video could not be loaded.",
          });

          if (sourceIndex < candidates.length - 1) {
            setSourceIndex((current) => current + 1);
          }
        }
      },
    );
    const sourceSubscription = player.addListener("sourceLoad", (payload) => {
      debugLog("player.sourceLoad", {
        activeUri,
        duration: payload.duration,
        availableVideoTracks: payload.availableVideoTracks,
        availableAudioTracks: payload.availableAudioTracks,
      });
    });

    return () => {
      statusSubscription.remove();
      sourceSubscription.remove();
    };
  }, [activeUri, candidates, isPreview, player, sourceIndex]);

  return (
    <View
      className={
        variant === "preview"
          ? "h-full max-h-[260px] w-full overflow-hidden bg-gray-950"
          : "aspect-[16/10] w-full overflow-hidden bg-gray-950"
      }
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
      {errorMessage ? (
        <View className="absolute inset-x-4 bottom-4 rounded-lg bg-black/70 p-3">
          <ThemedText type="small" className="text-white">
            {errorMessage}
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}
