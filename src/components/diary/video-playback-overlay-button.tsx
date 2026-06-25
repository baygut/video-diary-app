import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

type VideoPlaybackOverlayButtonProps = {
  isPlaying: boolean;
  onPress: () => void;
};

export function VideoPlaybackOverlayButton({
  isPlaying,
  onPress,
}: VideoPlaybackOverlayButtonProps) {
  return (
    <Pressable
      accessibilityLabel={isPlaying ? "Pause video" : "Play video"}
      accessibilityRole="button"
      className="absolute inset-0 items-center justify-center"
      onPress={onPress}
    >
      <View style={styles.playButton}>
        <Ionicons
          color="#111827"
          name={isPlaying ? "pause" : "play"}
          size={34}
          style={!isPlaying ? styles.playIcon : undefined}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  playButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(250, 204, 21, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  playIcon: {
    marginLeft: 3,
  },
});
