import { KeyboardAvoidingView, Modal, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/app-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { SelectedVideo } from '@/utils/video-files';

import { EntryMetadataForm, type EntryMetadataValues } from './entry-metadata-form';
import { UploadingVideoOverlay } from './uploading-video-overlay';
import { VideoPickerField } from './video-picker-field';
import { VideoTrimStep } from './video-trim-step';

export type EntryFlowStep = 'select' | 'trim' | 'metadata';

type NewEntryModalProps = {
  isPreparingVideo: boolean;
  isSaving: boolean;
  onBackToTrim: () => void;
  onCancel: () => void;
  onChangeTrimStart: (value: number) => void;
  onContinueToMetadata: () => void;
  onPickVideo: () => void;
  onSubmit: (values: EntryMetadataValues) => void;
  selectedVideo: SelectedVideo | null;
  step: EntryFlowStep;
  trimStart: number;
  visible: boolean;
};

function getStepTitle(step: EntryFlowStep) {
  if (step === 'select') return 'diary.selectVideo';
  if (step === 'trim') return 'diary.cropVideo';
  return 'diary.newEntry';
}

export function NewEntryModal({
  isPreparingVideo,
  isSaving,
  onBackToTrim,
  onCancel,
  onChangeTrimStart,
  onContinueToMetadata,
  onPickVideo,
  onSubmit,
  selectedVideo,
  step,
  trimStart,
  visible,
}: NewEntryModalProps) {
  const { t } = useTranslation();
  const isBusy = isPreparingVideo || isSaving;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <ThemedView className="flex-1">
        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1 px-6 py-6"
          >
            <View className="mb-6 flex-row items-center justify-between gap-4">
              <View className="flex-1">
                <ThemedText type="subtitle">{t(getStepTitle(step))}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {t('diary.stepLabel', {
                    current: step === 'select' ? 1 : step === 'trim' ? 2 : 3,
                    total: 3,
                  })}
                </ThemedText>
              </View>
              <AppButton
                variant="secondary"
                label={t('common.cancel')}
                onPress={onCancel}
                disabled={isBusy}
              />
            </View>

            <View className="flex-1 gap-4">
              {step === 'select' ? (
                <View className="flex-1 gap-4">
                  <VideoPickerField
                    selectedVideo={selectedVideo}
                    onPress={onPickVideo}
                    disabled={isBusy}
                  />
                  <ThemedText themeColor="textSecondary">{t('diary.selectVideoHint')}</ThemedText>
                </View>
              ) : null}

              {step === 'trim' && selectedVideo ? (
                <VideoTrimStep
                  selectedVideo={selectedVideo}
                  startTime={trimStart}
                  onChangeStart={onChangeTrimStart}
                  onNext={onContinueToMetadata}
                  disabled={isSaving}
                />
              ) : null}

              {step === 'trim' && !selectedVideo ? (
                <View className="flex-1 items-center justify-center rounded-lg bg-app-element">
                  <ThemedText themeColor="textSecondary">{t('diary.preparingVideo')}</ThemedText>
                </View>
              ) : null}

              {step === 'metadata' ? (
                <View className="flex-1 gap-4">
                  <AppButton
                    variant="secondary"
                    label={t('common.back')}
                    onPress={onBackToTrim}
                    disabled={isSaving}
                    className="self-start"
                  />
                  <EntryMetadataForm
                    visible={visible}
                    hasSelectedVideo={Boolean(selectedVideo)}
                    isSaving={isSaving}
                    onSubmit={onSubmit}
                    disabled={isSaving}
                  />
                </View>
              ) : null}
            </View>

            {isPreparingVideo ? (
              <UploadingVideoOverlay label={t('diary.preparingVideo')} />
            ) : null}
            {isSaving ? <UploadingVideoOverlay /> : null}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ThemedView>
    </Modal>
  );
}
