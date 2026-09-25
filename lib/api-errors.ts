export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function jsonResponse(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
export function errorResponse(error: unknown) {
  return jsonResponse(
    {
      error:
        error instanceof ApiError
          ? error.message
          : "No se pudo completar la solicitud. Inténtalo de nuevo.",
    },
    error instanceof ApiError ? error.status : 503,
  );
}
export async function readBody(
  request: Request,
): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new ApiError(415, "Se requiere JSON.");
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    throw new ApiError(403, "Origen de solicitud incorrecto.");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "Falta la solicitud.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 8192) {
        await reader.cancel();
        throw new ApiError(413, "Solicitud demasiado grande.");
      }
      chunks.push(value);
    }
    const body: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new Error();
    return body as Record<string, unknown>;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "Solicitud JSON inválida.");
  } finally {
    reader.releaseLock();
  }
}
