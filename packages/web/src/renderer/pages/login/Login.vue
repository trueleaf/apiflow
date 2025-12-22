<template>
  <div class="login-container d-flex a-center j-center">
    <div class="login-box d-flex">
      <div ref="left" tabindex="-1" class="left hidden-md-and-down">
        <!-- <h2 class="text-center mt-5">{{ t('客户端下载') }}</h2>
        <el-carousel trigger="click" height="340px" :autoplay="false">
          <el-carousel-item v-for="item in 4" :key="item">
            <div class="d-flex a-center j-center h-300px">{{ t('项目特色功能视频演示') }}</div>
            <img :src="require('@/assets/imgs/login/a.gif')" width="460" height="340">
          </el-carousel-item>
        </el-carousel>
        <div class="w-100 d-flex j-center">
          <div class="download-wrap">
            <a href="https://gitee.com/shuzhikai/moyu/releases" target="__blank"
              class="d-flex flex-column j-center a-center cursor-pointer download-link">
              <i class="iconfont iconwindows theme-color"></i>
              <div class="mt-1">Windows{{ t('下载') }}</div>
            </a>
            <a href="https://gitee.com/shuzhikai/moyu/releases" target="__blank"
              class="d-flex flex-column j-center a-center cursor-pointer download-link">
              <svg class="svg-icon" aria-hidden="true">
                <use xlink:href="#iconlinux1"></use>
              </svg>
              <div class="mt-1">Linux{{ t('下载') }}</div>
            </a>
            <a href="https://gitee.com/shuzhikai/moyu/releases" target="__blank"
              class="d-flex flex-column j-center a-center cursor-pointer download-link">
              <i class="iconfont iconmac gray-600"></i>
              <div class="mt-1">Mac{{ t('下载') }}</div>
            </a>
          </div>
        </div> -->
      </div>
      <div class="right">
        <h2 class="text-center">
          <span>{{ config.appConfig.appTitle }}</span>
          <span v-if="config.appConfig.version">({{ config.appConfig.version }})</span>
        </h2>
        <div class="server-config d-flex a-center mb-2">
          <Globe :size="18" class="label-icon" />
          <el-input v-model="localServerUrl" :placeholder="t('请输入接口调用地址')" clearable class="form-input" />
          <div class="server-actions d-flex a-center">
            <el-button @click="handleReset">{{ t('重置') }}</el-button>
            <el-button type="primary" @click="handleSave" :disabled="!hasChanges">{{ t('保存') }}</el-button>
          </div>
        </div>
        <el-tabs v-model="activeName" class="w-100" data-testid="login-tabs">
          <!-- 账号登录 -->
          <el-tab-pane :label="$t('账号登录')" name="loginAccount" data-testid="login-tab-account">
          </el-tab-pane>
          <!-- 手机号登录 -->
          <!-- <el-tab-pane :label="$t('手机登录')" name="loginPhone">
          </el-tab-pane> -->
          <!-- 忘记密码 -->
          <!-- <el-tab-pane :label="$t('忘记密码')" name="reset">
          </el-tab-pane> -->
        </el-tabs>
        <keep-alive>
          <component :is="getComponent()" v-on="eventListeners"></component>
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { config as globalConfig } from '@src/config/config'
import LoginAccount from './components/LoginAccount.vue';
import LoginPhone from './components/LoginPhone.vue';
import Register from './components/Register.vue';
import ResetPassword from './components/ResetPassword.vue';
import { useI18n } from 'vue-i18n'
import { useAppSettings } from '@/store/appSettings/appSettingsStore'
import { Globe } from 'lucide-vue-next'
import { ElMessageBox } from 'element-plus'
import { message } from '@/helper'
import { updateAxiosBaseURL } from '@/api/api'
const config = ref(globalConfig);
const { t } = useI18n()
const appSettingsStore = useAppSettings()
const localServerUrl = ref(appSettingsStore.serverUrl)
watch(() => appSettingsStore.serverUrl, (newVal) => {
  localServerUrl.value = newVal
})
const activeName = ref('loginAccount');
const hasChanges = computed(() => localServerUrl.value.trim() !== appSettingsStore.serverUrl)
const validateUrl = (url: string): boolean => {
  if (!url.trim()) {
    return false
  }
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}
const handleSave = () => {
  const trimmedUrl = localServerUrl.value.trim()
  if (!validateUrl(trimmedUrl)) {
    message.warning(t('请输入有效的接口调用地址'))
    return
  }
  appSettingsStore.setServerUrl(trimmedUrl)
  updateAxiosBaseURL(trimmedUrl)
  message.success(t('保存成功'))
}
const handleReset = async () => {
  try {
    await ElMessageBox.confirm(
      t('确认将所有配置恢复为默认值吗？'),
      {
        type: 'warning',
        confirmButtonText: t('确定'),
        cancelButtonText: t('取消'),
      }
    )
  } catch {
    return
  }
  appSettingsStore.resetServerUrl()
  updateAxiosBaseURL(appSettingsStore.serverUrl)
  localServerUrl.value = appSettingsStore.serverUrl
  message.success(t('重置成功'))
}

//跳转注册页面
const handleJumpToRegister = () => {
  activeName.value = 'register'
}
//跳转到重置密码
const handleJumpToResetPassword = () => {
  activeName.value = 'reset';
}
//跳转到登录页面
const handleJumpToLogin = () => {
  activeName.value = 'login'
}
const getComponent = () => {
  if (activeName.value === 'loginAccount') {
    return LoginAccount;
  } else if (activeName.value === 'loginPhone') {
    return LoginPhone;
  } else if (activeName.value === 'register') {
    return Register;
  } else if (activeName.value === 'reset') {
    return ResetPassword;
  }
}
const eventListeners = computed(() => {
  if (activeName.value === 'loginAccount') {
    return {
      'jumpToRegister': handleJumpToRegister,
      'jumpToResetPassword': handleJumpToResetPassword
    };
  } else if (activeName.value === 'reset') {
    return {
      'jumpToLogin': handleJumpToLogin
    };
  }
});
</script>

<style lang='scss' scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  background: var(--gray-200);

  .login-box {
    height: 550px;
    width: 960px;
    background: var(--white);
    box-shadow: var(--box-shadow-base);
    border-radius: var(--border-radius-base);

    .left {
      flex: 0 0 50%;
      position: relative;

      .download-wrap {
        width: 70%;
        display: flex;
        align-items: center;
        justify-content: space-around;

        .iconfont {
          font-size: 30px;
        }

        .svg-icon {
          width: 32px;
          height: 32px;
        }

        a {
          text-decoration: none;
        }
      }

      .featrue {
        margin-top: 25px;
        margin-left: 10%;

        &>li {
          margin-bottom: 10px;
          font-size: 15px;
        }
      }

      .el-carousel__item,
      .item-wrap {
        height: 340px;
      }
    }

    .right {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 0 40px;
      position: relative;
      height: 100%;

      &>h2 {
        margin-top: 20px;
      }

      .captcha {
        display: flex;

        &>img {
          width: 200px;
          height: 40px;
        }
      }
      .server-config {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 12px 0;
      }
      .server-config .form-input {
        flex: 1;
      }
      .server-config .server-actions .el-button {
        margin-left: 8px;
      }
    }
  }
  .download-link {
    &:hover {
      color: var(--theme-color);
    }
  }
}
</style>
