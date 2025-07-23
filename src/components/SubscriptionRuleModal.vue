<template>
  <a-modal
    :title="`为 “${subscriptionName}” 配置规则`"
    :open="visible"
    @ok="handleOk"
    @cancel="handleCancel"
    ok-text="保存规则"
    cancel-text="取消"
  >
    <a-form :model="newRule" layout="inline" style="margin-bottom: 24px;">
      <a-form-item label="类型">
        <a-select v-model:value="newRule.type" style="width: 100px">
          <a-select-option value="include">包含</a-select-option>
          <a-select-option value="exclude">排除</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="关键字">
        <a-input v-model:value="newRule.pattern" placeholder="支持正则, 如: 香港|HK" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="addRule" :disabled="!newRule.pattern">添加</a-button>
      </a-form-item>
    </a-form>

    <a-list :data-source="localRules" size="small" bordered>
       <template #header>
        <div>现有规则</div>
      </template>
      <template #renderItem="{ item, index }">
        <a-list-item>
          <a-tag :color="item.type === 'include' ? 'success' : 'error'">
            {{ item.type === 'include' ? '包含' : '排除' }}
          </a-tag>
          <span>{{ item.pattern }}</span>
          <template #actions>
            <a-button type="text" danger @click="() => removeRule(index)">删除</a-button>
          </template>
        </a-list-item>
      </template>
      <template #empty>
        <a-empty description="暂无规则" />
      </template>
    </a-list>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue';
import { message } from 'ant-design-vue';
import type { SubscriptionRule } from '@shared/types';

const props = defineProps<{
  visible: boolean;
  rules: SubscriptionRule[];
  subscriptionName: string;
}>();

const emit = defineEmits(['update:visible', 'save']);

const localRules = ref<SubscriptionRule[]>([]);
const newRule = reactive<Omit<SubscriptionRule, 'field'>>({
  type: 'include',
  pattern: '',
});

watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    // 深拷贝，防止直接修改 props
    localRules.value = JSON.parse(JSON.stringify(props.rules || []));
  }
});

const addRule = () => {
  if (!newRule.pattern) {
    message.warning('请输入关键字或正则表达式');
    return;
  }
  localRules.value.push({ ...newRule, field: 'name' });
  // Reset form
  newRule.pattern = '';
  newRule.type = 'include';
};

const removeRule = (index: number) => {
  localRules.value.splice(index, 1);
};

const handleOk = () => {
  emit('save', localRules.value);
  emit('update:visible', false);
};

const handleCancel = () => {
  emit('update:visible', false);
};
</script>