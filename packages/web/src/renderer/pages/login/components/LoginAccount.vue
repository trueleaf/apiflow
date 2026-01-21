<template>
  <el-form ref="form" class="login-account" :model="userInfo" :rules="rules" data-testid="login-form" @submit.stop.prevent="handleLogin">
    <el-form-item prop="loginName">
      <el-input v-model="userInfo.loginName" :prefix-icon="User" name="loginName" type="text"
        :placeholder="`${t('请输入用户名或邮箱')}...`" data-testid="login-username-input"></el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input v-model="userInfo.password" :prefix-icon="Lock" name="password" type="password"
        :placeholder="`${t('请输入密码')}...`" show-password data-testid="login-password-input"></el-input>
    </el-form-item>
    <el-form-item v-if="isShowCapture" prop="captcha">
      <div class="captcha">
        <el-input v-model="userInfo.captcha" :size="config.renderConfig.layout.size" name="captcha" type="text"
          :placeholder="t('验证码')" data-testid="login-captcha-input"></el-input>
        <img :src="captchaUrl" data-testid="login-captcha-img" @click="freshCapchaUrl" />
      </div>
    </el-form-item>
    <el-form-item class="mb-1">
      <el-button :loading="loading" type="primary" native-type="submit"
        class="w-100" data-testid="login-submit-btn">{{ t("登录") }}</el-button>
    </el-form-item>
    <el-form-item class="mb-1">
      <el-button :loading="quickLoginLoading" class="w-100" data-testid="login-quick-login-btn" @click="handleQuickLogin">{{ t('快速登录') }}</el-button>
    </el-form-item>
    <div class="mt-2 d-flex j-around">
      <a href="https://github.com/trueleaf/apiflow" target="_blank" class="d-flex flex-column j-center a-center">
        <svg class="svg-icon" aria-hidden="true" :title="t('跳转github')">
          <use xlink:href="#icongithub"></use>
        </svg>
        <div class="mt-1">GitHub</div>
      </a>
      <a href="https://gitee.com/wildsell/apiflow" target="_blank" class="d-flex flex-column j-center a-center">
        <svg class="svg-icon" aria-hidden="true" :title="t('跳转码云')">
          <use xlink:href="#icongitee"></use>
        </svg>
        <div class="mt-1">{{ t('码云') }}</div>
      </a>
    </div>
  </el-form>
</template>

<script lang="ts" setup>
import { config } from '@src/config/config';
import { PermissionUserInfo, CommonResponse } from '@src/types'
import { User, Lock } from '@element-plus/icons-vue'
import { computed, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { FormInstance } from 'element-plus';
import { request } from '@/api/api';
import { router } from '@/router';
import { useRuntime } from '@/store/runtime/runtimeStore';
import { useAppSettings } from '@/store/appSettings/appSettingsStore';    
import { IPC_EVENTS } from '@src/types/ipc'

import { message } from '@/helper'
import { trackEvent } from '@/utils/analytics';
const emits = defineEmits(['jumpToRegister', 'jumpToResetPassword'])
const { t } = useI18n()
const runtimeStore = useRuntime()
const userInfo = ref({
  loginName: process.env.NODE_ENV === 'development' ? 'apiflow' : '', //-----------登录名称
  password: process.env.NODE_ENV === 'development' ? '111111aaa' : '', //---------密码
  captcha: '', //----------------验证码
})

const form = ref<FormInstance>();
const rules = ref({
  loginName: [{ required: true, message: `${t('请输入用户名或邮箱')}`, trigger: 'blur' }],
  password: [{ required: true, message: `${t('请输入密码')}`, trigger: 'blur' }],
  captcha: [{ required: true, message: `${t('请输入验证码')}`, trigger: 'blur' }],
})

const random = ref(Math.random()) //--------验证码随机参数
const isShowCapture = ref(false) //---------是否展示验证码
const loading = ref(false) //---------------登录按钮loading
const quickLoginLoading = ref(false)
const appSettingsStore = useAppSettings()
const captchaUrl = computed(() => {
  const requestUrl = appSettingsStore.serverUrl || config.renderConfig.httpRequest.url;
  return `${requestUrl}/api/security/captcha?width=120&height=40&random=${random.value}`;
})
//登录
const handleLogin = async () => {
  form.value?.validate((valid: boolean) => {
    if (valid) {
      loading.value = true;
      request.post<CommonResponse<PermissionUserInfo>, CommonResponse<PermissionUserInfo>>('/api/security/login_password', userInfo.value).then((res) => {
        if (res.code === 2006 || res.code === 2003) {
          message.warning(res.msg);
          isShowCapture.value = true;
        } else {
          // 登录成功，更新用户信息到store
          runtimeStore.updateUserInfo(res.data);
          window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.userInfoChanged, { id: res.data.id, loginName: res.data.loginName, role: res.data.role, token: res.data.token, avatar: res.data.avatar })
          trackEvent('user_login', { method: 'account' });
          router.push('/home');
          // $store.dispatch('permission/getPermission')
        }
      }).catch((err) => {
        console.error(err);
      }).finally(() => {
        loading.value = false;
      });
    } else {
      nextTick(() => {
        const input = document.querySelector('.el-form-item.is-error input');
        if (input) {
          (input as HTMLElement).focus();
        }
      });
    }
  })
}
//刷新验证码
const freshCapchaUrl = () => {
  random.value = Math.random();
}
//快速登录
const handleQuickLogin = () => {
  if (quickLoginLoading.value) return
  quickLoginLoading.value = true
  type QuickLoginUserInfo = PermissionUserInfo & { password: string }
  request.post<CommonResponse<QuickLoginUserInfo>, CommonResponse<QuickLoginUserInfo>>('/api/security/login_guest', {}).then((res) => {
    const { password, ...safeUserInfo } = res.data
    runtimeStore.updateUserInfo(safeUserInfo)
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.userInfoChanged, { id: safeUserInfo.id, loginName: safeUserInfo.loginName, role: safeUserInfo.role, token: safeUserInfo.token, avatar: safeUserInfo.avatar })
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.quickLoginCredentialChanged, { loginName: safeUserInfo.loginName, password })
    trackEvent('user_login', { method: 'quick_login' });
    message.success(t('登录成功'))
    router.push('/home')
  }).catch(() => {
    message.error(t('登录失败'))
  }).finally(() => {
    quickLoginLoading.value = false
  })
}
// //用户注册
// const handleJumpToRegister = () => {
//   emits('jumpToRegister');
// }
// //重置密码
// const handleJumpToResetPassword = () => {
//   emits('jumpToResetPassword');
// }
// //体验用户登录
// const handleGuesttLogin = () => {
//   loading.value = true;
//   request.post('/api/security/login_guest', userInfo).then((res) => {
//     // 体验用户登录成功，更新用户信息到store
//     runtimeStore.updateUserInfo(res.data);
//     router.push('/home');
//   }).catch((err) => {
//     console.error(err);
//   }).finally(() => {
//     loading.value = false;
//   });
// }

</script>

<style lang='scss' scoped>
.login-account {
  .svg-icon {
    width: 35px;
    height: 35px;
    cursor: pointer;
  }

  .forget-pwd-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 10px;

    .el-button {
      margin: 0;
      padding: 0;
      min-height: 20px;
    }
  }
}
</style>
