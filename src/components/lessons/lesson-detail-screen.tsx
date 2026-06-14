import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getLessonHeroImageSource } from "@/constants/images";
import { useProgressStore } from "@/store/progress-store";
import { colors } from "@/theme";
import type { Lesson } from "@/types/learning";

type LessonDetailScreenProps = {
  lesson: Lesson;
};

export function LessonDetailScreen({ lesson }: LessonDetailScreenProps) {
  const { height, width } = useWindowDimensions();
  const contentWidth = Math.min(Math.max(width - 36, 320), 430);
  const completeLesson = useProgressStore((state) => state.completeLesson);

  function handleStartLesson() {
    completeLesson(lesson.id, lesson.languageCode, lesson.xpReward);
    router.back();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="items-center"
          style={[styles.screen, { minHeight: Math.max(height - 80, 700) }]}
        >
          <View style={{ width: contentWidth }}>
            <View className="flex-row items-center" style={styles.header}>
              <Pressable
                accessibilityLabel="Go back"
                accessibilityRole="button"
                hitSlop={10}
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.pressed,
                ]}
              >
                <SymbolView
                  name={{
                    android: "arrow_back_ios_new",
                    ios: "chevron.left",
                    web: "chevron_left",
                  }}
                  size={31}
                  tintColor={colors.textPrimary}
                  weight="semibold"
                />
              </Pressable>

              <Text className="lesson-detail__meta ml-2" numberOfLines={1}>
                Lesson {lesson.order}
              </Text>
            </View>

            <Image
              resizeMode="cover"
              source={getLessonHeroImageSource(lesson.id)}
              style={styles.heroImage}
            />

            <Text className="lesson-detail__title mt-7">{lesson.title}</Text>
            <Text className="lesson-detail__subtitle mt-3">
              {lesson.description}
            </Text>

            <View className="mt-6 flex-row gap-3">
              <View className="items-center rounded-2xl bg-[#F4F1FF] px-4 py-3">
                <Text className="lesson-detail__meta">
                  {lesson.xpReward} XP
                </Text>
              </View>
              <View className="items-center rounded-2xl bg-[#FFF6E8] px-4 py-3">
                <Text className="lesson-detail__meta">
                  {lesson.estimatedMinutes} min
                </Text>
              </View>
            </View>

            <View className="mt-7 gap-3">
              {lesson.goals.map((goal) => (
                <View className="flex-row items-start" key={goal}>
                  <View
                    className="mt-1 items-center justify-center rounded-full"
                    style={styles.goalCheck}
                  >
                    <SymbolView
                      name={{
                        android: "check",
                        ios: "checkmark",
                        web: "check",
                      }}
                      size={16}
                      tintColor="#FFFFFF"
                      weight="bold"
                    />
                  </View>
                  <Text className="lesson-detail__goal ml-3 flex-1">
                    {goal}
                  </Text>
                </View>
              ))}
            </View>

            <Pressable
              accessibilityRole="button"
              className="mt-8 items-center justify-center rounded-2xl bg-lingua-deep-purple"
              onPress={handleStartLesson}
              style={({ pressed }) => [
                styles.startButton,
                pressed && styles.pressed,
              ]}
            >
              <Text className="auth__primary-button-label">Start lesson</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    minWidth: "100%",
    paddingBottom: 28,
    width: "100%",
  },
  screen: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  header: {
    height: 48,
  },
  backButton: {
    alignItems: "flex-start",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  heroImage: {
    borderCurve: "continuous",
    borderRadius: 24,
    height: 210,
    overflow: "hidden",
    width: "100%",
  },
  goalCheck: {
    backgroundColor: colors.linguaGreen,
    height: 24,
    width: 24,
  },
  startButton: {
    height: 60,
  },
  pressed: {
    opacity: 0.78,
  },
});
