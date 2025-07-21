interface Env {
  KV: KVNamespace;
}

export async function handleSubscriptionStatuses(request: Request, env: Env): Promise<Response> {
  try {
    const KV = env.KV;
    const statusList = await KV.list({ prefix: 'sub-status:' });
    
    const statuses: Record<string, any> = {};
    await Promise.all(
      statusList.keys.map(async ({ name }) => {
        const subId = name.replace('sub-status:', '');
        const statusJson = await KV.get(name);
        if (statusJson) {
          statuses[subId] = JSON.parse(statusJson);
        }
      })
    );
    return new Response(JSON.stringify(statuses), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Failed to fetch subscription statuses:', error);
    return new Response(JSON.stringify({ error: '获取订阅状态失败' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
