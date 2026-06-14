import type { ImageSourcePropType } from "react-native";

const cafeLessonIds = new Set([
  "de-cafe-order",
  "es-cafe-order",
  "fr-cafe-order",
  "ja-cafe-order",
]);

export const images = {
  earth: require("../../assets/images/earth.png") as ImageSourcePropType,
  earthCropped: require("../../assets/images/earth-cropped.png") as ImageSourcePropType,
  lessonCafeBadge: require("../../assets/images/lesson-cafe-badge.png") as ImageSourcePropType,
  lessonCafeHero: require("../../assets/images/lesson-cafe-hero.png") as ImageSourcePropType,
  mascotAuth: require("../../assets/images/mascot-auth.png") as ImageSourcePropType,
  mascotLogo: require("../../assets/images/mascot-logo.png") as ImageSourcePropType,
  mascotWelcome: require("../../assets/images/mascot-welcome.png") as ImageSourcePropType,
  palace: require("../../assets/images/palace.png") as ImageSourcePropType,
  socialApple: require("../../assets/images/social-apple.png") as ImageSourcePropType,
  socialFacebook: require("../../assets/images/social-facebook.png") as ImageSourcePropType,
  socialGoogle: require("../../assets/images/social-google.png") as ImageSourcePropType,
  streakFire: require("../../assets/images/streak-fire.png") as ImageSourcePropType,
  treasure: require("../../assets/images/treasure.png") as ImageSourcePropType,
} as const;

export function getLessonCardImageSource(
  lessonId: string,
): ImageSourcePropType {
  if (cafeLessonIds.has(lessonId)) {
    return images.lessonCafeBadge;
  }

  return {
    uri: `https://picsum.photos/seed/twospeak-${lessonId}/120/120`,
  };
}

export function getLessonHeroImageSource(
  lessonId: string,
): ImageSourcePropType {
  if (cafeLessonIds.has(lessonId)) {
    return images.lessonCafeHero;
  }

  return {
    uri: `https://picsum.photos/seed/twospeak-${lessonId}-hero/546/285`,
  };
}
