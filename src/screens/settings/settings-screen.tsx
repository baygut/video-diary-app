import * as Localization from "expo-localization";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { AppScreen } from "@/components/app-screen";
import { ThemedText } from "@/components/themed-text";
import i18n from "@/i18n";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/utils/cn";

type SettingOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentedSettingProps<T extends string> = {
  label: string;
  onChange: (value: T) => void;
  options: SettingOption<T>[];
  value: T;
};

function getSystemLanguage() {
  return Localization.getLocales()[0]?.languageCode === "tr" ? "tr" : "en";
}

function SegmentedSetting<T extends string>({
  label,
  onChange,
  options,
  value,
}: SegmentedSettingProps<T>) {
  return (
    <View className="gap-2">
      <ThemedText type="smallBold">{label}</ThemedText>
      <View className="flex-row gap-1 rounded-lg bg-app-element p-1">
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <Pressable
              key={option.value}
              className={cn(
                "min-h-11 flex-1 items-center justify-center rounded-[7px] px-2",
                isSelected && "bg-app-selected",
              )}
              onPress={() => onChange(option.value)}
            >
              <ThemedText
                type="smallBold"
                themeColor={isSelected ? "text" : "textSecondary"}
                className="text-center"
              >
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function SettingsScreen() {
  const { t } = useTranslation();
  const colorSchemePreference = useAppStore(
    (state) => state.colorSchemePreference,
  );
  const languagePreference = useAppStore((state) => state.languagePreference);
  const setColorSchemePreference = useAppStore(
    (state) => state.setColorSchemePreference,
  );
  const setLanguagePreference = useAppStore(
    (state) => state.setLanguagePreference,
  );

  function changeLanguage(value: typeof languagePreference) {
    setLanguagePreference(value);
    i18n.changeLanguage(value === "system" ? getSystemLanguage() : value);
  }

  return (
    <AppScreen>
      <View className="gap-6">
        <SegmentedSetting
          label={t("settings.theme")}
          value={colorSchemePreference}
          onChange={setColorSchemePreference}
          options={[
            { label: t("settings.system"), value: "system" },
            { label: t("settings.light"), value: "light" },
            { label: t("settings.dark"), value: "dark" },
          ]}
        />

        <SegmentedSetting
          label={t("settings.language")}
          value={languagePreference}
          onChange={changeLanguage}
          options={[
            { label: t("settings.system"), value: "system" },
            { label: t("settings.english"), value: "en" },
            { label: t("settings.turkish"), value: "tr" },
          ]}
        />
      </View>
    </AppScreen>
  );
}
