<script setup lang="ts">
import { ref, watch } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import { parseNodeLink } from '@shared/node-parser';
import { Node } from '@shared/types';

interface ParsedNodeResult {
  node: Node;
  originalLink: string;
  error?: string;
}

const emit = defineEmits<{
  import: [nodes: Node[]];
}>();

const isOpen = ref(false);
const nodeInput = ref('');
const parsedNodes = ref<ParsedNodeResult[]>([]);
const importing = ref(false);

const open = () => {
  isOpen.value = true;
};

const close = () => {
  isOpen.value = false;
  nodeInput.value = '';
  parsedNodes.value = [];
};

watch(nodeInput, (newValue) => {
  parsedNodes.value = [];
  const lines = newValue.split('\n').filter(line => line.trim() !== '');
  
  lines.forEach((line, index) => {
    try {
      const parsedNode = parseNodeLink(line.trim());
      
      if (!parsedNode) {
        parsedNodes.value.push({
          node: {
            id: `temp-${index}`,
            name: `无法解析的节点 ${index + 1}`,
            server: '',
            port: 0,
            type: 'unknown',
            password: '',
            params: {}
          },
          originalLink: line,
          error: '无法解析此链接格式'
        });
        return;
      }
      
      // 验证必要字段
      if (!parsedNode.server || !parsedNode.port) {
        parsedNodes.value.push({
          node: {
            id: `temp-${index}`,
            name: parsedNode.name || `节点 ${index + 1}`,
            server: parsedNode.server || '',
            port: parsedNode.port || 0,
            type: parsedNode.type || 'unknown',
            password: parsedNode.password || '',
            params: parsedNode.params || {}
          },
          originalLink: line,
          error: '节点信息不完整（缺少服务器地址或端口）'
        });
        return;
      }
      
      // 成功解析的节点
      parsedNodes.value.push({
        node: {
          id: `temp-${index}`,
          name: parsedNode.name || `${parsedNode.server}:${parsedNode.port}`,
          server: parsedNode.server,
          port: parsedNode.port,
          type: parsedNode.type || 'vmess',
          password: parsedNode.password || '',
          params: parsedNode.params || {}
        },
        originalLink: line
      });
    } catch (error) {
      console.error(`Error parsing line ${index + 1}: ${line}`, error);
      parsedNodes.value.push({
        node: {
          id: `temp-${index}`,
          name: `解析失败的节点 ${index + 1}`,
          server: '',
          port: 0,
          type: 'unknown',
          password: '',
          params: {}
        },
        originalLink: line,
        error: `解析失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
    }
  });
});

const removeNode = (id: string) => {
  parsedNodes.value = parsedNodes.value.filter(item => item.node.id !== id);
};

const getValidNodes = () => {
  return parsedNodes.value
    .filter(item => !item.error)
    .map(item => item.node);
};

const importNodes = async () => {
  const validNodes = getValidNodes();
  
  if (validNodes.length === 0) {
    alert('没有有效的节点可以导入');
    return;
  }
  
  importing.value = true;
  try {
    emit('import', validNodes);
    close();
  } catch (error) {
    console.error('导入节点失败:', error);
  } finally {
    importing.value = false;
  }
};

defineExpose({
  open,
});
</script>

<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-10" @close="close">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div
          class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
        >
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6"
            >
              <div class="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                <button
                  type="button"
                  class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  @click="close"
                >
                  <span class="sr-only">Close</span>
                  <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div>
                <div class="mt-3 text-center sm:mt-0 sm:text-left">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                    导入节点
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      请粘贴节点链接，每行一个。系统会自动解析并显示节点信息。
                    </p>
                    <textarea
                      v-model="nodeInput"
                      rows="8"
                      class="mt-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="粘贴节点链接，例如：&#10;vmess://...&#10;ss://...&#10;vless://..."
                    ></textarea>

                    <div v-if="parsedNodes.length > 0" class="mt-4">
                      <div class="flex items-center justify-between mb-2">
                        <h4 class="text-sm font-medium text-gray-900">
                          解析结果 ({{ getValidNodes().length }}/{{ parsedNodes.length }} 个有效)
                        </h4>
                        <span class="text-xs text-gray-500">
                          绿色表示解析成功，红色表示解析失败
                        </span>
                      </div>
                      <div class="mt-2 flow-root max-h-96 overflow-y-auto">
                        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                          <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <table class="min-w-full divide-y divide-gray-300">
                              <thead class="bg-gray-50 sticky top-0">
                                <tr>
                                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-900 sm:pl-0">
                                    #
                                  </th>
                                  <th scope="col" class="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">
                                    状态
                                  </th>
                                  <th scope="col" class="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">
                                    名称
                                  </th>
                                  <th scope="col" class="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">
                                    类型
                                  </th>
                                  <th scope="col" class="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">
                                    服务器
                                  </th>
                                  <th scope="col" class="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">
                                    端口
                                  </th>
                                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                    <span class="sr-only">操作</span>
                                  </th>
                                </tr>
                              </thead>
                              <tbody class="divide-y divide-gray-200 bg-white">
                                <tr 
                                  v-for="(item, index) in parsedNodes" 
                                  :key="item.node.id"
                                  :class="item.error ? 'bg-red-50' : 'bg-green-50'"
                                >
                                  <td class="whitespace-nowrap py-2 pl-4 pr-3 text-xs font-medium text-gray-900 sm:pl-0">
                                    {{ index + 1 }}
                                  </td>
                                  <td class="whitespace-nowrap px-3 py-2 text-xs">
                                    <span 
                                      :class="item.error ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'"
                                      class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                                    >
                                      {{ item.error ? '失败' : '成功' }}
                                    </span>
                                  </td>
                                  <td class="whitespace-nowrap px-3 py-2 text-xs text-gray-900">
                                    {{ item.node.name }}
                                  </td>
                                  <td class="whitespace-nowrap px-3 py-2 text-xs text-gray-500">
                                    {{ item.node.type }}
                                  </td>
                                  <td class="whitespace-nowrap px-3 py-2 text-xs text-gray-500">
                                    {{ item.node.server || '-' }}
                                  </td>
                                  <td class="whitespace-nowrap px-3 py-2 text-xs text-gray-500">
                                    {{ item.node.port || '-' }}
                                  </td>
                                  <td class="relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-xs font-medium sm:pr-0">
                                    <button
                                      type="button"
                                      class="text-red-600 hover:text-red-900"
                                      @click="removeNode(item.node.id)"
                                    >
                                      删除
                                    </button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      
                      <!-- 错误信息显示 -->
                      <div v-if="parsedNodes.some(item => item.error)" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <h5 class="text-sm font-medium text-red-800 mb-2">解析错误详情：</h5>
                        <ul class="text-xs text-red-700 space-y-1">
                          <li v-for="item in parsedNodes.filter(item => item.error)" :key="item.node.id">
                            <strong>第{{ parsedNodes.indexOf(item) + 1 }}行:</strong> {{ item.error }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  :disabled="getValidNodes().length === 0 || importing"
                  class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
                  @click="importNodes"
                >
                  <span v-if="importing">导入中...</span>
                  <span v-else>导入 {{ getValidNodes().length }} 个节点</span>
                </button>
                <button
                  type="button"
                  class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  @click="close"
                >
                  取消
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
