type StreamPlatform = "android" | "ios" | "macos" | "web" | "windows";

type StreamNativeModuleCheckInput = {
  platform?: StreamPlatform;
  streamInCallManager?: unknown;
  webRTCModule?: unknown;
};

type ReactNativeRuntime = {
  NativeModules?: {
    StreamInCallManager?: unknown;
    WebRTCModule?: unknown;
  };
  Platform?: {
    OS?: StreamPlatform;
  };
};

declare const require:
  | ((moduleName: "react-native") => ReactNativeRuntime)
  | undefined;

export const streamNativeModuleUnavailableMessage =
  "Stream native modules are not available. Please rebuild the Expo dev client after installing Stream Video dependencies.";

export function getStreamNativeModuleUnavailableMessage(
  input?: StreamNativeModuleCheckInput,
) {
  const runtime = input ? null : getReactNativeRuntime();
  const platform = input?.platform ?? runtime?.Platform?.OS ?? "web";

  if (platform === "web") {
    return null;
  }

  const streamInCallManager =
    input && "streamInCallManager" in input
      ? input.streamInCallManager
      : runtime?.NativeModules?.StreamInCallManager;

  if (!streamInCallManager) {
    return streamNativeModuleUnavailableMessage;
  }

  const webRTCModule =
    input && "webRTCModule" in input
      ? input.webRTCModule
      : runtime?.NativeModules?.WebRTCModule;

  return webRTCModule ? null : streamNativeModuleUnavailableMessage;
}

export function loadGuardedStreamNativeModule<TModule>(
  loadModule: () => TModule,
  input?: StreamNativeModuleCheckInput,
) {
  const unavailableMessage = getStreamNativeModuleUnavailableMessage(input);

  if (unavailableMessage) {
    throw new Error(unavailableMessage);
  }

  return loadModule();
}

function getReactNativeRuntime() {
  try {
    return typeof require === "function" ? require("react-native") : null;
  } catch {
    return null;
  }
}
