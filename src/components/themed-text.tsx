import { Text, type TextProps } from 'react-native';

import { type ThemeColor } from '@/constants/theme';
import { cn } from '@/utils/cn';

export type ThemedTextProps = TextProps & {
  className?: string;
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ className, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  return (
    <Text
      className={cn(
        themeColor === 'textSecondary' ? 'text-app-secondary' : 'text-app-text',
        type === 'default' && 'text-base font-medium leading-6',
        type === 'title' && 'text-5xl font-semibold leading-[52px]',
        type === 'small' && 'text-sm font-medium leading-5',
        type === 'smallBold' && 'text-sm font-bold leading-5',
        type === 'subtitle' && 'text-[32px] font-semibold leading-[44px]',
        type === 'link' && 'text-sm leading-[30px]',
        type === 'linkPrimary' && 'text-sm leading-[30px] text-blue-500',
        type === 'code' && 'font-mono text-xs font-medium',
        className
      )}
      {...rest}
    />
  );
}
