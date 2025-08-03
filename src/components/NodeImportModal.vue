<script setup lang="ts">
import { ref, watch } from 'vue';
import { parseNodeLink } from '@shared/node-parser';
import { Node } from '@shared/types';
import { CloseOutlined } from '@ant-design/icons-vue';

interface ParsedNodeResult {
  node: Node;
  originalLink: string;
  error?: string;
}

const emit = defineEmits<{
  import: [nodes: Node[]];
}>();

const isOpen = ref(false);
const nodeInput = ref('');
const parsedNodes = ref<ParsedNodeResult[]>([]);
const importing = ref(false);

const open = () => {
  isOpen.value = true;
};

const close = () => {
  isOpen.value = false;
  nodeInput.value = '';
  parsedNodes.value = [];
};

watch(nodeInput, (newValue) => {
  parsedNodes.value = [];
  const lines = newValue.split('\n').filter(line => line.trim() !== '');
  
  lines.forEach((line, index) => {
    try {
      const parsedNode = parseNodeLink(line.trim());
      
      if (!parsedNode) {
        parsedNodes.value.push({
          node: {
            id: `temp-${index}`,
            name: `无法解析的节点 ${index + 1}`,
            server: '',
            port: 0,
            type: 'unknown',
            password: '',
            params: {}
          },
          originalLink: line,
          error: '无法解析此链接格式'
        });
        return;
      }
      
      // 验证必要字段
      if (!parsedNode.server || !parsedNode.port) {
        parsedNodes.value.push({
          node: {
            id: `temp-${index}`,
            name: parsedNode.name || `节点 ${index + 1}`,
            server: parsedNode.server || '',
            port: parsedNode.port || 0,
            type: parsedNode.type || 'vmess',
            password: parsedNode.password || '',
            params: parsedNode.params || {}
          },
          originalLink: line,
          error: '节点信息不完整（缺少服务器地址或端口）'
        });
        return;
      }
      
      // 成功解析的节点
      parsedNodes.value.push({
        node: {
          id: `temp-${index}`,
          name: parsedNode.name || `${parsedNode.server}:${parsedNode.port}`,
          server: parsedNode.server,
          port: parsedNode.port,
          type: parsedNode.type || 'vmess',
          password: parsedNode.password || '',
          params: parsedNode.params || {}
        },
        originalLink: line
      });
    } catch (error) {
      console.error(`Error parsing line ${index + 1}: ${line}`, error);
      parsedNodes.value.push({
        node: {
          id: `temp-${index}`,
          name: `解析失败的节点 ${index + 1}`,
          server: '',
          port: 0,
          type: 'unknown',
          password: '',
          params: {}
        },
        originalLink: line,
        error: `解析错误: ${error}`
      });
    }
  });
});

const getValidNodes = () => {
  return parsedNodes.value.filter(item => !item.error).map(item => item.node);
};

const removeNode = (index: number) => {
  parsedNodes.value.splice(index, 1);
};

const importNodes = () => {
  const validNodes = getValidNodes();
  if (validNodes.length === 0) {
    alert('没有有效的节点可以导入');
    return;
  }
  
  importing.value = true;
  emit('import', validNodes);
  close();
  importing.value = false;
};

// 表格列定义
const columns = [
  {
    title: '状态',
    key: 'status',
    width: 80
  },
  {
    title: '名称',
    key: 'name',
    dataIndex: ['node', 'name']
  },
  {
    title: '类型',
    key: 'type',
    dataIndex: ['node', 'type']
  },
  {
    title: '服务器',
    key: 'server',
    dataIndex: ['node', 'server']
  },
  {
    title: '端口',
    key: 'port',
    dataIndex: ['node', 'port']
  },
  {
    title: '错误信息',
    key: 'error',
    dataIndex: 'error'
  }
];

defineExpose({
  open
});
</script>

<template>
  <a-modal
    v-model:open="isOpen"
    title="导入节点"
    width="800px"
    :footer="null"
    @cancel="close"
  >
    <div class="import-modal">
      <div class="input-section">
        <a-textarea
          v-model:value="nodeInput"
          placeholder="请输入节点链接，每行一个链接&#10;支持的格式：&#10;- vmess://...&#10;- vless://...&#10;- trojan://...&#10;- ss://...&#10;- ssr://...&#10;- 服务器:端口:密码"
          :rows="8"
          class="node-input"
        />
      </div>
      
      <div class="parse-results">
        <h4>解析结果</h4>
        <div class="stats">
          <span class="stat-item">
            <span class="stat-label">有效节点:</span>
            <span class="stat-value success">{{ getValidNodes().length }}</span>
          </span>
          <span class="stat-item">
            <span class="stat-label">总节点:</span>
            <span class="stat-value">{{ parsedNodes.length }}</span>
          </span>
        </div>
        
        <div class="nodes-table-container">
          <a-table
            :data-source="parsedNodes"
            :columns="columns"
            :pagination="false"
            size="small"
            class="nodes-table"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.error ? 'error' : 'success'">
                  {{ record.error ? '失败' : '成功' }}
                </a-tag>
              </template>
              
              <template v-if="column.key === 'name'">
                <div class="node-name">
                  <span>{{ record.node.name }}</span>
                  <a-button
                    v-if="record.error"
                    type="text"
                    size="small"
                    @click="removeNode(index)"
                    class="remove-btn"
                  >
                    <template #icon><CloseOutlined /></template>
                  </a-button>
                </div>
              </template>
              
              <template v-if="column.key === 'error'">
                <span v-if="record.error" class="error-message">{{ record.error }}</span>
              </template>
            </template>
          </a-table>
        </div>
      </div>
      
      <div class="modal-footer">
        <a-space>
          <a-button @click="close">取消</a-button>
          <a-button
            type="primary"
            @click="importNodes"
            :loading="importing"
            :disabled="getValidNodes().length === 0"
          >
            导入 {{ getValidNodes().length }} 个节点
          </a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<style scoped>
.import-modal {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-section {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  background: var(--surface-color);
}

.node-input {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
}

.parse-results {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  background: var(--surface-color);
}

.parse-results h4 {
  margin: 0 0 12px 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
}

.stats {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--background-color);
  border-radius: 6px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 14px;
}

.stat-value {
  font-weight: 600;
  font-size: 16px;
}

.stat-value.success {
  color: #52c41a;
}

.nodes-table-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--border-light);
  border-radius: 6px;
}

.nodes-table {
  border-radius: 6px;
}

.nodes-table :deep(.ant-table-thead > tr > th) {
  background: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
}

.nodes-table :deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid var(--border-light);
}

.node-name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.remove-btn {
  color: #ff4d4f;
  padding: 2px;
  height: auto;
}

.remove-btn:hover {
  background: #fff2f0;
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  word-break: break-all;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats {
    flex-direction: column;
    gap: 8px;
  }
  
  .nodes-table-container {
    max-height: 200px;
  }
}
</style>
