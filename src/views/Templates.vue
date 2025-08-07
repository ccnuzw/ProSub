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
          <a-table
            :columns="columns"
            :data-source="templates[client.key]"
            :loading="loading"
            row-key="id"
            :pagination="false"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'updatedAt'">
                {{ formatDateTime(record.updatedAt) }}
              </template>
              <template v-if="column.key === 'actions'">
                <a-space>
                  <a-button type="text" size="small" @click="showEditModal(record)">编辑</a-button>
                  <a-button type="text" size="small" danger @click="handleDelete(record)">删除</a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </div>
      </a-tab-pane>
    </a-tabs>

    <TemplateFormModal
      :visible="isModalVisible"
      :is-edit="isEditMode"
      :initial-data="currentTemplate"
      :client-type="activeKey"
      @update:visible="isModalVisible = $event"
      @saved="fetchTemplates"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import TemplateFormModal from '../components/TemplateFormModal.vue';

interface Template {
  id: string;
  name: string;
  description: string;
  clientType: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const activeKey = ref('clash');
const loading = ref(false);
const isModalVisible = ref(false);
const isEditMode = ref(false);
const currentTemplate = ref<Template | null>(null);

const clients = [
  { key: 'clash', name: 'Clash' },
  { key: 'surge', name: 'Surge' },
  { key: 'quantumultx', name: 'Quantumult X' },
  { key: 'loon', name: 'Loon' },
  { key: 'sing-box', name: 'Sing-Box' },
];

const columns = [
  {
    title: '模板名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    width: 350,
  },
  {
    title: '修改时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    width: 250,
    align: 'center',
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    align: 'center',
  },
];

const templates = reactive<Record<string, Template[]>>({
  clash: [],
  surge: [],
  quantumultx: [],
  loon: [],
  'sing-box': [],
});

const fetchTemplates = async () => {
  loading.value = true;
  try {
    const response = await fetch('/api/templates');
    if (response.ok) {
      const data: Template[] = await response.json();
      // Clear existing data
      for (const key in templates) {
        templates[key] = [];
      }
      // Populate templates by clientType
      data.forEach(template => {
        if (templates[template.clientType]) {
          templates[template.clientType].push(template);
        }
      });
    } else {
      message.error('获取模板失败');
    }
  } catch (error) {
    console.error('获取模板失败:', error);
    message.error('获取模板失败');
  } finally {
    loading.value = false;
  }
};

const formatDateTime = (dateTimeString: string) => {
  if (!dateTimeString) return '';
  // Assuming format is ISO string like "YYYY-MM-DDTHH:mm:ss.sssZ"
  return dateTimeString.slice(0, 19).replace('T', ' ');
};

const showAddModal = (clientKey: string) => {
  isEditMode.value = false;
  currentTemplate.value = null;
  activeKey.value = clientKey; // Ensure modal opens on correct tab
  isModalVisible.value = true;
};

const showEditModal = (template: Template) => {
  isEditMode.value = true;
  currentTemplate.value = template;
  activeKey.value = template.clientType; // Ensure modal opens on correct tab
  isModalVisible.value = true;
};

const handleDelete = async (template: Template) => {
  try {
    const response = await fetch(`/api/templates/${template.id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      message.success('模板删除成功');
      fetchTemplates();
    } else {
      const errorData = await response.json();
      message.error(errorData.message || '删除失败');
    }
  } catch (error) {
    console.error('删除模板失败:', error);
    message.error('删除模板失败');
  }
};

const showImportModal = (clientKey: string) => {
  console.log(`Importing template for ${clientKey}`);
  // Logic to show a modal will be added later
};

onMounted(() => {
  fetchTemplates();
});
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
</style>
