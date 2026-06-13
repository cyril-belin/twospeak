import type { ImageSourcePropType } from "react-native";

export const images = {
  mascotLogo: require("../../assets/images/mascot-logo.png") as ImageSourcePropType,
  mascotWelcome: require("../../assets/images/mascot-welcome.png") as ImageSourcePropType,
} as const;
