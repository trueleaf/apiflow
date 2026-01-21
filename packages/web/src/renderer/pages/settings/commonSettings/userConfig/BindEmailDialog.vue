<template>
  <el-dialog
    v-model="visible"
    :title="t('绑定邮箱')"
    width="450px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="0">
      <el-form-item prop="email">
        <el-input v-model="formData.email" type="email" :placeholder="t('请输入邮箱地址')">
          <template #prefix>
            <Mail :size="18" class="input-icon" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code">
        <div class="verify-code-wrap">
          <el-input v-model="formData.code" :placeholder="t('请输入验证码')" maxlength="6">
            <template #prefix>
              <Shield :size="18" class="input-icon" />
            </template>
          </el-input>
          <el-button :disabled="countdown > 0" :loading="sendingCode" @click="handleSendCode">
            {{ countdown > 0 ? `${countdown}${t('秒后重试')}` : t('获取验证码') }}
          </el-button>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">{{ t('取消') }}</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ t('确定') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FormInstance, FormRules } from 'element-plus'
import { Mail, Shield } from 'lucide-vue-next'
import { request } from '@/api/api'
import { message } from '@/helper'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success', email: string): void
}>()

const { t } = useI18n()
const formRef = ref<FormInstance>()
const sendingCode = ref(false)
const countdown = ref(0)
const submitting = ref(false)

const visible = ref(props.modelValue)
const formData = reactive({
  email: '',
  code: '',
})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    formData.email = ''
    formData.code = ''
    countdown.value = 0
    formRef.value?.clearValidate()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const emailValidator = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!value) {
    callback(new Error(t('请输入邮箱地址')))
  } else if (!emailRegex.test(value)) {
    callback(new Error(t('请输入有效的邮箱地址')))
  } else {
    callback()
  }
}

const rules: FormRules = {
  email: [{ validator: emailValidator, trigger: 'blur' }],
  code: [{ required: true, message: t('请输入验证码'), trigger: 'blur' }],
}
//发送验证码
const handleSendCode = async () => {
  try {
    await formRef.value?.validateField('email')
    sendingCode.value = true
    await request.post('/api/security/send_email_code', {
      email: formData.email,
      type: 'bind',
    })
    message.success(t('验证码已发送，请查收邮件'))
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    //验证失败或发送失败
  } finally {
    sendingCode.value = false
  }
}
//提交绑定
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitting.value = true
    await request.put('/api/security/bind_email', {
      email: formData.email,
      code: formData.code,
    })
    message.success(t('邮箱绑定成功'))
    emit('success', formData.email)
    handleClose()
  } catch (error) {
    //表单验证失败或提交失败
  } finally {
    submitting.value = false
  }
}
//关闭对话框
const handleClose = () => {
  visible.value = false
}
</script>

<style scoped lang="scss">
.verify-code-wrap {
  display: flex;
  gap: 8px;
  
  .el-input {
    flex: 1;
  }
  
  .el-button {
    flex-shrink: 0;
    min-width: 110px;
  }
}

.input-icon {
  color: var(--el-input-icon-color, var(--el-text-color-placeholder));
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
