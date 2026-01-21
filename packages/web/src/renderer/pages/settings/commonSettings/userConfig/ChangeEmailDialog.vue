<template>
  <el-dialog
    v-model="visible"
    :title="t('修改邮箱')"
    width="450px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="current-email-tip">
      <div class="tip-label">{{ t('当前绑定邮箱') }}:</div>
      <div class="tip-value">{{ currentEmail }}</div>
    </div>
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="0">
      <el-form-item prop="oldCode">
        <div class="verify-code-wrap">
          <el-input v-model="formData.oldCode" :placeholder="t('请输入当前邮箱验证码')" maxlength="6">
            <template #prefix>
              <Shield :size="18" class="input-icon" />
            </template>
          </el-input>
          <el-button :disabled="oldCountdown > 0" :loading="sendingOldCode" @click="handleSendOldCode">
            {{ oldCountdown > 0 ? `${oldCountdown}${t('秒后重试')}` : t('获取验证码') }}
          </el-button>
        </div>
      </el-form-item>
      <div class="divider"></div>
      <el-form-item prop="email">
        <el-input v-model="formData.email" type="email" :placeholder="t('请输入新邮箱地址')">
          <template #prefix>
            <Mail :size="18" class="input-icon" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code">
        <div class="verify-code-wrap">
          <el-input v-model="formData.code" :placeholder="t('请输入新邮箱验证码')" maxlength="6">
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
  currentEmail: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success', email: string): void
}>()

const { t } = useI18n()
const formRef = ref<FormInstance>()
const sendingOldCode = ref(false)
const sendingCode = ref(false)
const oldCountdown = ref(0)
const countdown = ref(0)
const submitting = ref(false)

const visible = ref(props.modelValue)
const formData = reactive({
  oldCode: '',
  email: '',
  code: '',
})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    formData.oldCode = ''
    formData.email = ''
    formData.code = ''
    oldCountdown.value = 0
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
  } else if (value === props.currentEmail) {
    callback(new Error(t('新邮箱不能与当前邮箱相同')))
  } else {
    callback()
  }
}

const rules: FormRules = {
  oldCode: [{ required: true, message: t('请输入当前邮箱验证码'), trigger: 'blur' }],
  email: [{ validator: emailValidator, trigger: 'blur' }],
  code: [{ required: true, message: t('请输入新邮箱验证码'), trigger: 'blur' }],
}
//发送旧邮箱验证码
const handleSendOldCode = async () => {
  try {
    sendingOldCode.value = true
    await request.post('/api/security/send_email_code', {
      email: props.currentEmail,
      type: 'bind',
    })
    message.success(t('验证码已发送，请查收邮件'))
    oldCountdown.value = 60
    const timer = setInterval(() => {
      oldCountdown.value--
      if (oldCountdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    //发送失败
  } finally {
    sendingOldCode.value = false
  }
}
//发送新邮箱验证码
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
//提交修改
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitting.value = true
    await request.put('/api/security/bind_email', {
      email: formData.email,
      code: formData.code,
      oldCode: formData.oldCode,
    })
    message.success(t('邮箱修改成功'))
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
.current-email-tip {
  margin-bottom: 20px;
  padding: 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  
  .tip-label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin-bottom: 4px;
  }
  
  .tip-value {
    font-size: 14px;
    color: var(--el-text-color-primary);
    font-weight: 500;
  }
}

.divider {
  height: 1px;
  background-color: var(--el-border-color);
  margin: 20px 0;
}

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
