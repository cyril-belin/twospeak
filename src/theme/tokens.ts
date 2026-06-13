export const colors = {
  linguaPurple: "#6C4EF5",
  linguaDeepPurple: "#5B3BF6",
  linguaBlue: "#4D8BFF",
  linguaGreen: "#21C16B",
  success: "#21C16B",
  warning: "#FFC800",
  streak: "#FF8A00",
  error: "#FF4D4F",
  info: "#4D8BFF",
  textPrimary: "#0D132B",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  surface: "#F6F7FB",
  background: "#FFFFFF",
} as const;

export const fontFamilies = {
  regular: "Poppins-Regular",
  medium: "Poppins-Medium",
  semiBold: "Poppins-SemiBold",
  bold: "Poppins-Bold",
} as const;

export const typography = {
  h1: {
    label: "H1",
    usage: "Page / Screen Title",
    fontSize: 32,
    lineHeight: 38.4,
    fontFamily: fontFamilies.bold,
  },
  h2: {
    label: "H2",
    usage: "Section Title",
    fontSize: 24,
    lineHeight: 31.2,
    fontFamily: fontFamilies.semiBold,
  },
  h3: {
    label: "H3",
    usage: "Card / Module Title",
    fontSize: 20,
    lineHeight: 26,
    fontFamily: fontFamilies.semiBold,
  },
  h4: {
    label: "H4",
    usage: "Subheading",
    fontSize: 16,
    lineHeight: 22.4,
    fontFamily: fontFamilies.medium,
  },
  bodyLarge: {
    label: "Body Large",
    usage: "Important content",
    fontSize: 16,
    lineHeight: 25.6,
    fontFamily: fontFamilies.regular,
  },
  bodyMedium: {
    label: "Body Medium",
    usage: "Body text",
    fontSize: 14,
    lineHeight: 22.4,
    fontFamily: fontFamilies.regular,
  },
  bodySmall: {
    label: "Body Small",
    usage: "Supporting text",
    fontSize: 13,
    lineHeight: 20.8,
    fontFamily: fontFamilies.regular,
  },
  caption: {
    label: "Caption",
    usage: "Labels, meta text",
    fontSize: 11,
    lineHeight: 15.4,
    fontFamily: fontFamilies.regular,
  },
} as const;

export const radius = {
  card: 18,
  panel: 22,
  swatch: 10,
  button: 16,
} as const;

export const shadows = {
  card: "0px 8px 24px rgba(13, 19, 43, 0.05)",
} as const;
