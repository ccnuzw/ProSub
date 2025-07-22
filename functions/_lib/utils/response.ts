// _lib/utils/response.ts

export function jsonResponse(data: any, status: number = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

export function errorResponse(message: string, status: number = 500, headers: Record<string, string> = {}): Response {
  return jsonResponse({ error: message }, status, headers);
}
