import { useSignIn, useSignUp, useSSO } from "@clerk/expo";
import { useSignInWithApple } from "@clerk/expo/apple";
import { useSignInWithGoogle } from "@clerk/expo/google";
import * as AuthSession from "expo-auth-session";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Image,
    Keyboard,
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
import {
    canUseNativeGoogleSignIn,
    getClerkErrorMessage,
    SOCIAL_PROVIDERS,
    type AuthMode,
    type SocialProvider,
    type VerificationFlow,
} from "@/lib/clerk";
import { colors } from "@/theme";

import { SocialButton } from "./social-button";
import { VerificationModal } from "./verification-modal";

WebBrowser.maybeCompleteAuthSession();

type AuthScreenProps = {
  mode: AuthMode;
};

export function AuthScreen({ mode }: AuthScreenProps) {
  const { fetchStatus: signInFetchStatus, signIn } = useSignIn();
  const { fetchStatus: signUpFetchStatus, signUp } = useSignUp();
  const { startSSOFlow } = useSSO();
  const { startAppleAuthenticationFlow } = useSignInWithApple();
  const { startGoogleAuthenticationFlow } = useSignInWithGoogle();
  const { height, width } = useWindowDimensions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isVerificationVisible, setIsVerificationVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationFlow, setVerificationFlow] =
    useState<VerificationFlow>("sign-up");
  const [submittingSocialStrategy, setSubmittingSocialStrategy] =
    useState<SocialProvider["strategy"] | null>(null);
  const codeInputRef = useRef<TextInput>(null);

  const isSignUp = mode === "sign-up";
  const isSubmitting =
    signInFetchStatus === "fetching" ||
    signUpFetchStatus === "fetching" ||
    submittingSocialStrategy !== null;
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

  function openVerificationModal(flow: VerificationFlow) {
    setVerificationCode("");
    setVerificationFlow(flow);
    setIsVerificationVisible(true);
  }

  function showAuthError(message: string) {
    Alert.alert("Authentication error", message);
  }

  function handleAuthSuccess() {
    setIsVerificationVisible(false);
    Keyboard.dismiss();
    router.replace("/");
  }

  async function finalizeSignUp() {
    const { error } = await signUp.finalize();

    if (error) {
      showAuthError(getClerkErrorMessage(error, "Unable to finish sign up."));
      return;
    }

    handleAuthSuccess();
  }

  async function finalizeSignIn() {
    const { error } = await signIn.finalize();

    if (error) {
      showAuthError(getClerkErrorMessage(error, "Unable to finish sign in."));
      return;
    }

    handleAuthSuccess();
  }

  async function handleEmailAuthPress() {
    const emailAddress = email.trim();

    if (!emailAddress || !password) {
      showAuthError("Enter your email and password to continue.");
      return;
    }

    if (isSignUp) {
      const { error } = await signUp.password({ emailAddress, password });

      if (error) {
        showAuthError(getClerkErrorMessage(error, "Unable to sign up."));
        return;
      }

      if (signUp.status === "complete") {
        await finalizeSignUp();
        return;
      }

      if (
        signUp.status === "missing_requirements" &&
        signUp.unverifiedFields.includes("email_address")
      ) {
        const { error: codeError } = await signUp.verifications.sendEmailCode();

        if (codeError) {
          showAuthError(
            getClerkErrorMessage(
              codeError,
              "Unable to send verification code.",
            ),
          );
          return;
        }

        openVerificationModal("sign-up");
        return;
      }

      showAuthError("Your sign up needs more information before it can finish.");
      return;
    }

    const { error } = await signIn.password({
      identifier: emailAddress,
      password,
    });

    if (error) {
      showAuthError(getClerkErrorMessage(error, "Unable to sign in."));
      return;
    }

    if (signIn.status === "complete") {
      await finalizeSignIn();
      return;
    }

    if (
      signIn.status === "needs_second_factor" ||
      signIn.status === "needs_client_trust"
    ) {
      const { error: codeError } = await signIn.mfa.sendEmailCode();

      if (codeError) {
        showAuthError(
          getClerkErrorMessage(
            codeError,
            "This account needs additional verification.",
          ),
        );
        return;
      }

      openVerificationModal("sign-in-email-code");
      return;
    }

    showAuthError("Your sign in needs another step before it can finish.");
  }

  async function handleSocialAuthPress(provider: SocialProvider) {
    setSubmittingSocialStrategy(provider.strategy);

    try {
      if (provider.strategy === "oauth_google" && canUseNativeGoogleSignIn()) {
        const { createdSessionId, setActive } =
          await startGoogleAuthenticationFlow();

        if (createdSessionId && setActive) {
          await setActive({ session: createdSessionId });
          handleAuthSuccess();
          return;
        }

        showAuthError(
          `${provider.label} sign in needs another step before it can finish.`,
        );
        return;
      }

      if (provider.strategy === "oauth_apple" && Platform.select({ ios: true, default: false })) {
        const { createdSessionId, setActive } =
          await startAppleAuthenticationFlow();

        if (createdSessionId && setActive) {
          await setActive({ session: createdSessionId });
          handleAuthSuccess();
          return;
        }

        showAuthError(
          `${provider.label} sign in needs another step before it can finish.`,
        );
        return;
      }

      await handleBrowserSocialAuth(provider);
    } catch (error) {
      showAuthError(
        getClerkErrorMessage(error, `Unable to continue with ${provider.label}.`),
      );
    } finally {
      setSubmittingSocialStrategy(null);
    }
  }

  async function handleBrowserSocialAuth(provider: SocialProvider) {
    const { createdSessionId, setActive } = await startSSOFlow({
      strategy: provider.strategy,
      redirectUrl: AuthSession.makeRedirectUri({
        path: "sso-callback",
        scheme: "twospeak",
      }),
    });

    if (createdSessionId && setActive) {
      await setActive({ session: createdSessionId });
      handleAuthSuccess();
      return;
    }

    showAuthError(
      `${provider.label} sign in needs another step before it can finish.`,
    );
  }

  async function handleVerificationSubmit(code = verificationCode) {
    if (code.length !== 6) {
      return;
    }

    if (verificationFlow === "sign-up") {
      const { error } = await signUp.verifications.verifyEmailCode({
        code,
      });

      if (error) {
        showAuthError(
          getClerkErrorMessage(error, "Unable to verify this code."),
        );
        return;
      }

      if (signUp.status === "complete") {
        await finalizeSignUp();
        return;
      }

      showAuthError("Your sign up needs more information before it can finish.");
      return;
    }

    const { error } = await signIn.mfa.verifyEmailCode({
      code,
    });

    if (error) {
      showAuthError(getClerkErrorMessage(error, "Unable to verify this code."));
      return;
    }

    if (signIn.status === "complete") {
      await finalizeSignIn();
      return;
    }

    showAuthError("Your sign in needs another step before it can finish.");
  }

  function handleVerificationCodeChange(value: string) {
    const nextCode = value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(nextCode);

    if (nextCode.length === 6) {
      void handleVerificationSubmit(nextCode);
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
              disabled={isSubmitting}
              onPress={() => void handleEmailAuthPress()}
              style={({ pressed }) => [
                styles.primaryButtonShadow,
                { height: primaryButtonHeight },
                isSubmitting && styles.disabled,
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
                  key={provider.strategy}
                  isDisabled={isSubmitting}
                  isLoading={submittingSocialStrategy === provider.strategy}
                  onPress={() => void handleSocialAuthPress(provider)}
                  provider={provider}
                  socialButtonHeight={socialButtonHeight}
                />
              ))}
            </View>

            {isSignUp && <View nativeID="clerk-captcha" />}
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
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.72,
  },
});
