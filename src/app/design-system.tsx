import { Link, Redirect } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { APP_NAME } from "@/constants/brand";
import { images } from "@/constants/images";
import { colors, typography } from "@/theme";

type Swatch = {
  name: string;
  hex: string;
  colorClassName: string;
  hasBorder?: boolean;
};

type TypeRow = {
  label: string;
  role: string;
  size: string;
  weight: string;
  lineHeight: string;
  className: string;
};

const primarySwatches: Swatch[] = [
  {
    name: "LINGUA PURPLE",
    hex: colors.linguaPurple,
    colorClassName: "bg-lingua-purple",
  },
  {
    name: "LINGUA DEEP PURPLE",
    hex: colors.linguaDeepPurple,
    colorClassName: "bg-lingua-deep-purple",
  },
  {
    name: "LINGUA BLUE",
    hex: colors.linguaBlue,
    colorClassName: "bg-lingua-blue",
  },
  {
    name: "LINGUA GREEN",
    hex: colors.linguaGreen,
    colorClassName: "bg-lingua-green",
  },
];

const semanticSwatches: Swatch[] = [
  { name: "SUCCESS", hex: colors.success, colorClassName: "bg-success" },
  { name: "WARNING", hex: colors.warning, colorClassName: "bg-warning" },
  { name: "STREAK", hex: colors.streak, colorClassName: "bg-streak" },
  { name: "ERROR", hex: colors.error, colorClassName: "bg-error" },
  { name: "INFO", hex: colors.info, colorClassName: "bg-info" },
];

const neutralSwatches: Swatch[] = [
  {
    name: "TEXT / PRIMARY",
    hex: colors.textPrimary,
    colorClassName: "bg-text-primary",
  },
  {
    name: "TEXT / SECONDARY",
    hex: colors.textSecondary,
    colorClassName: "bg-text-secondary",
  },
  { name: "BORDER", hex: colors.border, colorClassName: "bg-border" },
  { name: "SURFACE", hex: colors.surface, colorClassName: "bg-surface" },
  {
    name: "BACKGROUND",
    hex: colors.background,
    colorClassName: "bg-background",
    hasBorder: true,
  },
];

const typographyRows: TypeRow[] = [
  {
    label: typography.h1.label,
    role: typography.h1.usage,
    size: "32px",
    weight: "Bold",
    lineHeight: "1.2",
    className: "type__h1",
  },
  {
    label: typography.h2.label,
    role: typography.h2.usage,
    size: "24px",
    weight: "SemiBold",
    lineHeight: "1.3",
    className: "type__h2",
  },
  {
    label: typography.h3.label,
    role: typography.h3.usage,
    size: "20px",
    weight: "SemiBold",
    lineHeight: "1.3",
    className: "type__h3",
  },
  {
    label: typography.h4.label,
    role: typography.h4.usage,
    size: "16px",
    weight: "Medium",
    lineHeight: "1.4",
    className: "type__h4",
  },
  {
    label: typography.bodyLarge.label,
    role: typography.bodyLarge.usage,
    size: "16px",
    weight: "Regular",
    lineHeight: "1.6",
    className: "type__body-large text-text-primary",
  },
  {
    label: typography.bodyMedium.label,
    role: typography.bodyMedium.usage,
    size: "14px",
    weight: "Regular",
    lineHeight: "1.6",
    className: "type__body-medium text-text-primary",
  },
  {
    label: typography.bodySmall.label,
    role: typography.bodySmall.usage,
    size: "13px",
    weight: "Regular",
    lineHeight: "1.6",
    className: "type__body-small text-text-primary",
  },
  {
    label: typography.caption.label,
    role: typography.caption.usage,
    size: "11px",
    weight: "Regular",
    lineHeight: "1.4",
    className: "type__caption",
  },
];

export default function Index() {
  if (!__DEV__) {
    return <Redirect href="/" />;
  }

  return (
    <ScrollView
      className="surface__screen flex-1"
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-4 2xl:flex-row">
        <View className="gap-4 2xl:flex-1">
          <View className="ds-panel gap-4 px-5 py-6 md:px-8">
            <View className="ds-section__header">
              <Text className="type__eyebrow">Screens</Text>
            </View>

            <Link href="/onboarding" asChild>
              <Pressable className="h-16 flex-row items-center justify-between rounded-2xl bg-lingua-deep-purple px-5">
                <Text className="font-poppins-semibold text-[18px] leading-6 text-white">
                  Open onboarding
                </Text>
                <SymbolView
                  name={{
                    android: "chevron_right",
                    ios: "chevron.right",
                    web: "chevron_right",
                  }}
                  size={24}
                  tintColor="#FFFFFF"
                />
              </Pressable>
            </Link>
          </View>

          <View className="ds-panel px-5 py-6 md:px-8">
            <View className="ds-section__header">
              <Text className="type__eyebrow">Brand</Text>
            </View>

            <View className="min-h-40 flex-row flex-wrap items-center justify-center gap-6 py-8">
              <Image
                resizeMode="contain"
                source={images.mascotLogo}
                style={styles.brandLogo}
              />
              <Text className="brand__wordmark">{APP_NAME}</Text>
            </View>
          </View>

          <View className="ds-panel gap-8 px-5 py-6 md:px-8">
            <View className="ds-section__header">
              <Text className="type__eyebrow">Colors</Text>
            </View>

            <SwatchSection
              columnsClassName="gap-x-10 gap-y-7"
              swatches={primarySwatches}
              title="Primary"
              variant="large"
            />

            <SwatchSection
              columnsClassName="gap-x-0 gap-y-7"
              swatches={semanticSwatches}
              title="Semantic"
              variant="medium"
            />

            <SwatchSection
              columnsClassName="gap-x-0 gap-y-7"
              swatches={neutralSwatches}
              title="Neutrals"
              variant="medium"
            />
          </View>
        </View>

        <View className="ds-panel gap-7 px-5 py-6 md:px-8 2xl:flex-1">
          <View className="ds-section__header">
            <Text className="type__eyebrow">Typography</Text>
          </View>

          <View className="gap-3">
            <Text className="type__label">Font Family</Text>
            <Text className="font-poppins-bold text-[58px] leading-[64px] text-text-primary">
              Poppins
            </Text>
            <Text className="type__body-large text-text-secondary">
              Poppins is a modern, geometric sans-serif typeface that provides
              excellent readability and a friendly personality.
            </Text>
          </View>

          <View className="gap-5">
            {typographyRows.map((row) => (
              <TypographyRow key={row.label} row={row} />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function SwatchSection({
  columnsClassName,
  swatches,
  title,
  variant,
}: {
  columnsClassName: string;
  swatches: Swatch[];
  title: string;
  variant: "large" | "medium";
}) {
  return (
    <View className="gap-4">
      <Text className="type__label">{title}</Text>
      <View className={`flex-row flex-wrap ${columnsClassName}`}>
        {swatches.map((swatch) => (
          <ColorSwatch key={swatch.name} swatch={swatch} variant={variant} />
        ))}
      </View>
    </View>
  );
}

function ColorSwatch({
  swatch,
  variant,
}: {
  swatch: Swatch;
  variant: "large" | "medium";
}) {
  const sizeClassName =
    variant === "large" ? "swatch__chip--large" : "swatch__chip--medium";
  const wrapperClassName = "w-32";
  const borderClassName = swatch.hasBorder ? "border border-border" : "";

  return (
    <View className={`${wrapperClassName} gap-2`}>
      <View
        className={`${sizeClassName} ${swatch.colorClassName} ${borderClassName}`}
      />
      <View>
        <Text className="type__label leading-[16px]">{swatch.name}</Text>
        <Text className="type__body-small">{swatch.hex}</Text>
      </View>
    </View>
  );
}

function TypographyRow({ row }: { row: TypeRow }) {
  return (
    <View className="flex-row items-center gap-4 py-1">
      <Text className={`${row.className} w-28 shrink-0`}>{row.label}</Text>
      <View className="flex-1 gap-1">
        <Text className="type__body-medium text-text-secondary">
          {row.role}
        </Text>
        <View className="flex-row flex-wrap gap-x-5 gap-y-1">
          <Text className="type__body-small">{row.size}</Text>
          <Text className="type__body-small">{row.weight}</Text>
          <Text className="type__body-small">{row.lineHeight}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brandLogo: {
    height: 112,
    width: 112,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
});
