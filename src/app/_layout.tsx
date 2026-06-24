import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';
import { AppState, useColorScheme } from 'react-native';
import * as Localization from 'expo-localization';
import i18n from '@/i18n';

import AppTabs from '@/components/app-tabs';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const sub = AppState.addEventListener('change', () => {
      const lng = Localization.getLocales()[0]?.languageCode ?? 'en';
      if (lng !== i18n.language) i18n.changeLanguage(lng);
    });
    return () => sub.remove();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppTabs />
    </ThemeProvider>
  );
}
