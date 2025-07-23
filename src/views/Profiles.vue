<template>
  <a-card>
    <div class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <a-typography-title :level="3" class="mb-2 sm:mb-0">配置文件管理</a-typography-title>
      <router-link to="/profiles/new" class="w-full sm:w-auto">
        <a-button type="primary" class="w-full sm:w-auto">
          <template #icon><PlusOutlined /></template>
          添加配置文件
        </a-button>
      </router-link>
    </div>

    <!-- Desktop Table View -->
    <a-table v-if="!isMobile" :columns="tableColumns" :data-source="profiles" row-key="id" :loading="loading" :scroll="{ x: 'max-content' }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'nodes'">
          <a-space align="center">
            <ClusterOutlined />
            <span>{{ record.nodes?.length || 0 }}</span>
          </a-space>
        </template>
        <template v-else-if="column.key === 'subscriptions'">
          <a-space align="center">
            <WifiOutlined />
            <span>{{ record.subscriptions?.length || 0 }}</span>
          </a-space>
        </template>
        <template v-else-if="column.key === 'subscribe_url'">
          <a-space v-if="origin">
            <a-tooltip :title="getSubscriptionUrl(record)">
              <a-button @click="handleCopy(getSubscriptionUrl(record))">
                <template #icon><CopyOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-button @click="showQrCode(getSubscriptionUrl(record))">
              <template #icon><QrcodeOutlined /></template>
            </a-button>
          </a-space>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space :size="isMobile ? 'small' : 'middle'" :direction="isMobile ? 'vertical' : 'horizontal'">
            <router-link :to="`/profiles/${record.id}`">
              <a-button>
                <template #icon><EditOutlined /></template>
                编辑
              </a-button>
            </router-link>
            <a-popconfirm
              title="确定要删除这个配置文件吗？"
              @confirm="handleDelete(record.id)"
              ok-text="确定"
              cancel-text="取消"
            >
              <a-button danger>
                <template #icon><DeleteOutlined /></template>
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- Mobile Card View -->
    <div v-else class="grid grid-cols-1 gap-4">
      <a-card v-for="profile in profiles" :key="profile.id" :title="profile.name" size="small">
        <p><strong>节点数:</strong> {{ profile.nodes?.length || 0 }}</p>
        <p><strong>订阅数:</strong> {{ profile.subscriptions?.length || 0 }}</p>
        <p v-if="profile.alias"><strong>别名:</strong> /sub/{{ profile.alias }}</p>
        <template #actions>
          <a-button type="text" :icon="h(CopyOutlined)" @click="handleCopy(getSubscriptionUrl(profile))">复制链接</a-button>
          <a-button type="text" :icon="h(QrcodeOutlined)" @click="showQrCode(getSubscriptionUrl(profile))">二维码</a-button>
          <router-link :to="`/profiles/${profile.id}`">
            <a-button type="text" :icon="h(EditOutlined)">编辑</a-button>
          </router-link>
          <a-popconfirm title="确定要删除这个配置文件吗？" @confirm="handleDelete(profile.id)" ok-text="确定" cancel-text="取消">
            <a-button type="text" danger :icon="h(DeleteOutlined)">删除</a-button>
          </a-popconfirm>
        </template>
      </a-card>
    </div>

    <a-modal title="订阅二维码" v-model:open="isQrCodeModalVisible" :footer="null" centered>
      <div class="flex justify-center items-center mt-5">
        <qrcode-vue :value="qrCodeUrl" :size="256" level="H" />
      </div>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted, h, onBeforeUnmount } from 'vue';
import { RouterLink } from 'vue-router';
import { message, Modal, Space, Tooltip, Button, Popconfirm, Card } from 'ant-design-vue';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CopyOutlined,
  QrcodeOutlined,
  ClusterOutlined,
  WifiOutlined,
} from '@ant-design/icons-vue';
import type { TableProps } from 'ant-design-vue';
import type { Profile } from '@shared/types';
import QrcodeVue from 'qrcode.vue';

const profiles = ref<Profile[]>([]);
const loading = ref(true);
const origin = ref('');
const isQrCodeModalVisible = ref(false);
const qrCodeUrl = ref('');

const isMobile = ref(window.innerWidth < 640); // Tailwind's sm breakpoint is 640px

const handleResize = () => {
  isMobile.value = window.innerWidth < 640;
};

const tableColumns: TableProps<Profile>['columns'] = [
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '节点数', dataIndex: 'nodes', key: 'nodes' },
  { title: '订阅数', dataIndex: 'subscriptions', key: 'subscriptions' },
  { title: '订阅链接', key: 'subscribe_url' },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 120,
    customRender: ({ record }) => (
      h(Space, { size: isMobile.value ? 'small' : 'middle', direction: isMobile.value ? 'vertical' : 'horizontal' }, () => [
        h(RouterLink, { to: `/profiles/${record.id}` }, () => h(Button, { icon: h(EditOutlined) }, () => '编辑')),
        h(Popconfirm,
          { title: '确定要删除这个配置文件吗？', onConfirm: () => handleDelete(record.id), okText: '确定', cancelText: '取消' },
          () => h(Button, { danger: true, icon: h(DeleteOutlined) }, () => '删除')
        ),
      ])
    ),
  },
];

onMounted(() => {
  if (typeof window !== 'undefined') {
    origin.value = window.location.origin;
  }
  fetchProfiles();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

const getSubscriptionUrl = (record: Profile) => {
  const baseUrl = record.alias
    ? `${origin.value}/sub/${record.alias}`
    : `${origin.value}/api/subscribe/${record.id}`;

  const clashRuleSet = record.ruleSets?.clash;
  const surgeRuleSet = record.ruleSets?.surge;

  if (clashRuleSet) {
    const url = new URL(baseUrl);
    url.searchParams.set('target', 'clash');

    if (clashRuleSet.type === 'built-in' && clashRuleSet.id !== 'default') {
      url.searchParams.set('ruleset', clashRuleSet.id!);
    }

    return url.toString();
  } else if (surgeRuleSet) {
    const url = new URL(baseUrl);
    url.searchParams.set('target', 'surge');

    if (surgeRuleSet.type === 'built-in' && surgeRuleSet.id !== 'default') {
      url.searchParams.set('ruleset', surgeRuleSet.id!);
    }

    return url.toString();
  } else if (record.ruleSets?.quantumultx) {
    const url = new URL(baseUrl);
    url.searchParams.set('target', 'quantumultx');

    if (record.ruleSets.quantumultx.type === 'built-in' && record.ruleSets.quantumultx.id !== 'default') {
      url.searchParams.set('ruleset', record.ruleSets.quantumultx.id!);
    }

    return url.toString();
  } else if (record.ruleSets?.loon) {
    const url = new URL(baseUrl);
    url.searchParams.set('target', 'loon');

    if (record.ruleSets.loon.type === 'built-in' && record.ruleSets.loon.id !== 'default') {
      url.searchParams.set('ruleset', record.ruleSets.loon.id!);
    }

    return url.toString();
  } else if (record.ruleSets?.singbox) {
    const url = new URL(baseUrl);
    url.searchParams.set('target', 'singbox');

    if (record.ruleSets.singbox.type === 'built-in' && record.ruleSets.singbox.id !== 'default') {
      url.searchParams.set('ruleset', record.ruleSets.singbox.id!);
    }

    return url.toString();
  }

  return baseUrl;
};

const fetchProfiles = async () => {
  loading.value = true;
  try {
    const res = await fetch('/api/profiles');
    if (!res.ok) throw new Error(`Failed to fetch profiles: ${res.statusText}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('API response is not an array');
    profiles.value = data as Profile[];
  } catch (error) {
    console.error('Failed to fetch profiles:', error);
    message.error('加载配置文件列表失败');
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (id: string) => {
  try {
    await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
    message.success('配置文件删除成功');
    await fetchProfiles();
  } catch (error) {
    console.error('Failed to delete profile:', error);
    message.error('删除配置文件失败');
  }
};

const handleCopy = (text: string) => {
  navigator.clipboard.writeText(text);
  message.success('订阅链接已复制到剪贴板');
};

const showQrCode = (url: string) => {
  qrCodeUrl.value = url;
  isQrCodeModalVisible.value = true;
};
</script>

<style scoped>
/* 可以根据需要添加样式 /
.ant-table-row td:last-child .ant-space {
display: flex;
align-items: center; / 添加垂直居中 */
</style>