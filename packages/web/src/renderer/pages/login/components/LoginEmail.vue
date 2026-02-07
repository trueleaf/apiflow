<template>
  <el-form ref="formRef" class="login-email" :model="formData" :rules="rules" @submit.stop.prevent="handleSubmit">
    <el-form-item prop="email">
      <el-input v-model="formData.email" type="email" :placeholder="t('请输入邮箱地址')">
        <template #prefix>
          <Mail class="input-icon" />
        </template>
      </el-input>
    </el-form-item>
    <el-form-item v-if="mode === 'register'" prop="password">
      <el-input v-model="formData.password" type="password" :placeholder="t('请设置密码（至少8位，包含字母和数字）')" show-password>
        <template #prefix>
          <Lock class="input-icon" />
        </template>
      </el-input>
    </el-form-item>
    <el-form-item v-if="mode === 'register'" prop="confirmPassword">
      <el-input v-model="formData.confirmPassword" type="password" :placeholder="t('请再次输入密码')" show-password>
        <template #prefix>
          <Lock class="input-icon" />
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="code">
      <div class="verify-code-wrap">
        <el-input v-model="formData.code" :placeholder="t('请输入验证码')" maxlength="6">
          <template #prefix>
            <Shield class="input-icon" />
          </template>
        </el-input>
        <el-button :disabled="countdown > 0" :loading="sendingCode" @click="handleSendCode">
          {{ countdown > 0 ? `${countdown}${t('秒后重试')}` : t('获取验证码') }}
        </el-button>
      </div>
    </el-form-item>
    <el-form-item v-if="mode === 'login' && systemConfigStore.enableGuest" class="mb-1">
      <el-button :loading="quickLoginLoading" type="primary" class="w-100" data-testid="login-quick-login-btn" @click="handleQuickLogin">{{ t('一键创建账号并登录') }}</el-button>
    </el-form-item>
    <el-form-item class="mb-1">
      <el-button :loading="loading" :type="mode === 'register' ? 'primary' : undefined" native-type="submit" class="w-100">
        {{ mode === 'register' ? t('注册') : t('登录') }}
      </el-button>
    </el-form-item>
    <div v-if="mode === 'register' && codeSent" class="code-sent-tip">
      <span>{{ t('验证码已发送，请注意查收邮件') }}</span>
    </div>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { FormInstance, FormRules } from 'element-plus';
import { Mail, Lock, Shield } from 'lucide-vue-next';
import { request } from '@/api/api';
import { message } from '@/helper';
import { router } from '@/router';
import { useRuntime } from '@/store/runtime/runtimeStore';
import { trackEvent } from '@/utils/analytics';
import { PermissionUserInfo, CommonResponse } from '@src/types';
import { setQuickLoginCredential } from '@/cache/runtime/quickLoginSession';
import { useSystemConfig } from '@/store/systemConfig/systemConfigStore';
import { IPC_EVENTS } from '@src/types/ipc';

const props = defineProps<{
  mode: 'login' | 'register'
}>();

const { t } = useI18n();
const runtimeStore = useRuntime();
const systemConfigStore = useSystemConfig();
const formRef = ref<FormInstance>();
const loading = ref(false);
const quickLoginLoading = ref(false);
const sendingCode = ref(false);
const countdown = ref(0);
const codeSent = ref(false);
const formData = reactive({
  email: import.meta.env.DEV && props.mode === 'register' ? '3073155898@qq.com' : '',
  code: '',
  password: import.meta.env.DEV && props.mode === 'register' ? '111111aaa' : '',
  confirmPassword: import.meta.env.DEV && props.mode === 'register' ? '111111aaa' : '',
});
const emailValidator = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!value) {
    callback(new Error(t('请输入邮箱地址')));
  } else if (!emailRegex.test(value)) {
    callback(new Error(t('请输入有效的邮箱地址')));
  } else {
    callback();
  }
};
const passwordValidator = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (props.mode !== 'register') {
    callback();
    return;
  }
  if (!value) {
    callback(new Error(t('请输入密码')));
  } else if (value.length < 8) {
    callback(new Error(t('密码至少8位')));
  } else if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
    callback(new Error(t('密码必须包含字母和数字')));
  } else {
    callback();
  }
};
const confirmPasswordValidator = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (props.mode !== 'register') {
    callback();
    return;
  }
  if (!value) {
    callback(new Error(t('请再次输入密码')));
  } else if (value !== formData.password) {
    callback(new Error(t('两次输入密码不一致!')));
  } else {
    callback();
  }
};
const rules: FormRules = {
  email: [{ validator: emailValidator, trigger: 'blur' }],
  code: [{ required: true, message: t('请输入验证码'), trigger: 'blur' }],
  password: [{ validator: passwordValidator, trigger: 'blur' }],
  confirmPassword: [{ validator: confirmPasswordValidator, trigger: 'blur' }],
};
//发送验证码
const handleSendCode = async () => {
  try {
    await formRef.value?.validateField('email');
    sendingCode.value = true;
    const type = props.mode === 'register' ? 'register' : 'login';
    await request.post('/api/security/send_email_code', {
      email: formData.email,
      type,
    });
    codeSent.value = true;
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (error) {
    //验证失败或发送失败
  } finally {
    sendingCode.value = false;
  }
};
//提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    loading.value = true;
    if (props.mode === 'register') {
      const payload = {
        email: formData.email,
        code: formData.code,
        password: formData.password,
      };
      const res = await request.post<CommonResponse<PermissionUserInfo>, CommonResponse<PermissionUserInfo>>('/api/security/register_email', payload);
      runtimeStore.updateUserInfo(res.data);
      window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.userInfoChanged, {
        id: res.data.id,
        loginName: res.data.loginName,
        role: res.data.role,
        token: res.data.token,
        avatar: res.data.avatar,
      });
      trackEvent('user_register', { method: 'email' });
      message.success(t('注册成功'));
      router.push('/home');
    } else {
      const payload = {
        email: formData.email,
        code: formData.code,
      };
      const res = await request.post<CommonResponse<PermissionUserInfo>, CommonResponse<PermissionUserInfo>>('/api/security/login_email', payload);
      runtimeStore.updateUserInfo(res.data);
      window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.userInfoChanged, {
        id: res.data.id,
        loginName: res.data.loginName,
        role: res.data.role,
        token: res.data.token,
        avatar: res.data.avatar,
      });
      trackEvent('user_login', { method: 'email' });
      router.push('/home');
    }
  } catch (error) {
    //表单验证失败或提交失败
  } finally {
    loading.value = false;
  }
};
//快速登录
const handleQuickLogin = async () => {
  if (quickLoginLoading.value) return
  quickLoginLoading.value = true
  type QuickLoginUserInfo = PermissionUserInfo & { password: string }
  try {
    const res = await request.post<CommonResponse<QuickLoginUserInfo>, CommonResponse<QuickLoginUserInfo>>('/api/security/login_guest', {})
    const { password, ...safeUserInfo } = res.data
    runtimeStore.updateUserInfo(safeUserInfo)
    setQuickLoginCredential({ loginName: safeUserInfo.loginName, password })
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.userInfoChanged, {
      id: safeUserInfo.id,
      loginName: safeUserInfo.loginName,
      role: safeUserInfo.role,
      token: safeUserInfo.token,
      avatar: safeUserInfo.avatar,
    })
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.quickLoginCredentialChanged, { loginName: safeUserInfo.loginName, password })
    trackEvent('user_login', { method: 'quick_login' });
    router.push('/home')
  } catch (error) {
    message.error(t('登录失败'))
  } finally {
    quickLoginLoading.value = false
  }
};
</script>

<style scoped>
.login-email {
  width: 100%;
}
.verify-code-wrap {
  display: flex;
  gap: 10px;
  width: 100%;
}
.verify-code-wrap .el-input {
  flex: 1;
}
.verify-code-wrap .el-button {
  flex-shrink: 0;
  white-space: nowrap;
}
.input-icon {
  width: 16px;
  height: 16px;
}
.code-sent-tip {
  margin-top: -8px;
  margin-bottom: 16px;
  padding: 8px 12px;
  background-color: var(--el-color-primary-light-9);
  border-radius: 4px;
  color: var(--el-color-primary);
  font-size: 12px;
  text-align: center;
}
</style>
