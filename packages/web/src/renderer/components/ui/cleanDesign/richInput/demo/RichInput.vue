<template>
  <div class="clean-rich-input-demo" :data-theme="currentTheme">
    <div class="demo-header">
      <h3>CleanRichInput 组件演示</h3>
      <button
        class="theme-toggle"
        @click="handleToggleTheme"
        :title="currentTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
      >
        <span class="theme-icon">{{ currentTheme === 'dark' ? '☀️' : '🌙' }}</span>
      </button>
    </div>

    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>基础用法</h4>
          <p>输入 { 自动补全为 {}，再次输入 { 补全为 &#123;&#123; &#125;&#125;。匹配到 &#123;&#123;xxx&#125;&#125; 格式时自动高亮显示</p>
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
      <div class="demo-content">
        <CleanRichInput
          v-model:value="basicValue"
          :width="400"
          :height="80"
          placeholder="输入 { 试试自动补全"
          @updateValue="handleBasicUpdate"
        />
        <div v-if="basicOutput" class="output-display">
          <h5>输出内容：</h5>
          <pre>{{ basicOutput }}</pre>
        </div>
      </div>
      <div v-if="showCode1" class="code-preview">
        <div class="code-header">
          <span class="code-title">基础用法源码</span>
          <button @click="handleCopyCode(basicUsageCode)" class="copy-btn" title="复制代码">
            📋
          </button>
        </div>
        <pre class="code-block"><code>{{ basicUsageCode }}</code></pre>
      </div>
    </div>

    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>不同尺寸</h4>
          <p>通过 width 和 height 属性控制组件尺寸</p>
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
      <div class="demo-content size-demos">
        <div class="size-item">
          <label>小尺寸 (300x60)</label>
          <CleanRichInput
            v-model:value="smallValue"
            :width="300"
            :height="60"
          />
        </div>
        <div class="size-item">
          <label>中尺寸 (400x80)</label>
          <CleanRichInput
            v-model:value="mediumValue"
            :width="400"
            :height="80"
          />
        </div>
        <div class="size-item">
          <label>大尺寸 (600x120)</label>
          <CleanRichInput
            v-model:value="largeValue"
            :width="600"
            :height="120"
          />
        </div>
      </div>
      <div v-if="showCode4" class="code-preview">
        <div class="code-header">
          <span class="code-title">不同尺寸源码</span>
          <button @click="handleCopyCode(sizeUsageCode)" class="copy-btn" title="复制代码">
            📋
          </button>
        </div>
        <pre class="code-block"><code>{{ sizeUsageCode }}</code></pre>
      </div>
    </div>

    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>撤销/重做</h4>
          <p>支持历史记录的撤销和重做操作</p>
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
      <div class="demo-content">
        <div class="undo-redo-controls">
          <button @click="handleUndo" class="control-btn">↶ 撤销</button>
          <button @click="handleRedo" class="control-btn">↷ 重做</button>
        </div>
        <CleanRichInput
          ref="undoRedoInput"
          v-model:value="undoRedoValue"
          :width="500"
          :height="100"
        />
      </div>
      <div v-if="showCode5" class="code-preview">
        <div class="code-header">
          <span class="code-title">撤销/重做源码</span>
          <button @click="handleCopyCode(undoRedoCode)" class="copy-btn" title="复制代码">
            📋
          </button>
        </div>
        <pre class="code-block"><code>{{ undoRedoCode }}</code></pre>
      </div>
    </div>

    <div class="demo-section">
      <h4>API 文档</h4>
      <table class="props-table">
        <thead>
          <tr>
            <th>属性</th>
            <th>说明</th>
            <th>类型</th>
            <th>默认值</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>value</code></td>
            <td>输入框的值（支持 v-model）</td>
            <td>String</td>
            <td>''</td>
          </tr>
          <tr>
            <td><code>placeholder</code></td>
            <td>占位符文本</td>
            <td>String</td>
            <td>''</td>
          </tr>
          <tr>
            <td><code>width</code></td>
            <td>组件宽度</td>
            <td>String | Number</td>
            <td>'100%'</td>
          </tr>
          <tr>
            <td><code>height</code></td>
            <td>组件高度</td>
            <td>String | Number</td>
            <td>'100%'</td>
          </tr>
        </tbody>
      </table>

      <h4 style="margin-top: 24px;">事件</h4>
      <table class="props-table">
        <thead>
          <tr>
            <th>事件名</th>
            <th>说明</th>
            <th>参数</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>update:value</code></td>
            <td>值更新时触发（v-model）</td>
            <td>(value: string)</td>
          </tr>
          <tr>
            <td><code>updateValue</code></td>
            <td>值更新时触发，返回模板字符串</td>
            <td>(value: string)</td>
          </tr>
          <tr>
            <td><code>undo</code></td>
            <td>撤销操作时触发</td>
            <td>-</td>
          </tr>
          <tr>
            <td><code>redo</code></td>
            <td>重做操作时触发</td>
            <td>-</td>
          </tr>
        </tbody>
      </table>

      <h4 style="margin-top: 24px;">方法</h4>
      <table class="props-table">
        <thead>
          <tr>
            <th>方法名</th>
            <th>说明</th>
            <th>参数</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>undo()</code></td>
            <td>撤销上一步操作</td>
            <td>-</td>
          </tr>
          <tr>
            <td><code>redo()</code></td>
            <td>重做下一步操作</td>
            <td>-</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CleanRichInput from '../ClRichInput.vue'

const currentTheme = ref<'light' | 'dark'>('light')

const showCode1 = ref(false)
const showCode4 = ref(false)
const showCode5 = ref(false)

const basicValue = ref('API URL: {{baseUrl}}/users/{{userId}}')
const basicOutput = ref('')

const smallValue = ref('')
const mediumValue = ref('')
const largeValue = ref('')

const undoRedoValue = ref('尝试编辑此文本并使用撤销/重做')
const undoRedoInput = ref<{ undo: () => void; redo: () => void } | null>(null)

const handleToggleTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', currentTheme.value)
  localStorage.setItem('clean-rich-input-theme', currentTheme.value)
}

const handleBasicUpdate = (value: string) => {
  basicOutput.value = value
}

const handleCopyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
  } catch {
    // 复制失败
  }
}

const handleUndo = () => {
  undoRedoInput.value?.undo()
}

const handleRedo = () => {
  undoRedoInput.value?.redo()
}

onMounted(() => {
  const savedTheme = localStorage.getItem('clean-rich-input-theme') as 'light' | 'dark' || 'light'
  currentTheme.value = savedTheme
  document.documentElement.setAttribute('data-theme', savedTheme)
})

const basicUsageCode = `<template>
  <CleanRichInput
    v-model:value="value"
    :width="400"
    :height="80"
    placeholder="输入 { 试试自动补全"
    @updateValue="handleUpdate"
  />
</template>

<script setup>
import { ref } from 'vue'
import CleanRichInput from '@/components/ui/cleanDesign/richInput/ClRichInput.vue'

const value = ref('')

const handleUpdate = (templateValue) => {
  console.log('Template:', templateValue)
}
<\/script>`

const sizeUsageCode = `<template>
  <!-- 小尺寸 -->
  <CleanRichInput
    v-model:value="smallValue"
    :width="300"
    :height="60"
  />
  
  <!-- 中尺寸 -->
  <CleanRichInput
    v-model:value="mediumValue"
    :width="400"
    :height="80"
  />
  
  <!-- 大尺寸 -->
  <CleanRichInput
    v-model:value="largeValue"
    :width="600"
    :height="120"
  />
</template>`

const undoRedoCode = `<template>
  <button @click="handleUndo">撤销</button>
  <button @click="handleRedo">重做</button>
  <CleanRichInput
    ref="inputRef"
    v-model:value="value"
  />
</template>

<script setup>
import { ref } from 'vue'
import CleanRichInput from '@/components/ui/cleanDesign/richInput/ClRichInput.vue'

const value = ref('')
const inputRef = ref(null)

const handleUndo = () => {
  inputRef.value?.undo()
}

const handleRedo = () => {
  inputRef.value?.redo()
}
<\/script>`
</script>

<style lang="scss" scoped>
.clean-rich-input-demo {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  .demo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--gray-200);

    h3 {
      color: var(--gray-900);
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    .theme-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: var(--white);
      border: 1px solid var(--gray-200);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
      color: var(--gray-700);

      &:hover {
        border-color: var(--gray-300);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      }

      .theme-icon {
        font-size: 16px;
      }
    }
  }

  .demo-section {
    margin-bottom: 48px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;

      h4 {
        color: var(--gray-800);
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
        letter-spacing: -0.01em;
      }

      p {
        margin: 0;
        color: var(--gray-600);
        font-size: 14px;
        line-height: 1.5;
      }

      .code-toggle-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: var(--gray-100);
        border: 1px solid var(--gray-200);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s ease;
        font-size: 13px;
        color: var(--gray-600);
        white-space: nowrap;

        &:hover {
          background: var(--gray-100);
          border-color: var(--gray-300);
        }

        &.active {
          background: var(--theme-color);
          border-color: var(--theme-color);
          color: white;
        }

        .code-icon {
          font-size: 14px;
        }

        .code-text {
          font-weight: 500;
        }
      }
    }

    .demo-content {
      padding: 20px;
      background: var(--gray-50);
      border-radius: 8px;
      border: 1px solid var(--gray-200);

      .output-display {
        margin-top: 16px;
        padding: 12px;
        background: var(--white);
        border-radius: 6px;
        border: 1px solid var(--gray-200);

        h5 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--gray-700);
        }

        pre {
          margin: 0;
          font-family: 'SF Mono', Monaco, monospace;
          font-size: 12px;
          color: var(--gray-900);
          white-space: pre-wrap;
          word-break: break-all;
        }
      }

      &.size-demos {
        display: flex;
        flex-direction: column;
        gap: 20px;

        .size-item {
          label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 500;
            color: var(--gray-700);
          }
        }
      }

      .undo-redo-controls {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;

        .control-btn {
          padding: 8px 16px;
          background: var(--white);
          border: 1px solid var(--gray-300);
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          color: var(--gray-700);
          transition: all 0.2s ease;

          &:hover {
            background: var(--gray-100);
            border-color: var(--theme-color);
            color: var(--theme-color);
          }
        }
      }
    }
  }

  .code-preview {
    margin-top: 16px;
    border: 1px solid var(--gray-200);
    border-radius: 8px;
    overflow: hidden;
    background: var(--white);

    .code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: var(--gray-100);
      border-bottom: 1px solid var(--gray-200);

      .code-title {
        font-size: 13px;
        font-weight: 500;
        color: var(--gray-700);
      }

      .copy-btn {
        display: flex;
        align-items: center;
        padding: 4px 8px;
        background: transparent;
        border: 1px solid var(--gray-200);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s ease;
        font-size: 12px;

        &:hover {
          background: var(--gray-100);
          border-color: var(--gray-300);
        }
      }
    }

    .code-block {
      margin: 0;
      padding: 16px;
      background: var(--gray-900);
      color: var(--gray-100);
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.5;
      overflow-x: auto;

      code {
        color: inherit;
        background: transparent;
        padding: 0;
        border-radius: 0;
        font-size: inherit;
      }
    }
  }

  .props-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 16px;
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: 8px;
    overflow: hidden;

    thead {
      background: var(--gray-100);

      tr {
        th {
          padding: 12px 16px;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
          color: var(--gray-800);
          border-bottom: 1px solid var(--gray-200);
        }
      }
    }

    tbody {
      tr {
        border-bottom: 1px solid var(--gray-100);

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background: var(--gray-50);
        }

        td {
          padding: 12px 16px;
          font-size: 14px;
          color: var(--gray-700);

          code {
            padding: 2px 6px;
            background: var(--gray-100);
            border-radius: 3px;
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 12px;
            color: var(--theme-color);
          }
        }
      }
    }
  }

  &[data-theme="dark"] {
    background: var(--gray-900);

    .demo-header {
      border-color: var(--gray-700);

      h3 {
        color: var(--gray-100);
      }

      .theme-toggle {
        background: var(--gray-800);
        border-color: var(--gray-600);
        color: var(--gray-300);

        &:hover {
          border-color: var(--gray-500);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
      }
    }

    .demo-section {
      .section-header {
        h4 {
          color: var(--gray-200);
        }

        p {
          color: var(--gray-400);
        }

        .code-toggle-btn {
          background: var(--gray-800);
          border-color: var(--gray-600);
          color: var(--gray-300);

          &:hover {
            background: var(--gray-700);
            border-color: var(--gray-500);
          }

          &.active {
            background: var(--theme-color);
            border-color: var(--theme-color);
            color: white;
          }
        }
      }

      .demo-content {
        background: var(--gray-800);
        border-color: var(--gray-700);

        .output-display {
          background: var(--gray-750);
          border-color: var(--gray-700);

          h5 {
            color: var(--gray-300);
          }

          pre {
            color: var(--gray-100);
          }
        }

        .undo-redo-controls {
          .control-btn {
            background: var(--gray-750);
            border-color: var(--gray-600);
            color: var(--gray-300);

            &:hover {
              background: var(--gray-700);
              border-color: var(--theme-color);
              color: var(--theme-color);
            }
          }
        }
      }
    }

    .code-preview {
      background: var(--gray-800);
      border-color: var(--gray-700);

      .code-header {
        background: var(--gray-700);
        border-color: var(--gray-600);

        .code-title {
          color: var(--gray-300);
        }

        .copy-btn {
          border-color: var(--gray-600);
          color: var(--gray-300);

          &:hover {
            background: var(--gray-700);
            border-color: var(--gray-500);
          }
        }
      }
    }

    .props-table {
      background: var(--gray-800);
      border-color: var(--gray-700);

      thead {
        background: var(--gray-750);

        tr th {
          color: var(--gray-200);
          border-color: var(--gray-700);
        }
      }

      tbody {
        tr {
          border-color: var(--gray-700);

          &:hover {
            background: var(--gray-750);
          }

          td {
            color: var(--gray-300);

            code {
              background: var(--gray-700);
              color: var(--theme-color);
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .clean-rich-input-demo {
    padding: 16px;

    .demo-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .theme-toggle {
        align-self: flex-end;
      }
    }

    .demo-section {
      margin-bottom: 32px;

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;

        .code-toggle-btn {
          align-self: flex-end;
        }
      }
    }
  }
}
</style>
