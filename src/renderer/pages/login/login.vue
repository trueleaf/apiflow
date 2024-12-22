<template>
  <div class="login-container d-flex a-center j-center">
    <div class="login-box d-flex">
      <div ref="left" tabindex="-1" class="left hidden-md-and-down">
        <!-- <h2 class="text-center mt-5">下载客户端获得完整功能</h2>
        <el-carousel trigger="click" height="340px" :autoplay="false">
          <el-carousel-item v-for="item in 4" :key="item">
            <div class="d-flex a-center j-center h-300px">项目特色功能视频演示</div>
            <img :src="require('@/assets/imgs/login/a.gif')" width="460" height="340">
          </el-carousel-item>
        </el-carousel>
        <div class="w-100 d-flex j-center">
          <div class="download-wrap">
            <a href="https://gitee.com/shuzhikai/moyu/releases" target="__blank"
              class="d-flex flex-column j-center a-center cursor-pointer hover-theme-color">
              <i class="iconfont iconwindows theme-color"></i>
              <div class="mt-1">Windows下载</div>
            </a>
            <a href="https://gitee.com/shuzhikai/moyu/releases" target="__blank"
              class="d-flex flex-column j-center a-center cursor-pointer hover-theme-color">
              <svg class="svg-icon" aria-hidden="true">
                <use xlink:href="#iconlinux1"></use>
              </svg>
              <div class="mt-1">Linux下载</div>
            </a>
            <a href="https://gitee.com/shuzhikai/moyu/releases" target="__blank"
              class="d-flex flex-column j-center a-center cursor-pointer hover-theme-color">
              <i class="iconfont iconmac gray-600"></i>
              <div class="mt-1">Mac下载</div>
            </a>
          </div>
        </div> -->
      </div>
      <div class="right">
        <h2 class="text-center">
          <span>{{ config.localization.title }}</span>
          <span v-if="config.localization.version">({{ config.localization.version }})</span>
        </h2>
        <el-tabs v-model="activeName" class="w-100">
          <!-- 账号登录 -->
          <el-tab-pane :label="t('账号登录')" name="loginAccount">
            <LoginAccount @jumpToRegister="handleJumpToRegister" @jumpToResetPassword="handleJumpToResetPassword"></LoginAccount>
          </el-tab-pane>
          <!-- 手机号登录 -->
          <el-tab-pane :label="t('手机登录')" name="loginPassword">
            <LoginPhone></LoginPhone>
          </el-tab-pane>
          <!-- 注册 -->
          <el-tab-pane v-if="config.localization.enableRegister" :label="t('账号注册')" name="register">
            <Register></Register>
          </el-tab-pane>
          <!-- 忘记密码 -->
          <el-tab-pane :label="t('忘记密码')" name="reset">
            <ResetPassword @jumpToLogin="handleJumpToLogin"></ResetPassword>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { config as globalConfig } from '@/../config/config'
import LoginAccount from './components/login-account.vue';
import LoginPhone from './components/login-phone.vue';
import Register from './components/register.vue';
import ResetPassword from './components/reset-password.vue';
import { t } from 'i18next'

const config = ref(globalConfig);
const activeName = ref('loginAccount');

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

</script>

<style  scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  background: $gray-200;

  .login-box {
    height: size(550);
    width: size(960);
    background: $white;
    box-shadow: $box-shadow-base;
    border-radius: $border-radius-base;

    .left {
      flex: 0 0 50%;
      position: relative;

      .download-wrap {
        width: 70%;
        display: flex;
        align-items: center;
        justify-content: space-around;

        .iconfont {
          font-size: fz(30);
        }

        .svg-icon {
          width: size(32);
          height: size(32);
        }

        a {
          text-decoration: none;
        }
      }

      .featrue {
        margin-top: size(25);
        margin-left: 10%;

        &>li {
          margin-bottom: size(10);
          font-size: fz(15);
        }
      }

      .el-carousel__item,
      .item-wrap {
        height: size(340);
      }
    }

    .right {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 0 size(40);
      position: relative;
      height: 100%;

      &>h2 {
        margin-top: size(20);
      }

      .captcha {
        display: flex;

        &>img {
          width: size(200);
          height: size(40);
        }
      }
    }
  }
}
</style>
