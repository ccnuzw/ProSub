<template>
  <a-modal
    :open="visible"
    :title="isEdit ? '编辑代理组' : '添加代理组'"
    @ok="handleOk"
    @cancel="handleCancel"
    :confirm-loading="loading"
    width="600px"
  >
    <a-form :model="formState" layout="vertical" :rules="rules" ref="formRef">
      <a-form-item label="名称" name="name">
        <a-input v-model:value="formState.name" placeholder="请输入代理组名称" />
      </a-form-item>
      <a-form-item label="类型" name="type">
        <a-select v-model:value="formState.type" placeholder="请选择代理组类型">
          <a-select-option value="select">Select (手动选择)</a-select-option>
          <a-select-option value="url-test">URL-Test (自动测速)</a-select-option>
          <a-select-option value="fallback">Fallback (故障转移)</a-select-option>
          <a-select-option value="load-balance">Load-Balance (负载均衡)</a-select-option>
          <a-select-option value="relay">Relay (链式代理)</a-select-option>
          <a-select-option value="ssid">SSID (Wi-Fi 切换)</a-select-option>
          <a-select-option value="fallback-filter">Fallback Filter (带过滤的故障转移)</a-select-option>
          <a-select-option value="load-balance-filter">Load-Balance Filter (带过滤的负载均衡)</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="成员" name="proxies">
        <a-select
          v-model:value="formState.proxies"
          mode="multiple"
          style="width: 100%"
          placeholder="请选择代理或代理组"
        >
          <a-select-option v-for="item in allAvailableNames" :key="item" :value="item">
            {{ item }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- URL-Test / Fallback / Load-Balance specific fields -->
      <template v-if="['url-test', 'fallback', 'load-balance', 'fallback-filter', 'load-balance-filter'].includes(formState.type)">
        <a-form-item label="测试 URL" name="url">
          <a-input v-model:value="formState.url" placeholder="请输入测试 URL" />
        </a-form-item>
        <a-form-item label="测试间隔 (秒)" name="interval">
          <a-input-number v-model:value="formState.interval" :min="1" />
        </a-form-item>
      </template>

      <!-- URL-Test / Fallback specific fields -->
      <template v-if="['url-test', 'fallback', 'fallback-filter'].includes(formState.type)">
        <a-form-item label="容忍度 (毫秒)" name="tolerance">
          <a-input-number v-model:value="formState.tolerance" :min="0" />
        </a-form-item>
      </template>

      <!-- Load-Balance specific fields -->
      <template v-if="['load-balance', 'load-balance-filter'].includes(formState.type)">
        <a-form-item label="负载均衡策略" name="strategy">
          <a-select v-model:value="formState.strategy" placeholder="请选择策略">
            <a-select-option value="consistent-hashing">Consistent Hashing</a-select-option>
            <a-select-option value="round-robin">Round Robin</a-select-option>
            <a-select-option value="least-connections">Least Connections</a-select-option>
          </a-select>
        </a-form-item>
      </template>

      <!-- SSID specific fields -->
      <template v-if="formState.type === 'ssid'">
        <a-form-item label="SSID 过滤 (正则表达式)" name="ssid-filter">
          <a-input v-model:value="formState['ssid-filter']" placeholder="请输入 SSID 正则表达式" />
        </a-form-item>
      </template>

      <!-- Filter specific fields -->
      <template v-if="['fallback-filter', 'load-balance-filter'].includes(formState.type)">
        <a-form-item label="过滤正则表达式" name="filter">
          <a-input v-model:value="formState.filter" placeholder="请输入过滤正则表达式" />
        </a-form-item>
      </template>

    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { message } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
  initialData: {
    type: Object as () => any | null,
    default: null,
  },
  availableProxies: {
    type: Array as () => string[],
    default: () => [],
  },
  availableProxyGroups: {
    type: Array as () => string[],
    default: () => [],
  },
});

const emit = defineEmits(['update:visible', 'saved']);

const formRef = ref();
const loading = ref(false);

const formState = reactive<any>({
  name: '',
  type: undefined,
  proxies: [],
  url: '',
  interval: 300,
  tolerance: 0,
  strategy: undefined,
  'ssid-filter': '',
  filter: '',
});

const allAvailableNames = computed(() => {
  return [...props.availableProxies, ...props.availableProxyGroups];
});

watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (props.isEdit && props.initialData) {
      Object.assign(formState, JSON.parse(JSON.stringify(props.initialData)));
    } else {
      // Reset form for new proxy group
      Object.assign(formState, {
        name: '',
        type: undefined,
        proxies: [],
        url: '',
        interval: 300,
        tolerance: 0,
        strategy: undefined,
        'ssid-filter': '',
        filter: '',
      });
    }
  }
});

const rules = computed(() => {
  const baseRules: Record<string, Rule[]> = {
    name: [{ required: true, message: '请输入代理组名称' }],
    type: [{ required: true, message: '请选择代理组类型' }],
    proxies: [{ required: true, type: 'array', message: '请选择代理或代理组' }],
  };

  if (['url-test', 'fallback', 'load-balance', 'fallback-filter', 'load-balance-filter'].includes(formState.type)) {
    baseRules.url = [{ required: true, message: '请输入测试 URL' }];
    baseRules.interval = [{ required: true, type: 'number', message: '请输入测试间隔' }];
  }

  if (['load-balance', 'load-balance-filter'].includes(formState.type)) {
    baseRules.strategy = [{ required: true, message: '请选择负载均衡策略' }];
  }

  if (formState.type === 'ssid') {
    baseRules['ssid-filter'] = [{ required: true, message: '请输入 SSID 过滤正则表达式' }];
  }

  if (['fallback-filter', 'load-balance-filter'].includes(formState.type)) {
    baseRules.filter = [{ required: true, message: '请输入过滤正则表达式' }];
  }

  return baseRules;
});

const handleOk = async () => {
  try {
    await formRef.value.validate();
    loading.value = true;
    emit('saved', { ...formState });
    emit('update:visible', false);
  } catch (error) {
    console.error('表单验证失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  emit('update:visible', false);
};

</script>