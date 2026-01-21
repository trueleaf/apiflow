<template>
  <section class="panel">
    <div class="panel-header">
      <div>
        <h3>{{ t('个人信息') }}</h3>
        <p>{{ t('更新您的个人信息和头像') }}</p>
      </div>
    </div>
    <div class="panel-body">
      <div class="media-block">
        <div
          class="image-container avatar-container"
          :class="{ 'is-hover': isAvatarHover }"
          @mouseenter="isAvatarHover = true"
          @mouseleave="isAvatarHover = false"
          @click="triggerAvatarUpload"
        >
          <img :src="displayAvatar" :alt="t('用户头像')" class="image-preview">
          <div class="image-overlay" v-if="isAvatarHover || isAvatarUploading">
            <div v-if="isAvatarUploading" class="loading-indicator">
              <span class="loading-spinner"></span>
            </div>
            <div v-else class="overlay-text">
              {{ t('点击更换') }}
            </div>
          </div>
        </div>
        <el-upload
          class="upload-proxy"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleAvatarChange"
          accept="image/jpeg,image/jpg,image/png,image/gif"
        >
          <template #trigger>
            <button ref="avatarTrigger"></button>
          </template>
        </el-upload>
      </div>

      <div class="form-block">
        <div class="form-grid">
          <div class="form-item">
            <div class="form-label">
              <User :size="18" class="label-icon" />
              {{ t('登录名称') }}
            </div>
            <div class="readonly-field">
              <span class="field-value">{{ userInfo.loginName || '/' }}</span>
            </div>
          </div>

          <div class="form-item">
            <div class="form-label">
              <Users :size="18" class="label-icon" />
              {{ t('所属团队') }}
            </div>
            <div class="readonly-field">
              <span v-if="isLocalMode" class="field-disabled">{{ t('离线模式下不可用') }}</span>
              <span v-else class="field-value">{{ teamDisplay }}</span>
            </div>
          </div>

          <div class="form-item">
            <div class="form-label">
              <Calendar :size="18" class="label-icon" />
              {{ t('注册时间') }}
            </div>
            <div class="readonly-field">
              <span v-if="isLocalMode" class="field-disabled">{{ t('离线模式下不可用') }}</span>
              <span v-else class="field-value">{{ registerTimeDisplay }}</span>
            </div>
          </div>

          <div class="form-item full-row">
            <div class="form-label">
              <Clock :size="18" class="label-icon" />
              {{ t('最后登录') }}
            </div>
            <div class="readonly-field">
              <span v-if="isLocalMode" class="field-disabled">{{ t('离线模式下不可用') }}</span>
              <span v-else class="field-value">{{ lastLoginTimeDisplay }}</span>
            </div>
          </div>

          <div class="form-item full-row">
            <div class="form-label">
              <Mail :size="18" class="label-icon" />
              {{ t('绑定邮箱') }}
            </div>
            <div class="readonly-field">
              <span v-if="userInfo.email" class="field-value">{{ userInfo.email }}</span>
              <span v-else class="field-disabled">{{ t('未绑定邮箱') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="panel-actions">
      <el-button v-if="!userInfo.email" type="primary" @click="handleBindEmail">
        {{ t('绑定邮箱') }}
      </el-button>
      <el-button v-else type="primary" @click="handleChangeEmail">
        {{ t('修改邮箱') }}
      </el-button>
      <el-button v-if="userInfo.email" @click="handleUnbindEmail">
        {{ t('解绑邮箱') }}
      </el-button>
      <el-button type="warning" @click="handleResetAvatar">
        {{ t('重置头像') }}
      </el-button>
    </div>
  </section>

  <BindEmailDialog v-model="bindDialogVisible" @success="handleBindSuccess" />
  <ChangeEmailDialog v-model="changeDialogVisible" :current-email="userInfo.email || ''" @success="handleChangeSuccess" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRuntime } from '@/store/runtime/runtimeStore'
import { processImageUpload } from '@/utils/imageHelper'
import { useI18n } from 'vue-i18n'
import { User, Users, Calendar, Clock, Mail } from 'lucide-vue-next'
import defaultAvatarImg from '@/assets/imgs/logo.png'
import type { UploadFile } from 'element-plus'
import type { PermissionUserInfo } from '@src/types/project'
import { message } from '@/helper'
import { runtimeCache } from '@/cache/runtime/runtimeCache'
import { request } from '@/api/api'
import { ElMessageBox } from 'element-plus'
import BindEmailDialog from './BindEmailDialog.vue'
import ChangeEmailDialog from './ChangeEmailDialog.vue'

const { t } = useI18n()
const runtimeStore = useRuntime()

const isLocalMode = computed(() => runtimeStore.networkMode === 'offline')

const normalizeUserInfo = (info?: PermissionUserInfo | null): PermissionUserInfo => ({
  id: info?.id || '',
  loginName: info?.loginName || '',
  roleIds: info?.roleIds || [],
  role: info?.role || 'user',
  token: info?.token || '',
  avatar: info?.avatar || '',
})

const getCachedUserInfo = (): PermissionUserInfo => {
  const cached = runtimeCache.getUserInfo()
  if (cached) {
    return normalizeUserInfo(cached)
  }
  return normalizeUserInfo(runtimeStore.userInfo)
}

const userInfo = ref<PermissionUserInfo>(getCachedUserInfo())

const isAvatarHover = ref(false)
const isAvatarUploading = ref(false)
const avatarTrigger = ref()
const bindDialogVisible = ref(false)
const changeDialogVisible = ref(false)


const displayAvatar = computed(() => {
  return userInfo.value.avatar || defaultAvatarImg
})

const teamDisplay = computed(() => {
  if (isLocalMode.value) {
    return '/'
  }
  return userInfo.value.id ? '/' : '/'
})

const registerTimeDisplay = computed(() => {
  if (isLocalMode.value || !userInfo.value.registerTime) {
    return '/'
  }
  return formatDateTime(userInfo.value.registerTime)
})

const lastLoginTimeDisplay = computed(() => {
  if (isLocalMode.value || !userInfo.value.lastLoginTime) {
    return '/'
  }
  return formatDateTime(userInfo.value.lastLoginTime)
})

const formatDateTime = (isoString: string): string => {
  try {
    const date = new Date(isoString)
    return date.toLocaleString()
  } catch {
    return '/'
  }
}

const refreshUserInfoFromCache = () => {
  userInfo.value = getCachedUserInfo()
}

const triggerAvatarUpload = () => {
  avatarTrigger.value?.click()
}

const handleAvatarChange = async (uploadFile: UploadFile) => {
  if (!uploadFile.raw) {
    message.warning(t('请选择图片文件'))
    return
  }
  isAvatarUploading.value = true
  const result = await processImageUpload(uploadFile.raw, 'avatar')
  isAvatarUploading.value = false
  if (result.success && result.data) {
    runtimeStore.updateUserInfo({ avatar: result.data })
    refreshUserInfoFromCache()
  } else {
    message.error(result.message || t('图片上传失败'))
  }
}

const handleResetAvatar = () => {
  runtimeCache.updateUserInfo({ avatar: '' })
  runtimeStore.updateUserInfo({ avatar: '' })
  refreshUserInfoFromCache()
}

//打开绑定邮箱对话框
const handleBindEmail = () => {
  bindDialogVisible.value = true
}
//打开修改邮箱对话框
const handleChangeEmail = () => {
  changeDialogVisible.value = true
}
//绑定成功回调
const handleBindSuccess = (email: string) => {
  runtimeCache.updateUserInfo({ email })
  runtimeStore.updateUserInfo({ email })
  refreshUserInfoFromCache()
}
//修改成功回调
const handleChangeSuccess = (email: string) => {
  runtimeCache.updateUserInfo({ email })
  runtimeStore.updateUserInfo({ email })
  refreshUserInfoFromCache()
}
//解绑邮箱
const handleUnbindEmail = async () => {
  try {
    await ElMessageBox.confirm(
      t('解绑邮箱后将无法通过邮箱登录和重置密码，确定要解绑吗？'),
      t('解绑邮箱'),
      {
        confirmButtonText: t('确定'),
        cancelButtonText: t('取消'),
        type: 'warning',
      }
    )
    await request.post('/api/security/send_email_code', {
      email: userInfo.value.email,
      type: 'bind',
    })
    message.success(t('验证码已发送，请查收邮件'))
    const { value } = await ElMessageBox.prompt(
      t('请输入邮箱验证码以确认解绑'),
      t('解绑邮箱'),
      {
        confirmButtonText: t('确定'),
        cancelButtonText: t('取消'),
        inputPlaceholder: t('请输入验证码'),
        inputPattern: /^\d{6}$/,
        inputErrorMessage: t('请输入6位数字验证码'),
      }
    )
    await request.put('/api/security/unbind_email', { code: value })
    runtimeCache.updateUserInfo({ email: undefined })
    runtimeStore.updateUserInfo({ email: undefined })
    refreshUserInfoFromCache()
    message.success(t('邮箱解绑成功'))
  } catch (error) {
    //取消或失败
  }
}

onMounted(() => {
  runtimeStore.initUserInfo()
  refreshUserInfoFromCache()
})
</script>

<style lang="scss" scoped>
.panel {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  box-shadow: 0 10px 30px var(--shadow-light);
  padding: 32px;
  margin-bottom: 32px;
}

.panel-header {
  margin-bottom: 24px;

  h3 {
    margin: 0 0 6px;
    font-size: 20px;
    color: var(--text-primary);
  }

  p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
  }
}

.panel-body {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.media-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.form-block {
  flex: 1;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &.full-row {
    grid-column: span 2;
  }
}

.form-label {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  .label-icon {
    color: var(--text-primary);
    flex-shrink: 0;
  }
}

.form-input {
  width: 100%;

  &.is-error {
    :deep(.el-input__wrapper) {
      box-shadow: 0 0 0 1px var(--el-color-danger) inset;
    }
  }

  &.is-success {
    :deep(.el-input__wrapper) {
      box-shadow: 0 0 0 1px var(--el-color-success) inset;
    }
  }
}

.form-error {
  color: var(--el-color-danger);
  font-size: 12px;
  margin-top: -4px;
}

.readonly-field {
  padding: 10px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  font-size: 14px;

  .field-value {
    color: var(--text-primary);
  }

  .field-disabled {
    color: var(--text-tertiary);
    font-style: italic;
  }
}

.image-container {
  width: 150px;
  height: 150px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-light);
  position: relative;
  cursor: pointer;
  transition: border-color 0.3s ease;

  &.avatar-container {
    border-radius: 50%;
  }

  &:hover {
    border-color: var(--text-primary);
  }

  .image-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-overlay {
    position: absolute;
    inset: 0;
    background: var(--bg-overlay);
    display: flex;
    align-items: center;
    justify-content: center;

    .overlay-text {
      color: var(--text-inverse);
      font-size: 14px;
      font-weight: 500;
    }

    .loading-indicator {
      .loading-spinner {
        display: inline-block;
        width: 24px;
        height: 24px;
        border: 3px solid var(--bg-white-30);
        border-top-color: var(--text-inverse);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
    }
  }
}

.panel-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
}

.upload-proxy {
  display: none;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
