<template>
  <a-typography-title :level="5" class="mt-6">选择节点</a-typography-title>
  <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4">
    <div class="flex-1 w-full min-w-0">
      <a-card :title="`可选节点 (${availableNodes.length})`" size="small">
        <template #extra>
          <a-input-search
            placeholder="搜索..."
            v-model:value="nodeSearchTerm"
            class="w-full sm:w-48"
          />
        </template>
        <a-list style="height: 600px; overflow: auto" :data-source="availableNodes">
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
                      class="inline-block max-w-full sm:max-w-xs"
                      :ellipsis="{ tooltip: node.name }"
                      >{{ node.name }}</a-typography-text
                    >
                  </template>
                  <template #description>
                    <a-space>
                      <a-tag :color="getNodeStatusColor(node)">{{
                        getNodeStatusText(node)
                      }}</a-tag>
                      <a-tag :color="getNodeTypeColor(node.type)">{{ node.type }}</a-tag>
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
        </a-list>
      </a-card>
    </div>
    <div class="flex flex-col sm:flex-row items-center justify-center gap-2 my-4 sm:my-0">
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
    </div>
    <div class="flex-1 w-full min-w-0">
      <a-card :title="`已选节点 (${selectedNodes.length})`" size="small">
        <div class="h-8 mb-2"></div>
        <a-list style="height: 600px; overflow: auto" :data-source="selectedNodes">
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
                      class="inline-block max-w-full sm:max-w-xs"
                      :ellipsis="{ tooltip: node.name }"
                      >{{ node.name }}</a-typography-text
                    >
                  </template>
                  <template #description>
                    <a-space>
                      <a-tag :color="getNodeStatusColor(node)">{{
                        getNodeStatusText(node)
                      }}</a-tag>
                      <a-tag :color="getNodeTypeColor(node.type)">{{ node.type }}</a-tag>
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
        </a-list>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue';
import { Node, HealthStatus } from '@shared/types';
import {
  ArrowRightOutlined,
  ArrowLeftOutlined,
  ClusterOutlined,
} from '@ant-design/icons-vue';

const props = defineProps<{ 
  allNodes: Node[];
  nodeStatuses: Record<string, HealthStatus>;
  selectedNodeIds: string[];
}>();

const emit = defineEmits<{ 
  (e: 'update:selectedNodeIds', value: string[]): void;
}>();

const nodeSearchTerm = ref('');
const checkedNodeIds = ref<string[]>([]);

const availableNodes = computed(() => {
  const statusOrder: Record<string, number> = {
    online: 1,
    checking: 2,
    unknown: 3,
    offline: 4,
  };

  return props.allNodes
    .filter((node) => !props.selectedNodeIds.includes(node.id))
    .filter((node) => {
      const term = nodeSearchTerm.value.toLowerCase();
      return (
        node.name.toLowerCase().includes(term) ||
        node.server.toLowerCase().includes(term) ||
        node.type.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const statusA = props.nodeStatuses[a.id] || { status: 'unknown' };
      const statusB = props.nodeStatuses[b.id] || { status: 'unknown' };
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
  return props.allNodes.filter((node) => props.selectedNodeIds.includes(node.id));
});

const handleNodeCheckChange = (id: string, checked: boolean) => {
  if (checked) {
    checkedNodeIds.value.push(id);
  } else {
    checkedNodeIds.value = checkedNodeIds.value.filter((i) => i !== id);
  }
};

const moveCheckedNodes = () => {
  const toMove = checkedNodeIds.value.filter(
    (id) => !props.selectedNodeIds.includes(id)
  );
  emit('update:selectedNodeIds', [...props.selectedNodeIds, ...toMove]);
  checkedNodeIds.value = [];
};

const removeCheckedNodes = () => {
  const toKeep = props.selectedNodeIds.filter(
    (id) => !checkedNodeIds.value.includes(id)
  );
  emit('update:selectedNodeIds', toKeep);
  checkedNodeIds.value = [];
};

const toggleNodeSelection = (id: string) => {
  if (props.selectedNodeIds.includes(id)) {
    emit('update:selectedNodeIds', props.selectedNodeIds.filter(
      (nodeId) => nodeId !== id
    ));
  } else {
    emit('update:selectedNodeIds', [...props.selectedNodeIds, id]);
  }
};

const getNodeStatusColor = (node: Node) => {
  const status = props.nodeStatuses[node.id];
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
  const status = props.nodeStatuses[node.id];
  if (!status) return '未知';
  if (status.status === 'checking') return '检查中...';
  if (status.status === 'offline') return '离线';
  if (status.status === 'online') {
    const latency = status.latency;
    return latency ? `${latency}ms` : '在线';
  }
  return '未知';
};

const getNodeTypeColor = (type: string) => {
  switch (type) {
    case 'ss':
    case 'ssr':
      return 'blue';
    case 'vmess':
      return 'green';
    case 'vless':
    case 'vless-reality':
      return 'purple';
    case 'trojan':
      return 'red';
    case 'socks5':
      return 'orange';
    case 'anytls':
      return 'cyan';
    case 'tuic':
      return 'geekblue';
    case 'hysteria':
    case 'hysteria2':
      return 'volcano';
    default:
      return 'default';
  }
};
</script>
