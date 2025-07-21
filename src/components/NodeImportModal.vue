<script setup lang="ts">
import { ref, watch } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import { parseNode } from '../lib/node-parser';
import { Node } from '../types';

const isOpen = ref(false);
const nodeInput = ref('');
const parsedNodes = ref<Node[]>([]);

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
      const node = parseNode(line);
      parsedNodes.value.push({ ...node, id: `temp-${index}` }); // Add a temporary ID for keying
    } catch (error) {
      console.error(`Error parsing line ${index + 1}: ${line}`, error);
      // Optionally, add some visual feedback for parsing errors
    }
  });
});

const removeNode = (id: string) => {
  parsedNodes.value = parsedNodes.value.filter(node => node.id !== id);
};

const importNodes = () => {
  // Emit event to parent with parsedNodes
  console.log('Importing nodes:', parsedNodes.value);
  close();
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
              class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
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
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900"
                    >Import Nodes</DialogTitle
                  >
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Paste your node links below, one per line. The system will automatically parse
                      and display them.
                    </p>
                    <textarea
                      v-model="nodeInput"
                      rows="10"
                      class="mt-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="Paste node links here..."
                    ></textarea>

                    <div v-if="parsedNodes.length > 0" class="mt-4">
                      <h4 class="text-sm font-medium text-gray-900">Parsed Nodes:</h4>
                      <div class="mt-2 flow-root">
                        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                          <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <table class="min-w-full divide-y divide-gray-300">
                              <thead>
                                <tr>
                                  <th
                                    scope="col"
                                    class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                                  >
                                    #
                                  </th>
                                  <th
                                    scope="col"
                                    class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                  >
                                    Name
                                  </th>
                                  <th
                                    scope="col"
                                    class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                  >
                                    Type
                                  </th>
                                  <th
                                    scope="col"
                                    class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                  >
                                    Address
                                  </th>
                                  <th
                                    scope="col"
                                    class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                  >
                                    Port
                                  </th>
                                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                    <span class="sr-only">Actions</span>
                                  </th>
                                </tr>
                              </thead>
                              <tbody class="divide-y divide-gray-200">
                                <tr v-for="(node, index) in parsedNodes" :key="node.id">
                                  <td
                                    class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0"
                                  >
                                    {{ index + 1 }}
                                  </td>
                                  <td
                                    class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                                  >
                                    {{ node.name }}
                                  </td>
                                  <td
                                    class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                                  >
                                    {{ node.type }}
                                  </td>
                                  <td
                                    class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                                  >
                                    {{ node.address }}
                                  </td>
                                  <td
                                    class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                                  >
                                    {{ node.port }}
                                  </td>
                                  <td
                                    class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0"
                                  >
                                    <button
                                      type="button"
                                      class="text-red-600 hover:text-red-900"
                                      @click="removeNode(node.id)"
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                  @click="importNodes"
                >
                  Import
                </button>
                <button
                  type="button"
                  class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  @click="close"
                  ref="cancelButtonRef"
                >
                  Cancel
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
