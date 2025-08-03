<template>
  <a-card class="rounded-xl shadow-sm">
    <a-form
      :model="formState"
      layout="vertical"
      @finish="onFinish"
    >
      <a-row :gutter="24">
        <a-col :span="24">
          <a-form-item
            name="name"
            label="名称"
            :rules="[{ required: true, message: '请输入节点名称' }]"
          >
            <a-input v-model:value="formState.name" placeholder="例如：日本东京节点" />
          </a-form-item>
        </a-col>
        
        <a-col :span="12">
          <a-form-item
            name="type"
            label="类型"
            :rules="[{ required: true, message: '请选择节点类型' }]"
          >
            <a-select v-model:value="formState.type" placeholder="请选择节点类型">
              <a-select-option value="ss">Shadowsocks</a-select-option>
              <a-select-option value="ssr">ShadowsocksR</a-select-option>
              <a-select-option value="vmess">V2Ray (VMess)</a-select-option>
              <a-select-option value="vless">Vless</a-select-option>
              <a-select-option value="vless-reality">Vless Reality</a-select-option>
              <a-select-option value="trojan">Trojan</a-select-option>
              <a-select-option value="socks5">SOCKS5</a-select-option>
              <a-select-option value="anytls">AnyTLS</a-select-option>
              <a-select-option value="tuic">TUIC</a-select-option>
              <a-select-option value="hysteria">Hysteria</a-select-option>
              <a-select-option value="hysteria2">Hysteria2</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        
        <a-col :span="12">
          <a-form-item
            name="port"
            label="端口"
            :rules="[{ required: true, message: '请输入端口号' }]"
          >
            <a-input-number v-model:value="formState.port" style="width: 100%" placeholder="例如：443" />
          </a-form-item>
        </a-col>
        
        <a-col :span="24">
          <a-form-item
            name="server"
            label="服务器地址"
            :rules="[{ required: true, message: '请输入服务器地址' }]"
          >
            <a-input v-model:value="formState.server" placeholder="例如：example.com 或 1.1.1.1" />
          </a-form-item>
        </a-col>
        
        <a-col :span="24">
          <a-form-item
            name="password"
            label="密码或认证信息"
          >
            <a-input-password v-model:value="formState.password" placeholder="请输入密码或认证信息" />
          </a-form-item>
        </a-col>

        <a-col :span="24">
          <a-form-item
            v-if="formState.type && [
              'vmess',
              'vless',
              'vless-reality',
              'trojan',
              'ssr',
              'anytls',
              'tuic',
              'hysteria',
              'hysteria2',
            ].includes(formState.type)"
            name="params"
            label="协议特定参数 (JSON 格式)"
            tooltip="请输入协议特有的配置参数，例如 VLESS 的 flow、Trojan 的 sni 等，格式为 JSON。"
          >
            <a-textarea 
              v-model:value="formState.params" 
              :rows="4" 
              placeholder='例如: { "flow": "xtls-rprx-vision", "sni": "example.com" }' 
              class="font-mono text-sm"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item class="mt-6">
        <a-button 
          type="primary" 
          html-type="submit" 
          :loading="loading"
          size="large"
          class="px-8 rounded-lg"
        >
          {{ node ? '更新节点' : '创建节点' }}
        </a-button>
        <a-button 
          @click="router.go(-1)" 
          class="ml-4 rounded-lg"
        >
          返回
        </a-button>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { message, Card, Form, Input, InputNumber, Select, Button } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import type { Node } from '../types'

const props = defineProps<{ node?: Node }>()

const router = useRouter()
const loading = ref(false)

interface NodeFormValues extends Omit<Node, 'params'> {
  params?: string;
}

const formState = reactive<NodeFormValues>({
  name: '',
  type: 'ss',
  server: '',
  port: 0,
  password: '',
  params: '',
})

onMounted(() => {
  if (props.node) {
    Object.assign(formState, {
      ...props.node,
      params: props.node.params ? JSON.stringify(props.node.params, null, 2) : '',
    })
  }
})

watch(() => props.node, (newNode) => {
  if (newNode) {
    Object.assign(formState, {
      ...newNode,
      params: newNode.params ? JSON.stringify(newNode.params, null, 2) : '',
    })
  }
})

const onFinish = async (values: NodeFormValues) => {
  loading.value = true
  const method = props.node ? 'PUT' : 'POST'
  const url = props.node ? `/api/nodes/${props.node.id}` : '/api/nodes'

  let parsedParams = null
  if (values.params) {
    try {
      parsedParams = JSON.parse(values.params)
    } catch (e) {
      console.error('Failed to parse params:', e)
      message.error('协议特定参数格式不正确，请输入有效的 JSON。')
      loading.value = false
      return
    }
  }

  const dataToSend = {
    ...values,
    params: parsedParams,
  } as Node

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend),
    })

    if (res.ok) {
      message.success(props.node ? '节点更新成功' : '节点创建成功')
      router.push('/nodes')
    } else {
      const errorData = (await res.json()) as { message: string }
      message.error(errorData.message || '操作失败')
    }
  } catch (error) {
    console.error('Node operation failed:', error)
    message.error('操作失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
:deep(.ant-form-item-label > label) {
  font-weight: 500;
}

:deep(.ant-card-head-title) {
  font-weight: 600;
}
</style>