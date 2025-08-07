<template>
  <a-typography-title :level="5" class="mt-6">选择订阅</a-typography-title>
  <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4">
    <div class="flex-1 w-full min-w-0">
      <a-card :title="`可选订阅 (${availableSubs.length})`" size="small">
        <template #extra>
          <a-input-search placeholder="搜索..." v-model:value="subSearchTerm" class="w-full sm:w-48" />
        </template>
        <a-list style="height: 200px; overflow: auto" :data-source="availableSubs">
          <template #renderItem="{ item: sub }">
            <a-list-item>
              <a-checkbox :checked="checkedSubIds.includes(sub.id)" @change="(e) => handleSubCheckChange(sub.id, e.target.checked)">
                <a-list-item-meta>
                   <template #avatar><WifiOutlined /></template>
                  <template #title>
                    <a-typography-text class="inline-block max-w-full sm:max-w-xs" :ellipsis="{ tooltip: sub.name }">{{ sub.name }}</a-typography-text>
                  </template>
                </a-list-item-meta>
              </a-checkbox>
              <template #actions>
                <a-button shape="circle" size="small" :icon="h-96" @click="() => toggleSubSelection(sub.id)" />
              </template>
            </a-list-item>
          </template>
        </a-list>
      </a-card>
    </div>
    
    <div class="flex flex-col sm:flex-row items-center justify-center gap-2 my-4 sm:my-0">
      <a-button :icon="h-96" @click="moveCheckedSubs" :disabled="checkedSubIds.filter((id) => !selectedSubIds.map(s => s.id).includes(id)).length === 0" />
      <a-button :icon="h(ArrowLeftOutlined)" @click="removeCheckedSubs" :disabled="checkedSubIds.filter((id) => selectedSubIds.map(s => s.id).includes(id)).length === 0" />
    </div>
    
    <div class="flex-1 w-full min-w-0">
      <a-card :title="`已选订阅 (${selectedSubs.length})`" size="small">
        <div class="h-8 mb-2"></div>
        <a-list style="height: 200px; overflow: auto" :data-source="selectedSubs">
          <template #renderItem="{ item: sub }">
            <a-list-item>
              <a-checkbox :checked="checkedSubIds.includes(sub.id)" @change="(e) => handleSubCheckChange(sub.id, e.target.checked)">
                <a-list-item-meta>
                   <template #avatar><WifiOutlined /></template>
                  <template #title>
                    <a-typography-text class="inline-block max-w-full sm:max-w-xs" :ellipsis="{ tooltip: sub.name }">{{ sub.name }}</a-typography-text>
                  </template>
                </a-list-item-meta>
              </a-checkbox>
              <template #actions>
                <a-badge :count="sub.rules?.length || 0" size="small">
                  <a-button size="small" @click="() => openRuleModal(sub)">规则</a-button>
                </a-badge>
                <a-button shape="circle" size="small" :icon="h(ArrowLeftOutlined)" @click="() => toggleSubSelection(sub.id)" />
              </template>
            </a-list-item>
          </template>
        </a-list>
      </a-card>
    </div>
  </div>

  <SubscriptionRuleModal
    v-if="editingSubscription"
    v-model:visible="isRuleModalVisible"
    :rules="editingSubscription.rules || []"
    :subscription-name="getSubscriptionName(editingSubscription.id)"
    @save="saveSubscriptionRules"
  />
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue';
import { Subscription, ProfileSubscription, SubscriptionRule } from '@shared/types';
import {
  ArrowRightOutlined,
  ArrowLeftOutlined,
  WifiOutlined,
} from '@ant-design/icons-vue';
import SubscriptionRuleModal from './SubscriptionRuleModal.vue';

const props = defineProps<{ 
  allSubscriptions: Subscription[];
  selectedSubIds: ProfileSubscription[];
}>();

const emit = defineEmits<{ 
  (e: 'update:selectedSubIds', value: ProfileSubscription[]): void;
}>();

const subSearchTerm = ref('');
const checkedSubIds = ref<string[]>([]);

const isRuleModalVisible = ref(false);
const editingSubscription = ref<ProfileSubscription | null>(null);

const selectedSubIdSet = computed(() => new Set(props.selectedSubIds.map(s => s.id)));

const availableSubs = computed(() => {
  return props.allSubscriptions
    .filter((sub) => !selectedSubIdSet.value.has(sub.id))
    .filter(
      (sub) =>
        sub.name.toLowerCase().includes(subSearchTerm.value.toLowerCase()) ||
        sub.url.toLowerCase().includes(subSearchTerm.value.toLowerCase())
    );
});

const selectedSubs = computed(() => {
  return props.selectedSubIds.map(profileSub => {
    const subInfo = props.allSubscriptions.find(s => s.id === profileSub.id);
    return {
      ...profileSub,
      name: subInfo?.name || '未知订阅',
    };
  });
});

const handleSubCheckChange = (id: string, checked: boolean) => {
  if (checked) {
    checkedSubIds.value.push(id);
  } else {
    checkedSubIds.value = checkedSubIds.value.filter((i) => i !== id);
  }
};

const moveCheckedSubs = () => {
  const toMove = checkedSubIds.value
    .filter((id) => !selectedSubIdSet.value.has(id))
    .map(id => ({ id, rules: [] }));
  emit('update:selectedSubIds', [...props.selectedSubIds, ...toMove]);
  checkedSubIds.value = [];
};

const removeCheckedSubs = () => {
  const checkedSet = new Set(checkedSubIds.value);
  emit('update:selectedSubIds', props.selectedSubIds.filter((sub) => !checkedSet.has(sub.id)));
  checkedSubIds.value = [];
};

const toggleSubSelection = (id: string) => {
  if (selectedSubIdSet.value.has(id)) {
    emit('update:selectedSubIds', props.selectedSubIds.filter(
      (sub) => sub.id !== id
    ));
  } else {
    emit('update:selectedSubIds', [...props.selectedSubIds, { id, rules: [] }]);
  }
};

const openRuleModal = (subscription: ProfileSubscription) => {
  // 创建一个深拷贝，确保编辑的是独立副本
  editingSubscription.value = JSON.parse(JSON.stringify(subscription));
  isRuleModalVisible.value = true;
};

const getSubscriptionName = (id: string) => {
  return props.allSubscriptions.find(s => s.id === id)?.name || '未知';
}

const saveSubscriptionRules = (newRules: SubscriptionRule[]) => {
  if (editingSubscription.value) {
    const index = props.selectedSubIds.findIndex(s => s.id === editingSubscription.value!.id);
    if (index !== -1) {
      const updatedSelectedSubIds = props.selectedSubIds.map(sub => 
        sub.id === editingSubscription.value!.id ? { ...sub, rules: newRules } : sub
      );
      emit('update:selectedSubIds', updatedSelectedSubIds);
    }
  }
  isRuleModalVisible.value = false;
  editingSubscription.value = null;
};
</script>
