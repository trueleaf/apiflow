<template>
  <div class="password-change">
    <el-card class="password-card">
      <template #header>
        <div class="card-header">
          <el-icon><Lock /></el-icon>
          <span>{{ $t('修改密码') }}</span>
        </div>
      </template>
      
      <div class="password-form-container">
        <el-form 
          :model="passwordForm" 
          :rules="passwordRules" 
          ref="formRef" 
          label-width="120px"
          class="password-form"
        >
          <el-form-item :label="$t('原密码')" prop="oldPassword">
            <el-input 
              v-model="passwordForm.oldPassword"
              type="password"
              :placeholder="$t('请输入原密码')"
              show-password
              clearable
            />
          </el-form-item>
          
          <el-form-item :label="$t('新密码')" prop="newPassword">
            <el-input 
              v-model="passwordForm.newPassword"
              type="password"
              :placeholder="$t('请输入新密码')"
              show-password
              clearable
              @input="checkPasswordStrength"
            />
            
            <!-- 密码强度指示器 -->
            <div v-if="passwordForm.newPassword" class="password-strength">
              <div class="strength-label">{{ $t('密码强度') }}:</div>
              <div class="strength-bar">
                <div 
                  class="strength-fill" 
                  :class="passwordStrength.level"
                  :style="{ width: passwordStrength.percentage + '%' }"
                ></div>
              </div>
              <div class="strength-text" :class="passwordStrength.level">
                {{ passwordStrength.text }}
              </div>
            </div>
            
            <!-- 密码要求提示 -->
            <div class="password-requirements">
              <div class="requirement-title">{{ $t('密码要求') }}:</div>
              <ul class="requirement-list">
                <li :class="{ valid: requirements.length }">
                  {{ $t('至少8个字符') }}
                </li>
                <li :class="{ valid: requirements.uppercase }">
                  {{ $t('包含大写字母') }}
                </li>
                <li :class="{ valid: requirements.lowercase }">
                  {{ $t('包含小写字母') }}
                </li>
                <li :class="{ valid: requirements.number }">
                  {{ $t('包含数字') }}
                </li>
                <li :class="{ valid: requirements.special }">
                  {{ $t('包含特殊字符') }}
                </li>
              </ul>
            </div>
          </el-form-item>
          
          <el-form-item :label="$t('确认密码')" prop="confirmPassword">
            <el-input 
              v-model="passwordForm.confirmPassword"
              type="password"
              :placeholder="$t('请再次输入新密码')"
              show-password
              clearable
            />
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              :loading="submitting"
              :disabled="!isFormValid"
              @click="handlePasswordChange"
            >
              {{ $t('确认修改密码') }}
            </el-button>
            <el-button @click="resetForm">
              {{ $t('重置') }}
            </el-button>
          </el-form-item>
        </el-form>
        
        <!-- 安全提示 -->
        <el-alert
          :title="$t('安全提示')"
          type="info"
          :closable="false"
          class="security-tips"
        >
          <ul>
            <li>{{ $t('建议使用包含大小写字母、数字和特殊字符的强密码') }}</li>
            <li>{{ $t('不要使用与其他账户相同的密码') }}</li>
            <li>{{ $t('定期更换密码以确保账户安全') }}</li>
          </ul>
        </el-alert>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useTranslation } from 'i18next-vue'
import { Lock } from '@element-plus/icons-vue'
import { ElMessage, FormInstance } from 'element-plus'

const { t } = useTranslation()

const formRef = ref<FormInstance>()
const submitting = ref(false)

// 密码表单数据
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码要求检查
const requirements = reactive({
  length: false,
  uppercase: false,
  lowercase: false,
  number: false,
  special: false
})

// 密码强度
const passwordStrength = reactive({
  level: 'weak',
  percentage: 0,
  text: '弱'
})

// 表单验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度至少8个字符', trigger: 'blur' },
    { 
      validator: (rule: any, value: string, callback: Function) => {
        if (value && value === passwordForm.oldPassword) {
          callback(new Error('新密码不能与原密码相同'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { 
      validator: (rule: any, value: string, callback: Function) => {
        if (value && value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

// 检查密码强度
const checkPasswordStrength = () => {
  const password = passwordForm.newPassword
  
  // 重置要求检查
  requirements.length = password.length >= 8
  requirements.uppercase = /[A-Z]/.test(password)
  requirements.lowercase = /[a-z]/.test(password)
  requirements.number = /\d/.test(password)
  requirements.special = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  
  // 计算强度
  const validRequirements = Object.values(requirements).filter(Boolean).length
  
  if (validRequirements <= 2) {
    passwordStrength.level = 'weak'
    passwordStrength.percentage = 25
    passwordStrength.text = '弱'
  } else if (validRequirements === 3) {
    passwordStrength.level = 'medium'
    passwordStrength.percentage = 50
    passwordStrength.text = '中等'
  } else if (validRequirements === 4) {
    passwordStrength.level = 'good'
    passwordStrength.percentage = 75
    passwordStrength.text = '良好'
  } else if (validRequirements === 5) {
    passwordStrength.level = 'strong'
    passwordStrength.percentage = 100
    passwordStrength.text = '强'
  }
}

// 表单是否有效
const isFormValid = computed(() => {
  return passwordForm.oldPassword && 
         passwordForm.newPassword && 
         passwordForm.confirmPassword &&
         passwordForm.newPassword === passwordForm.confirmPassword &&
         passwordForm.newPassword !== passwordForm.oldPassword &&
         requirements.length
})

// 处理密码修改
const handlePasswordChange = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitting.value = true
    
    // 模拟提交延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 打印参数到控制台
    console.log('密码修改参数:', {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword
    })
    
    ElMessage.success('密码修改成功')
    resetForm()
    
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  
  // 重置要求检查
  Object.keys(requirements).forEach(key => {
    requirements[key as keyof typeof requirements] = false
  })
  
  // 重置强度指示器
  passwordStrength.level = 'weak'
  passwordStrength.percentage = 0
  passwordStrength.text = '弱'
  
  formRef.value?.clearValidate()
}

// 监听确认密码变化，触发验证
watch(() => passwordForm.confirmPassword, () => {
  if (formRef.value) {
    formRef.value.validateField('confirmPassword')
  }
})

// 监听新密码变化，触发确认密码验证
watch(() => passwordForm.newPassword, () => {
  if (formRef.value && passwordForm.confirmPassword) {
    formRef.value.validateField('confirmPassword')
  }
})
</script>

<style lang="scss" scoped>
.password-change {
  max-width: 600px;
  
  .password-card {
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 16px;
    }
  }
  
  .password-form-container {
    .password-form {
      margin-bottom: 24px;
    }
    
    .password-strength {
      margin-top: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      
      .strength-label {
        color: var(--gray-600);
        white-space: nowrap;
      }
      
      .strength-bar {
        flex: 1;
        height: 4px;
        background: var(--gray-200);
        border-radius: 2px;
        overflow: hidden;
        
        .strength-fill {
          height: 100%;
          transition: width 0.3s ease;
          
          &.weak {
            background: var(--red);
          }
          
          &.medium {
            background: var(--orange);
          }
          
          &.good {
            background: var(--yellow);
          }
          
          &.strong {
            background: var(--green);
          }
        }
      }
      
      .strength-text {
        white-space: nowrap;
        font-weight: 500;
        
        &.weak {
          color: var(--red);
        }
        
        &.medium {
          color: var(--orange);
        }
        
        &.good {
          color: var(--yellow);
        }
        
        &.strong {
          color: var(--green);
        }
      }
    }
    
    .password-requirements {
      margin-top: 12px;
      padding: 12px;
      background: var(--gray-100);
      border-radius: var(--border-radius-sm);
      font-size: 12px;
      
      .requirement-title {
        font-weight: 500;
        margin-bottom: 8px;
        color: var(--gray-700);
      }
      
      .requirement-list {
        margin: 0;
        padding-left: 16px;
        
        li {
          margin-bottom: 4px;
          color: var(--gray-600);
          
          &.valid {
            color: var(--green);
            
            &::before {
              content: '✓ ';
              font-weight: bold;
            }
          }
          
          &:not(.valid)::before {
            content: '✗ ';
            color: var(--red);
            font-weight: bold;
          }
        }
      }
    }
    
    .security-tips {
      ul {
        margin: 8px 0 0 0;
        padding-left: 20px;
        
        li {
          margin-bottom: 4px;
          font-size: 12px;
          
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }
}
</style>
