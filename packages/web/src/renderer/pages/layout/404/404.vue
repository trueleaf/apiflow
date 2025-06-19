<template>
  <div class="h-100 d-flex a-center j-center flex-column">
    <h2>404</h2>
    <img :src="imgUrl" alt="logo">
    <el-button link type="primary" text @click="handleJumpToLogin">返回登录页面</el-button>
  </div>
</template>

<script lang="ts" setup>
import { router } from '@/router';

const imgUrl = new URL('@/assets/imgs/logo.png', import.meta.url).href
const handleJumpToLogin = () => {
  router.push('/login');
}
</script>

