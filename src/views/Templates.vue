<template>
  <div class="templates-page">
    <a-tabs type="card" v-model:activeKey="activeKey">
      <a-tab-pane v-for="client in clients" :key="client.key" :tab="client.name">
        <div class="tab-content">
          <div class="tab-header">
            <h2 class="tab-title">{{ client.name }} 模板</h2>
            <a-space>
              <a-button @click="showImportModal(client.key)">
                <template #icon><UploadOutlined /></template>
                导入模板
              </a-button>
              <a-button type="primary" @click="showAddModal(client.key)">
                <template #icon><PlusOutlined /></template>
                添加新模板
              </a-button>
            </a-space>
          </div>
          <a-list
            class="template-list"
            :loading="loading"
            item-layout="horizontal"
            :data-source="templates[client.key]"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <template #actions>
                  <a-button type="text" size="small">编辑</a-button>
                  <a-button type="text" size="small" danger>删除</a-button>
                </template>
                <a-list-item-meta
                  :description="`这是一个${client.name}的模板描述...`"
                >
                  <template #title>
                    <a>{{ item.name }}</a>
                  </template>
                  <template #avatar>
                    <FileTextOutlined />
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { PlusOutlined, FileTextOutlined, UploadOutlined } from '@ant-design/icons-vue';

const activeKey = ref('clash');
const loading = ref(false);

const clients = [
  { key: 'clash', name: 'Clash' },
  { key: 'surge', name: 'Surge' },
  { key: 'quantumultx', name: 'Quantumult X' },
  { key: 'loon', name: 'Loon' },
  { key: 'sing-box', name: 'Sing-Box' },
];

// Placeholder data
const templates = reactive({
  clash: [
    { id: 'clash-1', name: '默认Clash模板' },
    { id: 'clash-2', name: '精简Clash模板' },
  ],
  surge: [
    { id: 'surge-1', name: '默认Surge模板' },
  ],
  quantumultx: [
    { id: 'qx-1', name: '默认Quantumult X模板' },
  ],
  loon: [],
  'sing-box': [
    { id: 'sb-1', name: '默认Sing-Box模板' },
  ],
});

const showAddModal = (clientKey: string) => {
  console.log(`Adding new template for ${clientKey}`);
  // Logic to show a modal will be added later
};

const showImportModal = (clientKey: string) => {
  console.log(`Importing template for ${clientKey}`);
  // Logic to show a modal will be added later
};

</script>

<style scoped>
.templates-page {
  padding: 24px;
}

.tab-content {
  padding: 16px;
  background: var(--surface-color);
  border-radius: 0 0 12px 12px;
  border: 1px solid var(--border-color);
  border-top: none;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.tab-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.template-list {
  background-color: transparent;
}
</style>
