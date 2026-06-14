import { useAuth } from "@clerk/expo";
import { Redirect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
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
import {
  defaultLanguageSelectionCode,
  getLanguageSelectionItems,
} from "@/data/language-selection";
import { useLanguageStore } from "@/store/language-store";
import { colors } from "@/theme";
import type { SupportedLanguageCode } from "@/types/learning";

const languageSelectionItems = getLanguageSelectionItems();

export default function LanguageSelectionScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const { height, width } = useWindowDimensions();
  const hasHydrated = useLanguageStore((state) => state.hasHydrated);
  const savedLanguageCode = useLanguageStore(
    (state) => state.selectedLanguageCode,
  );
  const setSavedLanguageCode = useLanguageStore(
    (state) => state.setSelectedLanguageCode,
  );
  const [draftLanguageCode, setDraftLanguageCode] =
    useState<SupportedLanguageCode | null>(null);
  const selectedLanguageCode =
    draftLanguageCode ?? savedLanguageCode ?? defaultLanguageSelectionCode;
  const contentWidth = Math.min(Math.max(width - 48, 300), 354);

  function handleConfirmPress() {
    setSavedLanguageCode(selectedLanguageCode);
    router.replace("/");
  }

  if (!isLoaded || !hasHydrated) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
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
          style={[styles.screen, { minHeight: Math.max(height - 46, 780) }]}
        >
          <View style={{ width: contentWidth }}>
            <View className="h-12 flex-row items-center justify-center">
              <Pressable
                accessibilityLabel="Go back"
                className="absolute left-0 h-10 w-10 items-start justify-center"
                onPress={() => router.back()}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <SymbolView
                  name={{
                    android: "arrow_back_ios_new",
                    ios: "chevron.left",
                    web: "chevron_left",
                  }}
                  size={29}
                  tintColor="#0D132B"
                />
              </Pressable>

              <Text className="language__title">Choose a language</Text>
            </View>

            <View className="language__search mt-6 flex-row items-center px-5">
              <SymbolView
                name={{
                  android: "search",
                  ios: "magnifyingglass",
                  web: "search",
                }}
                size={25}
                tintColor="#5F6886"
              />
              <Text className="language__search-text ml-4">
                Search languages
              </Text>
            </View>

            <Text className="language__section-title mt-7">Popular</Text>

            <View className="mt-4 gap-2">
              {languageSelectionItems.map((language) => {
                const isSelected = language.code === selectedLanguageCode;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    className="language__card flex-row items-center"
                    key={language.code}
                    onPress={() => setDraftLanguageCode(language.code)}
                    style={({ pressed }) => [
                      styles.languageCard,
                      isSelected && styles.selectedLanguageCard,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View
                      className="items-center justify-center rounded-full bg-white"
                      style={styles.flagBubble}
                    >
                      <Text className="language__flag">
                        {language.flagEmoji}
                      </Text>
                    </View>

                    <View className="ml-5 flex-1">
                      <Text className="language__card-title">
                        {language.name}
                      </Text>
                      <Text className="language__card-subtitle mt-1">
                        {language.learnerCountLabel}
                      </Text>
                    </View>

                    <View className="ml-4 h-10 w-10 items-center justify-center">
                      {isSelected ? (
                        <View className="language__check h-8 w-8 items-center justify-center rounded-full">
                          <SymbolView
                            name={{
                              android: "check",
                              ios: "checkmark",
                              web: "check",
                            }}
                            size={21}
                            tintColor="#FFFFFF"
                          />
                        </View>
                      ) : (
                        <SymbolView
                          name={{
                            android: "chevron_right",
                            ios: "chevron.right",
                            web: "chevron_right",
                          }}
                          size={25}
                          tintColor="#64708D"
                        />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              accessibilityRole="button"
              className="language__confirm-button mt-6 items-center justify-center"
              onPress={handleConfirmPress}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text className="language__confirm-label">Continue</Text>
            </Pressable>
          </View>

          <View
            className="mt-auto items-center justify-end overflow-hidden"
            style={[styles.earthStage, { width, marginHorizontal: -24 }]}
          >
            <Image
              resizeMode="contain"
              source={images.earthCropped}
              style={{ height: width * 0.62, width }}
            />
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
    width: "100%",
  },
  screen: {
    flex: 1,
    paddingBottom: 0,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  languageCard: {
    minHeight: 72,
  },
  selectedLanguageCard: {
    backgroundColor: "#FBFAFF",
    borderColor: "#8A63FF",
    borderWidth: 2,
  },
  flagBubble: {
    borderColor: "#EEF0F5",
    borderWidth: 1,
    height: 46,
    width: 46,
  },
  earthStage: {
    width: "100%",
  },
  pressed: {
    opacity: 0.82,
  },
});
