import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';

type UploadingVideoOverlayProps = {
  label?: string;
};

export function UploadingVideoOverlay({ label }: UploadingVideoOverlayProps) {
  const { t } = useTranslation();
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1400, easing: Easing.linear }),
      -1,
      false
    );
    pulse.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    progress.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [progress, pulse, rotation]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + pulse.value * 0.45,
    transform: [{ scale: 0.85 + pulse.value * 0.18 }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${-72 + progress.value * 144}%` }],
  }));

  return (
    <View className="absolute inset-0 items-center justify-center bg-black/45 px-8">
      <View className="items-center gap-4 rounded-lg bg-black/75 px-6 py-5">
        <View className="h-20 w-20 items-center justify-center">
          <Animated.View
            className="absolute h-20 w-20 rounded-full border-4 border-white/20"
            style={pulseStyle}
          />
          <Animated.View
            className="h-16 w-16 rounded-full border-4 border-white/25 border-t-white"
            style={ringStyle}
          />
          <View className="absolute h-7 w-7 rounded-md bg-white/90" />
        </View>

        <View className="items-center gap-2">
          <ThemedText type="smallBold" className="text-white">
            {label ?? t('diary.uploading')}
          </ThemedText>
          <View className="h-2 w-48 overflow-hidden rounded-full bg-white/20">
            <Animated.View className="h-2 w-24 rounded-full bg-white" style={progressStyle} />
          </View>
        </View>
      </View>
    </View>
  );
}
