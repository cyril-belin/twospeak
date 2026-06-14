import type { RefObject } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";


type VerificationModalProps = {
  code: string;
  inputRef: RefObject<TextInput | null>;
  isVisible: boolean;
  onChangeCode: (value: string) => void;
  onClose: () => void;
};

export function VerificationModal({
  code,
  inputRef,
  isVisible,
  onChangeCode,
  onClose,
}: VerificationModalProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={isVisible}
    >
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", default: "height" })}
        style={styles.modalKeyboardView}
      >
        <Pressable className="flex-1 justify-end" onPress={onClose}>
          <Pressable
            className="auth__modal-card mx-5 mb-5 px-6 pb-7 pt-6"
            onPress={() => inputRef.current?.focus()}
            style={styles.modalCardShadow}
          >
            <Text className="auth__modal-title">Check your email</Text>
            <Text className="auth__modal-body mt-3">
              We sent you a verification code. Enter the 6 digits to continue.
            </Text>

            <View className="mt-6 flex-row justify-between gap-2">
              {Array.from({ length: 6 }).map((_, index) => {
                const digit = code[index];

                return (
                  <View
                    className={`auth__code-box items-center justify-center ${
                      digit ? "border-lingua-deep-purple" : "border-[#E7EAF2]"
                    }`}
                    key={`verification-digit-${index}`}
                  >
                    <Text className="auth__code-digit">{digit ?? ""}</Text>
                  </View>
                );
              })}
            </View>

            <TextInput
              autoComplete="one-time-code"
              autoFocus
              caretHidden={false}
              inputMode="numeric"
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={onChangeCode}
              ref={inputRef}
              style={styles.hiddenCodeInput}
              textContentType="oneTimeCode"
              underlineColorAndroid="transparent"
              value={code}
            />
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalKeyboardView: {
    backgroundColor: "rgba(8, 12, 31, 0.38)",
    flex: 1,
  },
  modalCardShadow: {
    boxShadow: "0px 18px 34px rgba(13, 19, 43, 0.18)",
  },
  hiddenCodeInput: {
    height: 1,
    opacity: 0,
    position: "absolute",
    width: 1,
  },
});
