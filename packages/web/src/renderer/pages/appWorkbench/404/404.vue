<template>
  <div class="h-100 d-flex a-center j-center flex-column">
    <h2>404</h2>
    <img :src="appSettingsStore.appLogo" :alt="appSettingsStore.appTitle">
    <el-button link type="primary" text @click="handleJumpToHome">{{ $t('返回首页') }}</el-button>
  </div>
</template>

<script lang="ts" setup>
import { router } from '@/router';
import { useAppSettings } from '@/store/appSettings/appSettingsStore'

const appSettingsStore = useAppSettings()
const handleJumpToHome = () => {
  router.replace('/home');
}
</script>

