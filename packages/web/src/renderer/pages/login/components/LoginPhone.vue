
<template>
  <el-form ref="form" :model="userInfo" :rules="rules" @submit.stop.prevent="handleLogin">
    <el-form-item prop="phone">
      <el-input v-model="userInfo.phone" :prefix-icon="IconUser" name="phone" type="text" :placeholder="`${$t('请输入手机号')}...`"></el-input>
    </el-form-item>
    <el-form-item prop="captcha">
      <div class="d-flex w-100 a-center">
        <el-input v-model="userInfo.captcha" :size="config.renderConfig.layout.size" class="h-30" name="captcha" type="text" :placeholder="$t('图形验证码')"></el-input>
        <div v-html="captchaData" class="w-100px h-50px" @click="getCaptcha"></div>
      </div>
    </el-form-item>
    <el-form-item prop="smsCode">
      <div class="d-flex w-100">
        <el-input v-model="userInfo.smsCode" :size="config.renderConfig.layout.size" name="smsCode" type="text" :placeholder="$t('验证码')"></el-input>
        <SmsButton ref="smsRef" :hook="smsCodeHook" @click="getSmsCode"></SmsButton>
      </div>
    </el-form-item>
    <el-form-item>
      <el-button :loading="loading" type="primary" native-type="submit" class="w-100">{{ $t("登录") }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { PermissionUserInfo, CommonResponse } from '@src/types';
import SmsButton from '@/components/common/smsButton/ClSmsButton.vue'
import { User as IconUser } from '@element-plus/icons-vue'
import { nextTick, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n'
import { FormInstance } from 'element-plus';
import { request } from '@/api/api';
import { router } from '@/router';
import { usePermissionStore } from '@/store/permission/permissionStore';
import { config } from '@src/config/config';


import { message } from '@/helper'
const { t } = useI18n()
const userInfo = reactive({
  phone: '', //------------------手机号码
  smsCode: '', //----------------短信验证码
  captcha: '', //-----------------图形验证码
})
const rules = reactive({
  phone: [{ required: true, message: `${t('请输入手机号')}`, trigger: 'blur' }],
  smsCode: [{ required: true, message: `${t('请输入验证码')}`, trigger: 'blur' }],
  captcha: [{ required: true, message: `${t('请输入验证码')}`, trigger: 'blur' }],
})
const loading = ref(false);
const form = ref<FormInstance>();
const smsRef = ref<{ resetState: () => void } | null>(null)
const captchaData = ref('');
const permissionStore = usePermissionStore()


//校验手机号码
const smsCodeHook = () => {
  if (userInfo.phone.length !== 11) {
    message.warning(t('请填写正确手机号'))
    return false
  }
  if (!userInfo.captcha) {
    message.warning(t('请输入图形验证码'))
    return
  }
  return true
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
  request.get<CommonResponse<any>, CommonResponse<any>>('/api/security/sms', { 
    params,
   }).then(res => {
    if (res.code === 4005) {
      getCaptcha();
      smsRef.value?.resetState();
      message.warning(res.msg);
    }
   }).catch((err) => {
    console.error(err);
    getCaptcha()
  });
}

//手机号登录
const handleLogin = () => {
  form.value?.validate((valid) => {
    if (valid) {
      loading.value = true;
      request.post<CommonResponse<PermissionUserInfo>, CommonResponse<PermissionUserInfo>>('/api/security/login_phone', userInfo).then((res) => {
        if (res.code === 2006 || res.code === 2003) {
          message.warning(res.msg);
        } else {
          router.push('/home');
          permissionStore.getPermission()
          
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
  });
}

onMounted(() => {
  getCaptcha();
})
</script>
