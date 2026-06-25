import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, FlatList, View } from "react-native";

import { AppButton } from "@/components/app-button";
import { AppScreen } from "@/components/app-screen";
import { DiaryCard } from "@/components/diary/diary-card";
import type { EntryMetadataValues } from "@/components/diary/entry-metadata-form";
import {
  type EntryFlowStep,
  NewEntryModal,
} from "@/components/diary/new-entry-modal";
import { SEGMENT_SECONDS } from "@/components/diary/video-trim-step";
import { ThemedText } from "@/components/themed-text";
import {
  useCreateDiary,
  useDeleteDiary,
  useDiaries,
  useTrimVideo,
  useUploadVideo,
} from "@/hooks/queries";
import { debugLog } from "@/utils/debug-log";
import {
  createPreviewVideo,
  deleteLocalFile,
  deleteLocalPreview,
  getCompatiblePickerOptions,
  type SelectedVideo,
} from "@/utils/video-files";

function waitForUiFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

export function DiaryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: diaries, isPending, isError } = useDiaries();
  const uploadVideo = useUploadVideo();
  const trimVideo = useTrimVideo();
  const createDiary = useCreateDiary();
  const deleteDiary = useDeleteDiary();

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<SelectedVideo | null>(
    null,
  );
  const [step, setStep] = useState<EntryFlowStep>("select");
  const [trimStart, setTrimStart] = useState(0);
  const [isPreparingVideo, setPreparingVideo] = useState(false);

  const isSaving =
    trimVideo.isPending || uploadVideo.isPending || createDiary.isPending;

  function openModal() {
    setStep("select");
    setModalVisible(true);
  }

  function resetForm(options?: { deletePreview?: boolean }) {
    if (options?.deletePreview) {
      deleteLocalPreview(selectedVideo);
    }
    setSelectedVideo(null);
    setStep("select");
    setTrimStart(0);
    setPreparingVideo(false);
    trimVideo.reset();
    uploadVideo.reset();
    createDiary.reset();
  }

  function closeModal() {
    if (isSaving) return;
    setModalVisible(false);
    resetForm({ deletePreview: true });
  }

  async function pickVideo() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t("diary.permissionTitle"), t("diary.permissionMessage"));
      return;
    }

    setPreparingVideo(true);
    debugLog("picker.open");
    const result = await ImagePicker.launchImageLibraryAsync(
      getCompatiblePickerOptions(),
    );
    debugLog("picker.result", {
      canceled: result.canceled,
      assetCount: result.canceled ? 0 : result.assets.length,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      try {
        setStep("trim");
        await waitForUiFrame();
        const previousVideo = selectedVideo;
        const previewVideo = await createPreviewVideo(asset);
        debugLog("selection.ready", previewVideo);
        setSelectedVideo(previewVideo);
        setTrimStart(0);
        deleteLocalPreview(previousVideo);
      } catch (error) {
        Alert.alert(
          t("common.error"),
          error instanceof Error ? error.message : t("diary.previewError"),
        );
      } finally {
        setPreparingVideo(false);
      }
    } else {
      setPreparingVideo(false);
    }
  }

  async function saveEntry(values: EntryMetadataValues) {
    if (!selectedVideo) return;
    let trimmedUri: string | null = null;

    try {
      const trimmed = await trimVideo.mutateAsync({
        uri: selectedVideo.uri,
        startTime: trimStart,
        endTime: trimStart + SEGMENT_SECONDS,
      });
      trimmedUri = trimmed.uri;

      const upload = await uploadVideo.mutateAsync({
        uri: trimmed.uri,
        mimeType: selectedVideo.mimeType,
      });
      await createDiary.mutateAsync({
        uploadId: upload.id,
        name: values.name,
        description: values.description || undefined,
      });
      deleteLocalPreview(selectedVideo);
      setModalVisible(false);
      resetForm();
    } catch (error) {
      Alert.alert(
        t("common.error"),
        error instanceof Error ? error.message : t("diary.saveError"),
      );
    } finally {
      deleteLocalFile(trimmedUri);
    }
  }

  function deleteEntry(id: string) {
    deleteDiary.mutate(id, {
      onError: (error) => {
        Alert.alert(
          t("common.error"),
          error instanceof Error ? error.message : t("diary.deleteError"),
        );
      },
    });
  }

  return (
    <AppScreen
      title={t("diary.title")}
      subtitle={t("diary.subtitle")}
      actions={<AppButton label={t("diary.upload")} onPress={openModal} />}
    >
      <FlatList
        className="flex-1"
        contentContainerClassName="gap-4 pb-4"
        data={diaries ?? []}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View className="min-h-[220px] items-center justify-center">
            {isPending ? (
              <ActivityIndicator />
            ) : (
              <ThemedText themeColor="textSecondary" className="text-center">
                {isError ? t("common.error") : t("diary.empty")}
              </ThemedText>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <DiaryCard
            entry={item}
            isDeleting={
              deleteDiary.isPending && deleteDiary.variables === item.id
            }
            onDelete={deleteEntry}
            onOpen={(id) => {
              router.push(`/diary/${id}`);
            }}
          />
        )}
      />

      <NewEntryModal
        visible={isModalVisible}
        selectedVideo={selectedVideo}
        isPreparingVideo={isPreparingVideo}
        isSaving={isSaving}
        step={step}
        trimStart={trimStart}
        onCancel={closeModal}
        onBackToTrim={() => setStep("trim")}
        onChangeTrimStart={setTrimStart}
        onContinueToMetadata={() => setStep("metadata")}
        onPickVideo={pickVideo}
        onSubmit={saveEntry}
      />
    </AppScreen>
  );
}
