import { Subscription } from '@/types';

interface SubscriptionRequest {
  name: string;
  url: string;
}

interface Env {
  KV: KVNamespace;
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
    return new Response(JSON.stringify(subscriptions.filter(Boolean)), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch subscriptions' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function handleSubscriptionsPost(request: Request, env: Env): Promise<Response> {
  try {
    const { name, url } = (await request.json()) as SubscriptionRequest
    const id = crypto.randomUUID()
    const newSubscription: Subscription = { id, name, url }
    
    const KV = env.KV
    await KV.put(`subscription:${id}`, JSON.stringify(newSubscription))
    
    return new Response(JSON.stringify(newSubscription), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Failed to create subscription:', error)
    return new Response(JSON.stringify({ error: 'Failed to create subscription' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
