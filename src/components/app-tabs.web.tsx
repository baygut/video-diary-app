import {
  TabList,
  TabListProps,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
  Tabs,
} from 'expo-router/ui';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { cn } from '@/utils/cn';

export default function AppTabs() {
  const { t } = useTranslation();

  return (
    <Tabs>
      <TabSlot className="h-full" />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>{t('tabs.diary')}</TabButton>
          </TabTrigger>
          <TabTrigger name="settings" href="/settings" asChild>
            <TabButton>{t('tabs.settings')}</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props}>
      {({ pressed }) => (
        <ThemedView
          type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
          className={cn('rounded-2xl px-4 py-1', pressed && 'opacity-70')}
        >
          <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
            {children}
          </ThemedText>
        </ThemedView>
      )}
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} className="absolute w-full flex-row items-center justify-center p-4">
      <ThemedView
        type="backgroundElement"
        className="w-full max-w-[800px] grow flex-row items-center gap-2 rounded-[32px] px-8 py-2"
      >
        <ThemedText type="smallBold" className="mr-auto">
          Video Diary
        </ThemedText>
        {props.children}
      </ThemedView>
    </View>
  );
}
