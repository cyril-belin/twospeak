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

import { images } from "@/constants/images";
import type { HomeDashboardData, HomePlanItem } from "@/data/home";
import { colors } from "@/theme";

type HomeScreenProps = {
  dashboardData: HomeDashboardData;
  userName: string;
};

const planIconByKind = {
  lesson: {
    backgroundColor: colors.linguaDeepPurple,
    name: { android: "menu_book", ios: "book.fill", web: "menu_book" },
  },
  "ai-conversation": {
    backgroundColor: colors.linguaDeepPurple,
    name: { android: "headphones", ios: "headphones", web: "headphones" },
  },
  "new-words": {
    backgroundColor: "#FF5C66",
    name: {
      android: "mark_unread_chat_alt",
      ios: "ellipsis.bubble.fill",
      web: "chat_bubble",
    },
  },
} as const;

export function HomeScreen({ dashboardData, userName }: HomeScreenProps) {
  const { height, width } = useWindowDimensions();
  const contentWidth = Math.min(Math.max(width - 48, 300), 430);
  const greeting = getGreeting(
    dashboardData.language.beginnerGreeting,
    userName,
  );
  const progressWidth =
    `${dashboardData.dailyGoal.progress * 100}%` as `${number}%`;

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
          style={[styles.screen, { minHeight: Math.max(height - 120, 700) }]}
        >
          <View style={{ width: contentWidth }}>
            <View className="flex-row items-center" style={styles.header}>
              <View
                className="items-center justify-center rounded-full bg-white"
                style={styles.flagBubble}
              >
                <Text className="home__flag">
                  {dashboardData.language.flagEmoji}
                </Text>
              </View>

              <Text className="home__greeting ml-4 flex-1" numberOfLines={1}>
                {greeting}
              </Text>

              <View className="ml-3 flex-row items-center">
                <Image
                  resizeMode="contain"
                  source={images.streakFire}
                  style={styles.streakIcon}
                />
                <Text className="home__streak ml-1">
                  {dashboardData.streakDays}
                </Text>
              </View>

              <Pressable
                accessibilityLabel="Notifications"
                accessibilityRole="button"
                className="ml-5 h-10 w-10 items-center justify-center"
                style={({ pressed }) => pressed && styles.pressed}
              >
                <SymbolView
                  name={{
                    android: "notifications_none",
                    ios: "bell",
                    web: "notifications_none",
                  }}
                  size={30}
                  tintColor={colors.textPrimary}
                  weight="semibold"
                />
              </Pressable>
            </View>

            <View className="home__daily-card mt-6 flex-row items-center overflow-hidden px-6">
              <View className="flex-1 pr-4">
                <Text className="home__daily-label">Daily goal</Text>
                <Text className="home__daily-value mt-3">
                  {dashboardData.dailyGoal.earnedXp}
                  <Text className="home__daily-value-muted">
                    {" "}
                    / {dashboardData.dailyGoal.targetXp} XP
                  </Text>
                </Text>
                <View className="home__daily-progress-track mt-6 overflow-hidden">
                  <View
                    className="home__daily-progress-fill"
                    style={{ width: progressWidth }}
                  />
                </View>
              </View>

              <Image
                resizeMode="contain"
                source={images.treasure}
                style={styles.treasure}
              />
            </View>

            <View className="home__learning-card mt-7 overflow-hidden px-6 py-6">
              <View style={styles.learningGlow} />
              <View style={styles.learningHill} />

              <View className="relative z-10">
                <Text className="home__learning-label">
                  Continue learning
                </Text>
                <Text className="home__learning-title mt-4" numberOfLines={1}>
                  {dashboardData.language.name}
                </Text>
                <Text className="home__learning-unit mt-1">
                  {dashboardData.unitLabel}
                </Text>

                <Pressable
                  accessibilityRole="button"
                  className="home__continue-button mt-5 items-center justify-center"
                  onPress={() => {
                    if (dashboardData.currentLesson) {
                      router.push(`/lesson/${dashboardData.currentLesson.id}`);
                    }
                  }}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <Text className="home__continue-label">Continue</Text>
                </Pressable>
              </View>

              <Image
                resizeMode="contain"
                source={images.palace}
                style={styles.palace}
              />
            </View>

            <View className="mt-8 flex-row items-center justify-between">
              <Text className="home__section-title">{"Today's plan"}</Text>
              <Pressable
                accessibilityRole="button"
                hitSlop={10}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Text className="home__section-link">View all</Text>
              </Pressable>
            </View>

            <View className="mt-5 gap-4">
              {dashboardData.todayPlan.length > 0 ? (
                dashboardData.todayPlan.map((item) => (
                  <TodayPlanRow item={item} key={item.id} />
                ))
              ) : (
                <View className="home__empty-plan items-center justify-center px-5">
                  <Text className="home__empty-title text-center">
                    Lessons coming soon
                  </Text>
                  <Text className="home__empty-subtitle mt-2 text-center">
                    We are preparing your first {dashboardData.language.name} plan.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TodayPlanRow({ item }: { item: HomePlanItem }) {
  const icon = planIconByKind[item.kind];

  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center"
      style={({ pressed }) => pressed && styles.pressed}
    >
      <View
        className="items-center justify-center rounded-xl"
        style={[styles.planIcon, { backgroundColor: icon.backgroundColor }]}
      >
        <SymbolView
          name={icon.name}
          size={27}
          tintColor="#FFFFFF"
          weight="bold"
        />
      </View>

      <View className="ml-5 flex-1">
        <Text className="home__plan-title" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="home__plan-subtitle mt-1" numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>

      {item.completed ? (
        <View className="home__plan-check items-center justify-center rounded-full">
          <SymbolView
            name={{ android: "check", ios: "checkmark", web: "check" }}
            size={21}
            tintColor="#FFFFFF"
            weight="bold"
          />
        </View>
      ) : (
        <View className="home__plan-empty rounded-full" />
      )}
    </Pressable>
  );
}

function getGreeting(beginnerGreeting: string, userName: string) {
  const greeting = beginnerGreeting.replace(/[!]+$/, "");

  return `${greeting}, ${userName}!`;
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    minWidth: "100%",
    paddingBottom: 24,
    width: "100%",
  },
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  header: {
    height: 48,
  },
  flagBubble: {
    borderColor: "#F0F2F7",
    borderWidth: 1,
    height: 42,
    width: 42,
  },
  streakIcon: {
    height: 34,
    width: 34,
  },
  treasure: {
    height: 102,
    width: 102,
  },
  learningGlow: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 80,
    height: 160,
    position: "absolute",
    right: -24,
    top: -34,
    width: 160,
  },
  learningHill: {
    backgroundColor: "rgba(39, 30, 151, 0.22)",
    borderTopLeftRadius: 92,
    height: 104,
    left: 188,
    position: "absolute",
    top: 74,
    transform: [{ rotate: "-12deg" }],
    width: 180,
  },
  palace: {
    bottom: -13,
    height: 164,
    position: "absolute",
    right: -7,
    width: 164,
  },
  planIcon: {
    height: 52,
    width: 52,
  },
  pressed: {
    opacity: 0.78,
  },
});
