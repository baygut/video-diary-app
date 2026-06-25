import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { VideoPlayerView } from '@/components/diary/video-player-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useDiary } from '@/hooks/queries';
import { useTheme } from '@/hooks/use-theme';

function formatEntryDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function DiaryDetailScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: diary, isError, isPending } = useDiary(id ?? '');

  return (
    <>
      <Stack.Screen
        options={{
          title: diary?.name ?? t('screens.diary.detailTitle'),
          headerRight: diary
            ? () => (
                <Pressable
                  accessibilityLabel={t('diary.editEntry')}
                  accessibilityRole="button"
                  className="h-10 w-10 items-center justify-center"
                  onPress={() => router.push(`/diary/${diary.id}/edit`)}
                >
                  <Ionicons color={theme.accent} name="create-outline" size={24} />
                </Pressable>
              )
            : undefined,
        }}
      />

      <ThemedView className="flex-1">
        {isPending ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : null}

        {isError ? (
          <View className="flex-1 items-center justify-center px-6">
            <ThemedText themeColor="textSecondary" className="text-center">
              {t('common.error')}
            </ThemedText>
          </View>
        ) : null}

        {diary ? (
          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-6 pb-10"
            showsVerticalScrollIndicator={false}
          >
            <View className="overflow-hidden bg-app-video">
              <VideoPlayerView uri={diary.uploadUri} variant="detail" />
            </View>

            <View className="gap-3 px-6">
              <View className="gap-1">
                <ThemedText type="subtitle" className="text-[28px] leading-9">
                  {diary.name}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {formatEntryDate(diary.createdAt)}
                </ThemedText>
              </View>

              {diary.description ? (
                <ThemedText className="text-base leading-6">
                  {diary.description}
                </ThemedText>
              ) : (
                <ThemedText themeColor="textSecondary" type="small">
                  {t('diary.noDescription')}
                </ThemedText>
              )}
            </View>
          </ScrollView>
        ) : null}
      </ThemedView>
    </>
  );
}
