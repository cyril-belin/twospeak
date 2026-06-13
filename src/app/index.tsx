import { useAuth, useClerk, useUser } from "@clerk/expo";
import { Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/theme";

export default function HomeScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View className="flex-1 justify-center px-8" style={styles.content}>
        <Text className="auth__title text-center">Welcome back</Text>
        <Text className="auth__subtitle mt-4 text-center">
          {user?.primaryEmailAddress?.emailAddress ?? "You're signed in."}
        </Text>

        <Pressable
          className="auth__primary-button mt-8 items-center justify-center"
          onPress={() => void signOut()}
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.pressed,
          ]}
        >
          <Text className="auth__primary-button-label" style={styles.signOutLabel}>
            Sign Out
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: 4,
  },
  signOutButton: {
    alignSelf: "center",
    borderRadius: 14,
    height: 46,
    paddingHorizontal: 28,
  },
  signOutLabel: {
    fontSize: 15,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.82,
  },
});
