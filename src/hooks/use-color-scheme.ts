import { useColorScheme as useRNColorScheme } from 'react-native';

import { useAppStore } from '@/store/app-store';

export function useColorScheme() {
  const colorScheme = useRNColorScheme();
  const preference = useAppStore((state) => state.colorSchemePreference);

  if (preference !== 'system') {
    return preference;
  }

  return colorScheme ?? 'light';
}
