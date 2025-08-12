---
title: Performance Optimization Guide
description: "Defines performance optimization strategies, best practices, and monitoring approaches."
inclusion: always
---

# ProSub 性能优化指南

## 性能优化概述

ProSub 性能优化旨在提升用户体验，减少加载时间，提高响应速度，并降低服务器成本。优化策略涵盖前端、后端和数据库三个层面，重点关注关键性能指标（KPIs）：

1. **首屏加载时间**：用户首次访问应用的等待时间
2. **交互响应时间**：用户操作到界面响应的时间
3. **API 响应时间**：后端接口的处理速度
4. **数据库查询性能**：数据访问效率

## 前端性能优化

### 打包优化
1. **代码分割**：
   ```javascript
   // 动态导入实现路由级别代码分割
   const Dashboard = () => import('@/views/Dashboard.vue');
   
   // 组件级别代码分割
   const HeavyComponent = defineAsyncComponent(() => 
     import('@/components/HeavyComponent.vue')
   );
   ```

2. **Tree Shaking**：
   - 使用具名导入而非默认导入
   - 移除未使用的代码和依赖
   - 定期清理无用的第三方库

3. **资源压缩**：
   ```javascript
   // vite.config.ts
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['vue', 'vue-router', 'pinia'],
             ui: ['ant-design-vue']
           }
         }
       },
       chunkSizeWarningLimit: 1000
     }
   });
   ```

### 图片优化
1. **格式选择**：
   - 照片使用 WebP 格式
   - 图标使用 SVG 格式
   - 简单图形使用 PNG 格式

2. **懒加载**：
   ```vue
   <template>
     <img v-lazy="imageSrc" alt="描述" />
   </template>
   
   <script setup>
   import { directive as lazy } from 'vue-lazyload';
   const vLazy = lazy;
   </script>
   ```

3. **响应式图片**：
   ```html
   <picture>
     <source media="(max-width: 799px)" srcset="small.jpg">
     <source media="(min-width: 800px)" srcset="large.jpg">
     <img src="default.jpg" alt="描述">
   </picture>
   ```

### 组件性能优化
1. **虚拟滚动**：
   ```vue
   <template>
     <virtual-list
       :items="largeList"
       :item-height="50"
       :visible-count="10"
     >
       <template #default="{ item }">
         <div>{{ item.name }}</div>
       </template>
     </virtual-list>
   </template>
   ```

2. **记忆化计算**：
   ```javascript
   import { computed } from 'vue';

   const expensiveValue = computed(() => {
     // 复杂计算逻辑
     return heavyComputation(data.value);
   });
   ```

3. **组件缓存**：
   ```vue
   <template>
     <keep-alive :include="['Dashboard', 'Nodes']">
       <router-view />
     </keep-alive>
   </template>
   ```

### 网络优化
1. **HTTP/2**：
   - 利用 Cloudflare 自动启用 HTTP/2
   - 合理设置资源优先级

2. **缓存策略**：
   ```javascript
   // vite.config.ts
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           entryFileNames: 'assets/[name].[hash].js',
           chunkFileNames: 'assets/[name].[hash].js',
           assetFileNames: 'assets/[name].[hash].[ext]'
         }
       }
     }
   });
   ```

3. **预加载关键资源**：
   ```html
   <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
   <link rel="prefetch" href="/api/nodes" as="fetch" crossorigin>
   ```

## 后端性能优化

### Workers 优化
1. **冷启动优化**：
   ```javascript
   // 预初始化耗时操作
   const initPromise = initializeExpensiveResource();
   
   export default {
     async fetch(request, env) {
       await initPromise;
       // 处理请求
     }
   };
   ```

2. **内存管理**：
   - 避免创建大型对象
   - 及时释放无用引用
   - 使用对象池复用对象

3. **并发处理**：
   ```javascript
   // 并行处理多个异步操作
   const [nodes, subscriptions, profiles] = await Promise.all([
     fetchNodes(env),
     fetchSubscriptions(env),
     fetchProfiles(env)
   ]);
   ```

### 缓存策略
1. **KV 缓存**：
   ```javascript
   // 缓存订阅生成结果
   const cacheKey = `subscription:${profileId}:${userAgent}`;
   let cached = await env.KV.get(cacheKey);
   
   if (!cached) {
     const result = await generateSubscription(profile, env);
     await env.KV.put(cacheKey, result, { expirationTtl: 600 });
     cached = result;
   }
   
   return new Response(cached);
   ```

2. **响应缓存**：
   ```javascript
   // 设置 HTTP 缓存头
   return new Response(JSON.stringify(data), {
     headers: {
       'Cache-Control': 'public, max-age=300',
       'ETag': generateETag(data)
     }
   });
   ```

### API 优化
1. **分页处理**：
   ```javascript
   // 实现分页查询
   export async function handleNodesGet(request, env) {
     const url = new URL(request.url);
     const page = parseInt(url.searchParams.get('page') || '1');
     const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
     const offset = (page - 1) * limit;
     
     const nodes = await NodeDataAccess.getPage(env, limit, offset);
     return jsonResponse(nodes);
   }
   ```

2. **字段筛选**：
   ```javascript
   // 支持客户端指定返回字段
   const fields = url.searchParams.get('fields')?.split(',') || [];
   if (fields.length > 0) {
     result = pick(result, fields);
   }
   ```

## 数据库性能优化

### 查询优化
1. **索引优化**：
   ```sql
   -- 为常用查询字段创建索引
   CREATE INDEX idx_nodes_status ON nodes(status);
   CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
   CREATE INDEX idx_profiles_name ON profiles(name);
   ```

2. **查询语句优化**：
   ```javascript
   // 避免 SELECT *，只查询需要的字段
   const query = `
     SELECT id, name, server, port, status 
     FROM nodes 
     WHERE status = 'active' 
     LIMIT ? OFFSET ?
   `;
   ```

3. **批量操作**：
   ```javascript
   // 批量插入节点
   const insertQuery = `
     INSERT INTO nodes (id, name, server, port, type) 
     VALUES ?;
   `;
   
   const values = nodes.map(node => [
     node.id, node.name, node.server, node.port, node.type
   ]);
   
   await db.prepare(insertQuery).bind(values).run();
   ```

### 连接池优化
```javascript
// 合理配置数据库连接
export interface Env {
  DB: D1Database;
  // 复用数据库连接，避免频繁创建新连接
}
```

### 数据模型优化
1. **规范化设计**：
   - 合理拆分表结构避免冗余
   - 使用外键维护数据一致性

2. **反规范化优化**：
   - 适当冗余常用字段避免 JOIN
   - 预计算聚合数据

## 监控和分析

### 性能指标监控
1. **前端监控**：
   ```javascript
   // 使用 Performance API 监控关键指标
   const observer = new PerformanceObserver((list) => {
     for (const entry of list.getEntries()) {
       if (entry.name === 'first-contentful-paint') {
         console.log('FCP:', entry.startTime);
       }
     }
   });
   observer.observe({ entryTypes: ['paint'] });
   ```

2. **后端监控**：
   ```javascript
   // 记录 API 响应时间
   const start = Date.now();
   // 处理请求
   const end = Date.now();
   console.log(`API Response Time: ${end - start}ms`);
   ```

### 错误监控
1. **前端错误捕获**：
   ```javascript
   // 全局错误处理
   window.addEventListener('error', (event) => {
     console.error('全局错误:', event.error);
   });
   
   // Promise 错误捕获
   window.addEventListener('unhandledrejection', (event) => {
     console.error('未处理的 Promise 错误:', event.reason);
   });
   ```

2. **后端错误监控**：
   ```javascript
   export default {
     async fetch(request, env) {
       try {
         // 处理请求
       } catch (error) {
         console.error('API 错误:', error);
         return errorResponse('内部服务器错误');
       }
     }
   };
   ```

### 性能分析工具
1. **Lighthouse**：
   ```bash
   # 运行 Lighthouse 审计
   npx lighthouse https://your-domain.com
   ```

2. **Web Vitals**：
   ```javascript
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

   getCLS(console.log);
   getFID(console.log);
   getFCP(console.log);
   getLCP(console.log);
   getTTFB(console.log);
   ```

## 性能测试

### 基准测试
```javascript
// 使用 Benchmark.js 进行性能测试
import Benchmark from 'benchmark';

const suite = new Benchmark.Suite;

suite
  .add('RegExp#test', function() {
    /o/.test('Hello World!');
  })
  .add('String#indexOf', function() {
    'Hello World!'.indexOf('o') > -1;
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ 'async': true });
```

### 负载测试
```javascript
// 使用 Artillery 进行负载测试
// load-test.yml
config:
  target: "https://your-api.com"
  phases:
    - duration: 60
      arrivalRate: 20
scenarios:
  - name: "Get Nodes"
    flow:
      - get:
          url: "/api/nodes"
```

## 优化最佳实践

### 前端最佳实践
1. **组件设计**：
   - 保持组件轻量级
   - 合理使用 props 和 emits
   - 避免不必要的重新渲染

2. **状态管理**：
   ```javascript
   // 使用 shallowRef 避免深层响应式
   const largeObject = shallowRef({});
   
   // 合理分割状态
   const nodeStore = defineStore('nodes', () => {
     const nodes = ref([]);
     const loading = ref(false);
     return { nodes, loading };
   });
   ```

### 后端最佳实践
1. **错误处理**：
   ```javascript
   // 统一错误处理中间件
   export async function errorHandler(request, env, ctx, next) {
     try {
       return await next();
     } catch (error) {
       console.error('Unhandled error:', error);
       return errorResponse('内部服务器错误', 500);
     }
   }
   ```

2. **日志记录**：
   ```javascript
   // 结构化日志记录
   console.log(JSON.stringify({
     level: 'info',
     message: 'User login',
     userId: user.id,
     timestamp: new Date().toISOString()
   }));
   ```

### 数据库最佳实践
1. **查询优化**：
   ```javascript
   // 使用预编译语句
   const stmt = db.prepare('SELECT * FROM nodes WHERE status = ?');
   const nodes = await stmt.bind('active').all();
   ```

2. **事务处理**：
   ```javascript
   // 批量操作使用事务
   const batch = db.batch([
     db.prepare('INSERT INTO nodes (id, name) VALUES (?, ?)').bind(id1, name1),
     db.prepare('INSERT INTO nodes (id, name) VALUES (?, ?)').bind(id2, name2)
   ]);
   await batch.run();
   ```

## 性能优化检查清单

### 前端检查项
- [ ] 实现代码分割和懒加载
- [ ] 优化图片资源格式和大小
- [ ] 使用合适的缓存策略
- [ ] 减少第三方库的使用
- [ ] 优化组件重新渲染
- [ ] 实现虚拟滚动处理大数据集
- [ ] 使用 Web Workers 处理复杂计算

### 后端检查项
- [ ] 实现 API 响应缓存
- [ ] 优化数据库查询语句
- [ ] 使用批量操作减少请求次数
- [ ] 实现合理的错误处理和重试机制
- [ ] 设置适当的超时时间
- [ ] 使用连接池管理数据库连接
- [ ] 实现请求限流防止滥用

### 数据库检查项
- [ ] 为常用查询字段创建索引
- [ ] 避免 SELECT * 查询
- [ ] 使用预编译语句防止 SQL 注入
- [ ] 合理设计表结构避免冗余
- [ ] 定期分析查询执行计划
- [ ] 实现数据归档策略
- [ ] 使用事务保证数据一致性

## 性能监控仪表板

### 关键指标展示
1. **前端性能**：
   - 首屏加载时间
   - 交互响应时间
   - 资源加载时间

2. **后端性能**：
   - API 响应时间
   - 错误率
   - 请求吞吐量

3. **数据库性能**：
   - 查询响应时间
   - 连接数
   - 缓存命中率

### 告警机制
```javascript
// 性能告警示例
if (responseTime > 1000) {
  console.warn('API 响应时间过长:', responseTime);
  // 发送告警通知
}

if (errorRate > 0.05) {
  console.error('错误率过高:', errorRate);
  // 触发告警
}
```

## 持续性能优化

### 性能回归检测
1. **自动化测试**：
   ```bash
   # 运行性能测试
   npm run test:performance
   
   # 比较基准性能数据
   npm run test:benchmark
   ```

2. **性能门禁**：
   - 关键 API 响应时间不超过 500ms
   - 页面加载时间不超过 3s
   - 首屏渲染时间不超过 1.5s

### 定期优化审查
1. **月度审查**：
   - 分析性能监控数据
   - 识别性能瓶颈
   - 制定优化计划

2. **季度评估**：
   - 评估优化效果
   - 更新性能基准
   - 调整优化策略

通过以上全面的性能优化策略和实践，ProSub 能够为用户提供流畅、快速的使用体验，同时降低服务器成本，提高系统稳定性。