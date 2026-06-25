import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { cn } from '@/utils/cn';

type AppButtonProps = Omit<PressableProps, 'children'> & {
  className?: string;
  label: string;
  loading?: boolean;
  textClassName?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'segment';
};

export function AppButton({
  className,
  disabled,
  label,
  loading,
  textClassName,
  variant = 'primary',
  ...props
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={cn(
        'min-h-11 items-center justify-center rounded-lg px-4',
        variant === 'primary' && 'bg-teal-700',
        variant === 'secondary' && 'bg-transparent',
        variant === 'danger' && 'bg-red-100',
        variant === 'segment' && 'flex-1 bg-transparent',
        isDisabled && 'opacity-45',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {({ pressed }) => (
        <>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : null}
          {!loading ? (
            <ThemedText
              type="smallBold"
              className={cn(
                pressed && 'opacity-70',
                variant === 'primary' && 'text-white',
                variant === 'danger' && 'text-red-800',
                textClassName
              )}
            >
              {label}
            </ThemedText>
          ) : null}
        </>
      )}
    </Pressable>
  );
}
