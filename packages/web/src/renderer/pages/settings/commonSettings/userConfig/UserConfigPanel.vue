<template>
  <section class="panel">
    <div class="panel-header">
      <div>
        <h3>{{ $t('个人信息') }}</h3>
        <p>{{ $t('更新您的个人信息和头像') }}</p>
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
          <img :src="displayAvatar" :alt="$t('用户头像')" class="image-preview">
          <div class="image-overlay" v-if="isAvatarHover || isAvatarUploading">
            <div v-if="isAvatarUploading" class="loading-indicator">
              <span class="loading-spinner"></span>
            </div>
            <div v-else class="overlay-text">
              {{ $t('点击更换') }}
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
              {{ $t('用户名称') }}
            </div>
            <el-input
              v-model="localUserName"
              :placeholder="$t('请输入用户名称')"
              clearable
              class="form-input"
            />
          </div>

          <div class="form-item">
            <div class="form-label">
              <Mail :size="18" class="label-icon" />
              {{ $t('邮箱地址') }}
            </div>
            <el-input
              v-model="localEmail"
              :placeholder="$t('请输入邮箱地址')"
              :class="{ 'is-error': emailError, 'is-success': emailSuccess }"
              clearable
              class="form-input"
              @blur="validateEmail"
              @input="onEmailInput"
            />
            <div v-if="emailError" class="form-error">{{ emailError }}</div>
          </div>

          <div class="form-item">
            <div class="form-label">
              <Users :size="18" class="label-icon" />
              {{ $t('所属团队') }}
            </div>
            <div class="readonly-field">
              <span v-if="isLocalMode" class="field-disabled">{{ $t('离线模式下不可用') }}</span>
              <span v-else class="field-value">{{ teamDisplay }}</span>
            </div>
          </div>

          <div class="form-item">
            <div class="form-label">
              <Calendar :size="18" class="label-icon" />
              {{ $t('注册时间') }}
            </div>
            <div class="readonly-field">
              <span v-if="isLocalMode" class="field-disabled">{{ $t('离线模式下不可用') }}</span>
              <span v-else class="field-value">{{ registerTimeDisplay }}</span>
            </div>
          </div>

          <div class="form-item full-row">
            <div class="form-label">
              <Clock :size="18" class="label-icon" />
              {{ $t('最后登录') }}
            </div>
            <div class="readonly-field">
              <span v-if="isLocalMode" class="field-disabled">{{ $t('离线模式下不可用') }}</span>
              <span v-else class="field-value">{{ lastLoginTimeDisplay }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="panel-actions">
      <el-button @click="handleReset">
        {{ $t('重置') }}
      </el-button>
      <el-button type="primary" @click="handleConfirm" :disabled="!hasChanges">
        {{ $t('确认修改') }}
      </el-button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRuntime } from '@/store/runtime/runtimeStore'
import { processImageUpload } from '@/utils/imageHelper'
import { ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { User, Mail, Users, Calendar, Clock } from 'lucide-vue-next'
import defaultAvatarImg from '@/assets/imgs/logo.png'
import type { UploadFile } from 'element-plus'
import type { PermissionUserInfo } from '@src/types/project'
import { message } from '@/helper'
import { runtimeCache } from '@/cache/runtime/runtimeCache'

const { t } = useI18n()
const runtimeStore = useRuntime()

const isLocalMode = computed(() => runtimeStore.networkMode === 'offline')

const normalizeUserInfo = (info?: PermissionUserInfo | null): PermissionUserInfo => ({
  id: info?.id || '',
  loginName: info?.loginName || '',
  phone: info?.phone || '',
  realName: info?.realName || 'me',
  roleIds: info?.roleIds || [],
  token: info?.token || '',
  avatar: info?.avatar || '',
  email: info?.email || ''
})

const getCachedUserInfo = (): PermissionUserInfo => {
  const cached = runtimeCache.getUserInfo()
  if (cached) {
    return normalizeUserInfo(cached)
  }
  return normalizeUserInfo(runtimeStore.userInfo)
}

const userInfo = ref<PermissionUserInfo>(getCachedUserInfo())
const localUserName = ref('')
const localEmail = ref('')

const isAvatarHover = ref(false)
const isAvatarUploading = ref(false)
const avatarTrigger = ref()

const emailError = ref('')
const emailSuccess = ref(false)

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

const syncLocalForm = () => {
  localUserName.value = userInfo.value.realName || 'me'
  localEmail.value = userInfo.value.email || ''
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateEmail = () => {
  const trimmedEmail = localEmail.value.trim()
  if (!trimmedEmail) {
    emailError.value = ''
    emailSuccess.value = false
    return
  }
  if (!isValidEmail(trimmedEmail)) {
    emailError.value = t('邮箱格式不正确')
    emailSuccess.value = false
  } else {
    emailError.value = ''
    emailSuccess.value = true
  }
}

const onEmailInput = () => {
  if (emailError.value) {
    validateEmail()
  }
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
    runtimeStore.updateUserAvatar(result.data)
    refreshUserInfoFromCache()
  } else {
    message.error(result.message || t('图片上传失败'))
  }
}

const hasChanges = computed(() => {
  const userNameChanged = localUserName.value.trim() !== (userInfo.value.realName || 'me')
  const emailChanged = localEmail.value.trim() !== (userInfo.value.email || '')
  return userNameChanged || emailChanged
})

const handleConfirm = () => {
  const trimmedUserName = localUserName.value.trim()
  const trimmedEmail = localEmail.value.trim()
  if (!trimmedUserName) {
    message.warning(t('用户名不能为空'))
    return
  }
  if (trimmedEmail && !isValidEmail(trimmedEmail)) {
    message.warning(t('邮箱格式不正确'))
    return
  }
  const updatedUserInfo = normalizeUserInfo({
    ...userInfo.value,
    realName: trimmedUserName,
    email: trimmedEmail
  })
  runtimeCache.setUserInfo(updatedUserInfo)
  runtimeStore.setUserInfo(updatedUserInfo)
  refreshUserInfoFromCache()
  message.success(t('保存成功'))
}

const handleReset = async () => {
  try {
    await ElMessageBox.confirm(
      t('确认将所有配置恢复为默认值吗？'),
      {
        type: 'warning',
        confirmButtonText: t('确定'),
        cancelButtonText: t('取消'),
      }
    )
  } catch {
    return
  }
  runtimeCache.clearUserInfo()
  runtimeStore.clearUserInfo()
  refreshUserInfoFromCache()
  syncLocalForm()
  emailError.value = ''
  emailSuccess.value = false
  message.success(t('已恢复默认配置'))
}

onMounted(() => {
  runtimeStore.initUserInfo()
  refreshUserInfoFromCache()
  syncLocalForm()
})
</script>

<style lang="scss" scoped>
.panel {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
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
      box-shadow: 0 0 0 1px #ef4444 inset;
    }
  }

  &.is-success {
    :deep(.el-input__wrapper) {
      box-shadow: 0 0 0 1px #10b981 inset;
    }
  }
}

.form-error {
  color: #ef4444;
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
        border: 3px solid rgba(255, 255, 255, 0.3);
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
