<template>
  <a-typography-title :level="5" class="mt-6">客户端规则配置</a-typography-title>

  <a-card size="small" class="mb-4">
    <template #title>Clash 规则</template>
    <div class="flex justify-center">
      <a-radio-group v-model:value="formState.ruleSets.clash.type" button-style="solid" class="w-full max-w-md">
        <a-radio-button value="built-in">内置规则</a-radio-button>
        <a-radio-button value="remote">远程配置</a-radio-button>
      </a-radio-group>
    </div>

    <div class="mt-4">
      <a-form-item v-if="formState.ruleSets.clash.type === 'built-in'">
        <a-select v-model:value="formState.ruleSets.clash.id" class="w-full max-w-md">
          <a-select-option value="default">默认规则 (全面分流)</a-select-option>
          <a-select-option value="lite">精简规则 (仅代理)</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item v-if="formState.ruleSets.clash.type === 'remote'"
        help="粘贴您的远程规则文件 URL。系统会自动合并节点列表。">
        <a-input v-model:value="formState.ruleSets.clash.url" placeholder="https://example.com/my-rules.json" class="w-full max-w-md" />
      </a-form-item>
    </div>
  </a-card>

  <a-card size="small" class="mb-4">
    <template #title>Surge 规则</template>
    <div class="flex justify-center">
      <a-radio-group v-model:value="formState.ruleSets.surge.type" button-style="solid" class="w-full max-w-md">
        <a-radio-button value="built-in">内置规则</a-radio-button>
        <a-radio-button value="remote">远程配置</a-radio-button>
      </a-radio-group>
    </div>

    <div class="mt-4">
      <a-form-item v-if="formState.ruleSets.surge.type === 'built-in'">
        <a-select v-model:value="formState.ruleSets.surge.id" class="w-full max-w-md">
          <a-select-option value="default">默认规则 (全面分流)</a-select-option>
          <a-select-option value="lite">精简规则 (仅代理)</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item v-if="formState.ruleSets.surge.type === 'remote'"
        help="粘贴您的远程规则文件 URL。系统会自动合并节点列表。">
        <a-input v-model:value="formState.ruleSets.surge.url" placeholder="https://example.com/my-surge-rules.conf" class="w-full max-w-md" />
      </a-form-item>
    </div>
  </a-card>

  <a-card size="small" class="mb-4">
    <template #title>Quantumult X 规则</template>
    <div class="flex justify-center">
      <a-radio-group v-model:value="formState.ruleSets.quantumultx.type" button-style="solid" class="w-full max-w-md">
        <a-radio-button value="built-in">内置规则</a-radio-button>
        <a-radio-button value="remote">远程配置</a-radio-button>
      </a-radio-group>
    </div>

    <div class="mt-4">
      <a-form-item v-if="formState.ruleSets.quantumultx.type === 'built-in'">
        <a-select v-model:value="formState.ruleSets.quantumultx.id" class="w-full max-w-md">
          <a-select-option value="default">默认规则 (全面分流)</a-select-option>
          <a-select-option value="lite">精简规则 (仅代理)</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item v-if="formState.ruleSets.quantumultx.type === 'remote'"
        help="粘贴您的远程规则文件 URL。系统会自动合并节点列表。">
        <a-input v-model:value="formState.ruleSets.quantumultx.url" placeholder="https://example.com/my-qx-rules.conf" class="w-full max-w-md" />
      </a-form-item>
    </div>
  </a-card>

  <a-card size="small" class="mb-4">
    <template #title>Loon 规则</template>
    <div class="flex justify-center">
      <a-radio-group v-model:value="formState.ruleSets.loon.type" button-style="solid" class="w-full max-w-md">
        <a-radio-button value="built-in">内置规则</a-radio-button>
        <a-radio-button value="remote">远程配置</a-radio-button>
      </a-radio-group>
    </div>

    <div class="mt-4">
      <a-form-item v-if="formState.ruleSets.loon.type === 'built-in'">
        <a-select v-model:value="formState.ruleSets.loon.id" class="w-full max-w-md">
          <a-select-option value="default">默认规则 (全面分流)</a-select-option>
          <a-select-option value="lite">精简规则 (仅代理)</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item v-if="formState.ruleSets.loon.type === 'remote'"
        help="粘贴您的远程规则文件 URL。系统会自动合并节点列表。">
        <a-input v-model:value="formState.ruleSets.loon.url" placeholder="https://example.com/my-loon-rules.conf" class="w-full max-w-md" />
      </a-form-item>
    </div>
  </a-card>

  <a-card size="small" class="mb-4">
    <template #title>Sing-Box 规则</template>
    <div class="flex justify-center">
      <a-radio-group v-model:value="formState.ruleSets.singbox.type" button-style="solid" class="w-full max-w-md">
        <a-radio-button value="built-in">内置规则</a-radio-button>
        <a-radio-button value="remote">远程配置</a-radio-button>
      </a-radio-group>
    </div>

    <div class="mt-4">
      <a-form-item v-if="formState.ruleSets.singbox.type === 'built-in'">
        <a-select v-model:value="formState.ruleSets.singbox.id" class="w-full max-w-md">
          <a-select-option value="default">默认规则 (全面分流)</a-select-option>
          <a-select-option value="lite">精简规则 (仅代理)</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item v-if="formState.ruleSets.singbox.type === 'remote'"
        help="粘贴您的远程规则文件 URL。系统会自动合并节点列表。">
        <a-input v-model:value="formState.ruleSets.singbox.url" placeholder="https://example.com/my-singbox-rules.json" class="w-full max-w-md" />
      </a-form-item>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { RuleSetConfig } from '@shared/types';

interface ProfileFormValues {
  ruleSets: Record<string, RuleSetConfig>;
}

const props = defineProps<{ formState: ProfileFormValues }>();
</script>
