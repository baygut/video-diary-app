import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  View,
} from "react-native";

import { AppScreen } from "@/components/app-screen";
import { DiaryCard } from "@/components/diary/diary-card";
import type { EntryMetadataValues } from "@/components/diary/entry-metadata-form";
import {
  type EntryFlowStep,
  NewEntryModal,
} from "@/components/diary/new-entry-modal";
import { ThemedText } from "@/components/themed-text";
import { DEFAULT_SEGMENT_SECONDS } from "@/constants/defaults";
import {
  useCreateDiary,
  useDeleteDiary,
  useDiaries,
  useTrimVideo,
  useUploadVideo,
} from "@/hooks/queries";
import { useTheme } from "@/hooks/use-theme";
import { useAppStore } from "@/store/app-store";
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
  const theme = useTheme();
  const router = useRouter();
  const sortOrder = useAppStore((state) => state.diaryListSortOrder);
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
  const [segmentSeconds, setSegmentSeconds] = useState(DEFAULT_SEGMENT_SECONDS);
  const [isPreparingVideo, setPreparingVideo] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);

  const sortedDiaries = useMemo(() => {
    if (!diaries) return [];
    return [...diaries].sort((left, right) => {
      const leftTime = new Date(left.createdAt).getTime();
      const rightTime = new Date(right.createdAt).getTime();
      return sortOrder === "newest"
        ? rightTime - leftTime
        : leftTime - rightTime;
    });
  }, [diaries, sortOrder]);

  const isSaving =
    trimVideo.isPending || uploadVideo.isPending || createDiary.isPending;

  function openModal() {
    setStep("select");
    setSegmentSeconds(DEFAULT_SEGMENT_SECONDS);
    setModalVisible(true);
  }

  function resetForm(options?: { deletePreview?: boolean }) {
    if (options?.deletePreview) {
      deleteLocalPreview(selectedVideo);
    }
    setSelectedVideo(null);
    setStep("select");
    setTrimStart(0);
    setSegmentSeconds(DEFAULT_SEGMENT_SECONDS);
    setPreparingVideo(false);
    setSaveProgress(0);
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
        setSegmentSeconds(
          Math.min(
            DEFAULT_SEGMENT_SECONDS,
            Math.max(1, Math.floor(previewVideo.durationSeconds)),
          ),
        );
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
      setSaveProgress(0.08);
      const trimmed = await trimVideo.mutateAsync({
        uri: selectedVideo.uri,
        startTime: trimStart,
        endTime: trimStart + segmentSeconds,
      });
      trimmedUri = trimmed.uri;
      setSaveProgress(0.38);

      const upload = await uploadVideo.mutateAsync({
        uri: trimmed.uri,
        mimeType: selectedVideo.mimeType,
      });
      setSaveProgress(0.78);
      await createDiary.mutateAsync({
        uploadId: upload.id,
        name: values.name,
        description: values.description || undefined,
      });
      setSaveProgress(1);
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
      setSaveProgress(0);
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
    <AppScreen title={t("diary.title")} subtitle={t("diary.subtitle")}>
      <FlatList
        className="flex-1"
        contentContainerClassName="gap-4 pb-28"
        data={sortedDiaries}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View className="min-h-[280px] items-center justify-center gap-3 rounded-2xl border border-dashed border-app-selected bg-app-element px-6">
            {isPending ? (
              <ActivityIndicator />
            ) : (
              <>
                <Ionicons color={theme.iconMuted} name="film-outline" size={40} />
                <ThemedText themeColor="textSecondary" className="text-center">
                  {isError ? t("common.error") : t("diary.empty")}
                </ThemedText>
              </>
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

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("diary.newEntry")}
        className="absolute bottom-8 right-6 h-14 w-14 items-center justify-center rounded-full bg-app-accent shadow-lg"
        onPress={openModal}
      >
        <Ionicons color={theme.onAccent} name="add" size={28} />
      </Pressable>

      <NewEntryModal
        visible={isModalVisible}
        selectedVideo={selectedVideo}
        isPreparingVideo={isPreparingVideo}
        isSaving={isSaving}
        step={step}
        trimStart={trimStart}
        segmentSeconds={segmentSeconds}
        onCancel={closeModal}
        onBackToTrim={() => setStep("trim")}
        onChangeTrimStart={setTrimStart}
        onChangeSegmentSeconds={setSegmentSeconds}
        onContinueToMetadata={() => setStep("metadata")}
        onPickVideo={pickVideo}
        saveProgress={saveProgress}
        onSubmit={saveEntry}
      />
    </AppScreen>
  );
}
