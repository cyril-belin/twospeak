import {
  createAudioLessonStreamSession,
  streamRouteErrorResponse,
} from "@/lib/stream-server";

export async function POST(request: Request) {
  try {
    return Response.json(await createAudioLessonStreamSession(request));
  } catch (error) {
    return streamRouteErrorResponse(error);
  }
}
