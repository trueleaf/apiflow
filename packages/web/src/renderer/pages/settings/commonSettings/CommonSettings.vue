<template>
  <div class="common-settings-container">
    <!-- 页面标题 -->
    <div class="page-title">
      <h2>{{ $t('通用配置') }}</h2>
    </div>

    <!-- 用户信息卡片 -->
    <div class="settings-card">
      <div class="card-header">
        <h3>{{ $t('用户信息') }}</h3>
      </div>
      <div class="card-body">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <img :src="displayAvatar" :alt="$t('用户头像')" class="avatar-image">
          </div>
          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleAvatarChange"
            accept="image/jpeg,image/jpg,image/png,image/gif"
          >
            <el-button size="small" type="primary">{{ $t('更换头像') }}</el-button>
          </el-upload>
        </div>

        <div class="info-section">
          <div class="info-row">
            <div class="info-label">
              <User :size="16" />
              {{ $t('用户名称') }}
            </div>
            <div class="info-value">
              <el-input
                v-model="localUserName"
                :placeholder="$t('用户名称')"
                clearable
              />
            </div>
          </div>

          <div class="info-row">
            <div class="info-label">
              <Mail :size="16" />
              {{ $t('邮箱地址') }}
            </div>
            <div class="info-value">
              <el-input
                v-model="localEmail"
                :placeholder="$t('邮箱地址')"
                clearable
              />
            </div>
          </div>

          <div class="info-row">
            <div class="info-label">
              <Users :size="16" />
              {{ $t('所属团队') }}
            </div>
            <div class="info-value">
              <span :class="{ 'disabled-value': isLocalMode }">{{ teamDisplay }}</span>
            </div>
          </div>

          <div class="info-row">
            <div class="info-label">
              <Calendar :size="16" />
              {{ $t('注册时间') }}
            </div>
            <div class="info-value">
              <span :class="{ 'disabled-value': isLocalMode }">{{ registerTimeDisplay }}</span>
            </div>
          </div>

          <div class="info-row full-width">
            <div class="info-label">
              <Clock :size="16" />
              {{ $t('最后登录') }}
            </div>
            <div class="info-value">
              <span :class="{ 'disabled-value': isLocalMode }">{{ lastLoginTimeDisplay }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 应用配置卡片 -->
    <div class="settings-card">
      <div class="card-header">
        <h3>{{ $t('应用配置') }}</h3>
      </div>
      <div class="card-body">
        <div class="avatar-section">
          <div class="logo-wrapper">
            <img :src="displayLogo" :alt="$t('应用Logo')" class="logo-image">
          </div>
          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleLogoChange"
            accept="image/jpeg,image/jpg,image/png,image/gif"
          >
            <el-button size="small" type="primary">{{ $t('更换Logo') }}</el-button>
          </el-upload>
        </div>

        <div class="info-section">
          <div class="info-row">
            <div class="info-label">
              <AppWindow :size="16" />
              {{ $t('应用名称') }}
            </div>
            <div class="info-value">
              <el-input
                v-model="localAppTitle"
                :placeholder="$t('应用名称')"
                clearable
              />
            </div>
          </div>

          <div class="info-row">
            <div class="info-label">
              <Palette :size="16" />
              {{ $t('应用主题') }}
            </div>
            <div class="info-value">
              <el-radio-group v-model="localAppTheme">
                <el-radio value="light">{{ $t('浅色') }}</el-radio>
                <el-radio value="dark">{{ $t('深色') }}</el-radio>
                <el-radio value="auto">{{ $t('跟随系统') }}</el-radio>
              </el-radio-group>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="bottom-actions">
      <el-button @click="handleReset" plain>
        {{ $t('重置') }}
      </el-button>
      <el-button type="primary" @click="handleConfirm" :disabled="!hasChanges">
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { User, Mail, Users, Calendar, Clock, AppWindow, Palette } from 'lucide-vue-next'
import defaultAvatarImg from '@/assets/imgs/logo.png'
import type { UploadFile } from 'element-plus'
import type { AppTheme } from '@src/types'

const { t } = useI18n()
const runtimeStore = useRuntime()
const appSettingsStore = useAppSettings()

// 默认头像和Logo
const defaultAvatar = defaultAvatarImg
const defaultLogo = defaultAvatarImg

// 离线模式判断
const isLocalMode = computed(() => runtimeStore.networkMode === 'offline')

// 用户信息
const userInfo = computed(() => runtimeStore.userInfo)
const localUserName = ref('')
const localEmail = ref('')

// 应用配置
const localAppTitle = ref('')
const localAppTheme = ref<AppTheme>('light')

// 显示的头像和Logo
const displayAvatar = computed(() => {
  return userInfo.value.avatar || defaultAvatar
})

const displayLogo = computed(() => {
  return appSettingsStore.appLogo || defaultLogo
})

// 团队显示
const teamDisplay = computed(() => {
  if (isLocalMode.value) {
    return '/'
  }
  return userInfo.value.id ? '/' : '/'
})

// 注册时间显示
const registerTimeDisplay = computed(() => {
  if (isLocalMode.value || !userInfo.value.registerTime) {
    return '/'
  }
  return formatDateTime(userInfo.value.registerTime)
})

// 最后登录时间显示
const lastLoginTimeDisplay = computed(() => {
  if (isLocalMode.value || !userInfo.value.lastLoginTime) {
    return '/'
  }
  return formatDateTime(userInfo.value.lastLoginTime)
})

// 格式化日期时间
const formatDateTime = (isoString: string): string => {
  try {
    const date = new Date(isoString)
    return date.toLocaleString()
  } catch {
    return '/'
  }
}
// 邮箱格式验证
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
// 处理头像更换
const handleAvatarChange = async (uploadFile: UploadFile) => {
  if (!uploadFile.raw) {
    ElMessage.warning(t('请选择图片文件'))
    return
  }
  const result = await processImageUpload(uploadFile.raw, 'avatar')
  if (result.success && result.data) {
    runtimeStore.updateUserAvatar(result.data)
    ElMessage.success(t('图片上传成功'))
  } else {
    ElMessage.error(result.message || t('图片上传失败'))
  }
}
// 处理Logo更换
const handleLogoChange = async (uploadFile: UploadFile) => {
  if (!uploadFile.raw) {
    ElMessage.warning(t('请选择图片文件'))
    return
  }
  const result = await processImageUpload(uploadFile.raw, 'logo')
  if (result.success && result.data) {
    appSettingsStore.setAppLogo(result.data)
    ElMessage.success(t('图片上传成功'))
  } else {
    ElMessage.error(result.message || t('图片上传失败'))
  }
}
// 检测是否有未保存的修改
const hasChanges = computed(() => {
  const userNameChanged = localUserName.value.trim() !== (userInfo.value.realName || 'me')
  const emailChanged = localEmail.value.trim() !== (userInfo.value.email || '')
  const appTitleChanged = localAppTitle.value.trim() !== appSettingsStore.appTitle
  const appThemeChanged = localAppTheme.value !== appSettingsStore.appTheme
  
  return userNameChanged || emailChanged || appTitleChanged || appThemeChanged
})
// 确认修改
const handleConfirm = () => {
  const trimmedUserName = localUserName.value.trim()
  const trimmedEmail = localEmail.value.trim()
  const trimmedAppTitle = localAppTitle.value.trim()
  if (!trimmedUserName) {
    ElMessage.warning(t('用户名不能为空'))
    return
  }
  if (trimmedEmail && !isValidEmail(trimmedEmail)) {
    ElMessage.warning(t('邮箱格式不正确'))
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
  ElMessage.success(t('保存成功'))
}
// 重置修改
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
  ElMessage.info(t('已重置'))
}
// 初始化
onMounted(() => {
  // 初始化用户信息
  runtimeStore.initUserInfo()
  localUserName.value = userInfo.value.realName || 'me'
  localEmail.value = userInfo.value.email || ''

  // 初始化应用配置
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
      color: #333;
    }
  }

  .settings-card {
    background: transparent;
    border: none;
    border-radius: 0;
    margin-bottom: 32px;
    overflow: visible;

    .card-header {
      padding: 0 0 16px 0;
      background: transparent;
      border-bottom: 1px solid #e5e7eb;

      h3 {
        margin: 0;
        font-size: 17px;
        font-weight: 500;
        color: #374151;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }

    .card-body {
      padding: 24px 0;
      display: flex;
      gap: 40px;

      .avatar-section,
      .logo-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;

        .avatar-wrapper,
        .logo-wrapper {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f9fafb;

          .avatar-image,
          .logo-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }

      .info-section {
        flex: 1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px 32px;

        .info-row {
          display: flex;
          flex-direction: column;
          gap: 8px;

          &.full-width {
            grid-column: 1 / -1;
          }

          .info-label {
            color: #374151;
            font-weight: 500;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .info-value {
            width: 100%;

            .el-input,
            .el-select,
            .el-radio-group {
              max-width: 100%;
            }

            span {
              color: #111827;
              font-size: 14px;

              &.disabled-value {
                color: #9ca3af;
                cursor: not-allowed;
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
    padding: 24px 0;
    background: linear-gradient(to top, rgba(255, 255, 255, 1) 80%, rgba(255, 255, 255, 0));
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 32px;
    z-index: 10;
  }
}
</style>
