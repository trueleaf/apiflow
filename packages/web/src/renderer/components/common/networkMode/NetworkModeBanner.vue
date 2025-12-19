<template>
  <div v-if="visible" class="network-mode-banner" role="alert">
    <div class="content d-flex a-center j-between">
      <div class="left d-flex a-center">
        <Info :size="18" :stroke-width="1.5" class="lucide-icon" aria-hidden="true"/>
        <span class="text">{{ t('互联网模式提示') }}</span>
      </div>
      <div class="right">
        <button class="btn-close" @click="handleClose" aria-label="关闭">
          <X :size="18" :stroke-width="1.5" class="lucide-icon" aria-hidden="true"/>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Info, X } from 'lucide-vue-next';
import { useRuntime } from '@/store/runtime/runtimeStore';
import { appStateCache } from '@/cache/appState/appStateCache';
// 保存横幅是否被关闭
const runtimeStore = useRuntime();
const { t } = useI18n();
const dismissed = ref(appStateCache.getNetworkModeBannerDismissed());
const visible = computed(() => runtimeStore.networkMode === 'online' && !dismissed.value);
const handleClose = () => {
  dismissed.value = true;
  appStateCache.setNetworkModeBannerDismissed(true);
}
// 如果网络模式从 offline 切换到 online，且缓存没有被dismiss，保持显示
watch(() => runtimeStore.networkMode, (mode) => {
  if (mode === 'online' && !appStateCache.getNetworkModeBannerDismissed()) {
    dismissed.value = false;
  }
});
</script>

<style lang="scss" scoped>
.network-mode-banner {
  width: 100%;
  background-color: var(--warning-color, var(--el-color-warning));
  color: var(--el-text-color-primary);
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  .content {
    width: 100%;
    align-items: center;
    .left {
      gap: 8px;
      .text {
        margin-left: 8px;
        font-weight: 500;
      }
    }
    .right {
      margin-left: auto;
      .btn-close {
        background: transparent;
        border: none;
        cursor: pointer;
        color: inherit;
        padding: 4px;
      }
    }
  }
}
</style>
