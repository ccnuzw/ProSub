import { jsonResponse, errorResponse } from '../utils/response';
import { parse } from 'cookie';

export async function handleMe(request: Request, env: Env): Promise<Response> {
  const cookies = parse(request.headers.get('Cookie') || '');
  const token = cookies.auth_token;

  if (!token) {
    return errorResponse('未授权', 401);
  }

  const userJson = await env.KV.get(`user:${token}`);

  if (!userJson) {
    return errorResponse('未授权', 401);
  }

  const user = JSON.parse(userJson) as User;

  // Do not return password in the response
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userWithoutPassword } = user;
  return jsonResponse(userWithoutPassword);
}
