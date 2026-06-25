import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { useTheme } from "@/hooks/use-theme";

type VideoPlaybackOverlayButtonProps = {
  isPlaying: boolean;
  onPress: () => void;
};

export function VideoPlaybackOverlayButton({
  isPlaying,
  onPress,
}: VideoPlaybackOverlayButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityLabel={isPlaying ? "Pause video" : "Play video"}
      accessibilityRole="button"
      className="absolute inset-0 items-center justify-center"
      onPress={onPress}
    >
      <View className="h-[68px] w-[68px] items-center justify-center rounded-full border border-app-on-dark/70 bg-app-play/90 shadow-lg">
        <Ionicons
          color={theme.onPlay}
          name={isPlaying ? "pause" : "play"}
          size={34}
          style={!isPlaying ? { marginLeft: 3 } : undefined}
        />
      </View>
    </Pressable>
  );
}
