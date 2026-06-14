import { useAuth } from "@clerk/expo";
import { Redirect, Tabs } from "expo-router";

import { CustomTabBar } from "@/components/navigation/custom-tab-bar";
import { useLanguageStore } from "@/store/language-store";
import { useProgressStore } from "@/store/progress-store";

export default function TabsLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const hasHydrated = useLanguageStore((state) => state.hasHydrated);
  const progressHasHydrated = useProgressStore((state) => state.hasHydrated);
  const selectedLanguageCode = useLanguageStore(
    (state) => state.selectedLanguageCode,
  );

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  if (!hasHydrated || !progressHasHydrated) {
    return null;
  }

  if (!selectedLanguageCode) {
    return <Redirect href="/language-selection" />;
  }

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="learn" options={{ title: "Learn" }} />
      <Tabs.Screen
        name="lesson/[lessonId]"
        options={{ href: null, title: "AI Teacher" }}
      />
      <Tabs.Screen name="ai-teacher" options={{ title: "AI Teacher" }} />
      <Tabs.Screen name="chat" options={{ title: "Chat" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
