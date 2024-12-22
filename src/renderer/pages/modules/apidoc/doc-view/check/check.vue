/*
    创建者：shuxiaokai
    创建时间：2021-10-11 22:25
    模块名称：check
    备注：
*/
<template>
  <SLoading v-if="!isValidShareId" :loading="loading" class="check-wrap">
    <div class="content">
      <div class="text-center">
        <img :src="require('@/assets/imgs/logo.png')" width="100" height="100" class="logo">
      </div>
      <h2 class="text-center">{{ projectName }}</h2>
      <div class="d-flex a-center mb-3">
        <el-input v-model="password" type="password" :placeholder="t('请输入密码')" class="w-200px" show-password clearable></el-input>
        <el-button type="success" :loading="loading2" @click="handleConfirmPassword">{{ t("确认密码") }}</el-button>
      </div>
      <div class="gray-600">
        <span class="mr-1">{{ t("过期倒计时") }}：</span>
        <span v-countdown="expire"></span>
      </div>
    </div>
  </SLoading>
  <el-empty v-if="isValidShareId" :description="t('无效的项目id')"></el-empty>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { Response } from '@src/types/global'

// const isBuildHtml = process.env.VUE_APP_BUILD_HTML;

type LinkInfo = {
  projectName: string,
  shareName: string,
  expire: number,
  needPassword: boolean,
};

export default defineComponent({
  data() {
    return {
      projectName: '', //项目名称
      expire: 0, //过期时间
      password: '', //密码
      //===================================其他参数====================================//
      isValidShareId: false, //文档是否存在
      loading: false, //基础数据获取
      loading2: false, //是否加载中
    };
  },
  mounted() {
    // console.log('check', typeof isBuildHtml)
    // if (isBuildHtml) {
    //   this.$router.push({
    //     path: '/view',
    //   });
    // } else {
    //   this.init()
    // }
  },
  methods: {
    //=====================================前后端交互====================================//
    //初始化
    init() {
      // eslint-disable-next-line camelcase
      const { share_id, id } = this.$route.query;
      if (!this.$route.query.id) {
        this.isValidShareId = true;
        return
      }
      this.loading = true;
      const params = {
        shareId: this.$route.query.share_id,
      };
      this.request.get<Response<LinkInfo>, Response<LinkInfo>>('/api/project/share_info', { params }).then((res) => {
        this.projectName = res.data.projectName;
        this.expire = res.data.expire;
        if (!res.data.needPassword) {
          this.$router.push({
            path: '/view',
            query: {
              id,
              share_id,
            },
          });
        }
      }).catch((err) => {
        console.error(err);
      }).finally(() => {
        this.loading = false;
      });
    },
    //确认密码
    handleConfirmPassword() {
      // eslint-disable-next-line camelcase
      const { share_id, id } = this.$route.query;
      this.loading2 = true;
      const params = {
        shareId: share_id,
        password: this.password,
      };
      this.request.get('/api/project/share_check', { params }).then(() => {
        localStorage.setItem('share/password', this.password || '');
        // eslint-disable-next-line camelcase
        localStorage.setItem('share/shareId', share_id as string);
        this.$router.push({
          path: '/view',
          query: {
            id,
            share_id,
          },
        });
      }).catch((err) => {
        console.error(err);
      }).finally(() => {
        this.loading2 = false;
      });
    },
  },
})
</script>

<style lang='scss' scoped>
.check-wrap {
    width: 100vw;
    height: 100vh;
    position: relative;
    background: $gray-100;
    .content {
        position: absolute;
        display: flex;
        flex-direction: column;
        left: 50%;
        top: 10vh;
        overflow: hidden;
        transform: translate(-50%, 0%);
        background: $white;
        padding: size(50) size(100);
        box-shadow: $box-shadow-sm;
        &>h2 {
            padding: 0;
            margin-bottom: size(20);
            margin-top: size(0);
        }
    }
}
</style>
