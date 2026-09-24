import {
  ApiError,
  errorResponse,
  jsonResponse,
  readBody,
} from "@/lib/api-errors";
import { createChallenge } from "@/lib/challenge";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const body = await readBody(request);
    if (Object.keys(body).some((k) => k !== "wallet" && k !== "tickers"))
      throw new ApiError(400, "Solicitud de desafío incorrecta.");
    return jsonResponse(
      createChallenge(body.wallet, body.tickers, new URL(request.url).host),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
