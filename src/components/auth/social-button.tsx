import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { images } from "@/constants/images";
import type { SocialProvider } from "@/lib/clerk";

type SocialButtonProps = {
  iconSize: number;
  isDisabled: boolean;
  isLoading: boolean;
  onPress: () => void;
  provider: SocialProvider;
  socialButtonHeight: number;
};

export function SocialButton({
  iconSize,
  isDisabled,
  isLoading,
  onPress,
  provider,
  socialButtonHeight,
}: SocialButtonProps) {
  return (
    <Pressable
      className="auth__social-button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.socialButtonShadow,
        { height: socialButtonHeight },
        isDisabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <View className="flex-row items-center" style={styles.socialButtonContent}>
        <SocialIcon iconSize={iconSize} provider={provider} />
        <Text className="auth__social-button-label">
          {isLoading ? "Opening..." : `Continue with ${provider.label}`}
        </Text>
      </View>
    </Pressable>
  );
}

type SocialIconProps = {
  iconSize: number;
  provider: SocialProvider;
};

function SocialIcon({ iconSize, provider }: SocialIconProps) {
  const iconStyle = { height: iconSize, width: iconSize };

  if (provider.icon === "Facebook") {
    return <Image resizeMode="contain" source={images.socialFacebook} style={iconStyle} />;
  }

  if (provider.icon === "Apple") {
    return <Image resizeMode="contain" source={images.socialApple} style={iconStyle} />;
  }

  return <Image resizeMode="contain" source={images.socialGoogle} style={iconStyle} />;
}

const styles = StyleSheet.create({
  socialButtonShadow: {
    boxShadow: "0px 7px 18px rgba(13, 19, 43, 0.035)",
  },
  socialButtonContent: {
    gap: 28,
    height: "100%",
    paddingLeft: 56,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.72,
  },
});
