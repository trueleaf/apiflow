<template>
  <el-form ref="form" class="login-account" :model="userInfo" :rules="rules" @submit.stop.prevent="handleLogin">
    <el-form-item prop="loginName">
      <el-input v-model="userInfo.loginName" :prefix-icon="User" name="loginName" type="text"
        :placeholder="`${$t('请输入用户名')}...`"></el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input v-model="userInfo.password" :prefix-icon="Lock" name="password" type="password"
        :placeholder="`${$t('请输入密码')}...`" show-password></el-input>
    </el-form-item>
    <el-form-item v-if="isShowCapture" prop="captcha">
      <div class="captcha">
        <el-input v-model="userInfo.captcha" :size="config.renderConfig.layout.size" name="captcha" type="text"
          :placeholder="$t('验证码')"></el-input>
        <img :src="captchaUrl" @click="freshCapchaUrl" />
      </div>
    </el-form-item>
    <el-form-item v-if="config.localization.enableGuest" class="mb-1">
      <el-button :loading="loading" class="w-100" type="primary" @click="handleGuesttLogin">{{ $t("直接登录(体验账号，数据不会被保存)")
        }}</el-button>
    </el-form-item>
    <el-form-item class="mb-1">
      <el-button :loading="loading" :type="config.localization.enableGuest ? '' : 'primary'" native-type="submit"
        class="w-100">{{ $t("登录") }}</el-button>
    </el-form-item>
    <el-form-item v-if="config.localization.enableRegister" class="mb-1">
      <el-button class="w-100" @click="handleJumpToRegister">{{ $t("注册账号") }}</el-button>
    </el-form-item>
    <div class="forget-pwd-wrap">
      <el-button text link type="primary" @click="handleJumpToResetPassword">{{ $t("已有账号，忘记密码?") }}</el-button>
    </div>
    <div v-if="config.localization.enableDocLink" class="mt-2 d-flex j-around">
      <a href="https://github.com/trueleaf/apiflow" target="_blank" class="d-flex flex-column j-center a-center">
        <svg class="svg-icon" aria-hidden="true" :title="$t('跳转github')">
          <use xlink:href="#icongithub"></use>
        </svg>
        <div class="mt-1">GitHub</div>
      </a>
      <a href="https://gitee.com/shuzhikai/apiflow" target="_blank" class="d-flex flex-column j-center a-center">
        <svg class="svg-icon" aria-hidden="true" :title="$t('跳转码云')">
          <use xlink:href="#icongitee"></use>
        </svg>
        <div class="mt-1">码云</div>
      </a>
      <a href="https://www.yuque.com/happymoyu/as0gig" target="_blank" class="d-flex flex-column j-center a-center">
        <svg class="svg-icon" aria-hidden="true" :title="$t('跳转文档')">
          <use xlink:href="#iconyuque"></use>
        </svg>
        <div class="mt-1">{{ $t("完整文档") }}</div>
      </a>
      <a :href="config.localization.download.url" target="__blank"
        class="d-flex flex-column j-center a-center cursor-pointer hover-theme-color">
        <svg class="svg-icon" aria-hidden="true" :title="$t('客户端下载')">
          <use xlink:href="#iconkehuduan"></use>
        </svg>
        <div class="mt-1">{{ $t("客户端下载") }}</div>
      </a>
    </div>
  </el-form>
</template>

<script lang="ts" setup>
import { config } from '@src/config/config';
import { PermissionUserInfo, Response } from '@src/types'
import { User, Lock } from '@element-plus/icons-vue'
import { computed, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, FormInstance } from 'element-plus';
import { request } from '@/api/api';
import { router } from '@/router';

const emits = defineEmits(['jumpToRegister', 'jumpToResetPassword'])
const { t } = useI18n()
const userInfo = ref({
  loginName: process.env.NODE_ENV === 'development' ? 'apiflow' : '', //-----------登录名称
  password: process.env.NODE_ENV === 'development' ? '111111aaa' : '', //---------密码
  captcha: '', //----------------验证码
})

const form = ref<FormInstance>();
const rules = ref({
  loginName: [{ required: true, message: `${t('请输入用户名')}`, trigger: 'blur' }],
  password: [{ required: true, message: `${t('请输入密码')}`, trigger: 'blur' }],
  captcha: [{ required: true, message: `${t('请输入验证码')}`, trigger: 'blur' }],
})

const random = ref(Math.random()) //--------验证码随机参数
const isShowCapture = ref(false) //---------是否展示验证码
const loading = ref(false) //---------------登录按钮loading
const captchaUrl = computed(() => {
  const requestUrl = config.renderConfig.httpRequest.url;
  return `${requestUrl}/api/security/captcha?width=120&height=40&random=${random.value}`;
})
//登录
const handleLogin = async () => {
  form.value?.validate((valid: boolean) => {
    if (valid) {
      loading.value = true;
      request.post<Response<PermissionUserInfo>, Response<PermissionUserInfo>>('/api/security/login_password', userInfo.value).then((res) => {
        if (res.code === 2006 || res.code === 2003) {
          ElMessage.warning(res.msg);
          isShowCapture.value = true;
        } else {
          router.push('/v1/apidoc/doc-list');
          localStorage.setItem('userInfo', JSON.stringify(res.data));
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
//用户注册
const handleJumpToRegister = () => {
  emits('jumpToRegister');
}
//重置密码
const handleJumpToResetPassword = () => {
  emits('jumpToResetPassword');
}
//体验账号登录
const handleGuesttLogin = () => {
  loading.value = true;
  request.post('/api/security/login_guest', userInfo).then((res) => {
    router.push('/v1/apidoc/doc-list');
    localStorage.setItem('userInfo', JSON.stringify(res.data));
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
}

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
