/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { handleLogin } from './auth/login';
import { handleLogout } from './auth/logout';
import { handleMe } from './auth/me';
import { handleNodeHealthCheck } from './node-health-check';
import { handleNodeStatuses } from './node-statuses';
import { handleNodesGet, handleNodesPost } from './nodes';
import { handleNodeGet, handleNodePut, handleNodeDelete } from './nodes-id';
import { handleNodesBatchDelete } from './nodes-batch-delete';
import { handleNodesBatchImport } from './nodes-batch-import';
import { handleNodesClearAll } from './nodes-clear-all';
import { handleProfilesGet, handleProfilesPost } from './profiles';
import { handleProfileGet, handleProfilePut, handleProfileDelete } from './profiles-id';
import { handleSubscribe } from './subscribe';
import { handleSubscriptionStatuses } from './subscription-statuses';
import { handleSubscriptionsGet, handleSubscriptionsPost } from './subscriptions';
import { handleSubscriptionGet, handleSubscriptionPut, handleSubscriptionDelete } from './subscriptions-id';
import { handleSubscriptionsBatchImport } from './subscriptions-batch-import';
import { handleSubscriptionsPreview } from './subscriptions-preview';
import { handleSubscriptionsUpdate } from './subscriptions-update';
import { handleTrafficGet } from './traffic';
import { handleUsersGet, handleUsersPost } from './users';
import { handleUserGet, handleUserPut, handleUserDelete } from './users-id';
import { handleUsersGet, handleUsersPost, handleUserChangePassword } from './users';

interface Env {
  KV: KVNamespace;
  NODE_ENV: string; // For secure cookie flag
}



export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    console.log('env.KV:', env.KV);

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Helper to extract ID from path
    const getIdFromPath = (prefix: string) => {
      const parts = path.split('/');
      if (parts.length > 0 && parts[parts.length - 1] !== '') {
        return parts[parts.length - 1];
      }
      return null;
    };

    // API Routes
    if (path.startsWith('/api/')) {
      // Auth routes
      if (path === '/api/auth/login' && method === 'POST') {
        return handleLogin(request, env);
      } else if (path === '/api/auth/logout' && method === 'POST') {
        return handleLogout(request, env);
      } else if (path === '/api/auth/me' && method === 'GET') {
        return handleMe(request, env);
      }
      // Node routes
      else if (path === '/api/nodes' && method === 'GET') {
        return handleNodesGet(request, env);
      } else if (path === '/api/nodes' && method === 'POST') {
        return handleNodesPost(request, env);
      } else if (path.startsWith('/api/nodes/') && method === 'GET') {
        const id = getIdFromPath('/api/nodes/');
        if (id) return handleNodeGet(request, env, id);
      } else if (path.startsWith('/api/nodes/') && method === 'PUT') {
        const id = getIdFromPath('/api/nodes/');
        if (id) return handleNodePut(request, env, id);
      } else if (path.startsWith('/api/nodes/') && method === 'DELETE') {
        const id = getIdFromPath('/api/nodes/');
        if (id) return handleNodeDelete(request, env, id);
      } else if (path === '/api/nodes/batch-delete' && method === 'POST') {
        return handleNodesBatchDelete(request, env);
      } else if (path === '/api/nodes/batch-import' && method === 'POST') {
        return handleNodesBatchImport(request, env);
      } else if (path === '/api/node-health-check' && method === 'POST') {
        return handleNodeHealthCheck(request, env);
      } else if (path === '/api/nodes/clear-all' && method === 'POST') {
        return handleNodesClearAll(request, env);
      }
      // Profile routes
      else if (path === '/api/profiles' && method === 'GET') {
        return handleProfilesGet(request, env);
      } else if (path === '/api/profiles' && method === 'POST') {
        return handleProfilesPost(request, env);
      } else if (path.startsWith('/api/profiles/') && method === 'GET') {
        const id = getIdFromPath('/api/profiles/');
        if (id) return handleProfileGet(request, env, id);
      } else if (path.startsWith('/api/profiles/') && method === 'PUT') {
        const id = getIdFromPath('/api/profiles/');
        if (id) return handleProfilePut(request, env, id);
      } else if (path.startsWith('/api/profiles/') && method === 'DELETE') {
        const id = getIdFromPath('/api/profiles/');
        if (id) return handleProfileDelete(request, env, id);
      }
      // Subscribe route (public)
      else if (path.startsWith('/api/subscribe/') && method === 'GET') {
        const profile_id = getIdFromPath('/api/subscribe/');
        if (profile_id) return handleSubscribe(request, env, profile_id);
      }
      // Subscription routes
      else if (path === '/api/subscription-statuses' && method === 'GET') {
        return handleSubscriptionStatuses(request, env);
      } else if (path === '/api/node-statuses' && method === 'GET') {
        return handleNodeStatuses(request, env);
      } else if (path === '/api/subscriptions' && method === 'GET') {
        return handleSubscriptionsGet(request, env);
      } else if (path === '/api/subscriptions' && method === 'POST') {
        return handleSubscriptionsPost(request, env);
      } else if (path.startsWith('/api/subscriptions/') && method === 'GET') {
        const id = getIdFromPath('/api/subscriptions/');
        if (id) return handleSubscriptionGet(request, env, id);
      } else if (path.startsWith('/api/subscriptions/') && method === 'PUT') {
        const id = getIdFromPath('/api/subscriptions/');
        if (id) return handleSubscriptionPut(request, env, id);
      } else if (path.startsWith('/api/subscriptions/') && method === 'DELETE') {
        const id = getIdFromPath('/api/subscriptions/');
        if (id) return handleSubscriptionDelete(request, env, id);
      } else if (path === '/api/subscriptions/batch-import' && method === 'POST') {
        return handleSubscriptionsBatchImport(request, env);
      } else if (path.startsWith('/api/subscriptions/preview/') && method === 'GET') {
        const id = getIdFromPath('/api/subscriptions/preview/');
        if (id) return handleSubscriptionsPreview(request, env, id);
      } else if (path.startsWith('/api/subscriptions/update/') && method === 'POST') {
        const id = getIdFromPath('/api/subscriptions/update/');
        if (id) return handleSubscriptionsUpdate(request, env, id);
      }
      // Traffic route
      else if (path === '/api/traffic' && method === 'GET') {
        return handleTrafficGet(request, env);
      }
      // User routes
      else if (path === '/api/users' && method === 'GET') {
        return handleUsersGet(request, env);
      } else if (path === '/api/users' && method === 'POST') {
        return handleUsersPost(request, env);
      } else if (path.startsWith('/api/users/') && method === 'GET') {
        const id = getIdFromPath('/api/users/');
        if (id) return handleUserGet(request, env, id);
      } else if (path.startsWith('/api/users/') && method === 'PUT') {
        const id = getIdFromPath('/api/users/');
        if (id) return handleUserPut(request, env, id);
      } else if (path.startsWith('/api/users/') && method === 'DELETE') {
        const id = getIdFromPath('/api/users/');
        if (id) return handleUserDelete(request, env, id);
      } else if (path === '/api/users/change-password' && method === 'POST') {
        return handleUserChangePassword(request, env);
      }
    }

    // Handle /sub/[alias] route (public subscription link)
    if (path.startsWith('/sub/') && method === 'GET') {
      const alias = getIdFromPath('/sub/');
      if (alias) {
        // This logic was originally in src/app/sub/[alias]/route.ts
        // We need to replicate it here or create a dedicated handler.
        // For now, I'll put a placeholder and suggest creating a dedicated handler.
        try {
          const KV = env.KV;
          const idRecord = await KV.get(`alias:${alias}`);
          if (!idRecord) {
            return new Response('Subscription alias not found', { status: 404 });
          }
          const { id: profileId } = JSON.parse(idRecord);

          const profileJson = await KV.get(`profile:${profileId}`);
          if (!profileJson) {
            return new Response('Profile data not found for the alias', { status: 404 });
          }
          const profile = JSON.parse(profileJson);

          // Record traffic (simplified for now)
          try {
            const timestamp = new Date().toISOString();
            const key = `traffic:${profileId}:${timestamp}`;
            await KV.put(key, JSON.stringify({ timestamp, profileId, alias }));
          } catch (error) {
            console.error('Failed to record traffic:', error);
          }

          // Use the generateSubscriptionResponse from lib
          return await handleSubscribe(request, env, profileId);

        } catch (error) {
          console.error(`Failed to generate subscription for alias ${alias}:`, error);
          return new Response('Failed to generate subscription', { status: 500 });
        }
      }
    }

    return new Response('Not Found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;


