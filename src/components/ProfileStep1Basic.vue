<template>
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
</template>

<script setup lang="ts">
import { reactive } from 'vue';

interface ProfileFormValues {
  name: string;
  alias?: string;
}

const props = defineProps<{ formState: ProfileFormValues }>();
</script>
