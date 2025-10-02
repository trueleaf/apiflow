<template>
  <el-dialog 
    v-model="visible" 
    title="新增项目" 
    width="600px"
    :before-close="handleClose"
  >
    <el-form 
      ref="formRef" 
      :model="formData" 
      :rules="formRules" 
      label-width="120px"
    >
      <el-form-item label="项目名称：" prop="projectName">
        <el-input 
          v-model="formData.projectName" 
          placeholder="请输入项目名称"
          @keydown.enter="handleCreate"
        />
      </el-form-item>
      
      <el-form-item label="项目描述：" prop="description">
        <el-input 
          v-model="formData.description"
          type="textarea"
          placeholder="请输入项目描述（可选）"
          :rows="3"
          show-word-limit
          maxlength="200"
        />
      </el-form-item>
      
      <el-form-item label="选择成员或组：">
        <UserGroupSelector 
          v-model="selectedMembers"
          placeholder="输入【用户名】| 【完整手机号】 | 【组名称】"
        />
      </el-form-item>
    </el-form>
    
    <!-- 成员信息表格 -->
    <div v-if="selectedMembers.length > 0" class="members-section">
      <h4>项目成员</h4>
      <el-table :data="selectedMembers" border max-height="300px">
        <el-table-column prop="name" label="名称" align="center" />
        <el-table-column prop="type" label="类型" align="center" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.type === 'user'">用户</el-tag>
            <el-tag v-else type="success">组</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="角色(权限)" align="center" width="200">
          <template #default="{ row }">
            <el-select v-model="row.permission" size="small">
              <el-option label="只读" value="readOnly">
                <span>只读</span>
                <span class="permission-desc">(仅查看项目)</span>
              </el-option>
              <el-option label="读写" value="readAndWrite">
                <span>读写</span>
                <span class="permission-desc">(新增和编辑文档)</span>
              </el-option>
              <el-option label="管理员" value="admin">
                <span>管理员</span>
                <span class="permission-desc">(添加新成员)</span>
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100">
          <template #default="{ $index }">
            <el-button 
              type="danger" 
              size="small" 
              @click="removeMember($index)"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          type="primary" 
          :loading="loading" 
          @click="handleCreate"
        >
          创建项目
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useProjectStore } from '@/stores'
import UserGroupSelector from '@/components/common/UserGroupSelector.vue'
import type { UserOrGroup } from '@/types'

// Props
interface Props {
  modelValue: boolean
}

// Emits
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const projectStore = useProjectStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

// 显示状态
const visible = ref(false)

// 表单数据
const formData = reactive({
  projectName: '',
  description: ''
})

// 选中的成员
const selectedMembers = ref<Array<UserOrGroup & { permission: string }>>([])

// 表单验证规则
const formRules: FormRules = {
  projectName: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 1, max: 50, message: '项目名称长度在 1 到 50 个字符', trigger: 'blur' }
  ]
}

// 监听 modelValue 变化
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    resetForm()
  }
})

// 监听 visible 变化
watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 重置表单
const resetForm = () => {
  formData.projectName = ''
  formData.description = ''
  selectedMembers.value = []
  formRef.value?.clearValidate()
}

// 处理关闭
const handleClose = () => {
  visible.value = false
}

// 移除成员
const removeMember = (index: number) => {
  selectedMembers.value.splice(index, 1)
}

// 创建项目
const handleCreate = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    loading.value = true
    
    const members = selectedMembers.value.map(member => ({
      id: member.id,
      name: member.name,
      type: member.type,
      permission: member.permission
    }))
    
    const result = await projectStore.createProject({
      projectName: formData.projectName,
      description: formData.description,
      members
    })
    
    if (result.success) {
      emit('success')
      handleClose()
    } else {
      ElMessage.error(result.message || '创建项目失败')
    }
  } catch (error) {
    console.error('创建项目失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.members-section {
  margin-top: var(--spacing-xl);
}

.members-section h4 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.permission-desc {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  margin-left: var(--spacing-xs);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}
</style>