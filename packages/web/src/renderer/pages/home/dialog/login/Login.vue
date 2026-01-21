<template>
  <el-dialog
    :model-value="modelValue"
    width="450px"
    :title="title || t('快捷登录')"
    :before-close="handleClose"
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="loginForm" :rules="rules" @submit.prevent="handleLogin">
      <el-form-item prop="loginName">
        <el-input
          v-model="loginForm.loginName"
          :placeholder="t('请输入用户名')"
          clearable
          name="loginName"
        >
          <template #prefix>
            <User :size="16" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          :placeholder="t('请输入密码')"
          show-password
          clearable
          name="password"
        >
          <template #prefix>
            <Lock :size="16" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item v-if="showCaptcha" prop="captcha">
        <div class="captcha-wrapper">
          <el-input
            v-model="loginForm.captcha"
            :placeholder="t('请输入验证码')"
            clearable
            name="captcha"
            class="captcha-input"
          />
          <img
            :src="captchaUrl"
            class="captcha-img"
            :title="t('点击刷新验证码')"
            @click="refreshCaptcha"
          />
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">{{ t('取消') }}</el-button>
        <el-button type="primary" :loading="loading" @click="handleLogin">
          {{ t('登录') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { User, Lock } from 'lucide-vue-next'
import type { FormInstance, FormRules } from 'element-plus'
import { request } from '@/api/api'
import { useRuntime } from '@/store/runtime/runtimeStore'
import { useAppSettings } from '@/store/appSettings/appSettingsStore'
import { message } from '@/helper'
import { config } from '@src/config/config'
import { IPC_EVENTS } from '@src/types/ipc'
import type { PermissionUserInfo, CommonResponse } from '@src/types'

defineProps<{
  modelValue: boolean
  title?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': [userInfo: PermissionUserInfo]
}>()

const { t } = useI18n()
const runtimeStore = useRuntime()
const appSettingsStore = useAppSettings()
const formRef = ref<FormInstance>()
const loginForm = ref({
  loginName: '',
  password: '',
  captcha: '',
})
const rules: FormRules = {
  loginName: [{ required: true, message: t('请输入用户名'), trigger: 'blur' }],
  password: [{ required: true, message: t('请输入密码'), trigger: 'blur' }],
  captcha: [{ required: true, message: t('请输入验证码'), trigger: 'blur' }],
}
const loading = ref(false)
const showCaptcha = ref(false)
const random = ref(Math.random())
const captchaUrl = computed(() => {
  const requestUrl = appSettingsStore.serverUrl || config.renderConfig.httpRequest.url
  return `${requestUrl}/api/security/captcha?width=120&height=40&random=${random.value}`
})
const handleClose = () => {
  emit('update:modelValue', false)
}
const handleClosed = () => {
  formRef.value?.resetFields()
  showCaptcha.value = false
  loginForm.value.captcha = ''
}
const refreshCaptcha = () => {
  random.value = Math.random()
}
const handleLogin = async () => {
  if (!formRef.value) return
  
  formRef.value.validate((valid: boolean) => {
    if (!valid) {
      nextTick(() => {
        const input = document.querySelector('.el-form-item.is-error input')
        if (input) {
          (input as HTMLElement).focus()
        }
      })
      return
    }

    loading.value = true
    request
      .post<CommonResponse<PermissionUserInfo>, CommonResponse<PermissionUserInfo>>(
        '/api/security/login_password',
        loginForm.value
      )
      .then((res) => {
        if (res.code === 2006 || res.code === 2003) {
          message.warning(res.msg)
          showCaptcha.value = true
          refreshCaptcha()
        } else {
          runtimeStore.updateUserInfo(res.data)
          window.electronAPI?.ipcManager.sendToMain(
            IPC_EVENTS.apiflow.contentToTopBar.userInfoChanged,
            {
              id: res.data.id,
              loginName: res.data.loginName,
              role: res.data.role,
              token: res.data.token,
              avatar: res.data.avatar,
            }
          )
          emit('success', res.data)
          handleClose()
        }
      })
      .catch((err) => {
        console.error(err)
        message.error(t('登录失败'))
      })
      .finally(() => {
        loading.value = false
      })
  })
}
</script>

<style lang="scss" scoped>
.captcha-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;

  .captcha-input {
    flex: 1;
  }

  .captcha-img {
    width: 120px;
    height: 40px;
    cursor: pointer;
    border-radius: var(--border-radius-base);
    border: 1px solid var(--border-color-base);
    flex-shrink: 0;

    &:hover {
      border-color: var(--color-primary);
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
