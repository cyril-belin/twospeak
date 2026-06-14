import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { SymbolView } from "expo-symbols";
import { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme";

const tabItems = [
  {
    label: "Home",
    name: "index",
    icon: { android: "home", ios: "house", web: "home" },
    activeIcon: { android: "home", ios: "house.fill", web: "home" },
  },
  {
    label: "Learn",
    name: "learn",
    icon: { android: "menu_book", ios: "book", web: "menu_book" },
    activeIcon: { android: "menu_book", ios: "book.fill", web: "menu_book" },
  },
  {
    label: "AI Teacher",
    name: "ai-teacher",
    icon: {
      android: "person_raised_hand",
      ios: "person.wave.2",
      web: "person_raised_hand",
    },
    activeIcon: {
      android: "person_raised_hand",
      ios: "person.wave.2.fill",
      web: "person_raised_hand",
    },
  },
  {
    label: "Chat",
    name: "chat",
    icon: { android: "chat_bubble", ios: "bubble.left", web: "chat_bubble" },
    activeIcon: {
      android: "chat_bubble",
      ios: "bubble.left.fill",
      web: "chat_bubble",
    },
  },
  {
    label: "Profile",
    name: "profile",
    icon: { android: "person", ios: "person", web: "person" },
    activeIcon: { android: "person", ios: "person.fill", web: "person" },
  },
] as const;

const horizontalPadding = 8;
const maxBarWidth = 430;

type TabRouteName = (typeof tabItems)[number]["name"];

function getTabItem(routeName: string) {
  return tabItems.find((item) => item.name === routeName);
}

export function CustomTabBar({
  descriptors,
  navigation,
  state,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const barWidth = Math.min(width, maxBarWidth);
  const itemWidth = (barWidth - horizontalPadding * 2) / tabItems.length;

  const visibleRoutes = useMemo(
    () =>
      state.routes.filter((route) => getTabItem(route.name) !== undefined),
    [state.routes],
  );
  const activeRoute = state.routes[state.index];

  return (
    <View className="bg-background">
      <View
        style={[
          styles.bar,
          {
            height: 74 + Math.max(insets.bottom, 12),
            paddingBottom: Math.max(insets.bottom, 12),
            width: barWidth,
          },
        ]}
      >
        <View className="flex-1 flex-row items-center">
          {visibleRoutes.map((route) => {
            const tabItem = getTabItem(route.name);

            if (!tabItem) {
              return null;
            }

            const descriptor = descriptors[route.key];
            const isFocused = route.key === activeRoute?.key;
            const options = descriptor.options;
            const accessibilityLabel =
              options.tabBarAccessibilityLabel ?? tabItem.label;

            function handlePress() {
              const event = navigation.emit({
                canPreventDefault: true,
                target: route.key,
                type: "tabPress",
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name as TabRouteName);
              }
            }

            function handleLongPress() {
              navigation.emit({
                target: route.key,
                type: "tabLongPress",
              });
            }

            return (
              <Pressable
                accessibilityLabel={accessibilityLabel}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                key={route.key}
                onLongPress={handleLongPress}
                onPress={handlePress}
                style={({ pressed }) => [
                  styles.tabButton,
                  { width: itemWidth },
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.iconSlot}>
                  <SymbolView
                    name={isFocused ? tabItem.activeIcon : tabItem.icon}
                    size={28}
                    tintColor={isFocused ? colors.linguaDeepPurple : "#7D849E"}
                    weight="semibold"
                  />
                </View>

                <Text
                  className={
                    isFocused
                      ? "tabs__label--active mt-1 text-center"
                      : "tabs__label mt-1 text-center"
                  }
                  numberOfLines={1}
                >
                  {tabItem.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignSelf: "center",
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    boxShadow: "0px -10px 26px rgba(13, 19, 43, 0.08)",
    paddingHorizontal: horizontalPadding,
    paddingTop: 12,
    position: "relative",
  },
  tabButton: {
    alignItems: "center",
    height: 62,
    justifyContent: "center",
    zIndex: 1,
  },
  iconSlot: {
    alignItems: "center",
    height: 31,
    justifyContent: "center",
    width: 44,
  },
  pressed: {
    opacity: 0.72,
  },
});
