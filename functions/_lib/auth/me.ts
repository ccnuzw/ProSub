import { authenticateUser } from '../lib/auth'
import { jsonResponse, errorResponse } from '../utils/response';



export async function handleMe(request: Request, env: Env): Promise<Response> {
  const user = await authenticateUser(request, env)

  if (!user) {
    return errorResponse('未授权', 401);
  }

  // Do not return password in the response
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userWithoutPassword } = user
  return jsonResponse(userWithoutPassword);
}
