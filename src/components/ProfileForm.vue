<template>
  <a-steps :current="currentStep" class="text-xs sm:text-base">
    <a-step title="基本信息" />
    <a-step title="节点选择" />
    <a-step title="订阅选择" />
    <a-step title="客户端规则" />
  </a-steps>

  <a-form :model="formState" layout="vertical" @finish="onFinish" class="mt-4 sm:mt-6">
    <div v-show="currentStep === 0">
      <ProfileStep1Basic :form-state="formState" />
    </div>

    <div v-show="currentStep === 1">
      <ProfileStep2Nodes 
        :all-nodes="allNodes"
        :node-statuses="nodeStatuses"
        :selected-node-ids="formState.nodes"
        @update:selected-node-ids="(ids) => formState.nodes = ids"
      />
    </div>

    <div v-show="currentStep === 2">
      <ProfileStep3Subscriptions
        :all-subscriptions="allSubscriptions"
        :selected-sub-ids="formState.subscriptions"
        @update:selected-sub-ids="(subs) => formState.subscriptions = subs"
      />
    </div>

    <div v-show="currentStep === 3">
      <ProfileStep4ClientRules :form-state="formState" />
    </div>

    <div class="mt-4 sm:mt-6">
      <a-button v-if="currentStep > 0" class="mr-2" @click="prevStep">
        上一步
      </a-button>
      <a-button v-if="currentStep < 3" type="primary" @click="nextStep">
        下一步
      </a-button>
      <a-button
        v-if="currentStep === 3"
        type="primary"
        html-type="submit"
        :loading="loading"
      >
        {{ profile ? '更新配置文件' : '创建配置文件' }}
      </a-button>
    </div>
  </a-form>

  <SubscriptionRuleModal
    v-if="editingSubscription"
    v-model:visible="isRuleModalVisible"
    :rules="editingSubscription.rules || []"
    :subscription-name="getSubscriptionName(editingSubscription.id)"
    @save="saveSubscriptionRules"
  />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';
import { Profile, Node, Subscription, HealthStatus, ProfileSubscription, RuleSetConfig } from '@shared/types';

// 导入步骤组件
import ProfileStep1Basic from './ProfileStep1Basic.vue';
import ProfileStep2Nodes from './ProfileStep2Nodes.vue';
import ProfileStep3Subscriptions from './ProfileStep3Subscriptions.vue';
import ProfileStep4ClientRules from './ProfileStep4ClientRules.vue';
import SubscriptionRuleModal from './SubscriptionRuleModal.vue';

const props = defineProps<{ profile?: Profile }>();

const router = useRouter();
const route = useRoute();
const loading = ref(false);

const currentStep = ref(0);

const allNodes = ref<Node[]>([]);
const allSubscriptions = ref<Subscription[]>([]);
const nodeStatuses = ref<Record<string, HealthStatus>>({});

// --- 规则模态框状态 ---
const isRuleModalVisible = ref(false);
const editingSubscription = ref<ProfileSubscription | null>(null);

interface ProfileFormValues {
  name: string;
  alias?: string;
  nodes: string[];
  subscriptions: ProfileSubscription[];
  ruleSets: Record<string, RuleSetConfig>;
}

const formState = reactive<ProfileFormValues>({
  name: '',
  alias: '',
  nodes: [],
  subscriptions: [],
  ruleSets: {
    clash: { type: 'built-in', id: 'default' },
    surge: { type: 'built-in', id: 'default' },
    quantumultx: { type: 'built-in', id: 'default' },
    loon: { type: 'built-in', id: 'default' },
    singbox: { type: 'built-in', id: 'default' },
  },
});

const fetchData = async () => {
    const [nodesRes, subsRes, statusesRes] = await Promise.all([
      fetch('/api/nodes'),
      fetch('/api/subscriptions'),
      fetch('/api/node-statuses'),
    ]);
    allNodes.value = await nodesRes.json();
    allSubscriptions.value = await subsRes.json();
    nodeStatuses.value = await statusesRes.json();
};

onMounted(async () => {
  await fetchData();
  if (props.profile) {
    Object.assign(formState, props.profile);
    // 兼容旧数据结构
    formState.subscriptions = (props.profile.subscriptions || []).map(sub => 
        typeof sub === 'string' ? { id: sub, rules: [] } : sub
    );
    if (!formState.ruleSets) { // 兼容旧数据
        formState.ruleSets = { 
          clash: { type: 'built-in', id: 'default' },
          surge: { type: 'built-in', id: 'default' },
          quantumultx: { type: 'built-in', id: 'default' },
          loon: { type: 'built-in', id: 'default' },
          singbox: { type: 'built-in', id: 'default' },
        };
    }
  } else if (route.query.template) { // 复制逻辑
    try {
        const template = JSON.parse(route.query.template as string);
        Object.assign(formState, template);
        formState.subscriptions = (template.subscriptions || []).map(sub =>
            reactive(typeof sub === 'string' ? { id: sub, rules: [] } : sub)
        );
        if (!formState.ruleSets) { // 兼容旧数据
            formState.ruleSets = { 
              clash: { type: 'built-in', id: 'default' },
              surge: { type: 'built-in', id: 'default' },
              quantumultx: { type: 'built-in', id: 'default' },
              loon: { type: 'built-in', id: 'default' },
              singbox: { type: 'built-in', id: 'default' },
            };
        }
        message.success('已从副本加载配置');
    } catch (e) {
        console.error("无法解析配置文件模板:", e);
    }
  }
});

const nextStep = () => {
  // 在这里可以添加每个步骤的验证逻辑
  if (currentStep.value < 3) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const onFinish = async () => {
  loading.value = true;
  const method = props.profile ? 'PUT' : 'POST';
  const url = props.profile
    ? `/api/profiles/${props.profile.id}`
    : '/api/profiles';
  
  const dataToSend = {
    name: formState.name,
    alias: formState.alias,
    nodes: formState.nodes,
    subscriptions: formState.subscriptions,
    ruleSets: formState.ruleSets,
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
      const errorData = await res.json();
      throw new Error(errorData.message || '操作失败');
    }
  } catch (error) {
    if (error instanceof Error) message.error(error.message);
  } finally {
    loading.value = false;
  }
};

const getSubscriptionName = (id: string) => {
  return allSubscriptions.value.find(s => s.id === id)?.name || '未知';
}

const saveSubscriptionRules = (newRules: SubscriptionRule[]) => {
  if (editingSubscription.value) {
    const index = formState.subscriptions.findIndex(s => s.id === editingSubscription.value!.id);
    if (index !== -1) {
      const updatedSubscriptions = [...formState.subscriptions];
      updatedSubscriptions[index] = { ...updatedSubscriptions[index], rules: newRules };
      formState.subscriptions = updatedSubscriptions;
    }
  }
  isRuleModalVisible.value = false;
  editingSubscription.value = null;
};
</script>
