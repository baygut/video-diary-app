import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { useAppStore } from '@/store/app-store';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const preference = useAppStore((state) => state.colorSchemePreference);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setHasHydrated(true); }, []);

  const colorScheme = useRNColorScheme();

  if (preference !== 'system') {
    return preference;
  }

  if (hasHydrated) {
    return colorScheme ?? 'light';
  }

  return 'light';
}
