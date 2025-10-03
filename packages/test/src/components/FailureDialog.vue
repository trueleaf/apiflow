<template>
  <el-dialog
    v-model="dialogVisible"
    title="标记为失败"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form :model="formData" label-width="80px">
      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="4"
          placeholder="请输入失败原因或备注信息..."
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="图片">
        <div class="image-upload-area">
          <div class="upload-tip">
            <el-icon><Picture /></el-icon>
            <span>点击上传或按 Ctrl+V 粘贴图片（最多5张，每张不超过2MB）</span>
          </div>
          
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            :before-upload="beforeUpload"
            :on-change="handleFileChange"
          >
            <el-button type="primary" plain size="small">
              <el-icon><Plus /></el-icon>
              选择图片
            </el-button>
          </el-upload>
          
          <!-- 图片预览列表 -->
          <div v-if="formData.images.length > 0" class="image-list">
            <div
              v-for="(image, index) in formData.images"
              :key="index"
              class="image-item"
            >
              <el-image
                :src="image"
                fit="cover"
                :preview-src-list="formData.images"
                :initial-index="index"
                class="preview-image"
              />
              <div class="image-actions">
                <el-icon class="delete-icon" @click="removeImage(index)">
                  <Close />
                </el-icon>
              </div>
            </div>
          </div>
        </div>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture, Plus, Close } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'

interface Props {
  visible: boolean
  remark?: string
  images?: string[]
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', data: { remark: string; images: string[] }): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  remark: '',
  images: () => []
})

const emit = defineEmits<Emits>()

const dialogVisible = ref(false)
const uploadRef = ref()

const formData = reactive({
  remark: '',
  images: [] as string[]
})

// 图片数量限制
const MAX_IMAGES = 5
// 单张图片大小限制（2MB）
const MAX_SIZE = 2 * 1024 * 1024

// 监听 visible 变化
watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val) {
    formData.remark = props.remark || ''
    formData.images = props.images ? [...props.images] : []
  }
})

// 监听 dialogVisible 变化
watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

// 文件上传前的检查
const beforeUpload = (file: File) => {
  if (formData.images.length >= MAX_IMAGES) {
    ElMessage.warning(`最多只能上传${MAX_IMAGES}张图片`)
    return false
  }
  
  if (file.size > MAX_SIZE) {
    ElMessage.warning('图片大小不能超过2MB')
    return false
  }
  
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('只能上传图片文件')
    return false
  }
  
  return true
}

// 处理文件选择
const handleFileChange = (uploadFile: UploadFile) => {
  const file = uploadFile.raw
  if (!file) return
  
  // 检查限制
  if (!beforeUpload(file)) return
  
  // 转换为 base64
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target?.result as string
    formData.images.push(base64)
  }
  reader.readAsDataURL(file)
}

// 移除图片
const removeImage = (index: number) => {
  formData.images.splice(index, 1)
}

// 处理粘贴事件
const handlePaste = (e: ClipboardEvent) => {
  if (!dialogVisible.value) return
  
  const items = e.clipboardData?.items
  if (!items) return
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    
    if (item.type.indexOf('image') !== -1) {
      e.preventDefault()
      
      if (formData.images.length >= MAX_IMAGES) {
        ElMessage.warning(`最多只能上传${MAX_IMAGES}张图片`)
        return
      }
      
      const file = item.getAsFile()
      if (!file) continue
      
      if (file.size > MAX_SIZE) {
        ElMessage.warning('图片大小不能超过2MB')
        continue
      }
      
      // 转换为 base64
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        formData.images.push(base64)
        ElMessage.success('图片粘贴成功')
      }
      reader.readAsDataURL(file)
    }
  }
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
}

// 确认
const handleConfirm = () => {
  emit('confirm', {
    remark: formData.remark,
    images: formData.images
  })
  handleClose()
}

// 挂载时添加粘贴事件监听
onMounted(() => {
  document.addEventListener('paste', handlePaste)
})

// 卸载时移除粘贴事件监听
onBeforeUnmount(() => {
  document.removeEventListener('paste', handlePaste)
})
</script>

<style scoped>
.image-upload-area {
  width: 100%;
}

.upload-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 12px;
  color: #909399;
  font-size: 13px;
}

.upload-tip .el-icon {
  font-size: 18px;
}

.image-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
}

.preview-image {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.image-actions {
  position: absolute;
  top: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 0 0 0 4px;
  padding: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .image-actions {
  opacity: 1;
}

.delete-icon {
  color: #fff;
  font-size: 16px;
  cursor: pointer;
}

.delete-icon:hover {
  color: #f56c6c;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
