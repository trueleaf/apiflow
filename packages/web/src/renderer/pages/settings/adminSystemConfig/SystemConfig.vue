<template>
  <div class="admin-system-config">
    <h3 class="config-title">{{ t('系统配置') }}</h3>
    <p class="config-desc">{{ t('管理登录页面功能开关，仅在自部署模式下可用') }}</p>
    <el-skeleton v-if="loading" :rows="3" animated />
    <el-form v-else label-position="left" label-width="200px" class="config-form">
      <el-form-item v-if="systemConfigStore.isOfficial" :label="t('一键创建账号并登录')">
        <el-switch v-model="form.enableGuest" :loading="saving" @change="handleSave" />
        <span class="form-item-desc">{{ t('关闭后登录页将隐藏一键创建账号按钮') }}</span>
      </el-form-item>
      <el-form-item :label="t('邮箱注册')">
        <el-switch v-model="form.enableRegister" :loading="saving" @change="handleSave" />
        <span class="form-item-desc">{{ t('关闭后登录页将隐藏注册入口') }}</span>
      </el-form-item>
      <el-form-item :label="t('忘记密码')">
        <el-switch v-model="form.enableForgotPassword" :loading="saving" @change="handleSave" />
        <span class="form-item-desc">{{ t('开启后登录页展示忘记密码入口') }}</span>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSystemConfig } from '@/store/systemConfig/systemConfigStore'
import { message } from '@/helper'

const { t } = useI18n()
const systemConfigStore = useSystemConfig()
const loading = ref(true)
const saving = ref(false)
const form = reactive({
  enableGuest: false,
  enableRegister: false,
  enableForgotPassword: false,
})
onMounted(async () => {
  await systemConfigStore.fetchConfig()
  form.enableGuest = systemConfigStore.enableGuest
  form.enableRegister = systemConfigStore.enableRegister
  form.enableForgotPassword = systemConfigStore.enableForgotPassword
  loading.value = false
})
// 保存配置
const handleSave = async () => {
  saving.value = true
  try {
    await systemConfigStore.updateConfig({
      enableGuest: form.enableGuest,
      enableRegister: form.enableRegister,
      enableForgotPassword: form.enableForgotPassword,
    })
    message.success(t('保存成功'))
  } catch {
    form.enableGuest = systemConfigStore.enableGuest
    form.enableRegister = systemConfigStore.enableRegister
    form.enableForgotPassword = systemConfigStore.enableForgotPassword
    message.error(t('保存失败'))
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.admin-system-config {
  max-width: 700px;
  .config-title {
    margin-bottom: 8px;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
  }
  .config-desc {
    margin-bottom: 24px;
    font-size: 13px;
    color: var(--text-secondary);
  }
  .config-form {
    .form-item-desc {
      margin-left: 12px;
      font-size: 12px;
      color: var(--text-tertiary);
    }
  }
}
</style>
