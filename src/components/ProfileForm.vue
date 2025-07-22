<template>
  <a-form :model="formState" layout="vertical" @finish="onFinish">
    <a-form-item
      name="name"
      label="配置文件名称"
      :rules="[{ required: true, message: '请输入配置文件名称' }]"
    >
      <a-input v-model:value="formState.name" placeholder="例如：主力配置" />
    </a-form-item>

    <a-form-item
      label="Custom Subscription Path"
      name="alias"
      tooltip="Create a short, memorable link like /sub/my-best-nodes. Use only letters, numbers, hyphen, and underscore."
    >
      <a-input v-model:value="formState.alias" addon-before="/sub/" />
    </a-form-item>

    <a-typography-title :level="5" style="margin-top: 24px">选择节点</a-typography-title>
    <div style="display: flex; align-items: center; gap: 16px">
      <div style="flex: 1; min-width: 0">
        <a-card :title="`可选节点 (${availableNodes.length})`" size="small">
          <template #extra>
            <a-input-search
              placeholder="搜索..."
              v-model:value="nodeSearchTerm"
              style="width: 200px"
            />
          </template>
          <a-list style="height: 400px; overflow: auto" :data-source="availableNodes">
            <template #renderItem="{ item: node }">
              <a-list-item>
                <a-checkbox
                  :checked="checkedNodeIds.includes(node.id)"
                  @change="(e) => handleNodeCheckChange(node.id, e.target.checked)"
                >
                  <a-list-item-meta>
                    <template #avatar><ClusterOutlined /></template>
                    <template #title>
                      <a-typography-text
                        style="display: inline-block; max-width: 250px"
                        :ellipsis="{ tooltip: node.name }"
                        >{{ node.name }}</a-typography-text
                      >
                    </template>
                    <template #description>
                      <a-space>
                        <a-tag :color="getNodeStatusColor(node)">{{
                          getNodeStatusText(node)
                        }}</a-tag>
                        <a-tag>{{ node.type }}</a-tag>
                      </a-space>
                    </template>
                  </a-list-item-meta>
                </a-checkbox>
                <template #actions>
                  <a-button
                    shape="circle"
                    size="small"
                    :icon="
                      selectedNodeIds.includes(node.id)
                        ? h(ArrowLeftOutlined)
                        : h(ArrowRightOutlined)
                    "
                    @click="() => toggleNodeSelection(node.id)"
                  />
                </template>
              </a-list-item>
            </template>
            <template #emptyText>
              <a-empty image="Empty.PRESENTED_IMAGE_SIMPLE" description="无可用节点" />
            </template>
          </a-list>
        </a-card>
      </div>
      <a-space direction="vertical">
        <a-button
          :icon="h(ArrowRightOutlined)"
          @click="moveCheckedNodes"
          :disabled="checkedNodeIds.filter((id) => !selectedNodeIds.includes(id)).length === 0"
        />
        <a-button
          :icon="h(ArrowLeftOutlined)"
          @click="removeCheckedNodes"
          :disabled="checkedNodeIds.filter((id) => selectedNodeIds.includes(id)).length === 0"
        />
      </a-space>
      <div style="flex: 1; min-width: 0">
        <a-card :title="`已选节点 (${selectedNodes.length})`" size="small">
          <div style="height: 32px; margin-bottom: 8px"></div>
          <a-list style="height: 400px; overflow: auto" :data-source="selectedNodes">
            <template #renderItem="{ item: node }">
              <a-list-item>
                <a-checkbox
                  :checked="checkedNodeIds.includes(node.id)"
                  @change="(e) => handleNodeCheckChange(node.id, e.target.checked)"
                >
                  <a-list-item-meta>
                    <template #avatar><ClusterOutlined /></template>
                    <template #title>
                      <a-typography-text
                        style="display: inline-block; max-width: 250px"
                        :ellipsis="{ tooltip: node.name }"
                        >{{ node.name }}</a-typography-text
                      >
                    </template>
                    <template #description>
                      <a-space>
                        <a-tag :color="getNodeStatusColor(node)">{{
                          getNodeStatusText(node)
                        }}</a-tag>
                        <a-tag>{{ node.type }}</a-tag>
                      </a-space>
                    </template>
                  </a-list-item-meta>
                </a-checkbox>
                <template #actions>
                  <a-button
                    shape="circle"
                    size="small"
                    :icon="
                      selectedNodeIds.includes(node.id)
                        ? h(ArrowLeftOutlined)
                        : h(ArrowRightOutlined)
                    "
                    @click="() => toggleNodeSelection(node.id)"
                  />
                </template>
              </a-list-item>
            </template>
            <template #emptyText>
              <a-empty image="Empty.PRESENTED_IMAGE_SIMPLE" description="请从左侧添加" />
            </template>
          </a-list>
        </a-card>
      </div>
    </div>

    <a-typography-title :level="5" style="margin-top: 24px">选择订阅</a-typography-title>
    <div style="display: flex; align-items: center; gap: 16px">
      <div style="flex: 1; min-width: 0">
        <a-card :title="`可选订阅 (${availableSubs.length})`" size="small">
          <template #extra>
            <a-input-search
              placeholder="搜索..."
              v-model:value="subSearchTerm"
              style="width: 200px"
            />
          </template>
          <a-list style="height: 200px; overflow: auto" :data-source="availableSubs">
            <template #renderItem="{ item: sub }">
              <a-list-item>
                <a-checkbox
                  :checked="checkedSubIds.includes(sub.id)"
                  @change="(e) => handleSubCheckChange(sub.id, e.target.checked)"
                >
                  <a-list-item-meta>
                    <template #avatar><WifiOutlined /></template>
                    <template #title>
                      <a-typography-text
                        style="display: inline-block; max-width: 250px"
                        :ellipsis="{ tooltip: sub.name }"
                        >{{ sub.name }}</a-typography-text
                      >
                    </template>
                    <template #description
                      ><a-typography-text
                        style="display: inline-block; max-width: 250px"
                        :ellipsis="{ tooltip: sub.url }"
                        >{{ sub.url }}</a-typography-text
                      ></template
                    >
                  </a-list-item-meta>
                </a-checkbox>
                <template #actions>
                  <a-button
                    shape="circle"
                    size="small"
                    :icon="
                      selectedSubIds.includes(sub.id)
                        ? h(ArrowLeftOutlined)
                        : h(ArrowRightOutlined)
                    "
                    @click="() => toggleSubSelection(sub.id)"
                  />
                </template>
              </a-list-item>
            </template>
            <template #emptyText>
              <a-empty image="Empty.PRESENTED_IMAGE_SIMPLE" description="无可用订阅" />
            </template>
          </a-list>
        </a-card>
      </div>
      <a-space direction="vertical">
        <a-button
          :icon="h(ArrowRightOutlined)"
          @click="moveCheckedSubs"
          :disabled="checkedSubIds.filter((id) => !selectedSubIds.includes(id)).length === 0"
        />
        <a-button
          :icon="h(ArrowLeftOutlined)"
          @click="removeCheckedSubs"
          :disabled="checkedSubIds.filter((id) => selectedSubIds.includes(id)).length === 0"
        />
      </a-space>
      <div style="flex: 1; min-width: 0">
        <a-card :title="`已选订阅 (${selectedSubs.length})`" size="small">
          <div style="height: 32px; margin-bottom: 8px"></div>
          <a-list style="height: 200px; overflow: auto" :data-source="selectedSubs">
            <template #renderItem="{ item: sub }">
              <a-list-item>
                <a-checkbox
                  :checked="checkedSubIds.includes(sub.id)"
                  @change="(e) => handleSubCheckChange(sub.id, e.target.checked)"
                >
                  <a-list-item-meta>
                    <template #avatar><WifiOutlined /></template>
                    <template #title>
                      <a-typography-text
                        style="display: inline-block; max-width: 250px"
                        :ellipsis="{ tooltip: sub.name }"
                        >{{ sub.name }}</a-typography-text
                      >
                    </template>
                    <template #description
                      ><a-typography-text
                        style="display: inline-block; max-width: 250px"
                        :ellipsis="{ tooltip: sub.url }"
                        >{{ sub.url }}</a-typography-text
                      ></template
                    >
                  </a-list-item-meta>
                </a-checkbox>
                <template #actions>
                  <a-button
                    shape="circle"
                    size="small"
                    :icon="
                      selectedSubIds.includes(sub.id)
                        ? h(ArrowLeftOutlined)
                        : h(ArrowRightOutlined)
                    "
                    @click="() => toggleSubSelection(sub.id)"
                  />
                </template>
              </a-list-item>
            </template>
            <template #emptyText>
              <a-empty image="Empty.PRESENTED_IMAGE_SIMPLE" description="请从左侧添加" />
            </template>
          </a-list>
        </a-card>
      </div>
    </div>

    <a-form-item style="margin-top: 24px">
      <a-button type="primary" html-type="submit" :loading="loading" size="large">
        {{ profile ? '更新配置文件' : '创建配置文件' }}
      </a-button>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed, h } from 'vue';
import { message, Empty } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { Profile, Node, Subscription, HealthStatus } from '../types';
import {
  ArrowRightOutlined,
  ArrowLeftOutlined,
  ClusterOutlined,
  WifiOutlined,
} from '@ant-design/icons-vue';

const props = defineProps<{ profile?: Profile }>();

const router = useRouter();
const loading = ref(false);
const dataLoading = ref(true);

const allNodes = ref<Node[]>([]);
const allSubscriptions = ref<Subscription[]>([]);
const nodeStatuses = ref<Record<string, HealthStatus>>({});

const selectedNodeIds = ref<string[]>([]);
const selectedSubIds = ref<string[]>([]);

const nodeSearchTerm = ref('');
const subSearchTerm = ref('');

const checkedNodeIds = ref<string[]>([]);
const checkedSubIds = ref<string[]>([]);

interface ProfileFormValues {
  name: string;
  alias?: string;
}

const formState = reactive<ProfileFormValues>({
  name: '',
  alias: '',
});

const fetchData = async () => {
  dataLoading.value = true;
  try {
    const [nodesRes, subsRes, statusesRes] = await Promise.all([
      fetch('/api/nodes'),
      fetch('/api/subscriptions'),
      fetch('/api/node-statuses'),
    ]);
    allNodes.value = await nodesRes.json();
    allSubscriptions.value = await subsRes.json();
    nodeStatuses.value = await statusesRes.json();
  } catch (error) {
    message.error('加载资源数据失败');
  } finally {
    dataLoading.value = false;
  }
};

onMounted(async () => {
  await fetchData();
  // After data is fetched, initialize the form based on props
  if (props.profile) {
    Object.assign(formState, props.profile);
    selectedNodeIds.value = props.profile.nodes || [];
    selectedSubIds.value = props.profile.subscriptions || [];
  } else {
    formState.name = '';
    formState.alias = '';
    selectedNodeIds.value = [];
    selectedSubIds.value = [];
  }
});


const onFinish = async (values: ProfileFormValues) => {
  loading.value = true;
  const method = props.profile ? 'PUT' : 'POST';
  const url = props.profile
    ? `/api/profiles/${props.profile.id}`
    : '/api/profiles';
  const dataToSend = {
    name: values.name,
    alias: values.alias,
    nodes: selectedNodeIds.value,
    subscriptions: selectedSubIds.value,
  };

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend),
    });
    if (res.ok) {
      message.success(props.profile ? '配置文件更新成功' : '配置文件创建成功');
      router.push('/profiles');
    } else {
      const errorData = (await res.json()) as { message: string };
      throw new Error(errorData.message || '操作失败');
    }
  } catch (error) {
    if (error instanceof Error) {
        message.error(error.message);
    } else {
        message.error('操作失败，请重试');
    }
  } finally {
    loading.value = false;
  }
};

const availableNodes = computed(() => {
  const statusOrder: Record<string, number> = {
    online: 1,
    checking: 2,
    unknown: 3,
    offline: 4,
  };

  return allNodes.value
    .filter((node) => !selectedNodeIds.value.includes(node.id))
    .filter((node) => {
      const term = nodeSearchTerm.value.toLowerCase();
      return (
        node.name.toLowerCase().includes(term) ||
        node.server.toLowerCase().includes(term) ||
        node.type.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const statusA = nodeStatuses.value[a.id] || { status: 'unknown' };
      const statusB = nodeStatuses.value[b.id] || { status: 'unknown' };
      const orderA = statusOrder[statusA.status] || 99;
      const orderB = statusOrder[statusB.status] || 99;
      if (orderA !== orderB) return orderA - orderB;
      const latencyA = statusA.latency ?? Infinity;
      const latencyB = statusB.latency ?? Infinity;
      if (latencyA !== latencyB) return latencyA - latencyB;
      return a.name.localeCompare(b.name);
    });
});

const selectedNodes = computed(() => {
  return allNodes.value.filter((node) => selectedNodeIds.value.includes(node.id));
});

const availableSubs = computed(() => {
  return allSubscriptions.value
    .filter((sub) => !selectedSubIds.value.includes(sub.id))
    .filter(
      (sub) =>
        sub.name.toLowerCase().includes(subSearchTerm.value.toLowerCase()) ||
        sub.url.toLowerCase().includes(subSearchTerm.value.toLowerCase())
    );
});

const selectedSubs = computed(() => {
  return allSubscriptions.value.filter((sub) => selectedSubIds.value.includes(sub.id));
});

const handleNodeCheckChange = (id: string, checked: boolean) => {
  if (checked) {
    checkedNodeIds.value.push(id);
  } else {
    checkedNodeIds.value = checkedNodeIds.value.filter((i) => i !== id);
  }
};

const handleSubCheckChange = (id: string, checked: boolean) => {
  if (checked) {
    checkedSubIds.value.push(id);
  } else {
    checkedSubIds.value = checkedSubIds.value.filter((i) => i !== id);
  }
};

const moveCheckedNodes = () => {
  const toMove = checkedNodeIds.value.filter(
    (id) => !selectedNodeIds.value.includes(id)
  );
  selectedNodeIds.value = [...selectedNodeIds.value, ...toMove];
  checkedNodeIds.value = [];
};

const removeCheckedNodes = () => {
  const toKeep = selectedNodeIds.value.filter(
    (id) => !checkedNodeIds.value.includes(id)
  );
  selectedNodeIds.value = toKeep;
  checkedNodeIds.value = [];
};

const moveCheckedSubs = () => {
  const toMove = checkedSubIds.value.filter(
    (id) => !selectedSubIds.value.includes(id)
  );
  selectedSubIds.value = [...selectedSubIds.value, ...toMove];
  checkedSubIds.value = [];
};

const removeCheckedSubs = () => {
  const toKeep = selectedSubIds.value.filter(
    (id) => !checkedSubIds.value.includes(id)
  );
  selectedSubIds.value = toKeep;
  checkedSubIds.value = [];
};

const toggleNodeSelection = (id: string) => {
  if (selectedNodeIds.value.includes(id)) {
    selectedNodeIds.value = selectedNodeIds.value.filter(
      (nodeId) => nodeId !== id
    );
  } else {
    selectedNodeIds.value = [...selectedNodeIds.value, id];
  }
};

const toggleSubSelection = (id: string) => {
  if (selectedSubIds.value.includes(id)) {
    selectedSubIds.value = selectedSubIds.value.filter(
      (subId) => subId !== id
    );
  } else {
    selectedSubIds.value = [...selectedSubIds.value, id];
  }
};

const getNodeStatusColor = (node: Node) => {
  const status = nodeStatuses.value[node.id];
  if (!status) return 'default';
  if (status.status === 'offline') return 'error';
  if (status.status === 'online') {
    const latency = status.latency;
    if (latency && latency > 1000) return 'error';
    if (latency && latency > 500) return 'warning';
    return 'success';
  }
  return 'default';
};

const getNodeStatusText = (node: Node) => {
  const status = nodeStatuses.value[node.id];
  if (!status) return '未知';
  if (status.status === 'checking') return '检查中...';
  if (status.status === 'offline') return '离线';
  if (status.status === 'online') {
    const latency = status.latency;
    return latency ? `${latency}ms` : '在线';
  }
  return '未知';
};
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>