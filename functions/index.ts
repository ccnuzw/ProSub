import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import manifestJSON from '__STATIC_CONTENT_MANIFEST';
const assetManifest = JSON.parse(manifestJSON);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    console.log('Incoming request:', request.method, request.url);

    // Fallback to serving static assets for all other requests
    try {
      return await getAssetFromKV(
        {
          request,
          waitUntil: (promise) => ctx.waitUntil(promise),
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: assetManifest,
        }
      );
    } catch (e) {
      // If the asset is not found, and it's a navigation request, serve the index.html
      if (request.headers.get('accept')?.includes('text/html')) {
        const url = new URL(request.url);
        url.pathname = '/'; // Serve the root index.html
        const newRequest = new Request(url.toString(), request);
        return await getAssetFromKV(
          {
            request: newRequest,
            waitUntil: (promise) => ctx.waitUntil(promise),
          },
          {
            ASSET_NAMESPACE: env.__STATIC_CONTENT,
            ASSET_MANIFEST: assetManifest,
          }
        );
      }
      return new Response('Not Found', { status: 404 });
    }
  },
};