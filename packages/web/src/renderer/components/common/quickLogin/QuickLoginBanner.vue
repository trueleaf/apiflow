<template>
  <div v-if="visible" class="quick-login-banner" role="alert">
    <div class="content d-flex a-center j-between">
      <div class="left d-flex a-center">
        <KeyRound :size="18" :stroke-width="1.5" class="lucide-icon" aria-hidden="true"/>
        <span class="text" :title="tipText">{{ tipText }}</span>
      </div>
      <div class="right">
        <button class="btn-close" @click="handleClose" :aria-label="t('关闭')">
          <X :size="18" :stroke-width="1.5" class="lucide-icon" aria-hidden="true"/>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { KeyRound, X } from 'lucide-vue-next';
import { getQuickLoginCredential, getQuickLoginTipDismissed, setQuickLoginTipDismissed } from '@/cache/runtime/quickLoginSession';
import type { QuickLoginCredential } from '@src/types/security/quickLogin';
import { IPC_EVENTS } from '@src/types/ipc';

const { t } = useI18n();
const quickLoginCredential = ref<QuickLoginCredential | null>(getQuickLoginCredential());
const quickLoginTipDismissed = ref(getQuickLoginTipDismissed());
const tipText = computed(() => {
  if (!quickLoginCredential.value) return '';
  return t('快速登录账号密码提示', {
    loginName: quickLoginCredential.value.loginName,
    password: quickLoginCredential.value.password,
  });
});
const visible = computed(() => {
  return Boolean(quickLoginCredential.value) && !quickLoginTipDismissed.value;
});
const handleClose = () => {
  quickLoginTipDismissed.value = true;
  setQuickLoginTipDismissed(true);
};
window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.contentToTopBar.quickLoginCredentialChanged, (credential: QuickLoginCredential) => {
  quickLoginCredential.value = credential;
  quickLoginTipDismissed.value = false;
});
</script>

<style lang="scss" scoped>
.quick-login-banner {
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
      flex: 1;
      min-width: 0;
      .text {
        margin-left: 8px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .right {
      margin-left: auto;
      flex-shrink: 0;
      .btn-close {
        background: transparent;
        border: none;
        cursor: pointer;
        color: inherit;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
}
</style>
