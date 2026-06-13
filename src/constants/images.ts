import type { ImageSourcePropType } from "react-native";

export const images = {
  mascotAuth: require("../../assets/images/mascot-auth.png") as ImageSourcePropType,
  mascotLogo: require("../../assets/images/mascot-logo.png") as ImageSourcePropType,
  mascotWelcome: require("../../assets/images/mascot-welcome.png") as ImageSourcePropType,
  socialApple: require("../../assets/images/social-apple.png") as ImageSourcePropType,
  socialFacebook: require("../../assets/images/social-facebook.png") as ImageSourcePropType,
  socialGoogle: require("../../assets/images/social-google.png") as ImageSourcePropType,
} as const;
