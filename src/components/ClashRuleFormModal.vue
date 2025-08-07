<template>
  <a-modal
    :open="visible"
    :title="isEdit ? '编辑规则' : '添加规则'"
    @ok="handleOk"
    @cancel="handleCancel"
    :confirm-loading="loading"
    width="600px"
  >
    <a-form :model="formState" layout="vertical" :rules="rules" ref="formRef">
      <a-form-item label="类型" name="type">
        <a-select v-model:value="formState.type" placeholder="请选择规则类型">
          <a-select-option value="DOMAIN-SUFFIX">DOMAIN-SUFFIX</a-select-option>
          <a-select-option value="DOMAIN-KEYWORD">DOMAIN-KEYWORD</a-select-option>
          <a-select-option value="DOMAIN">DOMAIN</a-select-option>
          <a-select-option value="FULL-DOMAIN">FULL-DOMAIN</a-select-option>
          <a-select-option value="IP-CIDR">IP-CIDR</a-select-option>
          <a-select-option value="IP-CIDR6">IP-CIDR6</a-select-option>
          <a-select-option value="GEOIP">GEOIP</a-select-option>
          <a-select-option value="MATCH">MATCH</a-select-option>
          <a-select-option value="FINAL">FINAL</a-select-option>
          <a-select-option value="PROCESS-NAME">PROCESS-NAME</a-select-option>
          <a-select-option value="PROCESS-PATH">PROCESS-PATH</a-select-option>
          <a-select-option value="RULE-SET">RULE-SET</a-select-option>
          <a-select-option value="URL-REGEX">URL-REGEX</a-select-option>
          <a-select-option value="SRC-IP-CIDR">SRC-IP-CIDR</a-select-option>
          <!-- Add more rule types as needed -->
        </a-select>
      </a-form-item>

      <a-form-item label="内容" name="content" v-if="formState.type !== 'MATCH' && formState.type !== 'FINAL'">
        <a-input v-model:value="formState.content" placeholder="请输入规则内容" />
      </a-form-item>

      <a-form-item label="国家代码" name="countryCode" v-if="formState.type === 'GEOIP'">
        <a-input v-model:value="formState.countryCode" placeholder="例如: CN, US" />
      </a-form-item>

      <a-form-item label="策略" name="policy">
        <a-select v-model:value="formState.policy" placeholder="请选择策略">
          <a-select-option v-for="policy in availablePolicies" :key="policy" :value="policy">
            {{ policy }}
          </a-select-option>
        </a-select>
      </a-form-item>
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
  availablePolicies: {
    type: Array as () => string[],
    default: () => [],
  },
});

const emit = defineEmits(['update:visible', 'saved']);

const formRef = ref();
const loading = ref(false);

const formState = reactive<any>({
  type: undefined,
  content: '',
  policy: undefined,
  countryCode: '',
});

watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (props.isEdit && props.initialData) {
      // Parse the rule string into type, content, policy for editing
      const parts = props.initialData.split(',');
      formState.type = parts[0];
      formState.content = parts[1];
      formState.policy = parts[2];
      // Handle specific fields like GEOIP country code
      if (formState.type === 'GEOIP') {
        formState.countryCode = parts[1];
        formState.content = ''; // Clear content as it's handled by countryCode
      }
    } else {
      // Reset form for new rule
      Object.assign(formState, {
        type: undefined,
        content: '',
        policy: undefined,
        countryCode: '',
      });
    }
  }
});

const rules = computed(() => {
  const baseRules: Record<string, Rule[]> = {
    type: [{ required: true, message: '请选择规则类型' }],
    policy: [{ required: true, message: '请选择策略' }],
  };

  if (formState.type !== 'MATCH' && formState.type !== 'FINAL') {
    baseRules.content = [
      { 
        required: true,
        message: '请输入规则内容',
        validator: (_rule, value) => {
          if (formState.type === 'GEOIP') {
            return formState.countryCode ? Promise.resolve() : Promise.reject('请输入国家代码');
          }
          return value ? Promise.resolve() : Promise.reject('请输入规则内容');
        },
      },
    ];
  }

  return baseRules;
});

const handleOk = async () => {
  try {
    await formRef.value.validate();
    loading.value = true;

    // Construct the rule string based on type
    let ruleString = '';
    if (formState.type === 'GEOIP') {
      ruleString = `${formState.type},${formState.countryCode},${formState.policy}`;
    } else if (formState.type === 'MATCH' || formState.type === 'FINAL') {
      ruleString = `${formState.type},${formState.policy}`;
    } else {
      ruleString = `${formState.type},${formState.content},${formState.policy}`;
    }

    emit('saved', { 
      ruleString,
      originalRuleString: props.isEdit ? props.initialData : undefined, // Pass original rule string for editing
    });
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
