<template>
  <div class="hidden sm:block">
    <!-- 桌面端视图 -->
    <a-row :gutter="[16, 16]">
      <a-col :span="24">
        <a-card>
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold">仪表盘</h1>
            <a-button type="primary" @click="refreshData" :loading="loading">刷新</a-button>
          </div>
        </a-card>
      </a-col>
      <!-- ... existing code ... -->
    </a-row>
  </div>
  <div class="sm:hidden">
    <!-- 移动端视图 -->
    <MobileDashboard />
  </div>
</template>