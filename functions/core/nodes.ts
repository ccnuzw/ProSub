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
  params?: Record<string, any>;
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
    const nodeData = await request.json() as NodeRequest;
    const { name, server, port, password, type, params } = nodeData;
    
    if (!name || !server || !port || !type) {
      return errorResponse('节点名称、服务器地址、端口和类型不能为空', 400);
    }

    // 验证端口范围
    if (port < 1 || port > 65535) {
      return errorResponse('端口必须在1-65535范围内', 400);
    }

    const id = crypto.randomUUID();
    const newNode: Node = { 
      id, 
      name, 
      server, 
      port, 
      password: password || '', 
      type,
      params: params || {}
    };

    console.log('正在创建节点:', { id, name, server, port, type });
    
    await NodeDataAccess.create(env, newNode);
    
    console.log('节点创建成功:', id);
    return jsonResponse(newNode);
  } catch (error) {
    console.error('创建节点失败:', error);
    return errorResponse('创建节点失败');
  }
}

export async function handleNodesBatchCreate(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { nodes } = await request.json() as { nodes: NodeRequest[] };
    
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      return errorResponse('请求体中需要提供一个包含节点数据的数组', 400);
    }

    const results = []
    let successCount = 0
    let errorCount = 0

    // 批量处理节点
    for (const nodeData of nodes) {
      try {
        const { name, server, port, password, type, params } = nodeData;
        
        if (!name || !server || !port || !type) {
          errorCount++
          results.push({ 
            success: false, 
            node: nodeData, 
            error: '节点名称、服务器地址、端口和类型不能为空' 
          })
          continue
        }

        // 验证端口范围
        if (port < 1 || port > 65535) {
          errorCount++
          results.push({ 
            success: false, 
            node: nodeData, 
            error: '端口必须在1-65535范围内' 
          })
          continue
        }

        const id = crypto.randomUUID();
        const newNode: Node = { 
          id, 
          name, 
          server, 
          port, 
          password: password || '', 
          type,
          params: params || {}
        };

        console.log('正在创建节点:', { id, name, server, port, type });
        
        await NodeDataAccess.create(env, newNode);
        
        console.log('节点创建成功:', id);
        successCount++
        results.push({ success: true, node: newNode })
      } catch (error) {
        errorCount++
        console.error('创建节点失败:', error)
        results.push({ 
          success: false, 
          node: nodeData, 
          error: error instanceof Error ? error.message : '创建节点失败' 
        })
      }
    }

    return jsonResponse({
      message: `批量创建完成！成功 ${successCount} 个，失败 ${errorCount} 个`,
      successCount,
      errorCount,
      results
    });
  } catch (error) {
    console.error('批量创建节点失败:', error);
    return errorResponse('批量创建节点失败');
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
    const nodeData = await request.json() as NodeRequest;
    const { name, server, port, password, type, params } = nodeData;
    
    if (!name || !server || !port || !type) {
      return errorResponse('节点名称、服务器地址、端口和类型不能为空', 400);
    }

    // 验证端口范围
    if (port < 1 || port > 65535) {
      return errorResponse('端口必须在1-65535范围内', 400);
    }

    const updatedNode: Node = { 
      id, 
      name, 
      server, 
      port, 
      password: password || '', 
      type,
      params: params || {}
    };
    
    console.log('正在更新节点:', { id, name, server, port, type });
    
    const node = await NodeDataAccess.update(env, id, updatedNode);
    
    console.log('节点更新成功:', id);
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