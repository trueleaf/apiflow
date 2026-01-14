<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <h2 class="title">{{ t('重置密码') }}</h2>
      <el-form ref="formRef" :model="formData" :rules="rules" @submit.stop.prevent="handleSubmit">
        <el-form-item prop="email">
          <el-input v-model="formData.email" type="email" :placeholder="t('请输入邮箱地址')">
            <template #prefix>
              <Mail />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="code">
          <div class="verify-code-wrap">
            <el-input v-model="formData.code" :placeholder="t('请输入验证码')" maxlength="6">
              <template #prefix>
                <Shield />
              </template>
            </el-input>
            <el-button :disabled="countdown > 0" :loading="sendingCode" @click="handleSendCode">
              {{ countdown > 0 ? `${countdown}${t('秒后重试')}` : t('获取验证码') }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item prop="newPassword">
          <el-input v-model="formData.newPassword" type="password" :placeholder="t('请输入新密码（至少8位，包含字母和数字）')" show-password>
            <template #prefix>
              <Lock />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item class="mb-1">
          <el-button :loading="loading" type="primary" native-type="submit" class="w-100">
            {{ t('重置密码') }}
          </el-button>
        </el-form-item>
        <el-form-item class="text-center mb-0">
          <el-button type="text" @click="handleBackToLogin">{{ t('返回登录') }}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { FormInstance, FormRules } from 'element-plus';
import { Mail, Lock, Shield } from 'lucide-vue-next';
import { request } from '@/api/api';
import { message } from '@/helper';
import { router } from '@/router';
import { CommonResponse } from '@src/types';

const { t } = useI18n();
const formRef = ref<FormInstance>();
const loading = ref(false);
const sendingCode = ref(false);
const countdown = ref(0);
const formData = reactive({
  email: '',
  code: '',
  newPassword: '',
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
  if (!value) {
    callback(new Error(t('请输入新密码')));
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
  newPassword: [{ validator: passwordValidator, trigger: 'blur' }],
};
//发送验证码
const handleSendCode = async () => {
  try {
    await formRef.value?.validateField('email');
    sendingCode.value = true;
    await request.post('/api/security/send_email_code', {
      email: formData.email,
      type: 'reset',
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
    await request.post<CommonResponse, CommonResponse>('/api/security/reset_password_by_email', formData);
    message.success(t('密码重置成功，请重新登录'));
    router.push('/login');
  } catch (error) {
    //表单验证失败或提交失败
  } finally {
    loading.value = false;
  }
};
//返回登录
const handleBackToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.forgot-password-card {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}
.title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  color: #333;
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
.text-center {
  text-align: center;
}
</style>
