import { type ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { cn } from "@/utils/cn";

type AppScreenProps = {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  compactHeader?: boolean;
  subtitle?: string;
  title?: string;
};

export function AppScreen({
  actions,
  children,
  className,
  compactHeader = false,
  subtitle,
  title,
}: AppScreenProps) {
  const showHeader = Boolean(title || subtitle || actions);

  return (
    <ThemedView className="flex-1 flex-row justify-center">
      <SafeAreaView className="flex-1 items-center">
        <View className={cn("w-full flex-1 px-6 pt-4", className)}>
          {showHeader ? (
            <View
              className={cn(
                "mb-5 flex-row items-start justify-between gap-4",
                compactHeader && "mb-4",
              )}
            >
              <View className="flex-1 gap-1">
                {title ? (
                  <ThemedText
                    type={compactHeader ? "default" : "subtitle"}
                    className={compactHeader ? "text-2xl font-semibold" : undefined}
                  >
                    {title}
                  </ThemedText>
                ) : null}
                {subtitle ? (
                  <ThemedText themeColor="textSecondary" type="small">
                    {subtitle}
                  </ThemedText>
                ) : null}
              </View>
              {actions ? <View className="shrink-0">{actions}</View> : null}
            </View>
          ) : null}
          {children}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
