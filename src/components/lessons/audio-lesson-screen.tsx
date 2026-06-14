import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import {
    Image,
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getLessonHeroImageSource, images } from "@/constants/images";
import type { AudioLessonScreenData } from "@/data/audio-lesson-screen";
import { colors } from "@/theme";

type AudioLessonScreenProps = {
  screenData: AudioLessonScreenData;
};

type SessionControl = {
  icon: SymbolViewProps["name"];
  label: string;
  tone: "neutral" | "danger";
};

const controls: SessionControl[] = [
  {
    icon: { android: "videocam", ios: "video.fill", web: "videocam" },
    label: "Camera",
    tone: "neutral",
  },
  {
    icon: { android: "mic", ios: "mic.fill", web: "mic" },
    label: "Mic",
    tone: "neutral",
  },
  {
    icon: { android: "translate", ios: "character.book.closed.fill", web: "translate" },
    label: "Subtitles",
    tone: "neutral",
  },
  {
    icon: { android: "call_end", ios: "phone.down.fill", web: "call_end" },
    label: "End Call",
    tone: "danger",
  },
];

export function AudioLessonScreen({ screenData }: AudioLessonScreenProps) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(Math.max(width - 28, 320), 430);
  const lessonPhrase = screenData.phrases[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View className="flex-1 items-center bg-background">
        <View style={[styles.screen, { width: contentWidth }]}>
          <View className="flex-row items-center" style={styles.header}>
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              hitSlop={10}
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
            >
              <SymbolView
                name={{
                  android: "arrow_back_ios_new",
                  ios: "chevron.left",
                  web: "chevron_left",
                }}
                size={31}
                tintColor={colors.textPrimary}
                weight="semibold"
              />
            </Pressable>

            <View className="flex-1" style={styles.titleBlock}>
              <Text className="audio-lesson__title" numberOfLines={1}>
                AI Teacher
              </Text>
              <View className="mt-1 flex-row items-center">
                <View style={styles.onlineDot} />
                <Text className="audio-lesson__status ml-2" numberOfLines={1}>
                  {screenData.sessionStatus}
                </Text>
              </View>
            </View>

            <HeaderAction
              accessibilityLabel="Audio lesson preview"
              icon={{ android: "videocam", ios: "video.fill", web: "videocam" }}
              size={22}
            />
            <View className="items-center justify-center" style={styles.xpPill}>
              <Text className="audio-lesson__xp">
                {screenData.lesson.xpReward}
              </Text>
            </View>
            <HeaderAction
              accessibilityLabel="User profile"
              icon={{
                android: "person",
                ios: "person.fill",
                web: "person",
              }}
            />
          </View>

          <ImageBackground
            imageStyle={styles.previewImage}
            resizeMode="cover"
            source={getLessonHeroImageSource(screenData.lesson.id)}
            style={styles.preview}
          >
            <View style={styles.previewScrim} />

            <View className="absolute left-5 top-5" style={styles.lessonBadge}>
              <Text className="audio-lesson__badge" numberOfLines={1}>
                {screenData.lesson.title}
              </Text>
              <Text className="audio-lesson__badge-subtitle" numberOfLines={1}>
                {screenData.primaryGoal}
              </Text>
            </View>

            <View className="absolute right-4 top-4" style={styles.teacherTile}>
              <Text className="audio-lesson__teacher-flag">
                {screenData.language.flagEmoji}
              </Text>
              <Text className="audio-lesson__teacher-label" numberOfLines={1}>
                Teacher
              </Text>
            </View>

            <Image
              resizeMode="contain"
              source={images.mascotAuth}
              style={styles.teacherMascot}
            />

            <View style={styles.messageBubble}>
              <View className="flex-1 pr-3">
                <Text className="audio-lesson__message">
                  {screenData.teacherMessage.encouragement}
                </Text>
                <Text className="audio-lesson__message mt-2">
                  {screenData.teacherMessage.phrase}
                </Text>
                <Text className="audio-lesson__translation mt-1">
                  {screenData.teacherMessage.translation}
                </Text>
              </View>
              <SymbolView
                name={{
                  android: "volume_up",
                  ios: "speaker.wave.2.fill",
                  web: "volume_up",
                }}
                size={34}
                tintColor={colors.linguaDeepPurple}
                weight="semibold"
              />
              <View style={styles.bubbleTail} />
            </View>

            <View
              className="absolute left-0 right-0 flex-row justify-between px-5"
              style={styles.controlsBar}
            >
              {controls.map((control) => (
                <SessionControlButton control={control} key={control.label} />
              ))}
            </View>
          </ImageBackground>

          <View className="flex-row bg-white" style={styles.feedbackCard}>
            <FeedbackColumn
              label="Speaking"
              tone="success"
              value={screenData.feedback.speaking}
            />
            <View style={styles.feedbackDivider} />
            <FeedbackColumn
              label="Pronunciation"
              tone="info"
              value={screenData.feedback.pronunciation}
            />
            <View style={styles.feedbackDivider} />
            <FeedbackColumn
              label="Grammar"
              tone="purple"
              value={screenData.feedback.grammar}
            />
          </View>

          <Text className="audio-lesson__context mt-3" numberOfLines={2}>
            {lessonPhrase?.situation ?? screenData.teacherContext.lessonContext}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function HeaderAction({
  accessibilityLabel,
  icon,
  size = 22,
}: {
  accessibilityLabel: string;
  icon: SessionControl["icon"];
  size?: number;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
    >
      <SymbolView
        name={icon}
        size={size}
        tintColor={colors.textPrimary}
        weight="semibold"
      />
    </Pressable>
  );
}

function SessionControlButton({ control }: { control: SessionControl }) {
  const isDanger = control.tone === "danger";

  return (
    <Pressable
      accessibilityLabel={control.label}
      accessibilityRole="button"
      className="items-center"
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <View
        className="items-center justify-center rounded-full"
        style={[
          styles.controlButton,
          isDanger ? styles.controlButtonDanger : styles.controlButtonNeutral,
        ]}
      >
        <SymbolView
          name={control.icon}
          size={isDanger ? 34 : 31}
          tintColor={isDanger ? "#FFFFFF" : colors.textPrimary}
          weight="semibold"
        />
      </View>
      <Text className="audio-lesson__control-label mt-2">
        {control.label}
      </Text>
    </Pressable>
  );
}

function FeedbackColumn({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "info" | "purple" | "success";
  value: string;
}) {
  const valueClassName =
    tone === "success"
      ? "audio-lesson__feedback-value--success"
      : tone === "info"
        ? "audio-lesson__feedback-value--info"
        : "audio-lesson__feedback-value--purple";

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="audio-lesson__feedback-label">{label}</Text>
      <Text className={`${valueClassName} mt-3`}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingTop: 14,
  },
  header: {
    height: 68,
  },
  backButton: {
    alignItems: "flex-start",
    height: 50,
    justifyContent: "center",
    width: 45,
  },
  titleBlock: {
    paddingLeft: 5,
    paddingRight: 10,
  },
  onlineDot: {
    backgroundColor: "#1FD51B",
    borderRadius: 999,
    height: 14,
    width: 14,
  },
  headerAction: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#ECEEF6",
    borderRadius: 999,
    borderWidth: 2,
    height: 48,
    justifyContent: "center",
    marginLeft: 6,
    width: 48,
  },
  xpPill: {
    backgroundColor: "#FFFFFF",
    borderColor: "#ECEEF6",
    borderRadius: 999,
    borderWidth: 2,
    height: 48,
    marginLeft: 6,
    width: 48,
  },
  preview: {
    borderCurve: "continuous",
    borderRadius: 25,
    flex: 1,
    overflow: "hidden",
  },
  previewImage: {
    borderCurve: "continuous",
    borderRadius: 25,
  },
  previewScrim: {
    backgroundColor: "rgba(13, 19, 43, 0.18)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  lessonBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: 17,
    maxWidth: 260,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  teacherTile: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 3,
    height: 124,
    justifyContent: "center",
    width: 104,
  },
  teacherMascot: {
    bottom: 124,
    height: 300,
    left: -16,
    position: "absolute",
    width: 300,
  },
  messageBubble: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#ECEEF4",
    borderRadius: 17,
    borderWidth: 1,
    bottom: 125,
    boxShadow: "0px 7px 14px rgba(13, 19, 43, 0.12)",
    flexDirection: "row",
    minHeight: 108,
    paddingHorizontal: 22,
    paddingVertical: 16,
    position: "absolute",
    width: "72%",
  },
  bubbleTail: {
    backgroundColor: "#FFFFFF",
    bottom: -14,
    height: 29,
    position: "absolute",
    right: 31,
    transform: [{ rotate: "45deg" }],
    width: 29,
  },
  controlButton: {
    height: 70,
    width: 70,
  },
  controlsBar: {
    bottom: 17,
  },
  controlButtonNeutral: {
    backgroundColor: "#FFFFFF",
  },
  controlButtonDanger: {
    backgroundColor: "#FF4147",
  },
  feedbackCard: {
    borderCurve: "continuous",
    borderRadius: 24,
    boxShadow: "0px 10px 24px rgba(13, 19, 43, 0.08)",
    height: 100,
    marginTop: 12,
    overflow: "hidden",
  },
  feedbackDivider: {
    alignSelf: "center",
    backgroundColor: "#ECEEF6",
    height: 74,
    width: 2,
  },
  pressed: {
    opacity: 0.76,
  },
});
