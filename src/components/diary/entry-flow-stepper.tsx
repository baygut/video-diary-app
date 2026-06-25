import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { cn } from "@/utils/cn";

import type { EntryFlowStep } from "./new-entry-modal";

const STEPS: EntryFlowStep[] = ["select", "trim", "metadata"];

type EntryFlowStepperProps = {
  currentStep: EntryFlowStep;
};

function getStepIndex(step: EntryFlowStep) {
  return STEPS.indexOf(step);
}

function getStepLabelKey(step: EntryFlowStep) {
  if (step === "select") return "diary.stepSelect";
  if (step === "trim") return "diary.stepTrim";
  return "diary.stepMetadata";
}

export function EntryFlowStepper({ currentStep }: EntryFlowStepperProps) {
  const { t } = useTranslation();
  const currentIndex = getStepIndex(currentStep);

  return (
    <View className="gap-3">
      <View className="flex-row items-center">
        {STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <View key={step} className="flex-1 flex-row items-center">
              <View className="items-center gap-1.5">
                <View
                  className={cn(
                    "h-8 w-8 items-center justify-center rounded-full border-2",
                    isComplete && "border-app-accent bg-app-accent",
                    isActive && "border-app-accent bg-app-accent-muted",
                    !isComplete && !isActive && "border-app-selected bg-app-element",
                  )}
                >
                  <ThemedText
                    type="smallBold"
                    className={cn(
                      isComplete && "text-white",
                      isActive && "text-app-accent",
                      !isComplete && !isActive && "text-app-secondary",
                    )}
                  >
                    {index + 1}
                  </ThemedText>
                </View>
                <ThemedText
                  type="small"
                  themeColor={isActive ? "text" : "textSecondary"}
                  className="max-w-[88px] text-center"
                  numberOfLines={2}
                >
                  {t(getStepLabelKey(step))}
                </ThemedText>
              </View>

              {index < STEPS.length - 1 ? (
                <View
                  className={cn(
                    "mx-1 mb-5 h-0.5 flex-1 rounded-full",
                    index < currentIndex ? "bg-app-accent" : "bg-app-selected",
                  )}
                />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}
