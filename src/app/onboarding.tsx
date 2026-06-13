import { Link } from "expo-router";
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
import { colors } from "@/theme";

export default function OnboardingScreen() {
  const { height, width } = useWindowDimensions();
  const contentWidth = Math.min(Math.max(width - 56, 300), 350);
  const screenMinHeight = Math.max(height, 820);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ ...styles.screen, minHeight: screenMinHeight }}>
          <View>
            <View className="flex-row items-center justify-center gap-3">
              <Image
                resizeMode="contain"
                source={images.mascotLogo}
                style={styles.logo}
              />
              <Text className="onboarding__wordmark">lingua</Text>
            </View>

            <View
              className="mt-10 items-start"
              style={{ width: contentWidth }}
            >
              <Text className="onboarding__headline w-full text-left">
                Your AI language
              </Text>
              <Text className="onboarding__headline w-full text-left text-lingua-deep-purple">
                teacher.
              </Text>
              <Text className="onboarding__body mt-5 w-full text-left">
                Real conversations, personalized lessons, anytime, anywhere.
              </Text>
            </View>

            <View
              className="relative mt-8"
              style={[styles.artStage, { width: contentWidth }]}
            >
              <View style={styles.helloBubble}>
                <View
                  className="onboarding__bubble bg-white px-7 py-4"
                  style={styles.bubbleShadow}
                >
                  <Text className="onboarding__bubble-text text-[#10131F]">
                    Hello!
                  </Text>
                  <View
                    className="absolute h-5 w-5 bg-white"
                    style={styles.helloTail}
                  />
                </View>
              </View>

              <View style={styles.holaBubble}>
                <View
                  className="onboarding__bubble bg-white px-7 py-4"
                  style={styles.bubbleShadow}
                >
                  <Text className="onboarding__bubble-text font-poppins-semibold text-[#121729]">
                    ¡Hola!
                  </Text>
                  <View
                    className="absolute h-5 w-5 bg-white"
                    style={styles.holaTail}
                  />
                </View>
              </View>

              <View style={styles.nihaoBubble}>
                <View
                  className="onboarding__bubble bg-white px-7 py-4"
                  style={styles.bubbleShadow}
                >
                  <Text className="onboarding__bubble-text text-[#FF3D2F]">
                    你好!
                  </Text>
                  <View
                    className="absolute h-5 w-5 bg-white"
                    style={styles.nihaoTail}
                  />
                </View>
              </View>

              <View className="absolute left-0 right-0 items-center" style={styles.mascotWrap}>
                <Image
                  resizeMode="contain"
                  source={images.mascotWelcome}
                  style={styles.mascot}
                />
              </View>
            </View>
          </View>

          <Link href="/" asChild>
            <Pressable
              className="onboarding__primary-button flex-row items-center justify-center"
              style={{ width: contentWidth }}
            >
              <Text className="onboarding__primary-button-label">
                Get Started
              </Text>
              <View className="absolute right-8">
                <SymbolView
                  name={{
                    android: "chevron_right",
                    ios: "chevron.right",
                    web: "chevron_right",
                  }}
                  size={28}
                  tintColor="#FFFFFF"
                />
              </View>
            </Pressable>
          </Link>
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
    width: "100%",
  },
  screen: {
    alignSelf: "stretch",
    flex: 1,
    paddingBottom: 36,
    paddingHorizontal: 28,
    paddingTop: 74,
    justifyContent: "space-between",
  },
  logo: {
    height: 44,
    width: 44,
  },
  artStage: {
    alignSelf: "stretch",
    height: 370,
  },
  helloBubble: {
    left: 0,
    position: "absolute",
    top: 196,
    zIndex: 2,
  },
  holaBubble: {
    position: "absolute",
    right: 0,
    top: 18,
    zIndex: 2,
  },
  nihaoBubble: {
    position: "absolute",
    right: 0,
    top: 288,
    zIndex: 2,
  },
  mascotWrap: {
    top: -36,
    zIndex: 1,
  },
  mascot: {
    height: 430,
    width: 430,
  },
  bubbleShadow: {
    boxShadow: "0px 10px 26px rgba(13, 19, 43, 0.08)",
  },
  helloTail: {
    bottom: -8,
    right: 24,
    transform: [{ rotate: "22deg" }],
  },
  holaTail: {
    bottom: -8,
    left: 24,
    transform: [{ rotate: "22deg" }],
  },
  nihaoTail: {
    bottom: -8,
    left: 22,
    transform: [{ rotate: "22deg" }],
  },
});
