<template>
  <div v-if="currentNotification" class="notification-banner" :class="`variant-${currentNotification.variant || 'warning'}`" role="alert">
    <div class="content d-flex a-center j-between">
      <div class="left d-flex a-center">
        <component :is="currentNotification.icon" :size="18" :stroke-width="1.5" class="lucide-icon" aria-hidden="true"/>
        <span class="text" :title="currentNotification.message">{{ currentNotification.message }}</span>
        <span v-if="currentNotification.data?.extraMessage" class="extra-text">{{ currentNotification.data.extraMessage }}</span>
        <button v-if="currentNotification.data?.extraActionText && currentNotification.data?.extraOnAction" class="btn-action extra-action" @click="handleExtraAction">
          {{ currentNotification.data.extraActionText }}
        </button>
        <button v-if="currentNotification.actionText && currentNotification.onAction" class="btn-action" @click="handleAction">
          {{ currentNotification.actionText }}
        </button>
      </div>
      <div class="right d-flex a-center">
        <button v-if="currentNotification.closeable" class="btn-close" @click="handleClose" :aria-label="t('关闭')">
          <X :size="18" :stroke-width="1.5" class="lucide-icon" aria-hidden="true"/>
        </button>
      </div>
    </div>
    <BindEmailDialog v-model="bindEmailDialogVisible" @success="handleBindEmailSuccess" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { KeyRound, X } from 'lucide-vue-next';
import { getQuickLoginCredential, clearQuickLoginCredential, clearQuickLoginTipDismissed } from '@/cache/runtime/quickLoginSession';
import { isNotificationDismissed, setNotificationDismissed, clearNotificationDismissed } from '@/cache/runtime/notificationSession';
import type { QuickLoginCredential } from '@src/types/security/quickLogin';
import type { BannerNotification } from '@src/types/common/notification';
import { IPC_EVENTS } from '@src/types/ipc';
import { useRuntime } from '@/store/runtime/runtimeStore';
import BindEmailDialog from '@/pages/settings/commonSettings/userConfig/BindEmailDialog.vue';

const { t } = useI18n();
const route = useRoute();
const runtimeStore = useRuntime();
const bindEmailDialogVisible = ref(false);
const quickLoginCredential = ref<QuickLoginCredential | null>(getQuickLoginCredential());
const quickLoginDismissed = ref(isNotificationDismissed('quick-login'));
//构建快速登录通知（合并邮箱绑定提示）
const quickLoginNotification = computed<BannerNotification | null>(() => {
  if (!quickLoginCredential.value) return null;
  if (quickLoginDismissed.value) return null;
  const user = runtimeStore.userInfo;
  const needBindEmail = user && !user.email;
  return {
    id: 'quick-login',
    type: 'quick-login',
    message: t('快速登录账号密码提示', {
      loginName: quickLoginCredential.value.loginName,
      password: quickLoginCredential.value.password,
    }),
    icon: KeyRound,
    closeable: true,
    variant: 'warning',
    data: needBindEmail ? {
      extraMessage: t('账号未绑定邮箱提示'),
      extraActionText: t('立即绑定'),
      extraOnAction: () => {
        bindEmailDialogVisible.value = true;
      },
    } : undefined,
  };
});
//当前显示的通知
const currentNotification = computed<BannerNotification | null>(() => {
  return quickLoginNotification.value;
});
//处理操作按钮点击
const handleAction = () => {
  if (currentNotification.value?.onAction) {
    currentNotification.value.onAction();
  }
};
//处理额外操作按钮点击
const handleExtraAction = () => {
  if (currentNotification.value?.data?.extraOnAction) {
    currentNotification.value.data.extraOnAction();
  }
};
//处理关闭按钮点击
const handleClose = () => {
  if (!currentNotification.value) return;
  const notificationId = currentNotification.value.id;
  setNotificationDismissed(notificationId, true);
  if (notificationId === 'quick-login') {
    quickLoginDismissed.value = true;
  }
};
//绑定邮箱成功后的处理
const handleBindEmailSuccess = (email: string) => {
  if (runtimeStore.userInfo) {
    runtimeStore.updateUserInfo({ ...runtimeStore.userInfo, email });
  }
  bindEmailDialogVisible.value = false;
};
//清除快速登录数据
const clearQuickLoginData = () => {
  quickLoginCredential.value = null;
  clearQuickLoginCredential();
  clearQuickLoginTipDismissed();
  clearNotificationDismissed('quick-login');
  quickLoginDismissed.value = false;
};


//监听路由变化，跳转到登录页时清除快速登录数据
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/login') {
      clearQuickLoginData();
    }
  }
);
//监听网络模式变化，切换到离线模式时清除快速登录数据
watch(
  () => runtimeStore.networkMode,
  (newMode) => {
    if (newMode === 'offline') {
      clearQuickLoginData();
    }
  }
);
//监听 IPC 事件，接收快速登录凭证
window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.contentToTopBar.quickLoginCredentialChanged, (credential: QuickLoginCredential) => {
  quickLoginCredential.value = credential;
  clearNotificationDismissed('quick-login');
  quickLoginDismissed.value = false;
});
</script>

<style lang="scss" scoped>
.notification-banner {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  color: var(--el-text-color-primary);
  &.variant-warning {
    background-color: var(--warning-color, var(--el-color-warning));
  }
  &.variant-info {
    background-color: var(--el-color-info-light-9);
  }
  &.variant-success {
    background-color: var(--el-color-success-light-9);
  }
  &.variant-error {
    background-color: var(--el-color-error-light-9);
  }
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
      .extra-text {
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        opacity: 0.9;
      }
      .btn-action {
        background: rgba(0, 0, 0, 0.08);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        color: inherit;
        padding: 6px 12px;
        font-size: 13px;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
        white-space: nowrap;
        flex-shrink: 0;
        &:hover {
          background: rgba(0, 0, 0, 0.12);
        }
        &.extra-action {
          background: rgba(0, 0, 0, 0.12);
          &:hover {
            background: rgba(0, 0, 0, 0.16);
          }
        }
      }
    }
    .right {
      margin-left: auto;
      flex-shrink: 0;
      gap: 8px;
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
