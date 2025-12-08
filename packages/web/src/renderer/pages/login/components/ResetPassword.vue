<template>
  <el-form ref="form" :model="userInfo" :rules="rules" @submit.stop.prevent="handleResetPassword">
    <el-form-item prop="phone">
      <el-input v-model="userInfo.phone" :size="config.renderConfig.layout.size" name="phone" type="text" :placeholder="`${t('请输入手机号')}...`"></el-input>
    </el-form-item>
    <el-form-item prop="captcha">
      <div class="d-flex w-100 a-center">
        <el-input v-model="userInfo.captcha" :size="config.renderConfig.layout.size" class="h-30" name="captcha" type="text" :placeholder="t('图形验证码')"></el-input>
        <div v-html="captchaData" class="w-100px h-50px" @click="getCaptcha"></div>
      </div>
    </el-form-item>
    <el-form-item prop="smsCode">
      <div class="d-flex w-100">
        <el-input v-model="userInfo.smsCode" :size="config.renderConfig.layout.size" name="smsCode" type="text" :placeholder="t('验证码')"></el-input>
        <SmsButton ref="smsRef" :hook="smsCodeHook" @click="getSmsCode"></SmsButton>
      </div>
    </el-form-item>
    <el-form-item prop="password">
      <el-input v-model="userInfo.password" :size="config.renderConfig.layout.size" show-password name="password" type="text" :placeholder="t('请输入重置后密码')"></el-input>
    </el-form-item>
    <el-form-item prop="password2">
      <el-input v-model="userInfo.password2" :size="config.renderConfig.layout.size" show-password name="password2" type="text" :placeholder="`${t('请再次输入密码')}...`"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button :loading="loading" type="primary" native-type="submit" class="w-100">{{ t('重置密码') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { CommonResponse } from '@src/types'
import { config } from '@src/config/config';
import { nextTick, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n'
import { FormInstance } from 'element-plus';
import { request } from '@/api/api';
import SmsButton from '@/components/common/smsButton/ClSmsButton.vue'



import { message } from '@/helper'
const emits = defineEmits(['jumpToLogin']);
const { t } = useI18n()
const form = ref<FormInstance>();
const userInfo = reactive({
  smsCode: '', //-----验证码
  password: '', //----密码
  password2: '', //---确认密码
  phone: '', //-------手机号码
  captcha: '', //-----图形验证码
});
const captchaData = ref('');
const smsRef = ref<{ resetState: () => void } | null>(null)
const validatePassword = (_: unknown, value: string, callback: (err?: Error) => void) => {
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
    if (userInfo.password2 !== '') {
      form.value?.validateField('password2');
    }
    callback();
  }
}
const validatePassword2 = (_: unknown, value: string, callback: (err?: Error) => void) => {
  const matchString = /[a-zA-Z]/;
  const matchNumber = /\d/;
  const inValidKey = /[^\w\d!@#]/;
  if (value === '') {
    callback(new Error(t('请再次输入密码')));
  } else if (value.match(inValidKey)) {
    callback(new Error(t('只允许 数字  字符串 ! @ # 不允许其他字符串')));
  } else if (!value.match(matchString) || !value.match(matchNumber) || value.length < 8) {
    callback(new Error(t('数字+字符串，并且大于8位')));
  } else if (value !== userInfo.password) {
    callback(new Error(t('两次输入密码不一致!')));
  } else {
    callback();
  }
}
const rules = reactive({
  loginName: [{ required: true, message: '请输入登录名称', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' },
  ],
  password2: [{ required: true, message: '请再次输入密码', trigger: 'blur' }, { validator: validatePassword2, trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  captcha: [{ required: true, message: t('请输入图形验证码'), trigger: 'blur' }],
  smsCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
});
const loading = ref(false);


//校验手机号码
const smsCodeHook = () => {
  if (userInfo.phone.length !== 11) {
    message.warning(t('请填写正确手机号'));
    return false;
  }
  if (!userInfo.captcha) {
    message.warning(t('请输入图形验证码'))
    return
  }
  return true;
}
//获取图形验证码
const getCaptcha = () => {
  userInfo.captcha = '';
  request.get('/api/security/captcha?width=100&height=50').then((res) => {
    captchaData.value = res.data;
  }).catch((err) => {
    console.error(err)
  });
}
//获取短信验证码
const getSmsCode = () => {
  const clientKey = sessionStorage.getItem('apiflow/x-client-key')
  const params = {
    phone: userInfo.phone,
    captcha: userInfo.captcha,
    clientKey
  };
  request.get<CommonResponse<any>, CommonResponse<any>>('/api/security/sms', { params }).then(res => {
    if (res.code === 4005) {
      getCaptcha();
      smsRef.value?.resetState();
      message.warning(res.msg);
    }
  }).catch((err) => {
    console.error(err);
  });
}
//重置密码
const handleResetPassword = () => {
  form.value?.validate((valid) => {
    if (valid) {
      loading.value = true;
      const params = {
        phone: userInfo.phone,
        password: userInfo.password,
        smsCode: userInfo.smsCode,
      };
      request.post<CommonResponse<{ loginName: string }>, CommonResponse<{ loginName: string }>>('/api/security/user_reset_password', params).then((res) => {
        if (res.code === 2006 || res.code === 2003) {
          message.warning(res.msg);
        } else {
          message.success(`${res.data.loginName} ${t('重置密码成功')}`);
          emits('jumpToLogin', res.data.loginName);
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
      message.warning(t('请完善必填信息'));
      loading.value = false;
    }
  });
}
onMounted(() => {
  getCaptcha();
})
</script>

<style lang='scss' scoped>

</style>
