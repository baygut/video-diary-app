import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppScreen } from '@/components/app-screen';
import { VideoPlayerView } from '@/components/diary/video-player-view';
import { ThemedText } from '@/components/themed-text';
import { useDiary } from '@/hooks/queries';

export function DiaryDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: diary, isError, isPending } = useDiary(id ?? '');

  return (
    <AppScreen title={diary?.name ?? t('diary.details')} subtitle={diary ? diary.description ?? undefined : undefined}>
      {isPending ? (
        <View className="min-h-[220px] items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : null}

      {isError ? (
        <ThemedText themeColor="textSecondary" className="text-center">
          {t('common.error')}
        </ThemedText>
      ) : null}

      {diary ? (
        <View className="gap-4">
          <VideoPlayerView uri={diary.uploadUri} />
          {diary.description ? (
            <ThemedText themeColor="textSecondary">{diary.description}</ThemedText>
          ) : null}
        </View>
      ) : null}
    </AppScreen>
  );
}
