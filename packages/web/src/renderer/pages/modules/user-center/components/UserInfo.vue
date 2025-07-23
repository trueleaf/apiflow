<template>
  <div class="user-info">
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <span>{{ $t('基本信息') }}</span>
        </div>
      </template>
      
      <div class="user-profile">
        <div class="avatar-section">
          <div class="avatar-container">
            <el-avatar :size="80" :src="userInfo.avatar" class="user-avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="avatar-actions">
              <el-button size="small" type="primary" @click="handleAvatarUpload">
                {{ $t('更换头像') }}
              </el-button>
            </div>
          </div>
        </div>
        
        <div class="info-section">
          <el-form :model="userInfo" :rules="rules" ref="formRef" label-width="100px">
            <el-form-item :label="$t('用户名')" prop="username">
              <el-input 
                v-model="userInfo.username" 
                :disabled="!isEditing"
                placeholder="请输入用户名"
              />
            </el-form-item>
            
            <el-form-item :label="$t('邮箱')" prop="email">
              <el-input 
                v-model="userInfo.email" 
                :disabled="!isEditing"
                placeholder="请输入邮箱"
              />
            </el-form-item>
            
            <el-form-item :label="$t('手机号')" prop="phone">
              <el-input 
                v-model="userInfo.phone" 
                :disabled="!isEditing"
                placeholder="请输入手机号"
              />
            </el-form-item>
            
            <el-form-item :label="$t('注册时间')">
              <el-input 
                :value="formatDate(userInfo.registerTime)" 
                disabled
                placeholder="注册时间"
              />
            </el-form-item>
            
            <el-form-item :label="$t('最后登录')">
              <el-input 
                :value="formatDate(userInfo.lastLoginTime)" 
                disabled
                placeholder="最后登录时间"
              />
            </el-form-item>
          </el-form>
          
          <div class="action-buttons">
            <template v-if="!isEditing">
              <el-button type="primary" @click="startEdit">
                {{ $t('编辑信息') }}
              </el-button>
            </template>
            <template v-else>
              <el-button type="primary" :loading="saving" @click="saveUserInfo">
                {{ $t('保存') }}
              </el-button>
              <el-button @click="cancelEdit">
                {{ $t('取消') }}
              </el-button>
            </template>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useTranslation } from 'i18next-vue'
import { User } from '@element-plus/icons-vue'
import { ElMessage, FormInstance } from 'element-plus'
import { formatDate } from '@/helper'
import { usePermissionStore } from '@/store/permission'

const { t } = useTranslation()
const permissionStore = usePermissionStore()

const formRef = ref<FormInstance>()
const isEditing = ref(false)
const saving = ref(false)

// 用户信息数据
const userInfo = reactive({
  username: '',
  email: '',
  phone: '',
  avatar: '',
  registerTime: new Date('2024-01-01'),
  lastLoginTime: new Date()
})

// 备份原始数据
let originalUserInfo = { ...userInfo }

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 开始编辑
const startEdit = () => {
  originalUserInfo = { ...userInfo }
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  Object.assign(userInfo, originalUserInfo)
  isEditing.value = false
}

// 保存用户信息
const saveUserInfo = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true
    
    // 模拟保存操作
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('保存用户信息:', {
      username: userInfo.username,
      email: userInfo.email,
      phone: userInfo.phone
    })
    
    ElMessage.success('用户信息保存成功')
    isEditing.value = false
    originalUserInfo = { ...userInfo }
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    saving.value = false
  }
}

// 头像上传
const handleAvatarUpload = () => {
  console.log('触发头像上传操作')
  ElMessage.info('头像上传功能')
}

// 初始化用户信息
const initUserInfo = () => {
  const storeUserInfo = permissionStore.userInfo
  if (storeUserInfo) {
    userInfo.username = storeUserInfo.realName || storeUserInfo.loginName
    userInfo.email = `${storeUserInfo.loginName}@example.com` // 模拟邮箱
    userInfo.phone = storeUserInfo.phone || ''
    // 可以根据需要添加更多字段映射
  }
}

// 监听 store 中用户信息的变化
watch(() => permissionStore.userInfo, (newUserInfo) => {
  if (newUserInfo) {
    userInfo.username = newUserInfo.realName || newUserInfo.loginName
    userInfo.email = `${newUserInfo.loginName}@example.com`
    userInfo.phone = newUserInfo.phone || ''
  }
}, { immediate: true })

onMounted(() => {
  initUserInfo()
  console.log('用户信息组件已加载')
})
</script>

<style lang="scss" scoped>
.user-info {
  .info-card {
    .card-header {
      font-weight: 600;
      font-size: 16px;
    }
  }
  
  .user-profile {
    display: flex;
    gap: 32px;
    
    .avatar-section {
      flex-shrink: 0;
      
      .avatar-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        
        .user-avatar {
          border: 2px solid var(--gray-200);
        }
      }
    }
    
    .info-section {
      flex: 1;
      
      .action-buttons {
        margin-top: 24px;
        display: flex;
        gap: 12px;
      }
    }
  }
}

@media (max-width: 768px) {
  .user-profile {
    flex-direction: column;
    gap: 24px;
    
    .avatar-section {
      align-self: center;
    }
  }
}
</style>
