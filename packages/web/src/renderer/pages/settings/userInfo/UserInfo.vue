<template>
  <div class="user-info-container">
    <!-- 页面标题区域 -->
    <div class="page-title">
      <h2>{{ $t('个人基本信息') }}</h2>
    </div>
    
    <div class="info-card">
      <div class="avatar-section">
        <div class="avatar">
          <img :src="userInfo.avatar || defaultAvatar" :alt="$t('用户头像')">
        </div>
      </div>
      
      <div class="info-section">
        <div class="info-row">
          <div class="info-label">{{ $t('用户名') }}</div>
          <div class="info-value">
            <input v-if="editing" v-model="editedInfo.username" />
            <span v-else>{{ userInfo.realName }}</span>
          </div>
        </div>
        
        <div class="info-row">
          <div class="info-label">{{ $t('邮箱') }}</div>
          <div class="info-value">
            <input v-if="editing" v-model="editedInfo.email" />
            <span v-else-if="isLocalMode" class="local-mode-value">/</span>
            <span v-else>/</span>
          </div>
        </div>
        
        <div class="info-row">
          <div class="info-label">{{ $t('所属团队') }}</div>
          <div class="info-value">
            <select v-if="editing" v-model="editedInfo.team">
              <option v-for="team in teams" :key="team.id" :value="team.id">{{ team.name }}</option>
            </select>
            <span v-else-if="isLocalMode" class="local-mode-value">/</span>
            <span v-else>{{ getUserTeam() }}</span>
          </div>
        </div>
        
        <div class="info-row">
          <div class="info-label">{{ $t('注册时间') }}</div>
          <div class="info-value">/</div>
        </div>
        
        <div class="info-row">
          <div class="info-label">{{ $t('最后登录') }}</div>
          <div class="info-value">/</div>
        </div>
        
        <div class="action-buttons">
          <button v-if="!editing && !isLocalMode" class="edit-btn" @click="startEditing">{{ $t('编辑信息') }}</button>
          <template v-if="editing">
            <button class="save-btn" @click="saveChanges">{{ $t('保存') }}</button>
            <button class="cancel-btn" @click="cancelEditing">{{ $t('取消') }}</button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRuntime } from '@/store/runtime/runtimeStore'
import defaultAvatarImg from '@/assets/imgs/logo.png'

const defaultAvatar = defaultAvatarImg
const runtimeStore = useRuntime()
const isLocalMode = computed(() => runtimeStore.networkMode === 'offline')
const userInfo = computed(() => runtimeStore.userInfo)

const teams = [
  { id: 1, name: '研发团队' },
  { id: 2, name: '产品团队' },
  { id: 3, name: '测试团队' }
]

const editing = ref(false)
const editedInfo = reactive({
  username: '',
  email: '',
  team: 1
})

function startEditing() {
  editedInfo.username = userInfo.value.realName
  editedInfo.email = ''
  editedInfo.team = 1
  editing.value = true
}

function cancelEditing() {
  editing.value = false
}

function saveChanges() {
  editing.value = false
}

function getUserTeam() {
  return '未分配'
}
</script>

<style lang="scss" scoped>
.user-info-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .page-title {
    margin-bottom: 24px;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
  }
  
  .info-card {
    background: white;
    border: 1px solid #eaeaea;
    padding: 24px;
    display: flex;
    flex: 1;
    min-height: calc(100% - 60px);
    
    .avatar-section {
      margin-right: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;

      .avatar {
        width: 120px;
        height: 120px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
    
    .info-section {
      flex: 1;
      
      .info-row {
        display: flex;
        margin-bottom: 20px;
        align-items: center;
        
        .info-label {
          width: 100px;
          color: #606266;
          font-weight: 500;
        }
        
        .info-value {
          flex: 1;
          
          input, select {
            width: 300px;
            padding: 8px 12px;
            border: 1px solid #dcdfe6;
            border-radius: 4px;
            color: #606266;
            transition: all 0.3s;
            
            &:focus {
              border-color: #409eff;
              outline: none;
            }
          }
          
          .local-mode-value {
            color: #909399;
            cursor:  not-allowed;
            position: relative;
            
            &:hover {
              text-decoration: underline dotted;
            }
          }
        }
      }
      
      .action-buttons {
        margin-top: 24px;
        
        button {
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-right: 10px;
          transition: all 0.3s ease;
          
          &.edit-btn {
            background: #409eff;
            color: white;
            border: none;
            
            &:hover {
              background: #66b1ff;
            }
            
            &:disabled {
              background: #a0cfff;
              cursor: not-allowed;
            }
          }
          
          &.save-btn {
            background: #67c23a;
            color: white;
            border: none;
            
            &:hover {
              background: #85ce61;
            }
          }
          
          &.cancel-btn {
            background: white;
            border: 1px solid #dcdfe6;
            color: #606266;
            
            &:hover {
              color: #409eff;
              border-color: #c6e2ff;
              background-color: #ecf5ff;
            }
          }
        }
      }
    }
  }
}
</style>
