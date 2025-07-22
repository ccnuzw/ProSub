import { jsonResponse, errorResponse } from './utils/response';

interface SubscriptionRequest {
  name: string;
  url: string;
}



export async function handleSubscriptionGet(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const KV = env.KV
    const subJson = await KV.get(`subscription:${id}`)
    if (!subJson) {
      return errorResponse('Subscription not found', 404);
    }
    return jsonResponse(JSON.parse(subJson));
  } catch (error) {
    console.error(`Failed to fetch subscription ${id}:`, error)
    return errorResponse('Failed to fetch subscription');
  }
}

export async function handleSubscriptionPut(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const { name, url } = (await request.json()) as SubscriptionRequest
    const updatedSubscription: Subscription = { id, name, url }
    
    const KV = env.KV
    await KV.put(`subscription:${id}`, JSON.stringify(updatedSubscription))
    
    return jsonResponse(updatedSubscription);
  } catch (error) {
    console.error(`Failed to update subscription ${id}:`, error)
    return errorResponse('Failed to update subscription');
  }
}

export async function handleSubscriptionDelete(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const KV = env.KV
    await KV.delete(`subscription:${id}`)
    
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(`Failed to delete subscription ${id}:`, error)
    return errorResponse('Failed to delete subscription');
  }
}
