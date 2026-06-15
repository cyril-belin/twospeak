import {
  createStreamApiUrl,
  StreamApiRouteError,
  streamRouteErrorResponse,
} from "./stream-server";

const callUrl = createStreamApiUrl(
  "/video/call/default/audio-es-lesson-user",
  "stream-key",
);

if (
  callUrl !==
  "https://video.stream-io-api.com/video/call/default/audio-es-lesson-user?api_key=stream-key"
) {
  throw new Error(`Stream Video call URL should use the /video API. Got ${callUrl}.`);
}

const usersUrl = createStreamApiUrl("/api/v2/users", "stream-key");

if (
  usersUrl !== "https://video.stream-io-api.com/api/v2/users?api_key=stream-key"
) {
  throw new Error(`Stream user URL should use the shared API route. Got ${usersUrl}.`);
}

const response = streamRouteErrorResponse(
  new StreamApiRouteError("Stream rejected the audio session.", 502),
);

if (response.status !== 502) {
  throw new Error(`Expected Stream route error status 502. Got ${response.status}.`);
}

const body = (await response.json()) as { error?: string };

if (body.error !== "Stream rejected the audio session.") {
  throw new Error(
    `Development Stream route errors should expose the useful message. Got ${body.error}.`,
  );
}
