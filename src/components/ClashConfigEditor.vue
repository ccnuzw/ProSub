<template>
  <a-tabs v-model:activeKey="activeTab" type="card">
    <a-tab-pane key="general" tab="基本设置">
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="HTTP 代理端口">
              <a-input-number v-model:value="config.port" :min="0" :max="65535" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="SOCKS 代理端口">
              <a-input-number v-model:value="config['socks-port']" :min="0" :max="65535" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="允许局域网连接">
          <a-switch v-model:checked="config['allow-lan']" />
        </a-form-item>
        <a-form-item label="模式">
          <a-select v-model:value="config.mode">
            <a-select-option value="global">Global</a-select-option>
            <a-select-option value="rule">Rule</a-select-option>
            <a-select-option value="direct">Direct</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="日志级别">
          <a-select v-model:value="config['log-level']">
            <a-select-option value="debug">Debug</a-select-option>
            <a-select-option value="info">Info</a-select-option>
            <a-select-option value="warning">Warning</a-select-option>
            <a-select-option value="error">Error</a-select-option>
            <a-select-option value="silent">Silent</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="外部控制器地址">
          <a-input v-model:value="config['external-controller']" placeholder="127.0.0.1:9090" />
        </a-form-item>
        <a-form-item label="外部控制器密钥">
          <a-input v-model:value="config.secret" placeholder="可选" />
        </a-form-item>
      </a-form>
    </a-tab-pane>

    <a-tab-pane key="dns" tab="DNS 设置">
      <a-form layout="vertical">
        <a-form-item label="启用 DNS">
          <a-switch v-model:checked="config.dns.enable" />
        </a-form-item>
        <a-form-item label="DNS 监听地址">
          <a-input v-model:value="config.dns.listen" placeholder="0.0.0.0:53" />
        </a-form-item>
        <a-form-item label="增强模式">
          <a-select v-model:value="config.dns['enhanced-mode']">
            <a-select-option value="redir-host">redir-host</a-select-option>
            <a-select-option value="fake-ip">fake-ip</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="上游 DNS 服务器">
          <a-select
            v-model:value="config.dns.nameservers"
            mode="tags"
            style="width: 100%"
            placeholder="输入并回车添加 DNS 服务器"
          />
        </a-form-item>
        <a-form-item label="备用 DNS 服务器">
          <a-select
            v-model:value="config.dns.fallback"
            mode="tags"
            style="width: 100%"
            placeholder="输入并回车添加备用 DNS 服务器"
          />
        </a-form-item>
      </a-form>
    </a-tab-pane>

    <a-tab-pane key="proxies" tab="代理">
      <a-button type="primary" @click="showAddProxyModal">
        <template #icon><PlusOutlined /></template>
        添加代理
      </a-button>
      <a-table
        :columns="proxyColumns"
        :data-source="config.proxies"
        row-key="name"
        :pagination="false"
        class="mt-4"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button type="text" size="small" @click="showEditProxyModal(record)">编辑</a-button>
              <a-button type="text" size="small" danger @click="handleDeleteProxy(record)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-tab-pane>

    <a-tab-pane key="proxy-groups" tab="代理组">
      <a-button type="primary" @click="showAddProxyGroupModal">
        <template #icon><PlusOutlined /></template>
        添加代理组
      </a-button>
      <a-table
        :columns="proxyGroupColumns"
        :data-source="config['proxy-groups']"
        row-key="name"
        :pagination="false"
        class="mt-4"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'members'">
            <a-tag v-for="member in record.proxies" :key="member">{{ member }}</a-tag>
          </template>
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button type="text" size="small" @click="showEditProxyGroupModal(record)">编辑</a-button>
              <a-button type="text" size="small" danger @click="handleDeleteProxyGroup(record)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-tab-pane>

    <a-tab-pane key="rules" tab="规则">
      <a-button type="primary" @click="showAddRuleModal">
        <template #icon><PlusOutlined /></template>
        添加规则
      </a-button>
      <a-table
        :columns="ruleColumns"
        :data-source="config.rules"
        row-key="content"
        :pagination="false"
        class="mt-4"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button type="text" size="small" @click="showEditRuleModal(record)">编辑</a-button>
              <a-button type="text" size="small" danger @click="handleDeleteRule(record)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-tab-pane>

    <a-tab-pane key="yaml" tab="YAML 输出">
      <a-textarea :value="yamlContent" :rows="20" readonly />
    </a-tab-pane>
  </a-tabs>

  <a-modal
    :open="isSimpleProxyModalVisible"
    :title="isSimpleProxyEditMode ? '编辑代理名称' : '添加代理名称'"
    @ok="handleSimpleProxyOk"
    @cancel="isSimpleProxyModalVisible = false"
    :confirm-loading="loading"
  >
    <a-form :model="simpleProxyFormState" layout="vertical" :rules="simpleProxyRules" ref="simpleProxyFormRef">
      <a-form-item label="代理名称" name="name">
        <a-input v-model:value="simpleProxyFormState.name" placeholder="请输入代理名称" />
      </a-form-item>
    </a-form>
  </a-modal>

  <ClashProxyGroupFormModal
    :visible="isProxyGroupModalVisible"
    :is-edit="isProxyGroupEditMode"
    :initial-data="currentProxyGroup"
    :available-proxies="availableProxyNames"
    :available-proxy-groups="availableProxyGroupNames"
    @update:visible="isProxyGroupModalVisible = $event"
    @saved="handleProxyGroupSaved"
  />

  <ClashRuleFormModal
    :visible="isRuleModalVisible"
    :is-edit="isRuleEditMode"
    :initial-data="currentRule"
    :available-policies="availablePolicies"
    @update:visible="isRuleModalVisible = $event"
    @saved="handleRuleSaved"
  />
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import * as yaml from 'js-yaml';
import { PlusOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import ClashProxyGroupFormModal from './ClashProxyGroupFormModal.vue';
import ClashRuleFormModal from './ClashRuleFormModal.vue';

const props = defineProps({
  initialContent: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:content']);

const activeTab = ref('general');

const defaultConfig = {
  port: 7890,
  'socks-port': 7891,
  'allow-lan': false,
  mode: 'rule',
  'log-level': 'info',
  'external-controller': '127.0.0.1:9090',
  secret: '',
  dns: {
    enable: true,
    listen: '0.0.0.0:53',
    'enhanced-mode': 'redir-host',
    nameservers: ['114.114.114.114', '8.8.8.8'],
    fallback: ['1.1.1.1'],
  },
  proxies: ['Proxy A', 'Proxy B'], // Simplified to names only
  'proxy-groups': [
    { name: 'Auto', type: 'url-test', url: 'http://www.gstatic.com/generate_204', interval: 300, proxies: ['Proxy A', 'Proxy B'] },
    { name: 'Manual', type: 'select', proxies: ['Proxy A', 'Proxy B', 'Auto'] },
  ],
  rules: [
    'DOMAIN-SUFFIX,google.com,Proxy A',
    'IP-CIDR,192.168.1.1/24,DIRECT',
    'MATCH,Manual',
  ],
};

const config = reactive<any>(defaultConfig);

const proxyColumns = [
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '操作', key: 'actions', width: 150, align: 'center' },
];

const proxyGroupColumns = [
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '成员', dataIndex: 'proxies', key: 'members' },
  { title: '操作', key: 'actions', width: 150, align: 'center' },
];

const ruleColumns = [
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '内容', dataIndex: 'content', key: 'content' },
  { title: '策略', dataIndex: 'policy', key: 'policy' },
  { title: '操作', key: 'actions', width: 150, align: 'center' },
];

const isSimpleProxyModalVisible = ref(false);
const isSimpleProxyEditMode = ref(false);
const currentSimpleProxyName = ref('');
const simpleProxyFormRef = ref();
const simpleProxyFormState = reactive({ name: '' });
const simpleProxyRules = { name: [{ required: true, message: '请输入代理名称' }] };

const isProxyGroupModalVisible = ref(false);
const isProxyGroupEditMode = ref(false);
const currentProxyGroup = ref<any>(null);

const isRuleModalVisible = ref(false);
const isRuleEditMode = ref(false);
const currentRule = ref<any>(null);

// Computed properties for available proxy and proxy group names
const availableProxyNames = computed(() => config.proxies);
const availableProxyGroupNames = computed(() => config['proxy-groups'].map((pg: any) => pg.name));
const availablePolicies = computed(() => [
  'DIRECT',
  'REJECT',
  ...availableProxyNames.value,
  ...availableProxyGroupNames.value,
]);

// Watch for initialContent changes to populate the form when editing
watch(() => props.initialContent, (newContent) => {
  if (newContent) {
    try {
      const parsed = yaml.load(newContent) as any;
      Object.assign(config, parsed);
    } catch (e) {
      console.error('Failed to parse YAML content:', e);
      // Fallback to default config if parsing fails
      Object.assign(config, defaultConfig);
    }
  } else {
    // Reset to default if no initial content
    Object.assign(config, defaultConfig);
  }
}, { immediate: true });

// Computed property to generate YAML content from reactive config
const yamlContent = computed(() => {
  try {
    const cleanConfig = JSON.parse(JSON.stringify(config));
    if (cleanConfig.proxies && cleanConfig.proxies.length === 0) delete cleanConfig.proxies;
    if (cleanConfig['proxy-groups'] && cleanConfig['proxy-groups'].length === 0) delete cleanConfig['proxy-groups'];
    if (cleanConfig.rules && cleanConfig.rules.length === 0) delete cleanConfig.rules;

    return yaml.dump(cleanConfig, { indent: 2 });
  } catch (e) {
    console.error('Failed to dump YAML content:', e);
    return 'Error generating YAML';
  }
});

// Emit the YAML content whenever it changes
watch(yamlContent, (newYaml) => {
  emit('update:content', newYaml);
});

const showAddProxyModal = () => {
  isSimpleProxyEditMode.value = false;
  currentSimpleProxyName.value = '';
  simpleProxyFormState.name = '';
  isSimpleProxyModalVisible.value = true;
};

const showEditProxyModal = (proxyName: string) => {
  isSimpleProxyEditMode.value = true;
  currentSimpleProxyName.value = proxyName;
  simpleProxyFormState.name = proxyName;
  isSimpleProxyModalVisible.value = true;
};

const handleSimpleProxyOk = async () => {
  try {
    await simpleProxyFormRef.value.validate();
    loading.value = true;
    const newName = simpleProxyFormState.name;

    if (isSimpleProxyEditMode.value) {
      const oldName = currentSimpleProxyName.value;
      const index = config.proxies.indexOf(oldName);
      if (index !== -1) {
        config.proxies[index] = newName;
        // Also update proxy group members that reference this proxy
        config['proxy-groups'].forEach((group: any) => {
          const memberIndex = group.proxies.indexOf(oldName);
          if (memberIndex !== -1) {
            group.proxies[memberIndex] = newName;
          }
        });
        // Also update rules that reference this proxy
        config.rules.forEach((rule: string, ruleIndex: number) => {
          const parts = rule.split(',');
          if (parts.length === 3 && parts[2] === oldName) {
            config.rules[ruleIndex] = `${parts[0]},${parts[1]},${newName}`;
          }
        });
      }
    } else {
      if (config.proxies.includes(newName)) {
        message.error(`代理名称 ${newName} 已存在`);
        return;
      }
      config.proxies.push(newName);
    }
    message.success(`代理 ${newName} 已保存`);
    isSimpleProxyModalVisible.value = false;
  } catch (error) {
    console.error('表单验证失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleDeleteProxy = (proxyName: string) => {
  config.proxies = config.proxies.filter((p: string) => p !== proxyName);
  // Also remove from proxy groups that reference this proxy
  config['proxy-groups'].forEach((group: any) => {
    group.proxies = group.proxies.filter((member: string) => member !== proxyName);
  });
  // Also remove from rules that reference this proxy
  config.rules = config.rules.filter((rule: string) => {
    const parts = rule.split(',');
    return !(parts.length === 3 && parts[2] === proxyName);
  });
  message.success(`代理 ${proxyName} 已删除`);
};

const showAddProxyGroupModal = () => {
  isProxyGroupEditMode.value = false;
  currentProxyGroup.value = null;
  isProxyGroupModalVisible.value = true;
};

const showEditProxyGroupModal = (group: any) => {
  isProxyGroupEditMode.value = true;
  currentProxyGroup.value = { ...group };
  isProxyGroupModalVisible.value = true;
};

const handleDeleteProxyGroup = (group: any) => {
  config['proxy-groups'] = config['proxy-groups'].filter((g: any) => g.name !== group.name);
  // Also remove from proxy groups that reference this group
  config['proxy-groups'].forEach((pg: any) => {
    pg.proxies = pg.proxies.filter((member: string) => member !== group.name);
  });
  // Also remove from rules that reference this group
  config.rules = config.rules.filter((rule: string) => {
    const parts = rule.split(',');
    return !(parts.length === 3 && parts[2] === group.name);
  });
  message.success(`代理组 ${group.name} 已删除`);
};

const handleProxyGroupSaved = (savedGroup: any) => {
  if (isProxyGroupEditMode.value) {
    const index = config['proxy-groups'].findIndex((g: any) => g.name === savedGroup.name);
    if (index !== -1) {
      config['proxy-groups'][index] = savedGroup;
    }
  } else {
    config['proxy-groups'].push(savedGroup);
  }
  message.success(`代理组 ${savedGroup.name} 已保存`);
};

const showAddRuleModal = () => {
  isRuleEditMode.value = false;
  currentRule.value = null;
  isRuleModalVisible.value = true;
};

const showEditRuleModal = (rule: any) => {
  isRuleEditMode.value = true;
  currentRule.value = { ...rule };
  isRuleModalVisible.value = true;
};

const handleDeleteRule = (rule: any) => {
  config.rules = config.rules.filter((r: any) => r !== rule);
  message.success(`规则 ${rule} 已删除`);
};

const handleRuleSaved = (savedRule: any) => {
  // Rules are simple strings, so we need to parse them into type, content, policy
  // and then convert back to string for storage in config.rules
  let ruleString = '';
  if (savedRule.type === 'GEOIP') {
    ruleString = `${savedRule.type},${savedRule.content},${savedRule.policy}`;
  } else if (savedRule.type === 'MATCH' || savedRule.type === 'FINAL') {
    ruleString = `${savedRule.type},${savedRule.policy}`;
  } else {
    ruleString = `${savedRule.type},${savedRule.content},${savedRule.policy}`;
  }

  if (isRuleEditMode.value) {
    const index = config.rules.indexOf(savedRule.originalRuleString);
    if (index !== -1) {
      config.rules[index] = ruleString;
    }
  } else {
    config.rules.push(ruleString);
  }
  message.success(`规则 ${ruleString} 已保存`);
};
</script>