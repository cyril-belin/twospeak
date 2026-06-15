import "../../global.css";

import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { StreamVideoSessionProvider } from "@/components/stream/stream-video-session-provider";
import { colors, poppinsFonts } from "@/theme";

void SplashScreen.preventAutoHideAsync();

const clerkPublishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!clerkPublishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add your Clerk Publishable Key to the project's environment.",
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(poppinsFonts);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ClerkProvider
          publishableKey={clerkPublishableKey}
          tokenCache={tokenCache}
        >
          <StreamVideoSessionProvider>
            <Stack
              screenOptions={{
                contentStyle: { backgroundColor: colors.background },
                headerShown: false,
              }}
            />
          </StreamVideoSessionProvider>
        </ClerkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  function handleGoBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/");
  }

  return (
    <SafeAreaView style={styles.errorSafeArea}>
      <View style={styles.errorContent}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>
          {error.message || "An unexpected error occurred."}
        </Text>
        <View style={styles.errorButtons}>
          <Pressable
            onPress={retry}
            style={({ pressed }) => [styles.errorPrimaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.errorPrimaryLabel}>Try again</Text>
          </Pressable>
          <Pressable
            onPress={handleGoBack}
            style={({ pressed }) => [styles.errorSecondaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.errorSecondaryLabel}>Go back</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  errorSafeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  errorContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    color: colors.textPrimary,
    fontFamily: "Poppins-Bold",
    fontSize: 28,
    lineHeight: 36,
    textAlign: "center",
  },
  errorMessage: {
    color: "#737a95",
    fontFamily: "Poppins-Regular",
    fontSize: 15,
    lineHeight: 24,
    marginTop: 12,
    textAlign: "center",
  },
  errorButtons: {
    gap: 12,
    marginTop: 32,
    maxWidth: 320,
    width: "100%",
  },
  errorPrimaryButton: {
    alignItems: "center",
    backgroundColor: colors.linguaDeepPurple,
    borderRadius: 16,
    height: 56,
    justifyContent: "center",
  },
  errorPrimaryLabel: {
    color: "#ffffff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 17,
    lineHeight: 24,
  },
  errorSecondaryButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
  },
  errorSecondaryLabel: {
    color: colors.textPrimary,
    fontFamily: "Poppins-SemiBold",
    fontSize: 17,
    lineHeight: 24,
  },
  pressed: {
    opacity: 0.72,
  },
});
