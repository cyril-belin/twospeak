import { getStreamNativeModuleUnavailableMessage } from "./stream-native-module";

const missingMessage = getStreamNativeModuleUnavailableMessage({
  platform: "ios",
  streamInCallManager: undefined,
  webRTCModule: {},
});

if (!missingMessage?.includes("rebuild the Expo dev client")) {
  throw new Error(
    "Missing Stream native modules should explain that the Expo dev client must be rebuilt.",
  );
}

const availableMessage = getStreamNativeModuleUnavailableMessage({
  platform: "ios",
  streamInCallManager: {},
  webRTCModule: {},
});

if (availableMessage !== null) {
  throw new Error("Installed Stream native modules should not block Stream setup.");
}

const missingWebRTCMessage = getStreamNativeModuleUnavailableMessage({
  platform: "ios",
  streamInCallManager: {},
  webRTCModule: undefined,
});

if (!missingWebRTCMessage?.includes("rebuild the Expo dev client")) {
  throw new Error(
    "Missing WebRTC native module should explain that the Expo dev client must be rebuilt.",
  );
}

const webMessage = getStreamNativeModuleUnavailableMessage({
  platform: "web",
  streamInCallManager: undefined,
});

if (webMessage !== null) {
  throw new Error("Web should not require the iOS/Android Stream native module.");
}
