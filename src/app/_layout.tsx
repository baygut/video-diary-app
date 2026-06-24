import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as Localization from 'expo-localization';
import { useEffect } from 'react';
import { AppState, useColorScheme } from 'react-native';

import AppTabs from '@/components/app-tabs';
import i18n from '@/i18n';
import { queryClient, registerAppStateFocusListener } from '@/lib/query-client';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const unsubFocus = registerAppStateFocusListener();
    const sub = AppState.addEventListener('change', () => {
      const lng = Localization.getLocales()[0]?.languageCode ?? 'en';
      if (lng !== i18n.language) i18n.changeLanguage(lng);
    });
    return () => {
      unsubFocus();
      sub.remove();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppTabs />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
