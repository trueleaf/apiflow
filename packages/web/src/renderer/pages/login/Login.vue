<template>
  <div class="login-container d-flex a-center j-center">
    <div class="login-box d-flex">
      <div ref="left" tabindex="-1" class="left hidden-md-and-down">
      </div>
      <div class="right">
        <h2 class="text-center">
          <span>{{ config.appConfig.appTitle }}</span>
          <span v-if="config.appConfig.version">({{ config.appConfig.version }})</span>
        </h2>
        <el-tabs v-if="!showForgotPassword" v-model="activeName" class="w-100" data-testid="login-tabs">
          <el-tab-pane :label="t('用户登录')" name="loginAccount" data-testid="login-tab-account">
          </el-tab-pane>
          <el-tab-pane :label="t('注册')" name="registerEmail" data-testid="login-tab-register">
          </el-tab-pane>
          <el-tab-pane :label="t('设置')" name="setting" data-testid="login-tab-setting">
          </el-tab-pane>
        </el-tabs>
        <h3 v-else class="text-center forgot-password-title">{{ t('重置密码') }}</h3>
        <div v-show="activeName === 'loginAccount' && !showForgotPassword">
          <LoginAccount />
        </div>
        <div v-show="activeName === 'registerEmail' && !showForgotPassword">
          <LoginEmail mode="register" />
        </div>
        <div v-show="activeName === 'setting' && !showForgotPassword">
          <ServerConfig />
        </div>
        <div v-if="showForgotPassword">
          <ForgotPassword @success="handleResetSuccess" />
        </div>
        <div v-if="activeName === 'loginAccount' && !showForgotPassword" class="text-center mt-3">     
          <el-button type="text" @click="handleForgotPassword">{{ t('忘记密码？') }}</el-button>
        </div>
        <div v-if="showForgotPassword" class="text-center mt-3">     
          <el-button type="text" @click="handleBackToLogin">{{ t('返回登录') }}</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { config as globalConfig } from '@src/config/config'
import LoginAccount from './components/LoginAccount.vue';
import LoginEmail from './components/LoginEmail.vue';
import ServerConfig from './components/ServerConfig.vue';
import ForgotPassword from './components/ForgotPassword.vue';

const { t } = useI18n();
const config = ref(globalConfig);
const activeName = ref('loginAccount');
const showForgotPassword = ref(false);
//显示忘记密码界面
const handleForgotPassword = () => {
  showForgotPassword.value = true;
}
//返回登录
const handleBackToLogin = () => {
  showForgotPassword.value = false;
  activeName.value = 'loginAccount';
}
//重置密码成功
const handleResetSuccess = () => {
  showForgotPassword.value = false;
  activeName.value = 'loginAccount';
}
</script>

<style lang='scss' scoped>
.login-container {
  width: 100%;
  height: 100%;
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

      .forgot-password-title {
        margin-top: 20px;
        margin-bottom: 20px;
        color: var(--text-color);
      }

      .captcha {
        display: flex;

        &>img {
          width: 200px;
          height: 40px;
        }
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
