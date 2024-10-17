
<template>
  <el-form ref="form" :model="userInfo" :rules="rules" @submit.stop.prevent="handleLogin">
    <el-form-item prop="phone">
      <el-input v-model="userInfo.phone" :prefix-icon="IconUser" name="phone" type="text" :placeholder="`${t('请输入手机号')}...`"></el-input>
    </el-form-item>
    <el-form-item prop="smsCode">
      <div class="d-flex w-100">
        <el-input v-model="userInfo.smsCode" :size="config.renderConfig.layout.size" name="smsCode" type="text" :placeholder="t('验证码')"></el-input>
        <SmsButton :hook="smsCodeHook" @click="getSmsCode"></SmsButton>
      </div>
    </el-form-item>
    <el-form-item>
      <el-button :loading="loading" type="primary" native-type="submit" class="w-100">{{ t("登录") }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { PermissionUserInfo, Response } from '@src/types/global';
import SmsButton from '@/components/common/sms-button/g-sms-button.vue'
import { User as IconUser } from '@element-plus/icons-vue'
import { nextTick, reactive, ref } from 'vue';
import {t} from 'i18next'
import { ElMessage, FormInstance } from 'element-plus';
import { request } from '@/api/api';
import { router } from '@/router';
import { usePermissionStore } from '@/store/permission';
import { config } from '@src/config/config';

const userInfo = reactive({
  phone: '', //------------------手机号码
  smsCode: '', //----------------短信验证码
})
const rules = reactive({
  phone: [{ required: true, message: `${t('请输入手机号')}`, trigger: 'blur' }],
  smsCode: [{ required: true, message: `${t('请输入验证码')}`, trigger: 'blur' }]
})
const loading = ref(false);
const form = ref<FormInstance>();
const permissionStore = usePermissionStore()


//校验手机号码
const smsCodeHook = () => {
  if (userInfo.phone.length !== 11) {
    ElMessage.warning(t('请填写正确手机号'))
    return false
  }
  return true
}

//获取短信验证码
const getSmsCode = () => {
  const params = {
    phone: userInfo.phone,
  };
  request.get('/api/security/sms', { params }).catch((err) => {
    console.error(err)
  });
}

//手机号登录
const handleLogin = () => {
  form.value?.validate((valid) => {
    if (valid) {
      loading.value = true;
      request.post<Response<PermissionUserInfo>, Response<PermissionUserInfo>>('/api/security/login_phone', userInfo).then((res) => {
        if (res.code === 2006 || res.code === 2003) {
          ElMessage.warning(res.msg);
        } else {
          router.push('/v1/apidoc/doc-list');
          localStorage.setItem('userInfo', JSON.stringify(res.data));
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
</script>
