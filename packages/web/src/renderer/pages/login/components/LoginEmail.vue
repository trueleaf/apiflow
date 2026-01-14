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
    <el-form-item v-if="mode === 'register'" prop="loginName">
      <el-input v-model="formData.loginName" type="text" :placeholder="t('请输入登录名（选填，默认使用邮箱前缀）')">
        <template #prefix>
          <User class="input-icon" />
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
    <el-form-item class="mb-1">
      <el-button :loading="loading" type="primary" native-type="submit" class="w-100">
        {{ mode === 'register' ? t('注册') : t('登录') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { FormInstance, FormRules } from 'element-plus';
import { Mail, Lock, User, Shield } from 'lucide-vue-next';
import { request } from '@/api/api';
import { message } from '@/helper';
import { router } from '@/router';
import { useRuntime } from '@/store/runtime/runtimeStore';
import { PermissionUserInfo, CommonResponse } from '@src/types';
import { IPC_EVENTS } from '@src/types/ipc';

const props = defineProps<{
  mode: 'login' | 'register'
}>();

const { t } = useI18n();
const runtimeStore = useRuntime();
const formRef = ref<FormInstance>();
const loading = ref(false);
const sendingCode = ref(false);
const countdown = ref(0);
const formData = reactive({
  email: '',
  code: '',
  password: '',
  loginName: '',
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
const rules: FormRules = {
  email: [{ validator: emailValidator, trigger: 'blur' }],
  code: [{ required: true, message: t('请输入验证码'), trigger: 'blur' }],
  password: [{ validator: passwordValidator, trigger: 'blur' }],
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
    message.success(t('验证码已发送，请查收邮件'));
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
        loginName: formData.loginName || undefined,
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
      message.success(t('登录成功'));
      router.push('/home');
    }
  } catch (error) {
    //表单验证失败或提交失败
  } finally {
    loading.value = false;
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
</style>
