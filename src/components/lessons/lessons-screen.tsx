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

import { getLessonCardImageSource, images } from "@/constants/images";
import type {
  LessonScreenData,
  LessonScreenLesson,
} from "@/data/lesson-screen";
import { colors } from "@/theme";

type LessonsScreenProps = {
  screenData: LessonScreenData;
};

export function LessonsScreen({ screenData }: LessonsScreenProps) {
  const { height, width } = useWindowDimensions();
  const contentWidth = Math.min(Math.max(width - 36, 320), 430);
  const heroHeight = Math.min(Math.max(width * 0.52, 198), 248);
  const stageHeight = 78 + heroHeight;

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
          style={[styles.screen, { minHeight: Math.max(height - 100, 760) }]}
        >
          <View style={[styles.heroStage, { height: stageHeight, width }]}>
            <Image
              resizeMode="cover"
              source={images.lessonCafeHero}
              style={[styles.heroImage, { height: heroHeight, width }]}
            />

            <View
              className="absolute left-0 right-0 top-0 z-10 items-center"
              pointerEvents="box-none"
            >
              <View style={{ width: contentWidth }}>
                <View className="flex-row items-start" style={styles.header}>
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

                  <View className="flex-1 pr-4" style={styles.titleBlock}>
                    <Text className="lesson__title" numberOfLines={1}>
                      {screenData.title}
                    </Text>
                    <Text className="lesson__subtitle mt-1" numberOfLines={1}>
                      {screenData.progressLabel}
                    </Text>
                  </View>

                  <Pressable
                    accessibilityLabel="Save unit"
                    accessibilityRole="button"
                    hitSlop={10}
                    style={({ pressed }) => [
                      styles.bookmarkButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.bookmarkAccent} />
                    <SymbolView
                      name={{
                        android: "bookmark_border",
                        ios: "bookmark",
                        web: "bookmark",
                      }}
                      size={36}
                      tintColor="#465BC8"
                      weight="medium"
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          <View
            className="flex-row"
            style={[styles.segmentedControl, { width: contentWidth }]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: true }}
              className="flex-1 items-center justify-center"
              style={({ pressed }) => [
                styles.segmentButton,
                styles.segmentButtonActive,
                pressed && styles.pressed,
              ]}
            >
              <Text className="lesson__tab-label--active">Lessons</Text>
              <View style={styles.segmentIndicator} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              className="flex-1 items-center justify-center"
              style={({ pressed }) => [
                styles.segmentButton,
                pressed && styles.pressed,
              ]}
            >
              <Text className="lesson__tab-label">Practice</Text>
            </Pressable>
          </View>

          <View
            className="gap-3"
            style={[styles.lessonList, { width: contentWidth }]}
          >
            {screenData.lessons.map((lesson) => (
              <LessonCard key={lesson.lesson.id} lesson={lesson} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LessonCard({ lesson }: { lesson: LessonScreenLesson }) {
  const isInProgress = lesson.status === "in-progress";
  const isCompleted = lesson.status === "completed";
  const isNotStarted = lesson.status === "not-started";

  function handlePress() {
    router.push(lesson.href);
  }

  return (
    <Pressable
      accessibilityLabel={`Open lesson ${lesson.lessonNumber}: ${lesson.lesson.title}`}
      accessibilityRole="button"
      className="flex-row items-center bg-white"
      onPress={handlePress}
      style={({ pressed }) => [
        styles.lessonCard,
        isInProgress && styles.lessonCardActive,
        pressed && styles.pressed,
      ]}
    >
      <View className="flex-1">
        <Text
          className={
            isInProgress
              ? "lesson__card-label--active"
              : "lesson__card-label"
          }
        >
          Lesson {lesson.lessonNumber}
        </Text>
        <Text className="lesson__card-title mt-3" numberOfLines={1}>
          {lesson.lesson.title}
        </Text>
        {lesson.progressLabel ? (
          <Text
            className={
              isNotStarted
                ? "lesson__progress--muted mt-1"
                : "lesson__progress mt-1"
            }
          >
            {lesson.progressLabel}
          </Text>
        ) : null}
      </View>

      <View
        className="ml-4 items-center justify-center"
        style={styles.statusSlot}
      >
        {isCompleted ? (
          <View
            className="items-center justify-center rounded-full"
            style={styles.checkBadge}
          >
            <SymbolView
              name={{ android: "check", ios: "checkmark", web: "check" }}
              size={23}
              tintColor="#FFFFFF"
              weight="bold"
            />
          </View>
        ) : null}

        {isInProgress ? (
          <Image
            resizeMode="contain"
            source={getLessonCardImageSource(lesson.lesson.id)}
            style={styles.activeLessonImage}
          />
        ) : null}

        {isNotStarted ? (
          <View className="items-center justify-center" style={styles.lockBadge}>
            <SymbolView
              name={{ android: "lock", ios: "lock", web: "lock" }}
              size={25}
              tintColor="#66708F"
              weight="semibold"
            />
          </View>
        ) : null}
      </View>
    </Pressable>
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
    paddingBottom: 22,
    width: "100%",
  },
  screen: {
    flex: 1,
    paddingBottom: 8,
  },
  heroStage: {
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  heroImage: {
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  header: {
    minHeight: 104,
    paddingTop: 24,
  },
  backButton: {
    alignItems: "flex-start",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  titleBlock: {
    marginLeft: 11,
    paddingTop: 1,
  },
  bookmarkButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 40,
  },
  bookmarkAccent: {
    backgroundColor: "#FF9D16",
    borderRadius: 3,
    height: 8,
    position: "absolute",
    right: 7,
    top: 6,
    width: 18,
    zIndex: 2,
  },
  segmentedControl: {
    alignSelf: "center",
    backgroundColor: "#F8F7FC",
    borderRadius: 20,
    boxShadow: "0px 10px 24px rgba(99, 87, 149, 0.10)",
    height: 78,
    marginTop: -1,
    overflow: "hidden",
  },
  segmentButton: {
    height: 78,
  },
  segmentButtonActive: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    boxShadow: "0px 8px 20px rgba(91, 59, 246, 0.10)",
  },
  segmentIndicator: {
    backgroundColor: colors.linguaDeepPurple,
    borderRadius: 999,
    bottom: 0,
    height: 3,
    left: 0,
    position: "absolute",
    right: 0,
  },
  lessonList: {
    marginTop: 26,
  },
  lessonCard: {
    borderColor: "#EEF0F6",
    borderCurve: "continuous",
    borderRadius: 17,
    borderWidth: 1,
    boxShadow: "0px 5px 14px rgba(17, 24, 39, 0.025)",
    minHeight: 81,
    paddingHorizontal: 25,
    paddingVertical: 17,
  },
  lessonCardActive: {
    backgroundColor: "#FEFCFF",
    borderColor: "#8D70FF",
    borderWidth: 2,
    minHeight: 103,
    paddingBottom: 16,
    paddingTop: 17,
  },
  statusSlot: {
    height: 56,
    width: 58,
  },
  checkBadge: {
    backgroundColor: "#21C922",
    borderColor: "#1BAF1E",
    borderWidth: 1,
    height: 31,
    width: 31,
  },
  activeLessonImage: {
    height: 62,
    width: 62,
  },
  lockBadge: {
    height: 32,
    width: 32,
  },
  pressed: {
    opacity: 0.78,
  },
});
