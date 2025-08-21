<template>
  <div class="message-content">
    <div class="content-editor">
      <el-input 
        v-model="messageContent" 
        type="textarea" 
        :rows="10"
        placeholder="请输入要发送的消息内容..."
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />
    </div>
    
    <div class="content-actions">
      <el-button type="primary" @click="handleSendMessage">
        {{ t("发送消息") }}
      </el-button>
      <el-button @click="handleClearContent">
        {{ t("清空内容") }}
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useTranslation } from 'i18next-vue'

const { t } = useTranslation()

// 响应式数据
const messageContent = ref('')

// 方法
const handleSendMessage = () => {
  if (!messageContent.value.trim()) {
    console.warn('消息内容不能为空')
    return
  }
  console.log('发送WebSocket消息:', messageContent.value)
  // 这里实现发送消息的逻辑
}

const handleClearContent = () => {
  messageContent.value = ''
}
</script>

<style lang="scss" scoped>
.message-content {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;

  .content-editor {
    flex: 1;
    margin-bottom: 16px;
  }

  .content-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-start;
  }
}
</style>
