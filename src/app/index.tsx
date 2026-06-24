import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useDiaries } from '@/hooks/queries';

export default function DiaryScreen() {
  const { t } = useTranslation();
  const { data: diaries, isPending, isError } = useDiaries();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">{t('diary.title')}</ThemedText>

        {isPending && (
          <ThemedText themeColor="textSecondary">{t('common.loading')}</ThemedText>
        )}

        {isError && (
          <ThemedText themeColor="textSecondary">{t('common.error')}</ThemedText>
        )}

        {diaries?.length === 0 && (
          <ThemedText themeColor="textSecondary">{t('diary.empty')}</ThemedText>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    paddingTop: Spacing.four,
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
});
