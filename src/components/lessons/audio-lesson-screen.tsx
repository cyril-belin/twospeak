import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useState } from "react";
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
import {
  getInitialAudioLessonSessionState,
  updateAudioLessonSessionState,
  type AudioLessonScreenData,
  type AudioLessonSessionAction,
  type AudioLessonSessionState,
} from "@/data/audio-lesson-screen";
import { useProgressStore } from "@/store/progress-store";
import { colors } from "@/theme";

type AudioLessonScreenProps = {
  screenData: AudioLessonScreenData;
};

type SessionControl = {
  action: AudioLessonSessionAction;
  icon: SymbolViewProps["name"];
  label: string;
  tone: "neutral" | "danger";
};

const controls: SessionControl[] = [
  {
    action: "toggle-preview",
    icon: { android: "videocam", ios: "video.fill", web: "videocam" },
    label: "Camera",
    tone: "neutral",
  },
  {
    action: "toggle-mic",
    icon: { android: "mic", ios: "mic.fill", web: "mic" },
    label: "Mic",
    tone: "neutral",
  },
  {
    action: "toggle-subtitles",
    icon: {
      android: "translate",
      ios: "character.book.closed.fill",
      web: "translate",
    },
    label: "Subtitles",
    tone: "neutral",
  },
  {
    action: "end-session",
    icon: { android: "call_end", ios: "phone.down.fill", web: "call_end" },
    label: "End Call",
    tone: "danger",
  },
];

export function AudioLessonScreen({ screenData }: AudioLessonScreenProps) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(Math.max(width - 28, 320), 430);
  const lessonPhrase = screenData.phrases[0];
  const completeLesson = useProgressStore((state) => state.completeLesson);
  const [sessionState, setSessionState] = useState(() =>
    getInitialAudioLessonSessionState(screenData),
  );

  function handleSessionAction(action: AudioLessonSessionAction) {
    if (action === "end-session" && sessionState.hasEnded) {
      router.back();
      return;
    }

    const nextState = updateAudioLessonSessionState(
      sessionState,
      action,
      screenData,
    );

    if (action === "end-session" && !sessionState.hasEnded) {
      completeLesson(
        screenData.lesson.id,
        screenData.lesson.languageCode,
        screenData.lesson.xpReward,
      );
    }

    setSessionState(nextState);
  }

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
                  {sessionState.status}
                </Text>
              </View>
            </View>

            <HeaderAction
              accessibilityLabel="Audio lesson preview"
              icon={{ android: "videocam", ios: "video.fill", web: "videocam" }}
              isSelected={sessionState.isPreviewOn}
              onPress={() => handleSessionAction("toggle-preview")}
              size={22}
            />
            <View className="items-center justify-center" style={styles.xpPill}>
              <Text className="audio-lesson__xp">
                {screenData.lesson.xpReward}
              </Text>
            </View>
            <HeaderAction
              accessibilityLabel="Play teacher response"
              icon={{
                android: "volume_up",
                ios: "speaker.wave.2.fill",
                web: "volume_up",
              }}
              onPress={() => handleSessionAction("play-teacher")}
            />
          </View>

          <ImageBackground
            imageStyle={styles.previewImage}
            resizeMode="cover"
            source={getLessonHeroImageSource(screenData.lesson.id)}
            style={styles.preview}
          >
            <View
              style={[
                styles.previewScrim,
                !sessionState.isPreviewOn && styles.previewScrimMuted,
              ]}
            />

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
                {sessionState.isPreviewOn ? screenData.language.flagEmoji : "♪"}
              </Text>
              <Text className="audio-lesson__teacher-label" numberOfLines={1}>
                {sessionState.isPreviewOn ? "Teacher" : "Audio only"}
              </Text>
            </View>

            {sessionState.isPreviewOn ? (
              <Image
                resizeMode="contain"
                source={images.mascotAuth}
                style={styles.teacherMascot}
              />
            ) : null}

            <View
              style={[
                styles.messageBubble,
                sessionState.subtitle && styles.messageBubbleWithSubtitles,
              ]}
            >
              <View className="flex-1 pr-3">
                <Text className="audio-lesson__message">
                  {sessionState.teacherMessage.encouragement}
                </Text>
                <Text className="audio-lesson__message mt-2">
                  {sessionState.teacherMessage.phrase}
                </Text>
                <Text className="audio-lesson__translation mt-1">
                  {sessionState.teacherMessage.translation}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Play teacher response"
                accessibilityRole="button"
                onPress={() => handleSessionAction("play-teacher")}
                style={({ pressed }) => pressed && styles.pressed}
              >
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
              </Pressable>
              <View style={styles.bubbleTail} />
            </View>

            {sessionState.subtitle ? (
              <View style={styles.subtitleBar}>
                <Text className="audio-lesson__subtitle-text" numberOfLines={2}>
                  {sessionState.subtitle}
                </Text>
              </View>
            ) : null}

            <View
              className="absolute left-0 right-0 flex-row justify-between px-5"
              style={styles.controlsBar}
            >
              {controls.map((control) => (
                <SessionControlButton
                  control={control}
                  isActive={getControlIsActive(control.action, sessionState)}
                  isEnded={sessionState.hasEnded}
                  key={control.label}
                  label={getControlLabel(control.action, sessionState)}
                  onPress={() => handleSessionAction(control.action)}
                />
              ))}
            </View>
          </ImageBackground>

          <View className="flex-row bg-white" style={styles.feedbackCard}>
            <FeedbackColumn
              label="Speaking"
              tone="success"
              value={sessionState.feedback.speaking}
            />
            <View style={styles.feedbackDivider} />
            <FeedbackColumn
              label="Pronunciation"
              tone="info"
              value={sessionState.feedback.pronunciation}
            />
            <View style={styles.feedbackDivider} />
            <FeedbackColumn
              label="Grammar"
              tone="purple"
              value={sessionState.feedback.grammar}
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
  isSelected = false,
  onPress,
  size = 22,
}: {
  accessibilityLabel: string;
  icon: SessionControl["icon"];
  isSelected?: boolean;
  onPress: () => void;
  size?: number;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.headerAction,
        isSelected && styles.headerActionActive,
        pressed && styles.pressed,
      ]}
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

function SessionControlButton({
  control,
  isActive,
  isEnded,
  label,
  onPress,
}: {
  control: SessionControl;
  isActive: boolean;
  isEnded: boolean;
  label: string;
  onPress: () => void;
}) {
  const isDanger = control.tone === "danger";
  const icon = getControlIcon(control.action, isActive, isEnded, control.icon);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      className="items-center"
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <View
        className="items-center justify-center rounded-full"
        style={[
          styles.controlButton,
          isDanger ? styles.controlButtonDanger : styles.controlButtonNeutral,
          isActive && !isDanger && styles.controlButtonActive,
          isEnded && isDanger && styles.controlButtonComplete,
        ]}
      >
        <SymbolView
          name={icon}
          size={isDanger ? 34 : 31}
          tintColor={
            isDanger
              ? "#FFFFFF"
              : isActive
                ? colors.linguaDeepPurple
                : colors.textPrimary
          }
          weight="semibold"
        />
      </View>
      <Text className="audio-lesson__control-label mt-2">
        {label}
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

function getControlIsActive(
  action: AudioLessonSessionAction,
  state: AudioLessonSessionState,
) {
  if (action === "toggle-mic") {
    return state.isMicOn;
  }

  if (action === "toggle-preview") {
    return state.isPreviewOn;
  }

  if (action === "toggle-subtitles") {
    return state.areSubtitlesOn;
  }

  return state.hasEnded;
}

function getControlLabel(
  action: AudioLessonSessionAction,
  state: AudioLessonSessionState,
) {
  if (action === "toggle-mic") {
    return state.isMicOn ? "Mic" : "Muted";
  }

  if (action === "toggle-preview") {
    return state.isPreviewOn ? "Camera" : "Audio";
  }

  if (action === "toggle-subtitles") {
    return state.areSubtitlesOn ? "Captions" : "Subtitles";
  }

  return state.hasEnded ? "Done" : "End Call";
}

function getControlIcon(
  action: AudioLessonSessionAction,
  isActive: boolean,
  isEnded: boolean,
  fallbackIcon: SymbolViewProps["name"],
): SymbolViewProps["name"] {
  if (action === "toggle-mic" && !isActive) {
    return { android: "mic_off", ios: "mic.slash.fill", web: "mic_off" };
  }

  if (action === "toggle-preview" && !isActive) {
    return {
      android: "videocam_off",
      ios: "video.slash.fill",
      web: "videocam_off",
    };
  }

  if (action === "end-session" && isEnded) {
    return { android: "check", ios: "checkmark", web: "check" };
  }

  return fallbackIcon;
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
  headerActionActive: {
    backgroundColor: "#F4F1FF",
    borderColor: "#DCD5FF",
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
  previewScrimMuted: {
    backgroundColor: "rgba(13, 19, 43, 0.54)",
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
  messageBubbleWithSubtitles: {
    bottom: 178,
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
    borderColor: "transparent",
    borderWidth: 2,
    height: 70,
    width: 70,
  },
  controlsBar: {
    bottom: 17,
  },
  controlButtonNeutral: {
    backgroundColor: "#FFFFFF",
  },
  controlButtonActive: {
    backgroundColor: "#F4F1FF",
    borderColor: "#DCD5FF",
  },
  controlButtonDanger: {
    backgroundColor: "#FF4147",
  },
  controlButtonComplete: {
    backgroundColor: colors.linguaGreen,
  },
  subtitleBar: {
    alignSelf: "center",
    backgroundColor: "rgba(13, 19, 43, 0.72)",
    borderRadius: 16,
    bottom: 104,
    paddingHorizontal: 16,
    paddingVertical: 10,
    position: "absolute",
    width: "86%",
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
