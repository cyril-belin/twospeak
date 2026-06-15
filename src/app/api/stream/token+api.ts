import {
  createStreamTokenSession,
  streamRouteErrorResponse,
} from "@/lib/stream-server";

export async function POST(request: Request) {
  try {
    return Response.json(await createStreamTokenSession(request));
  } catch (error) {
    return streamRouteErrorResponse(error);
  }
}
