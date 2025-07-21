import { Subscription } from '@/types';

interface SubscriptionRequest {
  name: string;
  url: string;
}

interface Env {
  KV: KVNamespace;
}

export async function handleSubscriptionGet(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const KV = env.KV
    const subJson = await KV.get(`subscription:${id}`)
    if (!subJson) {
      return new Response(JSON.stringify({ error: 'Subscription not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
    }
    return new Response(JSON.stringify(JSON.parse(subJson)), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error(`Failed to fetch subscription ${id}:`, error)
    return new Response(JSON.stringify({ error: 'Failed to fetch subscription' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function handleSubscriptionPut(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const { name, url } = (await request.json()) as SubscriptionRequest
    const updatedSubscription: Subscription = { id, name, url }
    
    const KV = env.KV
    await KV.put(`subscription:${id}`, JSON.stringify(updatedSubscription))
    
    return new Response(JSON.stringify(updatedSubscription), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error(`Failed to update subscription ${id}:`, error)
    return new Response(JSON.stringify({ error: 'Failed to update subscription' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function handleSubscriptionDelete(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const KV = env.KV
    await KV.delete(`subscription:${id}`)
    
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error(`Failed to delete subscription ${id}:`, error)
    return new Response(JSON.stringify({ error: 'Failed to delete subscription' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
