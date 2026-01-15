<template>
  <el-form ref="formRef" :model="formData" :rules="rules" @submit.stop.prevent="handleSubmit">
    <el-form-item prop="email">
      <el-input v-model="formData.email" type="email" :placeholder="t('请输入邮箱地址')">
        <template #prefix>
          <Mail :size="16" />
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="code">
      <div class="verify-code-wrap">
        <el-input v-model="formData.code" :placeholder="t('请输入验证码')" maxlength="6">
          <template #prefix>
            <Shield :size="16" />
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
          <Lock :size="16" />
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="confirmPassword">
      <el-input v-model="formData.confirmPassword" type="password" :placeholder="t('请再次输入新密码')" show-password>
        <template #prefix>
          <Lock :size="16" />
        </template>
      </el-input>
    </el-form-item>
    <el-form-item class="mb-1">
      <el-button :loading="loading" type="primary" native-type="submit" class="w-100">
        {{ t('重置密码') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { FormInstance, FormRules } from 'element-plus';
import { Mail, Lock, Shield } from 'lucide-vue-next';
import { request } from '@/api/api';
import { message } from '@/helper';
import { CommonResponse } from '@src/types';

const emit = defineEmits<{
  success: []
}>();

const { t } = useI18n();
const formRef = ref<FormInstance>();
const loading = ref(false);
const sendingCode = ref(false);
const countdown = ref(0);
const formData = reactive({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: '',
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
const confirmPasswordValidator = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback(new Error(t('请再次输入新密码')));
  } else if (value !== formData.newPassword) {
    callback(new Error(t('两次输入的密码不一致')));
  } else {
    callback();
  }
};
const rules: FormRules = {
  email: [{ validator: emailValidator, trigger: 'blur' }],
  code: [{ required: true, message: t('请输入验证码'), trigger: 'blur' }],
  newPassword: [{ validator: passwordValidator, trigger: 'blur' }],
  confirmPassword: [{ validator: confirmPasswordValidator, trigger: 'blur' }],
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
    await request.post<CommonResponse, CommonResponse>('/api/security/reset_password_by_email', {
      email: formData.email,
      code: formData.code,
      newPassword: formData.newPassword,
    });
    message.success(t('密码重置成功，请重新登录'));
    emit('success');
  } catch (error) {
    //表单验证失败或提交失败
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
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
</style>
