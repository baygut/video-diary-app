import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, ScrollView, View } from 'react-native';

import {
  EntryMetadataForm,
  type EntryMetadataValues,
} from '@/components/diary/entry-metadata-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useDiary, useUpdateDiary } from '@/hooks/queries';

export function DiaryEditScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const entryId = id ?? '';
  const { data: diary, isError, isPending } = useDiary(entryId);
  const updateDiary = useUpdateDiary();

  const initialValues = useMemo<EntryMetadataValues>(
    () => ({
      name: diary?.name ?? '',
      description: diary?.description ?? '',
    }),
    [diary?.description, diary?.name],
  );

  async function saveEntry(values: EntryMetadataValues) {
    if (!entryId) return;

    try {
      await updateDiary.mutateAsync({
        id: entryId,
        values: {
          name: values.name,
          description: values.description || undefined,
        },
      });
      router.back();
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('diary.updateError'),
      );
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: t('diary.editEntry'),
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
            contentContainerClassName="gap-5 px-6 py-6"
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
          >
            <EntryMetadataForm
              initialValues={initialValues}
              isSaving={updateDiary.isPending}
              onSubmit={saveEntry}
              requireDirty
              saveLabel={t('diary.saveChanges')}
              savingLabel={t('diary.savingChanges')}
            />
          </ScrollView>
        ) : null}
      </ThemedView>
    </>
  );
}
