import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import type { RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { colors } from "@/theme";

type AuthMode = "sign-up" | "sign-in";

type AuthScreenProps = {
  mode: AuthMode;
};

const SOCIAL_PROVIDERS = ["Google", "Facebook", "Apple"] as const;

export function AuthScreen({ mode }: AuthScreenProps) {
  const { height, width } = useWindowDimensions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isVerificationVisible, setIsVerificationVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const codeInputRef = useRef<TextInput>(null);

  const isSignUp = mode === "sign-up";
  const isCompactScreen = height < 900;
  const contentWidth = Math.min(Math.max(width - 56, 304), 340);
  const mascotSize = isCompactScreen ? 200 : 230;
  const mascotStageHeight = isCompactScreen ? 132 : 146;
  const screenMinHeight = Math.max(height, 680);
  const fieldHeight = isCompactScreen ? 66 : 80;
  const primaryButtonHeight = isCompactScreen ? 56 : 66;
  const socialButtonHeight = isCompactScreen ? 50 : 58;
  const socialIconSize = isCompactScreen ? 25 : 32;

  const copy = useMemo(
    () =>
      isSignUp
        ? {
            title: "Create your account",
            subtitle: "Start your language journey today ✨",
            button: "Sign Up",
            footer: "Already have an account?",
            footerAction: "Log in",
            footerHref: "/sign-in",
          }
        : {
            title: "Welcome back",
            subtitle: "Continue your language journey ✨",
            button: "Sign In",
            footer: "Don't have an account?",
            footerAction: "Sign up",
            footerHref: "/sign-up",
          },
    [isSignUp],
  );

  useEffect(() => {
    if (!isVerificationVisible) {
      return;
    }

    const focusTimer = setTimeout(() => {
      codeInputRef.current?.focus();
    }, 250);

    return () => clearTimeout(focusTimer);
  }, [isVerificationVisible]);

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/onboarding");
  }

  function openVerificationModal() {
    setVerificationCode("");
    setIsVerificationVisible(true);
  }

  function handleVerificationCodeChange(value: string) {
    const nextCode = value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(nextCode);

    if (nextCode.length === 6) {
      setIsVerificationVisible(false);
      Keyboard.dismiss();
      router.replace("/");
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          className="items-center"
          style={[
            styles.screen,
            {
              minHeight: screenMinHeight,
              paddingHorizontal: Math.max((width - contentWidth) / 2, 24),
            },
          ]}
        >
          <View className="w-full" style={{ maxWidth: contentWidth }}>
            <Pressable
              accessibilityLabel="Go back"
              className="h-12 w-12 items-start justify-center"
              hitSlop={12}
              onPress={handleBackPress}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <SymbolView
                name={{
                  android: "chevron_left",
                  ios: "chevron.left",
                  web: "chevron_left",
                }}
                size={31}
                tintColor={colors.textPrimary}
              />
            </Pressable>

            <View className="mt-7">
              <Text className="auth__title">{copy.title}</Text>
              <Text className="auth__subtitle mt-4">{copy.subtitle}</Text>
            </View>

            <View
              className="relative mt-2 items-center"
              style={[styles.mascotStage, { height: mascotStageHeight }]}
            >
              <Text className="auth__sparkle absolute left-[78px] top-[44px] text-[#FF8A00]">
                ✦
              </Text>
              <Text className="auth__sparkle absolute right-[74px] top-[44px] text-[#68A7FF]">
                ✦
              </Text>
              <Text className="auth__sparkle absolute right-[92px] top-[78px] text-[#FFD34E]">
                ✦
              </Text>
              <Image
                resizeMode="contain"
                source={images.mascotAuth}
                style={[styles.mascot, { height: mascotSize, width: mascotSize }]}
              />
            </View>

            <View className="mt-2 gap-3" style={styles.formStack}>
              <View
                className="auth__field justify-center px-6"
                style={[styles.fieldShadow, { height: fieldHeight }]}
              >
                <Text className="auth__field-label">Email</Text>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  inputMode="email"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="alex@gmail.com"
                  placeholderTextColor="#A2A8BC"
                  style={styles.fieldInput}
                  textContentType="emailAddress"
                  underlineColorAndroid="transparent"
                  value={email}
                />
              </View>

              <View
                className="auth__field flex-row items-center px-6"
                style={[styles.fieldShadow, { height: fieldHeight }]}
              >
                <View className="flex-1">
                  <Text className="auth__field-label">Password</Text>
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor="#A2A8BC"
                    secureTextEntry={!isPasswordVisible}
                    style={styles.fieldInput}
                    textContentType={isSignUp ? "newPassword" : "password"}
                    underlineColorAndroid="transparent"
                    value={password}
                  />
                </View>
                <Pressable
                  accessibilityLabel={
                    isPasswordVisible ? "Hide password" : "Show password"
                  }
                  className="h-11 w-11 items-end justify-center"
                  hitSlop={10}
                  onPress={() => setIsPasswordVisible((current) => !current)}
                  style={({ pressed }) => [pressed && styles.pressed]}
                >
                  <SymbolView
                    name={{
                      android: isPasswordVisible
                        ? "visibility_off"
                        : "visibility",
                      ios: isPasswordVisible ? "eye.slash" : "eye",
                      web: isPasswordVisible
                        ? "visibility_off"
                        : "visibility",
                    }}
                    size={29}
                    tintColor="#7D849F"
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              className="auth__primary-button mt-5 items-center justify-center"
              onPress={openVerificationModal}
              style={({ pressed }) => [
                styles.primaryButtonShadow,
                { height: primaryButtonHeight },
                pressed && styles.primaryButtonPressed,
              ]}
            >
              <Text className="auth__primary-button-label">{copy.button}</Text>
            </Pressable>

            <View className="mt-6 flex-row items-center gap-5">
              <View className="h-[1px] flex-1 bg-[#E8EAF2]" />
              <Text className="auth__divider-text">or continue with</Text>
              <View className="h-[1px] flex-1 bg-[#E8EAF2]" />
            </View>

            <View className="mt-3 gap-3">
              {SOCIAL_PROVIDERS.map((provider) => (
                <SocialButton
                  iconSize={socialIconSize}
                  key={provider}
                  provider={provider}
                  socialButtonHeight={socialButtonHeight}
                />
              ))}
            </View>
          </View>

          <View className="pb-1 pt-4">
            <Text className="auth__footer-text text-center">
              {copy.footer}{" "}
              <Link href={copy.footerHref} asChild>
                <Text className="auth__footer-link">{copy.footerAction}</Text>
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>

      <VerificationModal
        code={verificationCode}
        inputRef={codeInputRef}
        isVisible={isVerificationVisible}
        onChangeCode={handleVerificationCodeChange}
        onClose={() => setIsVerificationVisible(false)}
      />
    </SafeAreaView>
  );
}

type SocialButtonProps = {
  provider: (typeof SOCIAL_PROVIDERS)[number];
};

type SocialButtonComponentProps = SocialButtonProps & {
  iconSize: number;
  socialButtonHeight: number;
};

function SocialButton({
  iconSize,
  provider,
  socialButtonHeight,
}: SocialButtonComponentProps) {
  return (
    <Pressable
      className="auth__social-button"
      onPress={() => undefined}
      style={({ pressed }) => [
        styles.socialButtonShadow,
        { height: socialButtonHeight },
        pressed && styles.pressed,
      ]}
    >
      <View className="flex-row items-center" style={styles.socialButtonContent}>
        <SocialIcon iconSize={iconSize} provider={provider} />
        <Text className="auth__social-button-label">
          Continue with {provider}
        </Text>
      </View>
    </Pressable>
  );
}

type SocialIconProps = SocialButtonProps & {
  iconSize: number;
};

function SocialIcon({ iconSize, provider }: SocialIconProps) {
  const iconStyle = { height: iconSize, width: iconSize };

  if (provider === "Facebook") {
    return <Image resizeMode="contain" source={images.socialFacebook} style={iconStyle} />;
  }

  if (provider === "Apple") {
    return <Image resizeMode="contain" source={images.socialApple} style={iconStyle} />;
  }

  return <Image resizeMode="contain" source={images.socialGoogle} style={iconStyle} />;
}

type VerificationModalProps = {
  code: string;
  inputRef: RefObject<TextInput | null>;
  isVisible: boolean;
  onChangeCode: (value: string) => void;
  onClose: () => void;
};

function VerificationModal({
  code,
  inputRef,
  isVisible,
  onChangeCode,
  onClose,
}: VerificationModalProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={isVisible}
    >
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", default: "height" })}
        style={styles.modalKeyboardView}
      >
        <Pressable className="flex-1 justify-end" onPress={onClose}>
          <Pressable
            className="auth__modal-card mx-5 mb-5 px-6 pb-7 pt-6"
            onPress={() => inputRef.current?.focus()}
            style={styles.modalCardShadow}
          >
            <Text className="auth__modal-title">Check your email</Text>
            <Text className="auth__modal-body mt-3">
              We sent you a verification code. Enter the 6 digits to continue.
            </Text>

            <View className="mt-6 flex-row justify-between gap-2">
              {Array.from({ length: 6 }).map((_, index) => {
                const digit = code[index];

                return (
                  <View
                    className={`auth__code-box items-center justify-center ${
                      digit ? "border-lingua-deep-purple" : "border-[#E7EAF2]"
                    }`}
                    key={`verification-digit-${index}`}
                  >
                    <Text className="auth__code-digit">{digit ?? ""}</Text>
                  </View>
                );
              })}
            </View>

            <TextInput
              autoComplete="one-time-code"
              autoFocus
              caretHidden={false}
              inputMode="numeric"
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={onChangeCode}
              ref={inputRef}
              style={styles.hiddenCodeInput}
              textContentType="oneTimeCode"
              underlineColorAndroid="transparent"
              value={code}
            />
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minWidth: "100%",
    width: "100%",
  },
  screen: {
    alignSelf: "stretch",
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 22,
    paddingTop: 22,
  },
  mascotStage: {
    overflow: "visible",
    zIndex: 1,
  },
  mascot: {
    zIndex: 1,
  },
  fieldInput: {
    color: colors.textPrimary,
    fontFamily: "Poppins-Medium",
    fontSize: 18,
    lineHeight: 24,
    marginTop: 5,
    padding: 0,
  },
  formStack: {
    zIndex: 2,
  },
  fieldShadow: {
    boxShadow: "0px 6px 18px rgba(13, 19, 43, 0.03)",
  },
  primaryButtonShadow: {
    boxShadow: "0px 10px 20px rgba(91, 59, 246, 0.18)",
  },
  primaryButtonPressed: {
    opacity: 0.88,
    transform: [{ translateY: 1 }],
  },
  socialButtonShadow: {
    boxShadow: "0px 7px 18px rgba(13, 19, 43, 0.035)",
  },
  socialButtonContent: {
    gap: 28,
    height: "100%",
    paddingLeft: 56,
  },
  pressed: {
    opacity: 0.72,
  },
  modalKeyboardView: {
    backgroundColor: "rgba(8, 12, 31, 0.38)",
    flex: 1,
  },
  modalCardShadow: {
    boxShadow: "0px 18px 34px rgba(13, 19, 43, 0.18)",
  },
  hiddenCodeInput: {
    height: 1,
    opacity: 0,
    position: "absolute",
    width: 1,
  },
});
