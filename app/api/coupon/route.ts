import { errorResponse, jsonResponse, readBody } from "@/lib/api-errors";
import { issueCoupon } from "@/lib/issue-coupon";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    return jsonResponse(
      await issueCoupon(await readBody(request), new URL(request.url).host),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
