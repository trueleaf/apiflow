
<template>
  <el-form ref="form" :model="registerInfo" :rules="rules" @submit.stop.prevent="handleRegister">
    <el-form-item prop="loginName">
      <el-input v-model="registerInfo.loginName" :size="config.renderConfig.layout.size" name="loginName" type="text" :placeholder="`${t('请输入登录名称')}...`"></el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input v-model="registerInfo.password" :size="config.renderConfig.layout.size" show-password name="password" type="text" :placeholder="`${t('请输入密码')}...`"></el-input>
    </el-form-item>
    <el-form-item prop="password2">
      <el-input v-model="registerInfo.password2" :size="config.renderConfig.layout.size" show-password name="password2" type="text" :placeholder="`${t('请再次输入密码')}...`"></el-input>
    </el-form-item>
    <el-form-item prop="phone">
      <el-input v-model="registerInfo.phone" :size="config.renderConfig.layout.size" name="phone" type="text" :placeholder="`${t('请输入手机号')}...`"></el-input>
    </el-form-item>
    <el-form-item prop="smsCode">
      <div class="d-flex w-100">
        <el-input v-model="registerInfo.smsCode" :size="config.renderConfig.layout.size" name="smsCode" type="text" :placeholder="t('请输入验证码')"></el-input>
        <SmsButton :hook="smsCodeHook" @click="getSmsCode"></SmsButton>
      </div>
    </el-form-item>
    <el-form-item>
      <el-button :loading="loading" type="primary" native-type="submit" class="w-100">{{ t("注册并登录") }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import type { InternalRuleItem } from 'async-validator/dist-types/interface'
import { nextTick, reactive, ref } from 'vue';
import { t } from 'i18next'
import { ElMessage, FormInstance } from 'element-plus';
import { request } from '@/api/api';
import { router } from '@/router';
import { config } from '@src/config/config';
import SmsButton from '@/components/common/sms-button/g-sms-button.vue'

const registerInfo = reactive({
  loginName: '', //---登录名称
  smsCode: '', //-----验证码
  password: '', //----密码
  password2: '', //---确认密码
  phone: '', //-------手机号码
})
const loading = ref(false)
const validatePassword = (_: InternalRuleItem, value: string, callback: (err?: Error | string) => void) => {
  const matchString = /[a-zA-Z]/;
  const matchNumber = /\d/;
  const inValidKey = /[^\w\d!@#]/;
  if (value.trim() === '') {
    callback(new Error(t('请输入密码')));
  } else if (value.match(inValidKey)) {
    callback(new Error(t('只允许 数字  字符串 ! @ # 不允许其他字符串')));
  } else if (!value.match(matchString) || !value.match(matchNumber) || value.length < 8) {
    callback(new Error(t('数字+字符串，并且大于8位')));
  } else {
    if (registerInfo.password2 !== '') {
      form.value?.validateField('password2');
    }
    callback();
  }
}

const validatePassword2 = (_: InternalRuleItem, value: string, callback: (err?: Error | string) => void) => {
  const matchString = /[a-zA-Z]/;
  const matchNumber = /\d/;
  const inValidKey = /[^\w\d!@#]/;
  if (value === '') {
    callback(new Error(t('请再次输入密码')));
  } else if (value.match(inValidKey)) {
    callback(new Error(t('只允许 数字  字符串 ! @ # 不允许其他字符串')));
  } else if (!value.match(matchString) || !value.match(matchNumber) || value.length < 8) {
    callback(new Error(t('数字+字符串，并且大于8位')));
  } else if (value !== registerInfo.password) {
    callback(new Error(t('两次输入密码不一致!')));
  } else {
    callback();
  }
}
const rules = reactive({
  loginName: [{ required: true, message: t('请输入登录名称'), trigger: 'blur' }],
  password: [
    { required: true, message: t('请输入密码'), trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' },
  ],
  password2: [
    { required: true, message: t('请再次输入密码'), trigger: 'blur' },
    { validator: validatePassword2, trigger: 'blur' },
  ],
  phone: [{ required: true, message: t('请输入手机号'), trigger: 'blur' }],
  smsCode: [{ required: true, message: t('请输入验证码'), trigger: 'blur' }],
})
const form = ref<FormInstance>()

//校验手机号码
const smsCodeHook = () => {
  if (registerInfo.phone.length !== 11) {
    ElMessage.warning(t('请填写正确手机号'));
    return false;
  }
  return true;
}
//获取短信验证码
const getSmsCode = () => {
  const params = {
    phone: registerInfo.phone,
  };
  request.get('/api/security/sms', { params }).catch((err) => {
    console.error(err);
  });
}
//用户注册
const handleRegister = () => {
  form.value?.validate((valid) => {
    if (valid) {
      const userInfo = {
        loginName: registerInfo.loginName,
        password: registerInfo.password,
      };
      request.post('/api/security/register', registerInfo).then(() => {
        request.post('/api/security/login_password', userInfo).then((res) => {
          router.push('/v1/apidoc/doc-list');
          sessionStorage.setItem('userInfo', JSON.stringify(res.data));
        }).catch((err) => {
          console.error(err);
        }).finally(() => {
          loading.value = false;
        });
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
      ElMessage.warning(t('请完善必填信息'));
      loading.value = false;
    }
  });
}
</script>

<style lang="scss" scoped>

</style>
