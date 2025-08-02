import { jsonResponse, errorResponse } from './utils/response';
import { NodeGroup, Env } from '../../packages/shared/types/index.ts';
import { requireAuth } from './utils/auth';

const ALL_NODE_GROUPS_KEY = 'ALL_NODE_GROUPS';

async function getAllNodeGroups(env: Env): Promise<Record<string, NodeGroup>> {
  const groupsJson = await env.KV.get(ALL_NODE_GROUPS_KEY);
  return groupsJson ? JSON.parse(groupsJson) : {};
}

async function putAllNodeGroups(env: Env, groups: Record<string, NodeGroup>): Promise<void> {
  await env.KV.put(ALL_NODE_GROUPS_KEY, JSON.stringify(groups));
}

interface NodeGroupRequest {
  name: string;
  nodeIds?: string[];
}

export async function handleNodeGroupsGet(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const allGroups = await getAllNodeGroups(env);
    return jsonResponse(Object.values(allGroups));
  } catch (error) {
    console.error('Failed to fetch node groups:', error);
    return errorResponse('Failed to fetch node groups');
  }
}

export async function handleNodeGroupsPost(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { name, nodeIds = [] } = (await request.json()) as NodeGroupRequest;
    
    if (!name) {
      return errorResponse('Group name is required', 400);
    }

    const id = crypto.randomUUID();
    const newGroup: NodeGroup = {
      id,
      name,
      nodeIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const allGroups = await getAllNodeGroups(env);
    allGroups[id] = newGroup;
    await putAllNodeGroups(env, allGroups);

    return jsonResponse(newGroup, 201);
  } catch (error) {
    console.error('Failed to create node group:', error);
    return errorResponse('Failed to create node group');
  }
}

export async function handleNodeGroupsIdGet(request: Request, env: Env, groupId: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const allGroups = await getAllNodeGroups(env);
    const group = allGroups[groupId];
    
    if (!group) {
      return errorResponse('Node group not found', 404);
    }

    return jsonResponse(group);
  } catch (error) {
    console.error('Failed to fetch node group:', error);
    return errorResponse('Failed to fetch node group');
  }
}

export async function handleNodeGroupsIdPut(request: Request, env: Env, groupId: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { name, nodeIds } = (await request.json()) as NodeGroupRequest;
    
    if (!name) {
      return errorResponse('Group name is required', 400);
    }

    const allGroups = await getAllNodeGroups(env);
    const existingGroup = allGroups[groupId];
    
    if (!existingGroup) {
      return errorResponse('Node group not found', 404);
    }

    const updatedGroup: NodeGroup = {
      ...existingGroup,
      name,
      nodeIds: nodeIds || existingGroup.nodeIds,
      updatedAt: new Date().toISOString()
    };

    allGroups[groupId] = updatedGroup;
    await putAllNodeGroups(env, allGroups);

    return jsonResponse(updatedGroup);
  } catch (error) {
    console.error('Failed to update node group:', error);
    return errorResponse('Failed to update node group');
  }
}

export async function handleNodeGroupsIdDelete(request: Request, env: Env, groupId: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const allGroups = await getAllNodeGroups(env);
    const existingGroup = allGroups[groupId];
    
    if (!existingGroup) {
      return errorResponse('Node group not found', 404);
    }

    delete allGroups[groupId];
    await putAllNodeGroups(env, allGroups);

    return jsonResponse({ message: 'Node group deleted successfully' });
  } catch (error) {
    console.error('Failed to delete node group:', error);
    return errorResponse('Failed to delete node group');
  }
}