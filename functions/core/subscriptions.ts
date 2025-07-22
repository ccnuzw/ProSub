import { jsonResponse, errorResponse } from './utils/response';

interface SubscriptionRequest {
  name: string;
  url: string;
}



export async function handleSubscriptionsGet(request: Request, env: Env): Promise<Response> {
  try {
    const KV = env.KV
    const subIndexJson = await KV.get('_index:subscriptions');
    const subIds = subIndexJson ? JSON.parse(subIndexJson) : [];

    const subscriptions = await Promise.all(
      subIds.map(async (subId: string) => {
        const subJson = await KV.get(`subscription:${subId}`);
        return subJson ? JSON.parse(subJson) : null;
      })
    );

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

    const subIndexJson = await KV.get('_index:subscriptions');
    const subIds = subIndexJson ? JSON.parse(subIndexJson) : [];
    subIds.push(id);
    await KV.put('_index:subscriptions', JSON.stringify(subIds));
    
    return jsonResponse(newSubscription);
  } catch (error) {
    console.error('Failed to create subscription:', error)
    return errorResponse('Failed to create subscription');
  }
}
