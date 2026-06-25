import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/app-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import type { SelectedVideo } from "@/utils/video-files";

import { EntryFlowStepper } from "./entry-flow-stepper";
import {
  EntryMetadataForm,
  type EntryMetadataValues,
} from "./entry-metadata-form";
import { UploadingVideoOverlay } from "./uploading-video-overlay";
import { VideoPickerField } from "./video-picker-field";
import { VideoTrimStep } from "./video-trim-step";

export type EntryFlowStep = "select" | "trim" | "metadata";

type NewEntryModalProps = {
  isPreparingVideo: boolean;
  isSaving: boolean;
  onBackToTrim: () => void;
  onCancel: () => void;
  onChangeSegmentSeconds: (value: number) => void;
  onChangeTrimStart: (value: number) => void;
  onContinueToMetadata: () => void;
  onPickVideo: () => void;
  onSubmit: (values: EntryMetadataValues) => void;
  segmentSeconds: number;
  selectedVideo: SelectedVideo | null;
  step: EntryFlowStep;
  trimStart: number;
  visible: boolean;
};

function getStepTitle(step: EntryFlowStep) {
  if (step === "select") return "diary.selectVideo";
  if (step === "trim") return "diary.cropVideo";
  return "diary.stepMetadata";
}

export function NewEntryModal({
  isPreparingVideo,
  isSaving,
  onBackToTrim,
  onCancel,
  onChangeSegmentSeconds,
  onChangeTrimStart,
  onContinueToMetadata,
  onPickVideo,
  onSubmit,
  segmentSeconds,
  selectedVideo,
  step,
  trimStart,
  visible,
}: NewEntryModalProps) {
  const { t } = useTranslation();
  const isBusy = isPreparingVideo || isSaving;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <ThemedView className="flex-1">
        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1"
          >
            <View className="border-b border-app-selected px-6 pb-4 pt-2">
              <View className="mb-4 flex-row items-center justify-between gap-4">
                <View className="flex-1">
                  <ThemedText type="subtitle" className="text-[28px] leading-9">
                    {t(getStepTitle(step))}
                  </ThemedText>
                </View>
                <AppButton
                  variant="ghost"
                  label={t("common.cancel")}
                  onPress={onCancel}
                  disabled={isBusy}
                />
              </View>
              <EntryFlowStepper currentStep={step} />
            </View>

            <ScrollView
              className="flex-1 px-6"
              contentContainerClassName="grow gap-4 py-6"
              keyboardShouldPersistTaps="handled"
            >
              {step === "select" ? (
                <View className="flex-1 gap-4">
                  <VideoPickerField
                    selectedVideo={selectedVideo}
                    onPress={onPickVideo}
                    disabled={isBusy}
                  />
                  <ThemedText themeColor="textSecondary" type="small">
                    {t("diary.selectVideoHint")}
                  </ThemedText>
                </View>
              ) : null}

              {step === "trim" && selectedVideo ? (
                <VideoTrimStep
                  selectedVideo={selectedVideo}
                  startTime={trimStart}
                  segmentSeconds={segmentSeconds}
                  onChangeSegmentSeconds={onChangeSegmentSeconds}
                  onChangeStart={onChangeTrimStart}
                  onNext={onContinueToMetadata}
                  disabled={isSaving}
                />
              ) : null}

              {step === "trim" && !selectedVideo ? (
                <View className="min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-app-selected bg-app-element">
                  <ThemedText themeColor="textSecondary">
                    {t("diary.preparingVideo")}
                  </ThemedText>
                </View>
              ) : null}

              {step === "metadata" ? (
                <View className="flex-1 gap-4">
                  <AppButton
                    variant="ghost"
                    label={t("common.back")}
                    onPress={onBackToTrim}
                    disabled={isSaving}
                    className="self-start"
                  />
                  <EntryMetadataForm
                    visible={visible}
                    ready={Boolean(selectedVideo)}
                    isSaving={isSaving}
                    onSubmit={onSubmit}
                    disabled={isSaving}
                  />
                </View>
              ) : null}
            </ScrollView>

            {isPreparingVideo ? (
              <UploadingVideoOverlay label={t("diary.preparingVideo")} />
            ) : null}
            {isSaving ? <UploadingVideoOverlay /> : null}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ThemedView>
    </Modal>
  );
}
