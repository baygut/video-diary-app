import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { AppButton } from '@/components/app-button';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

const EntryMetadataSchema = z.object({
  name: z.string().trim().min(1).max(50),
  description: z.string().trim().max(200).optional(),
});

export type EntryMetadataValues = z.infer<typeof EntryMetadataSchema>;

type EntryMetadataFormProps = {
  disabled?: boolean;
  initialValues?: EntryMetadataValues;
  isSaving: boolean;
  onSubmit: (values: EntryMetadataValues) => void;
  ready?: boolean;
  requireDirty?: boolean;
  saveLabel?: string;
  savingLabel?: string;
  visible?: boolean;
};

const EMPTY_VALUES: EntryMetadataValues = { name: '', description: '' };

export function EntryMetadataForm({
  disabled,
  initialValues = EMPTY_VALUES,
  isSaving,
  onSubmit,
  ready = true,
  requireDirty,
  saveLabel,
  savingLabel,
  visible = true,
}: EntryMetadataFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    control,
    formState: { errors, isDirty, isValid },
    handleSubmit,
    reset,
  } = useForm<EntryMetadataValues>({
    defaultValues: initialValues,
    mode: 'onChange',
    resolver: zodResolver(EntryMetadataSchema),
  });
  const name = useWatch({ control, name: 'name' }) ?? '';
  const description = useWatch({ control, name: 'description' }) ?? '';
  const canSubmit =
    ready &&
    isValid &&
    !disabled &&
    !isSaving &&
    (!requireDirty || isDirty);

  useEffect(() => {
    if (!visible) {
      reset(EMPTY_VALUES);
      return;
    }

    reset(initialValues);
  }, [initialValues, reset, visible]);

  return (
    <View className="gap-4">
      <View className="gap-2">
        <View className="flex-row justify-between gap-2">
          <ThemedText type="smallBold">{t('diary.name')}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {name.length}/50
          </ThemedText>
        </View>
        <Controller
          control={control}
          name="name"
          render={({ field: { onBlur, onChange, value } }) => (
            <TextInput
              className="min-h-12 rounded-lg border border-app-selected bg-app-element px-4 py-2 text-base text-app-text"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={t('diary.namePlaceholder')}
              placeholderTextColor={theme.textSecondary}
              maxLength={50}
              editable={!disabled}
            />
          )}
        />
        {errors.name ? (
          <ThemedText type="small" className="text-red-600">
            {t('diary.nameRequired')}
          </ThemedText>
        ) : null}
      </View>

      <View className="gap-2">
        <View className="flex-row justify-between gap-2">
          <ThemedText type="smallBold">{t('diary.description')}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {description.length}/200
          </ThemedText>
        </View>
        <Controller
          control={control}
          name="description"
          render={({ field: { onBlur, onChange, value } }) => (
            <TextInput
              className="min-h-[116px] rounded-lg border border-app-selected bg-app-element px-4 py-2 text-base text-app-text"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={t('diary.descriptionPlaceholder')}
              placeholderTextColor={theme.textSecondary}
              maxLength={200}
              multiline
              textAlignVertical="top"
              editable={!disabled}
            />
          )}
        />
      </View>

      <AppButton
        label={isSaving ? savingLabel ?? t('diary.saving') : saveLabel ?? t('diary.save')}
        loading={isSaving}
        disabled={!canSubmit}
        onPress={handleSubmit(onSubmit)}
        className="w-full"
      />
    </View>
  );
}
