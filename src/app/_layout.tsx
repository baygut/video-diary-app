import { QueryClientProvider } from "@tanstack/react-query";
import * as Localization from "expo-localization";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import { useEffect } from "react";
import { AppState } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";
import i18n from "@/i18n";
import { queryClient, registerAppStateFocusListener } from "@/lib/query-client";
import { useAppStore } from "@/store/app-store";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const languagePreference = useAppStore((state) => state.languagePreference);

  useEffect(() => {
    setColorScheme(colorScheme === "dark" ? "dark" : "light");
  }, [colorScheme, setColorScheme]);

  useEffect(() => {
    const lng =
      languagePreference === "system"
        ? Localization.getLocales()[0]?.languageCode === "tr"
          ? "tr"
          : "en"
        : languagePreference;

    if (lng !== i18n.language) i18n.changeLanguage(lng);
  }, [languagePreference]);

  useEffect(() => {
    const unsubFocus = registerAppStateFocusListener();
    const sub = AppState.addEventListener("change", () => {
      if (languagePreference !== "system") return;

      const lng =
        Localization.getLocales()[0]?.languageCode === "tr" ? "tr" : "en";
      if (lng !== i18n.language) i18n.changeLanguage(lng);
    });
    return () => {
      unsubFocus();
      sub.remove();
    };
  }, [languagePreference]);

  const { t } = useTranslation();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen options={{ headerShown: false }} name="(tabs)" />
          <Stack.Screen
            name="diary/[id]"
            options={{
              title: t("screens.diary.detailTitle"),
              headerBackTitle: t("tabs.diary"), // iOS back text
            }}
          />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
