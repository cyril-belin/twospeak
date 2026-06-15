import { useUser } from "@clerk/expo";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { getLessonHeroImageSource, images } from "@/constants/images";
import {
  getInitialAudioLessonSessionState,
  updateAudioLessonSessionState,
  type AudioLessonScreenData,
  type AudioLessonSessionAction,
  type AudioLessonSessionState,
} from "@/data/audio-lesson-screen";
import { useStreamAudioLessonCall } from "@/hooks/use-stream-audio-lesson-call";
import type { StreamAudioCallStatus } from "@/lib/stream-audio";
import { useLanguageStore } from "@/store/language-store";
import { useProgressStore } from "@/store/progress-store";
import { colors } from "@/theme";

import { getAudioLessonPreviewHeight } from "./audio-lesson-layout";

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
  const { user } = useUser();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const contentWidth = Math.min(Math.max(width - 28, 320), 430);
  const availableHeight = height - insets.top - insets.bottom;
  const previewHeight = getAudioLessonPreviewHeight({
    availableHeight,
    contentWidth,
  });
  const mascotSize = Math.min(322, Math.max(246, previewHeight - 92));
  const mascotBottom = Math.min(92, Math.max(76, previewHeight * 0.2));
  const completeLesson = useProgressStore((state) => state.completeLesson);
  const selectedLanguageCode = useLanguageStore(
    (state) => state.selectedLanguageCode,
  );
  const streamSessionStarted = useRef(false);
  const [sessionState, setSessionState] = useState(() =>
    getInitialAudioLessonSessionState(screenData),
  );
  const userDisplayName = useMemo(
    () =>
      user?.fullName ??
      user?.firstName ??
      user?.username ??
      user?.primaryEmailAddress?.emailAddress.split("@")[0] ??
      "Twospeak learner",
    [
      user?.firstName,
      user?.fullName,
      user?.primaryEmailAddress?.emailAddress,
      user?.username,
    ],
  );
  const streamCall = useStreamAudioLessonCall({
    displayName: userDisplayName,
    languageCode: selectedLanguageCode ?? screenData.language.code,
    lessonId: screenData.lesson.id,
    userImage: user?.imageUrl,
  });
  const startStreamCallSession = streamCall.startCallSession;

  useEffect(() => {
    if (streamSessionStarted.current) {
      return;
    }

    streamSessionStarted.current = true;
    void startStreamCallSession();
  }, [startStreamCallSession]);

  async function handleSessionAction(action: AudioLessonSessionAction) {
    if (action === "end-session" && sessionState.hasEnded) {
      router.back();
      return;
    }

    if (action === "toggle-mic") {
      const isJoined =
        streamCall.status === "joined" || streamCall.status === "muted";
      const didToggle = await streamCall.toggleMute();

      if (!didToggle || !isJoined) {
        return;
      }
    }

    if (action === "end-session") {
      const didEndCall = await streamCall.endCall();

      if (!didEndCall) {
        return;
      }
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

  async function handleCallPrimaryAction() {
    if (streamCall.status === "idle" || streamCall.status === "error") {
      const session = await streamCall.startCallSession();

      if (!session) {
        return;
      }
    }

    await streamCall.joinCall();
  }

  const audioContent = (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View className="flex-1 items-center bg-background">
        <View style={[styles.screen, { width: contentWidth }]}>
          <View className="items-center justify-center" style={styles.header}>
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

            <Text className="audio-lesson__title" numberOfLines={1}>
              AI Teacher
            </Text>

            <View className="absolute right-0 flex-row items-center">
              <Pressable
                accessibilityLabel="Toggle teacher preview"
                accessibilityRole="button"
                accessibilityState={{ selected: sessionState.isPreviewOn }}
                className="flex-row items-center"
                onPress={() => handleSessionAction("toggle-preview")}
                style={({ pressed }) => [
                  styles.headerMetric,
                  pressed && styles.pressed,
                ]}
              >
                <SymbolView
                  name={{ android: "videocam", ios: "video.fill", web: "videocam" }}
                  size={18}
                  tintColor={colors.textPrimary}
                  weight="semibold"
                />
                <Text className="audio-lesson__xp ml-1">
                  {screenData.lesson.xpReward}
                </Text>
              </Pressable>

              <Pressable
                accessibilityLabel="Play teacher response"
                accessibilityRole="button"
                onPress={() => handleSessionAction("play-teacher")}
                style={({ pressed }) => [
                  styles.headerBell,
                  pressed && styles.pressed,
                ]}
              >
                <SymbolView
                  name={{
                    android: "notifications",
                    ios: "bell",
                    web: "notifications",
                  }}
                  size={25}
                  tintColor={colors.textPrimary}
                  weight="medium"
                />
              </Pressable>
            </View>
          </View>

          <View className="flex-row items-center" style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text className="audio-lesson__status ml-2" numberOfLines={1}>
              {sessionState.status}
            </Text>
          </View>

          <View className="flex-row items-center bg-white" style={styles.callCard}>
            <View
              style={[
                styles.callStatusDot,
                getCallStatusDotStyle(streamCall.status),
              ]}
            />
            <View className="ml-3 flex-1">
              <Text className="audio-lesson__call-label">Stream audio</Text>
              <Text className="audio-lesson__call-title mt-1" numberOfLines={1}>
                {streamCall.statusLabel}
              </Text>
              <Text className="audio-lesson__call-meta mt-1" numberOfLines={1}>
                {streamCall.userName ?? userDisplayName} -{" "}
                {screenData.language.name} - {screenData.lesson.title}
              </Text>
              {streamCall.errorMessage ? (
                <Text
                  className="audio-lesson__call-error mt-1"
                  numberOfLines={2}
                >
                  {streamCall.errorMessage}
                </Text>
              ) : null}
            </View>

            {streamCall.canJoin ? (
              <Pressable
                accessibilityLabel="Join Stream audio call"
                accessibilityRole="button"
                className="items-center justify-center"
                disabled={streamCall.isBusy}
                onPress={handleCallPrimaryAction}
                style={({ pressed }) => [
                  styles.callActionButton,
                  pressed && styles.pressed,
                  streamCall.isBusy && styles.disabled,
                ]}
              >
                <Text className="audio-lesson__call-action">
                  {streamCall.status === "idle" || streamCall.status === "error"
                    ? "Start"
                    : "Join"}
                </Text>
              </Pressable>
            ) : (
              <View className="items-center justify-center" style={styles.callLivePill}>
                <Text className="audio-lesson__call-pill">
                  {getCallStatusPillLabel(streamCall.status)}
                </Text>
              </View>
            )}
          </View>

          <View
            style={[
              styles.preview,
              { height: previewHeight },
              !sessionState.isPreviewOn && styles.previewMuted,
            ]}
          >
            <View style={styles.teacherTile}>
              {sessionState.isPreviewOn ? (
                <Image
                  resizeMode="cover"
                  source={getLessonHeroImageSource(screenData.lesson.id)}
                  style={styles.teacherTileImage}
                />
              ) : (
                <>
                  <Text className="audio-lesson__teacher-flag">♪</Text>
                  <Text
                    className="audio-lesson__teacher-label"
                    numberOfLines={1}
                  >
                    Audio
                  </Text>
                </>
              )}
            </View>

            {sessionState.isPreviewOn ? (
              <Image
                resizeMode="contain"
                source={images.mascotWelcome}
                style={[
                  styles.teacherMascot,
                  {
                    bottom: mascotBottom,
                    height: mascotSize,
                    width: mascotSize,
                  },
                ]}
              />
            ) : null}

            <View
              style={[
                styles.messageBubble,
                !!sessionState.subtitle && styles.messageBubbleWithSubtitles,
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
          </View>

          <View className="flex-row justify-between" style={styles.controlsRow}>
            {controls.map((control) => (
              <SessionControlButton
                control={control}
                isActive={getControlIsActive(
                  control.action,
                  sessionState,
                  streamCall.isMuted,
                  streamCall.status,
                )}
                isDisabled={streamCall.isBusy}
                isEnded={sessionState.hasEnded}
                key={control.label}
                label={getControlLabel(
                  control.action,
                  sessionState,
                  streamCall.isMuted,
                  streamCall.status,
                )}
                onPress={() => handleSessionAction(control.action)}
              />
            ))}
          </View>

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

        </View>
      </View>
    </SafeAreaView>
  );

  const StreamCallComponent = streamCall.StreamCallComponent;

  if (!streamCall.call || !StreamCallComponent) {
    return audioContent;
  }

  return (
    <StreamCallComponent call={streamCall.call}>{audioContent}</StreamCallComponent>
  );
}

function SessionControlButton({
  control,
  isActive,
  isDisabled,
  isEnded,
  label,
  onPress,
}: {
  control: SessionControl;
  isActive: boolean;
  isDisabled: boolean;
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
      accessibilityState={{ disabled: isDisabled, selected: isActive }}
      className="items-center"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}
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
        {control.action === "toggle-subtitles" ? (
          <Text
            style={[
              styles.controlTextIcon,
              isActive && styles.controlTextIconActive,
              isDanger && styles.controlTextIconDanger,
            ]}
          >
            Aa
          </Text>
        ) : (
          <SymbolView
            name={icon}
            size={isDanger ? 34 : 30}
            tintColor={
              isDanger
                ? "#FFFFFF"
                : isActive
                  ? colors.linguaDeepPurple
                  : colors.textPrimary
            }
            weight="semibold"
          />
        )}
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
  streamCallIsMuted: boolean,
  streamCallStatus: StreamAudioCallStatus,
) {
  if (action === "toggle-mic") {
    if (streamCallStatus === "joined" || streamCallStatus === "muted") {
      return !streamCallIsMuted;
    }

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
  streamCallIsMuted: boolean,
  streamCallStatus: StreamAudioCallStatus,
) {
  if (action === "toggle-mic") {
    if (streamCallStatus === "joined" || streamCallStatus === "muted") {
      return streamCallIsMuted ? "Muted" : "Mic";
    }

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

function getCallStatusPillLabel(status: StreamAudioCallStatus) {
  if (status === "muted") return "Muted";
  if (status === "ended") return "Ended";
  if (status === "starting" || status === "joining") return "Connecting";
  if (status === "ending") return "Ending";
  if (status === "error") return "Error";

  return "Live";
}

function getCallStatusDotStyle(status: StreamAudioCallStatus) {
  if (status === "joined") return styles.callStatusDotJoined;
  if (status === "muted") return styles.callStatusDotMuted;
  if (status === "error") return styles.callStatusDotError;
  if (status === "ended") return styles.callStatusDotEnded;
  if (status === "starting" || status === "joining" || status === "ending") {
    return styles.callStatusDotConnecting;
  }

  return styles.callStatusDotReady;
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
    paddingBottom: 10,
    paddingTop: 10,
  },
  header: {
    height: 50,
  },
  backButton: {
    alignItems: "flex-start",
    left: 0,
    height: 50,
    justifyContent: "center",
    position: "absolute",
    width: 45,
  },
  onlineDot: {
    backgroundColor: "#2DE36E",
    borderRadius: 999,
    height: 11,
    width: 11,
  },
  statusRow: {
    height: 26,
  },
  callCard: {
    borderColor: "#EEEFF4",
    borderCurve: "continuous",
    borderRadius: 18,
    borderWidth: 1,
    boxShadow: "0px 7px 18px rgba(13, 19, 43, 0.05)",
    marginTop: 5,
    minHeight: 62,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  callStatusDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  callStatusDotReady: {
    backgroundColor: "#7F8AA3",
  },
  callStatusDotConnecting: {
    backgroundColor: colors.warning,
  },
  callStatusDotJoined: {
    backgroundColor: colors.linguaGreen,
  },
  callStatusDotMuted: {
    backgroundColor: "#A98BFF",
  },
  callStatusDotError: {
    backgroundColor: colors.error,
  },
  callStatusDotEnded: {
    backgroundColor: "#B8BECD",
  },
  callActionButton: {
    backgroundColor: colors.linguaDeepPurple,
    borderRadius: 999,
    height: 38,
    minWidth: 62,
    paddingHorizontal: 14,
  },
  callLivePill: {
    backgroundColor: "#F3F5FA",
    borderRadius: 999,
    height: 34,
    minWidth: 58,
    paddingHorizontal: 12,
  },
  headerMetric: {
    borderRadius: 999,
    minHeight: 34,
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  headerBell: {
    alignItems: "center",
    height: 42,
    justifyContent: "center",
    marginLeft: 15,
    width: 32,
  },
  preview: {
    backgroundColor: "#F6F0FF",
    borderCurve: "continuous",
    borderRadius: 27,
    boxShadow: "0px 12px 24px rgba(108, 78, 245, 0.08)",
    marginTop: 10,
    overflow: "hidden",
  },
  previewMuted: {
    backgroundColor: "#EDE6F7",
  },
  teacherTile: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderColor: "#FFFFFF",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 2,
    height: 78,
    justifyContent: "center",
    overflow: "hidden",
    position: "absolute",
    right: 24,
    top: 24,
    width: 78,
  },
  teacherTileImage: {
    height: "100%",
    width: "100%",
  },
  teacherMascot: {
    alignSelf: "center",
    left: 10,
    position: "absolute",
  },
  messageBubble: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderCurve: "continuous",
    borderRadius: 17,
    bottom: 24,
    boxShadow: "0px 8px 18px rgba(82, 61, 122, 0.10)",
    flexDirection: "row",
    minHeight: 74,
    paddingHorizontal: 17,
    paddingVertical: 12,
    position: "absolute",
    width: "89%",
  },
  messageBubbleWithSubtitles: {
    bottom: 92,
  },
  bubbleTail: {
    display: "none",
  },
  controlButton: {
    borderColor: "transparent",
    borderWidth: 2,
    boxShadow: "0px 9px 22px rgba(13, 19, 43, 0.08)",
    height: 68,
    width: 68,
  },
  controlsRow: {
    height: 96,
    marginTop: 18,
    paddingHorizontal: 14,
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
    backgroundColor: "rgba(13, 19, 43, 0.68)",
    borderRadius: 14,
    bottom: 25,
    paddingHorizontal: 16,
    paddingVertical: 9,
    position: "absolute",
    width: "86%",
  },
  feedbackCard: {
    borderColor: "#EEEFF4",
    borderCurve: "continuous",
    borderRadius: 22,
    borderWidth: 1,
    boxShadow: "0px 7px 18px rgba(13, 19, 43, 0.05)",
    height: 78,
    marginTop: 10,
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
  disabled: {
    opacity: 0.52,
  },
  controlTextIcon: {
    color: colors.textPrimary,
    fontFamily: "Poppins-SemiBold",
    fontSize: 23,
    lineHeight: 29,
  },
  controlTextIconActive: {
    color: colors.linguaDeepPurple,
  },
  controlTextIconDanger: {
    color: "#FFFFFF",
  },
});
