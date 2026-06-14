import { Platform } from "react-native";

export type AuthMode = "sign-up" | "sign-in";

export type SocialProvider = {
  icon: "Google" | "Facebook" | "Apple";
  label: string;
  strategy: "oauth_google" | "oauth_facebook" | "oauth_apple";
};

export type VerificationFlow = "sign-up" | "sign-in-email-code";

export const SOCIAL_PROVIDERS: SocialProvider[] = [
  { icon: "Google", label: "Google", strategy: "oauth_google" },
  { icon: "Facebook", label: "Facebook", strategy: "oauth_facebook" },
  { icon: "Apple", label: "Apple", strategy: "oauth_apple" },
];

export function getClerkErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }

    if (
      "errors" in error &&
      Array.isArray(error.errors) &&
      error.errors[0] &&
      typeof error.errors[0] === "object" &&
      "message" in error.errors[0] &&
      typeof error.errors[0].message === "string"
    ) {
      return error.errors[0].message;
    }
  }

  return fallback;
}

export function canUseNativeGoogleSignIn(): boolean {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return false;
  }

  if (!process.env.EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID) {
    return false;
  }

  if (Platform.OS === "ios") {
    return Boolean(process.env.EXPO_PUBLIC_CLERK_GOOGLE_IOS_CLIENT_ID);
  }

  return true;
}
