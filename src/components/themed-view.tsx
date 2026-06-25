import { View, type ViewProps } from 'react-native';

import { type ThemeColor } from '@/constants/theme';
import { cn } from '@/utils/cn';

export type ThemedViewProps = ViewProps & {
  className?: string;
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

export function ThemedView({ className, type, ...otherProps }: ThemedViewProps) {
  return (
    <View
      className={cn(
        (!type || type === 'background') && 'bg-app-background',
        type === 'backgroundElement' && 'bg-app-element',
        type === 'backgroundSelected' && 'bg-app-selected',
        className
      )}
      {...otherProps}
    />
  );
}
