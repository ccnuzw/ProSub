import { jsonResponse, errorResponse } from './utils/response';
import { Node, Env } from '@shared/types';
import { requireAuth } from './utils/auth';
import { NodeDataAccess } from './utils/data-access';

interface NodeRequest {
  name: string;
  server: string;
  port: number;
  password?: string;
  type: 'ss' | 'ssr' | 'vmess' | 'vless' | 'trojan' | 'socks5' | 'anytls' | 'tuic' | 'hysteria' | 'hysteria2' | 'vless-reality';
}

export async function handleNodesGet(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const allNodes = await NodeDataAccess.getAll(env);
    return jsonResponse(Object.values(allNodes));
  } catch (error) {
    console.error('获取节点列表失败:', error);
    return errorResponse('获取节点列表失败');
  }
}

export async function handleNodesPost(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { name, server, port, password, type } = (await request.json()) as NodeRequest;
    
    if (!name || !server || !port || !type) {
      return errorResponse('节点名称、服务器地址、端口和类型不能为空', 400);
    }

    const id = crypto.randomUUID();
    const newNode: Node = { id, name, server, port, password, type };

    await NodeDataAccess.create(env, newNode);
    return jsonResponse(newNode);
  } catch (error) {
    console.error('创建节点失败:', error);
    return errorResponse('创建节点失败');
  }
}

export async function handleNodeGet(request: Request, env: Env, id: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }
  
  try {
    const node = await NodeDataAccess.getById(env, id);
    if (!node) {
      return errorResponse('节点不存在', 404);
    }
    return jsonResponse(node);
  } catch (error) {
    console.error(`获取节点 ${id} 失败:`, error);
    return errorResponse('获取节点失败');
  }
}

export async function handleNodeUpdate(request: Request, env: Env, id: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { name, server, port, password, type } = (await request.json()) as NodeRequest;
    
    if (!name || !server || !port || !type) {
      return errorResponse('节点名称、服务器地址、端口和类型不能为空', 400);
    }

    const updatedNode: Node = { id, name, server, port, password, type };
    const node = await NodeDataAccess.update(env, id, updatedNode);
    return jsonResponse(node);
  } catch (error) {
    console.error('更新节点失败:', error);
    return errorResponse('更新节点失败');
  }
}

export async function handleNodeDelete(request: Request, env: Env, id: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    await NodeDataAccess.delete(env, id);
    return jsonResponse({ message: '节点删除成功' });
  } catch (error) {
    console.error('删除节点失败:', error);
    return errorResponse('删除节点失败');
  }
}