<template>
  <el-dialog
    v-model="visible"
    :title="t('修改密码')"
    width="450px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="0">
      <el-form-item prop="oldPassword">
        <el-input v-model="formData.oldPassword" type="password" show-password :placeholder="t('请输入原密码')">
          <template #prefix>
            <Lock :size="18" class="input-icon" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="newPassword">
        <el-input v-model="formData.newPassword" type="password" show-password :placeholder="t('请输入新密码')">
          <template #prefix>
            <KeyRound :size="18" class="input-icon" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input v-model="formData.confirmPassword" type="password" show-password :placeholder="t('请输入确认密码')">
          <template #prefix>
            <KeyRound :size="18" class="input-icon" />
          </template>
        </el-input>
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
import { Lock, KeyRound } from 'lucide-vue-next'
import { request } from '@/api/api'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const { t } = useI18n()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const visible = ref(props.modelValue)
const formData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    formData.oldPassword = ''
    formData.newPassword = ''
    formData.confirmPassword = ''
    formRef.value?.clearValidate()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const passwordValidator = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  const matchString = /[a-zA-Z]/
  const matchNumber = /\d/
  if (!value) {
    callback(new Error(t('请输入新密码')))
  } else if (!matchString.test(value) || !matchNumber.test(value)) {
    callback(new Error(t('密码必须包含字母和数字')))
  } else if (value.length < 8) {
    callback(new Error(t('密码至少8位')))
  } else {
    if (formData.confirmPassword) {
      formRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

const confirmPasswordValidator = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback(new Error(t('请输入确认密码')))
  } else if (value !== formData.newPassword) {
    callback(new Error(t('两次输入的密码不一致')))
  } else {
    callback()
  }
}

const rules: FormRules = {
  oldPassword: [{ required: true, message: t('请输入原密码'), trigger: 'blur' }],
  newPassword: [{ validator: passwordValidator, trigger: 'blur' }],
  confirmPassword: [{ validator: confirmPasswordValidator, trigger: 'blur' }],
}

const handleClose = () => {
  visible.value = false
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitting.value = true
    await request.put('/api/security/user_password', {
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword,
    })
    emit('success')
    handleClose()
  } catch (error) {
    console.error('Change password error:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.input-icon {
  color: var(--text-secondary);
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-input__prefix) {
  display: flex;
  align-items: center;
  margin-left: 8px;
}
</style>
