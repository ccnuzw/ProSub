import { jsonResponse, errorResponse } from './utils/response';

interface SubscriptionRequest {
  name: string;
  url: string;
}



export async function handleSubscriptionsGet(request: Request, env: Env): Promise<Response> {
  try {
    const KV = env.KV
    const subList = await KV.list({ prefix: 'subscription:' })
    const subscriptions = await Promise.all(
      subList.keys.map(async ({ name }) => {
        const subJson = await KV.get(name)
        return subJson ? JSON.parse(subJson) : null
      })
    )
    return jsonResponse(subscriptions.filter(Boolean));
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error)
    return errorResponse('Failed to fetch subscriptions');
  }
}

export async function handleSubscriptionsPost(request: Request, env: Env): Promise<Response> {
  try {
    const { name, url } = (await request.json()) as SubscriptionRequest
    const id = crypto.randomUUID()
    const newSubscription: Subscription = { id, name, url }
    
    const KV = env.KV
    await KV.put(`subscription:${id}`, JSON.stringify(newSubscription))
    
    return jsonResponse(newSubscription);
  } catch (error) {
    console.error('Failed to create subscription:', error)
    return errorResponse('Failed to create subscription');
  }
}
