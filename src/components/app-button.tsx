import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/utils/cn";
import * as Haptics from "expo-haptics";

type AppButtonProps = Omit<PressableProps, "children"> & {
  className?: string;
  label: string;
  loading?: boolean;
  size?: "default" | "compact";
  textClassName?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  hapticType?:
    | "impactLight"
    | "impactMedium"
    | "impactHeavy"
    | "notificationSuccess"
    | "notificationWarning"
    | "notificationError";
};

export function AppButton({
  className,
  disabled,
  label,
  loading,
  size = "default",
  textClassName,
  variant = "primary",
  hapticType = "impactLight",
  ...props
}: AppButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const handlePressIn: PressableProps["onPressIn"] = (event) => {
    if (hapticType) {
      switch (hapticType) {
        case "impactLight":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case "impactMedium":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case "impactHeavy":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case "notificationSuccess":
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case "notificationWarning":
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case "notificationError":
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    }
    props.onPressIn?.(event);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      className={cn(
        "items-center justify-center rounded-xl border",
        size === "default" ? "min-h-11 px-4" : "min-h-9 px-3",
        variant === "primary" && "border-app-accent bg-app-accent",
        variant === "secondary" && "border-app-selected bg-app-element",
        variant === "danger" && "border-app-danger-muted bg-app-danger-muted",
        variant === "ghost" && "border-transparent bg-transparent",
        isDisabled && "opacity-45",
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      {({ pressed }) => (
        <>
          {loading ? (
            <ActivityIndicator
              color={variant === "primary" ? theme.onAccent : undefined}
            />
          ) : null}
          {!loading ? (
            <ThemedText
              type="smallBold"
              className={cn(
                pressed && "opacity-70",
                variant === "primary" && "text-white",
                variant === "secondary" && "text-app-text",
                variant === "danger" && "text-app-danger",
                variant === "ghost" && "text-app-accent",
                textClassName,
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
