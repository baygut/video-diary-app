import { type ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import { cn } from "@/utils/cn";

type AppScreenProps = {
  children: ReactNode;
  className?: string;
};

export function AppScreen({ children, className }: AppScreenProps) {
  return (
    <ThemedView className="flex-1 flex-row justify-center">
      <SafeAreaView className="flex-1 items-center">
        <View className={cn("w-full flex-1 gap-6 px-6 pt-6", className)}>
          {children}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
