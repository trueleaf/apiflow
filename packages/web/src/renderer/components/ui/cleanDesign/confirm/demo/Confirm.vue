<template>
  <div class="confirm-demo" :data-theme="currentTheme">
    <div class="demo-header">
      <h3>Confirm 确认对话框演示</h3>
      <button
        class="theme-toggle"
        @click="toggleTheme"
        :title="currentTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
      >
        <span class="theme-icon">{{ currentTheme === 'dark' ? '☀️' : '🌙' }}</span>
      </button>
    </div>
    <div class="demo-description">
      <p>VSCode 风格的确认对话框组件，支持命令式调用、Promise 异步确认、多种类型图标和可选复选框</p>
    </div>
    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>基础用法</h4>
          <p>使用 showConfirm 函数调用确认对话框，返回 Promise 用于异步处理</p>
        </div>
        <button
          class="code-toggle-btn"
          @click="showCode1 = !showCode1"
          :class="{ active: showCode1 }"
          title="查看源码"
        >
          <span class="code-icon">{{ showCode1 ? '📖' : '💻' }}</span>
          <span class="code-text">{{ showCode1 ? '隐藏代码' : '查看代码' }}</span>
        </button>
      </div>
      <button class="demo-btn" @click="handleBasicConfirm">打开基础确认框</button>
      <div v-if="lastResult" class="result-display">
        <span class="result-label">用户操作：</span>
        <span :class="['result-value', lastResult.confirmed ? 'confirmed' : 'cancelled']">
          {{ lastResult.confirmed ? '已确认' : '已取消' }}
        </span>
      </div>
      <div v-if="showCode1" class="code-preview">
        <div class="code-header">
          <span class="code-title">基础用法源码</span>
          <button @click="copyCode(basicUsageCode)" class="copy-btn" title="复制代码">
            📋
          </button>
        </div>
        <pre class="code-block"><code>{{ basicUsageCode }}</code></pre>
      </div>
    </div>
    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>不同类型</h4>
          <p>支持 info、warning、error、success 四种类型，显示不同的图标和提示</p>
        </div>
        <button
          class="code-toggle-btn"
          @click="showCode2 = !showCode2"
          :class="{ active: showCode2 }"
          title="查看源码"
        >
          <span class="code-icon">{{ showCode2 ? '📖' : '💻' }}</span>
          <span class="code-text">{{ showCode2 ? '隐藏代码' : '查看代码' }}</span>
        </button>
      </div>
      <div class="demo-buttons">
        <button class="demo-btn demo-btn-info" @click="handleInfoConfirm">信息提示</button>
        <button class="demo-btn demo-btn-warning" @click="handleWarningConfirm">警告提示</button>
        <button class="demo-btn demo-btn-error" @click="handleErrorConfirm">错误提示</button>
        <button class="demo-btn demo-btn-success" @click="handleSuccessConfirm">成功提示</button>
      </div>
      <div v-if="showCode2" class="code-preview">
        <div class="code-header">
          <span class="code-title">不同类型源码</span>
          <button @click="copyCode(typesCode)" class="copy-btn" title="复制代码">
            📋
          </button>
        </div>
        <pre class="code-block"><code>{{ typesCode }}</code></pre>
      </div>
    </div>
    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>带复选框</h4>
          <p>添加"不再提示"复选框，用户可以选择以后不再显示该确认框</p>
        </div>
        <button
          class="code-toggle-btn"
          @click="showCode3 = !showCode3"
          :class="{ active: showCode3 }"
          title="查看源码"
        >
          <span class="code-icon">{{ showCode3 ? '📖' : '💻' }}</span>
          <span class="code-text">{{ showCode3 ? '隐藏代码' : '查看代码' }}</span>
        </button>
      </div>
      <button class="demo-btn" @click="handleCheckboxConfirm">打开带复选框的确认框</button>
      <div v-if="checkboxResult" class="result-display">
        <span class="result-label">用户选择：</span>
        <span :class="['result-value', checkboxResult.confirmed ? 'confirmed' : 'cancelled']">
          {{ checkboxResult.confirmed ? '已确认' : '已取消' }}
        </span>
        <span v-if="checkboxResult.checked" class="checkbox-status">（已勾选"不再提示"）</span>
      </div>
      <div v-if="showCode3" class="code-preview">
        <div class="code-header">
          <span class="code-title">带复选框源码</span>
          <button @click="copyCode(checkboxCode)" class="copy-btn" title="复制代码">
            📋
          </button>
        </div>
        <pre class="code-block"><code>{{ checkboxCode }}</code></pre>
      </div>
    </div>
    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>自定义文本</h4>
          <p>自定义标题、内容和按钮文字</p>
        </div>
        <button
          class="code-toggle-btn"
          @click="showCode4 = !showCode4"
          :class="{ active: showCode4 }"
          title="查看源码"
        >
          <span class="code-icon">{{ showCode4 ? '📖' : '💻' }}</span>
          <span class="code-text">{{ showCode4 ? '隐藏代码' : '查看代码' }}</span>
        </button>
      </div>
      <button class="demo-btn" @click="handleCustomTextConfirm">打开自定义文本确认框</button>
      <div v-if="showCode4" class="code-preview">
        <div class="code-header">
          <span class="code-title">自定义文本源码</span>
          <button @click="copyCode(customTextCode)" class="copy-btn" title="复制代码">
            📋
          </button>
        </div>
        <pre class="code-block"><code>{{ customTextCode }}</code></pre>
      </div>
    </div>
    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>多实例支持</h4>
          <p>支持同时打开多个确认框，自动管理层级关系</p>
        </div>
        <button
          class="code-toggle-btn"
          @click="showCode5 = !showCode5"
          :class="{ active: showCode5 }"
          title="查看源码"
        >
          <span class="code-icon">{{ showCode5 ? '📖' : '💻' }}</span>
          <span class="code-text">{{ showCode5 ? '隐藏代码' : '查看代码' }}</span>
        </button>
      </div>
      <button class="demo-btn" @click="handleMultipleConfirm">连续打开 3 个确认框</button>
      <div v-if="showCode5" class="code-preview">
        <div class="code-header">
          <span class="code-title">多实例源码</span>
          <button @click="copyCode(multipleCode)" class="copy-btn" title="复制代码">
            📋
          </button>
        </div>
        <pre class="code-block"><code>{{ multipleCode }}</code></pre>
      </div>
    </div>
    <div class="demo-section">
      <h4>API 参数</h4>
      <table class="props-table">
        <thead>
          <tr>
            <th>参数</th>
            <th>说明</th>
            <th>类型</th>
            <th>默认值</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>title</code></td>
            <td>对话框标题</td>
            <td>string</td>
            <td>-</td>
          </tr>
          <tr>
            <td><code>content</code></td>
            <td>对话框内容（必填）</td>
            <td>string</td>
            <td>-</td>
          </tr>
          <tr>
            <td><code>type</code></td>
            <td>类型（影响图标）</td>
            <td>'info' | 'warning' | 'error' | 'success'</td>
            <td>'info'</td>
          </tr>
          <tr>
            <td><code>showCheckbox</code></td>
            <td>是否显示复选框</td>
            <td>boolean</td>
            <td>false</td>
          </tr>
          <tr>
            <td><code>checkboxText</code></td>
            <td>复选框文本</td>
            <td>string</td>
            <td>'不再提示'</td>
          </tr>
          <tr>
            <td><code>confirmButtonText</code></td>
            <td>确认按钮文本</td>
            <td>string</td>
            <td>'确定'</td>
          </tr>
          <tr>
            <td><code>cancelButtonText</code></td>
            <td>取消按钮文本</td>
            <td>string</td>
            <td>'取消'</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="demo-section">
      <h4>返回值</h4>
      <table class="props-table">
        <thead>
          <tr>
            <th>字段</th>
            <th>说明</th>
            <th>类型</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>confirmed</code></td>
            <td>用户是否确认（true=确认，false=取消）</td>
            <td>boolean</td>
          </tr>
          <tr>
            <td><code>checked</code></td>
            <td>复选框是否被勾选</td>
            <td>boolean</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="demo-section">
      <h4>特性说明</h4>
      <ul class="feature-list">
        <li>✓ VSCode 风格设计，自动适配亮色/暗色主题</li>
        <li>✓ Promise 异步调用，支持 async/await 语法</li>
        <li>✓ 多实例支持，自动管理 zIndex 层级</li>
        <li>✓ 四种类型图标（info/warning/error/success）</li>
        <li>✓ 可选的"不再提示"复选框</li>
        <li>✓ 完整的国际化支持（中英文）</li>
        <li>✓ 流畅的动画效果（淡入淡出 + 缩放）</li>
        <li>✓ 点击遮罩关闭</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showConfirm } from '../confirm'
import type { ConfirmResult } from '@src/types/components/components'

const currentTheme = ref<'light' | 'dark'>('light')
const showCode1 = ref(false)
const showCode2 = ref(false)
const showCode3 = ref(false)
const showCode4 = ref(false)
const showCode5 = ref(false)
const lastResult = ref<ConfirmResult | null>(null)
const checkboxResult = ref<ConfirmResult | null>(null)
const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', currentTheme.value)
  localStorage.setItem('confirm-demo-theme', currentTheme.value)
}
const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    ElMessage.success('代码已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}
const handleBasicConfirm = async () => {
  const result = await showConfirm({
    content: '确定要执行此操作吗？',
  })
  lastResult.value = result
}
const handleInfoConfirm = async () => {
  await showConfirm({
    title: '信息提示',
    content: '这是一个信息提示对话框，用于向用户展示重要信息。',
    type: 'info',
  })
}
const handleWarningConfirm = async () => {
  await showConfirm({
    title: '警告提示',
    content: '此操作可能会影响系统稳定性，请谨慎操作！',
    type: 'warning',
  })
}
const handleErrorConfirm = async () => {
  await showConfirm({
    title: '错误提示',
    content: '检测到严重错误，是否继续执行？继续可能导致数据丢失。',
    type: 'error',
  })
}
const handleSuccessConfirm = async () => {
  await showConfirm({
    title: '操作成功',
    content: '操作已成功完成，是否查看详情？',
    type: 'success',
  })
}
const handleCheckboxConfirm = async () => {
  const result = await showConfirm({
    title: '删除确认',
    content: '此操作将永久删除该文件，是否继续？',
    type: 'warning',
    showCheckbox: true,
    checkboxText: '不再提示',
  })
  checkboxResult.value = result
  if (result.confirmed && result.checked) {
  }
}
const handleCustomTextConfirm = async () => {
  await showConfirm({
    title: '退出编辑',
    content: '您有未保存的更改，确定要退出吗？',
    type: 'warning',
    confirmButtonText: '放弃更改',
    cancelButtonText: '继续编辑',
  })
}
const handleMultipleConfirm = () => {
  showConfirm({
    title: '第一个确认框',
    content: '这是第一个确认框',
    type: 'info',
  })
  setTimeout(() => {
    showConfirm({
      title: '第二个确认框',
      content: '这是第二个确认框，zIndex 自动递增',
      type: 'warning',
    })
  }, 200)
  setTimeout(() => {
    showConfirm({
      title: '第三个确认框',
      content: '这是第三个确认框，支持同时显示多个',
      type: 'success',
    })
  }, 400)
}
onMounted(() => {
  const savedTheme = localStorage.getItem('confirm-demo-theme') as 'light' | 'dark' || 'light'
  currentTheme.value = savedTheme
  document.documentElement.setAttribute('data-theme', savedTheme)
})
const basicUsageCode = `import { showConfirm } from '@/components/ui/cleanDesign/confirm'

const handleConfirm = async () => {
  const result = await showConfirm({
    content: '确定要执行此操作吗？',
  })

  if (result.confirmed) {
    console.log('用户确认了操作')
  } else {
    console.log('用户取消了操作')
  }
}`
const typesCode = `// 信息提示
await showConfirm({
  title: '信息提示',
  content: '这是一个信息提示对话框',
  type: 'info',
})

// 警告提示
await showConfirm({
  title: '警告提示',
  content: '此操作可能会影响系统稳定性',
  type: 'warning',
})

// 错误提示
await showConfirm({
  title: '错误提示',
  content: '检测到严重错误，是否继续？',
  type: 'error',
})

// 成功提示
await showConfirm({
  title: '操作成功',
  content: '操作已成功完成',
  type: 'success',
})`
const checkboxCode = `const result = await showConfirm({
  title: '删除确认',
  content: '此操作将永久删除该文件，是否继续？',
  type: 'warning',
  showCheckbox: true,
  checkboxText: '不再提示',
})

if (result.confirmed && result.checked) {
  localStorage.setItem('hideDeleteConfirm', 'true')
  console.log('用户选择不再提示')
}`
const customTextCode = `await showConfirm({
  title: '退出编辑',
  content: '您有未保存的更改，确定要退出吗？',
  type: 'warning',
  confirmButtonText: '放弃更改',
  cancelButtonText: '继续编辑',
})`
const multipleCode = `showConfirm({
  title: '第一个确认框',
  content: '这是第一个确认框',
  type: 'info',
})

setTimeout(() => {
  showConfirm({
    title: '第二个确认框',
    content: 'zIndex 自动递增',
    type: 'warning',
  })
}, 200)

setTimeout(() => {
  showConfirm({
    title: '第三个确认框',
    content: '支持同时显示多个',
    type: 'success',
  })
}, 400)`
</script>

<style lang="scss" scoped>
.confirm-demo {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  .demo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-base);
    h3 {
      color: var(--text-primary);
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .theme-toggle {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-base);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      &:hover {
        border-color: var(--border-dark);
      }
      .theme-icon {
        font-size: 16px;
      }
    }
  }
  .demo-description {
    margin-bottom: 32px;
    p {
      margin: 0;
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.6;
    }
  }
  .demo-section {
    margin-bottom: 48px;
    padding: 20px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-base);
    border-radius: 8px;
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      h4 {
        color: var(--text-primary);
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
      }
      p {
        margin: 0;
        color: var(--text-secondary);
        font-size: 14px;
        line-height: 1.5;
      }
      .code-toggle-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: var(--bg-primary);
        border: 1px solid var(--border-base);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s ease;
        font-size: 13px;
        color: var(--text-secondary);
        &:hover {
          border-color: var(--border-dark);
        }
        &.active {
          background: var(--el-color-primary);
          border-color: var(--el-color-primary);
          color: white;
        }
      }
    }
    h4 {
      color: var(--text-primary);
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
    }
  }
  .demo-btn {
    padding: 8px 16px;
    background: var(--el-color-primary);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
    &:hover {
      opacity: 0.9;
    }
    &.demo-btn-info {
      background: var(--el-color-info);
    }
    &.demo-btn-warning {
      background: var(--el-color-warning);
    }
    &.demo-btn-error {
      background: var(--el-color-danger);
    }
    &.demo-btn-success {
      background: var(--el-color-success);
    }
  }
  .demo-buttons {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .result-display {
    margin-top: 12px;
    padding: 12px;
    background: var(--bg-primary);
    border: 1px solid var(--border-base);
    border-radius: 6px;
    font-size: 14px;
    .result-label {
      color: var(--text-secondary);
      margin-right: 8px;
    }
    .result-value {
      font-weight: 500;
      &.confirmed {
        color: var(--el-color-success);
      }
      &.cancelled {
        color: var(--el-color-info);
      }
    }
    .checkbox-status {
      color: var(--el-color-warning);
      margin-left: 8px;
    }
  }
  .code-preview {
    margin-top: 16px;
    border: 1px solid var(--border-base);
    border-radius: 8px;
    overflow: hidden;
    background: var(--bg-primary);
    .code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-base);
      .code-title {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-primary);
      }
      .copy-btn {
        padding: 4px 8px;
        background: transparent;
        border: 1px solid var(--border-base);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s ease;
        &:hover {
          border-color: var(--border-dark);
        }
      }
    }
    .code-block {
      margin: 0;
      padding: 16px;
      background: var(--bg-tertiary);
      color: var(--text-primary);
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.5;
      overflow-x: auto;
    }
  }
  .props-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--bg-primary);
    border: 1px solid var(--border-base);
    border-radius: 8px;
    overflow: hidden;
    thead {
      background: var(--bg-secondary);
      tr th {
        padding: 12px 16px;
        text-align: left;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
        border-bottom: 1px solid var(--border-base);
      }
    }
    tbody {
      tr {
        border-bottom: 1px solid var(--border-light);
        &:last-child {
          border-bottom: none;
        }
        &:hover {
          background: var(--bg-hover);
        }
        td {
          padding: 12px 16px;
          font-size: 14px;
          color: var(--text-primary);
          code {
            padding: 2px 6px;
            background: var(--bg-secondary);
            border-radius: 3px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 12px;
            color: var(--el-color-primary);
          }
        }
      }
    }
  }
  .feature-list {
    margin: 0;
    padding-left: 20px;
    li {
      margin-bottom: 8px;
      font-size: 14px;
      color: var(--text-primary);
      line-height: 1.6;
    }
  }
}
</style>
