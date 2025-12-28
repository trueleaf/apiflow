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
        <el-tabs v-model="activeName" class="w-100" data-testid="login-tabs">
          <!-- 账号登录 -->
          <el-tab-pane :label="$t('账号登录')" name="loginAccount" data-testid="login-tab-account">
          </el-tab-pane>
          <!-- 设置 -->
          <el-tab-pane :label="$t('设置')" name="setting" data-testid="login-tab-setting">
          </el-tab-pane>
          <!-- 手机号登录 -->
          <!-- <el-tab-pane :label="$t('手机登录')" name="loginPhone">
          </el-tab-pane> -->
          <!-- 忘记密码 -->
          <!-- <el-tab-pane :label="$t('忘记密码')" name="reset">
          </el-tab-pane> -->
        </el-tabs>
        <keep-alive>
          <component :is="getComponent()"></component>
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { config as globalConfig } from '@src/config/config'
import LoginAccount from './components/LoginAccount.vue';
import ServerConfig from './components/ServerConfig.vue';

const config = ref(globalConfig);
const activeName = ref('loginAccount');

const getComponent = () => {
  if (activeName.value === 'loginAccount') {
    return LoginAccount;
  } else if (activeName.value === 'setting') {
    return ServerConfig;
  }
}
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
    }
  }
  .download-link {
    &:hover {
      color: var(--theme-color);
    }
  }
}
</style>
