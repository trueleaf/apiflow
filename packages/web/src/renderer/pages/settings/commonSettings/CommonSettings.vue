<template>
  <div class="common-settings-container">
    <div class="page-title">
      <h2>{{ $t('通用配置') }}</h2>
    </div>

    <div class="settings-content">
      <div class="left-column">
        <div class="settings-card">
          <div class="card-header">
            <h3>{{ $t('用户信息') }}</h3>
          </div>
          <div class="card-body">
            <div class="image-upload-section">
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
                ref="avatarUpload"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleAvatarChange"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                style="display: none;"
              >
                <template #trigger>
                  <button ref="avatarTrigger"></button>
                </template>
              </el-upload>
            </div>

            <div class="form-section">
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

              <div class="form-item">
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
      </div>

      <div class="right-column">
        <div class="settings-card">
          <div class="card-header">
            <h3>{{ $t('应用配置') }}</h3>
          </div>
          <div class="card-body">
            <div class="image-upload-section">
              <div
                class="image-container logo-container"
                :class="{ 'is-hover': isLogoHover }"
                @mouseenter="isLogoHover = true"
                @mouseleave="isLogoHover = false"
                @click="triggerLogoUpload"
              >
                <img :src="displayLogo" :alt="$t('应用Logo')" class="image-preview">
                <div class="image-overlay" v-if="isLogoHover || isLogoUploading">
                  <div v-if="isLogoUploading" class="loading-indicator">
                    <span class="loading-spinner"></span>
                  </div>
                  <div v-else class="overlay-text">
                    {{ $t('点击更换') }}
                  </div>
                </div>
              </div>
              <el-upload
                ref="logoUpload"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleLogoChange"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                style="display: none;"
              >
                <template #trigger>
                  <button ref="logoTrigger"></button>
                </template>
              </el-upload>
            </div>

            <div class="form-section">
              <div class="form-item">
                <div class="form-label">
                  <AppWindow :size="18" class="label-icon" />
                  {{ $t('应用名称') }}
                </div>
                <el-input
                  v-model="localAppTitle"
                  :placeholder="$t('请输入应用名称')"
                  clearable
                  class="form-input"
                />
              </div>

              <div class="form-item">
                <div class="form-label">
                  <Palette :size="18" class="label-icon" />
                  {{ $t('应用主题') }}
                </div>
                <el-radio-group v-model="localAppTheme" class="theme-radio-group">
                  <el-radio value="light" class="theme-radio">{{ $t('浅色') }}</el-radio>
                  <el-radio value="dark" class="theme-radio">{{ $t('深色') }}</el-radio>
                  <el-radio value="auto" class="theme-radio">{{ $t('跟随系统') }}</el-radio>
                </el-radio-group>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-actions">
      <el-button @click="handleReset" size="large">
        {{ $t('重置') }}
      </el-button>
      <el-button type="primary" @click="handleConfirm" :disabled="!hasChanges" size="large">
        {{ $t('确认修改') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRuntime } from '@/store/runtime/runtimeStore'
import { useAppSettings } from '@/store/appSettings/appSettingsStore'
import { processImageUpload } from '@/utils/imageHelper'
import { ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { User, Mail, Users, Calendar, Clock, AppWindow, Palette } from 'lucide-vue-next'
import defaultAvatarImg from '@/assets/imgs/logo.png'
import type { UploadFile } from 'element-plus'
import type { AppTheme } from '@src/types'
import { message } from '@/helper'

const { t } = useI18n()
const runtimeStore = useRuntime()
const appSettingsStore = useAppSettings()

const defaultAvatar = defaultAvatarImg
const defaultLogo = defaultAvatarImg

const isLocalMode = computed(() => runtimeStore.networkMode === 'offline')

const userInfo = computed(() => runtimeStore.userInfo)
const localUserName = ref('')
const localEmail = ref('')

const localAppTitle = ref('')
const localAppTheme = ref<AppTheme>('light')

const isAvatarHover = ref(false)
const isLogoHover = ref(false)
const isAvatarUploading = ref(false)
const isLogoUploading = ref(false)

const avatarUpload = ref()
const logoUpload = ref()
const avatarTrigger = ref()
const logoTrigger = ref()

const emailError = ref('')
const emailSuccess = ref(false)

const displayAvatar = computed(() => {
  return userInfo.value.avatar || defaultAvatar
})

const displayLogo = computed(() => {
  return appSettingsStore.appLogo || defaultLogo
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
const triggerLogoUpload = () => {
  logoTrigger.value?.click()
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
    message.success(t('图片上传成功'))
  } else {
    message.error(result.message || t('图片上传失败'))
  }
}
const handleLogoChange = async (uploadFile: UploadFile) => {
  if (!uploadFile.raw) {
    message.warning(t('请选择图片文件'))
    return
  }
  isLogoUploading.value = true
  const result = await processImageUpload(uploadFile.raw, 'logo')
  isLogoUploading.value = false
  if (result.success && result.data) {
    appSettingsStore.setAppLogo(result.data)
    message.success(t('图片上传成功'))
  } else {
    message.error(result.message || t('图片上传失败'))
  }
}
const hasChanges = computed(() => {
  const userNameChanged = localUserName.value.trim() !== (userInfo.value.realName || 'me')
  const emailChanged = localEmail.value.trim() !== (userInfo.value.email || '')
  const appTitleChanged = localAppTitle.value.trim() !== appSettingsStore.appTitle
  const appThemeChanged = localAppTheme.value !== appSettingsStore.appTheme

  return userNameChanged || emailChanged || appTitleChanged || appThemeChanged
})
const handleConfirm = () => {
  const trimmedUserName = localUserName.value.trim()
  const trimmedEmail = localEmail.value.trim()
  const trimmedAppTitle = localAppTitle.value.trim()
  if (!trimmedUserName) {
    message.warning(t('用户名不能为空'))
    return
  }
  if (trimmedEmail && !isValidEmail(trimmedEmail)) {
    message.warning(t('邮箱格式不正确'))
    return
  }
  if (trimmedUserName !== userInfo.value.realName) {
    runtimeStore.updateUserRealName(trimmedUserName)
  }
  if (trimmedEmail !== userInfo.value.email) {
    runtimeStore.updateUserEmail(trimmedEmail)
  }
  if (trimmedAppTitle && trimmedAppTitle !== appSettingsStore.appTitle) {
    appSettingsStore.setAppTitle(trimmedAppTitle)
  }
  if (localAppTheme.value !== appSettingsStore.appTheme) {
    appSettingsStore.setAppTheme(localAppTheme.value)
  }
  message.success(t('保存成功'))
}
const handleReset = async () => {
  if (hasChanges.value) {
    try {
      await ElMessageBox.confirm(
        t('确认放弃所有未保存的修改吗？'),
        {
          type: 'warning',
          confirmButtonText: t('确定'),
          cancelButtonText: t('取消'),
        }
      )
    } catch {
      return
    }
  }
  localUserName.value = userInfo.value.realName || 'me'
  localEmail.value = userInfo.value.email || ''
  localAppTitle.value = appSettingsStore.appTitle
  localAppTheme.value = appSettingsStore.appTheme
  emailError.value = ''
  emailSuccess.value = false
  message.info(t('已重置'))
}
onMounted(() => {
  runtimeStore.initUserInfo()
  localUserName.value = userInfo.value.realName || 'me'
  localEmail.value = userInfo.value.email || ''
  localAppTitle.value = appSettingsStore.appTitle
  localAppTheme.value = appSettingsStore.appTheme
})
</script>

<style lang="scss" scoped>
.common-settings-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow-y: auto;
  position: relative;

  .page-title {
    margin-bottom: 24px;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #111827;
    }
  }

  .settings-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 24px;

    @media (max-width: 1400px) {
      grid-template-columns: 1fr;
    }

    .left-column,
    .right-column {
      min-width: 0;
    }
  }

  .settings-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;

    .card-header {
      padding: 16px 24px;
      background: #fafafa;
      border-bottom: 1px solid #e5e7eb;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #111827;
      }
    }

    .card-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;

      .image-upload-section {
        display: flex;
        justify-content: center;

        .image-container {
          width: 150px;
          height: 150px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;

          &.avatar-container {
            border-radius: 50%;
          }

          &:hover {
            border-color: #007aff;
          }

          .image-preview {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .image-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.3s ease;

            .overlay-text {
              color: #ffffff;
              font-size: 14px;
              font-weight: 500;
            }

            .loading-indicator {
              .loading-spinner {
                display: inline-block;
                width: 24px;
                height: 24px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-top-color: #ffffff;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
              }
            }
          }
        }
      }

      .form-section {
        display: flex;
        flex-direction: column;
        gap: 20px;

        .form-item {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .form-label {
            color: #6b7280;
            font-weight: 500;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;

            .label-icon {
              color: #007aff;
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
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            font-size: 14px;

            .field-value {
              color: #111827;
            }

            .field-disabled {
              color: #9ca3af;
              font-style: italic;
            }
          }

          .theme-radio-group {
            display: flex;
            gap: 16px;

            .theme-radio {
              :deep(.el-radio__label) {
                font-size: 14px;
              }
            }
          }
        }
      }
    }
  }

  .bottom-actions {
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px 0;
    background: #ffffff;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    z-index: 10;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
