<template>
  <a-modal
    :open="visible"
    :title="isEdit ? '编辑模板' : '添加新模板'"
    @ok="handleOk"
    @cancel="handleCancel"
    :confirm-loading="loading"
    width="800px"
  >
    <a-form :model="formState" layout="vertical" :rules="rules" ref="formRef">
      <a-form-item label="模板名称" name="name">
        <a-input v-model:value="formState.name" placeholder="请输入模板名称" />
      </a-form-item>
      <a-form-item label="描述" name="description">
        <a-textarea v-model:value="formState.description" placeholder="请输入模板描述" :rows="2" />
      </a-form-item>

      <a-form-item label="模板内容" name="content" v-if="clientType !== 'clash'">
        <a-textarea v-model:value="formState.content" placeholder="请输入模板内容 (YAML/JSON)" :rows="10" />
      </a-form-item>

      <ClashConfigEditor
        v-if="clientType === 'clash'"
        :initial-content="formState.content"
        @update:content="formState.content = $event"
      />
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { message } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import ClashConfigEditor from './ClashConfigEditor.vue';

interface TemplateFormState {
  id?: string;
  name: string;
  description: string;
  content: string;
  clientType: string;
}

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
    type: Object as () => TemplateFormState | null,
    default: null,
  },
  clientType: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['update:visible', 'saved']);

const formRef = ref();
const loading = ref(false);

const formState = reactive<TemplateFormState>({
  name: '',
  description: '',
  content: '',
  clientType: props.clientType,
});

watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (props.isEdit && props.initialData) {
      Object.assign(formState, props.initialData);
    } else {
      // Reset form for new template
      formState.id = undefined;
      formState.name = '';
      formState.description = '';
      formState.content = '';
      formState.clientType = props.clientType;
    }
  }
});

const rules: Record<string, Rule[]> = {
  name: [{ required: true, message: '请输入模板名称' }],
  content: [{ required: true, message: '请输入模板内容' }],
};

const handleOk = async () => {
  try {
    await formRef.value.validate();
    loading.value = true;

    const method = props.isEdit ? 'PUT' : 'POST';
    const url = props.isEdit ? `/api/templates/${formState.id}` : '/api/templates';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formState),
    });

    if (response.ok) {
      message.success(props.isEdit ? '模板更新成功' : '模板添加成功');
      emit('saved');
      emit('update:visible', false);
    } else {
      const errorData = await response.json();
      message.error(errorData.message || '操作失败');
    }
  } catch (error) {
    console.error('表单验证失败或提交错误:', error);
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  emit('update:visible', false);
};

</script>