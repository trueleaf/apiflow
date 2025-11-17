<template>
  <div class="cl-rich-input-demo" :data-theme="currentTheme">
    <div class="demo-header">
      <h3>ClRichInput 组件演示</h3>
      <button
        class="theme-toggle"
        @click="toggleTheme"
        :title="currentTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
      >
        <span class="theme-icon">{{ currentTheme === 'dark' ? '☀️' : '🌙' }}</span>
      </button>
    </div>

    <div class="demo-description">
      <p>基于 Tiptap 的极简纯文本输入框，无边框、支持换行和撤销功能</p>
    </div>

    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>基础用法</h4>
          <p>默认的纯文本输入框</p>
        </div>
      </div>
      <div class="demo-container">
        <div class="input-wrapper">
          <ClRichInput
            v-model="text1"
            placeholder="请输入内容..."
          />
        </div>
        <div class="output">
          <strong>输出内容：</strong>
          <pre>{{ text1 }}</pre>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>自定义高度</h4>
          <p>设置最小高度和最大高度，内容超出时显示滚动条</p>
        </div>
      </div>
      <div class="demo-container">
        <div class="input-wrapper">
          <ClRichInput
            v-model="text2"
            placeholder="最小高度60px，最大高度150px"
            :min-height="60"
            :max-height="150"
          />
        </div>
        <div class="output">
          <strong>输出内容：</strong>
          <pre>{{ text2 }}</pre>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>禁用状态</h4>
          <p>禁用输入框，不可编辑</p>
        </div>
      </div>
      <div class="demo-container">
        <div class="input-wrapper">
          <ClRichInput
            v-model="text3"
            placeholder="禁用状态"
            disabled
          />
        </div>
      </div>
    </div>

    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>只读状态</h4>
          <p>只读模式，可选择但不可编辑</p>
        </div>
      </div>
      <div class="demo-container">
        <div class="input-wrapper">
          <ClRichInput
            v-model="text4"
            placeholder="只读状态"
            readonly
          />
        </div>
      </div>
    </div>

    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>事件监听</h4>
          <p>监听 focus 和 blur 事件</p>
        </div>
      </div>
      <div class="demo-container">
        <div class="input-wrapper">
          <ClRichInput
            v-model="text5"
            placeholder="点击输入框查看事件触发..."
            @focus="handleFocus"
            @blur="handleBlur"
          />
        </div>
        <div class="event-log">
          <strong>事件日志：</strong>
          <div v-for="(log, index) in eventLogs" :key="index" class="log-item">
            {{ log }}
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h4>Props 参数</h4>
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
            <td><code>modelValue</code></td>
            <td>绑定值</td>
            <td>string</td>
            <td>''</td>
          </tr>
          <tr>
            <td><code>placeholder</code></td>
            <td>占位符文本</td>
            <td>string</td>
            <td>''</td>
          </tr>
          <tr>
            <td><code>disabled</code></td>
            <td>是否禁用</td>
            <td>boolean</td>
            <td>false</td>
          </tr>
          <tr>
            <td><code>readonly</code></td>
            <td>是否只读</td>
            <td>boolean</td>
            <td>false</td>
          </tr>
          <tr>
            <td><code>minHeight</code></td>
            <td>最小高度</td>
            <td>number</td>
            <td>32</td>
          </tr>
          <tr>
            <td><code>maxHeight</code></td>
            <td>最大高度</td>
            <td>number</td>
            <td>300</td>
          </tr>
          <tr>
            <td><code>class</code></td>
            <td>自定义类名</td>
            <td>string</td>
            <td>''</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="demo-section">
      <h4>Events 事件</h4>
      <table class="props-table">
        <thead>
          <tr>
            <th>事件名</th>
            <th>说明</th>
            <th>回调参数</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>update:modelValue</code></td>
            <td>内容变化时触发</td>
            <td>(value: string)</td>
          </tr>
          <tr>
            <td><code>focus</code></td>
            <td>获得焦点时触发</td>
            <td>-</td>
          </tr>
          <tr>
            <td><code>blur</code></td>
            <td>失去焦点时触发</td>
            <td>-</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="demo-section">
      <h4>特性说明</h4>
      <ul class="feature-list">
        <li>✓ 基于 Tiptap 3.3.0 富文本编辑器</li>
        <li>✓ 极简无边框设计</li>
        <li>✓ 支持 Enter 键换行</li>
        <li>✓ 支持 Ctrl+Z / Cmd+Z 撤销和 Ctrl+Shift+Z / Cmd+Shift+Z 重做</li>
        <li>✓ 自动适配亮色/暗色主题</li>
        <li>✓ 默认高度 32px，内容超出自动撑开</li>
        <li>✓ 支持最大高度限制和滚动条</li>
        <li>✓ 完整的 TypeScript 类型定义</li>
        <li>✓ 支持禁用和只读状态</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ClRichInput from '../ClRichInput.vue'

const currentTheme = ref<'light' | 'dark'>('light')

const text1 = ref('')
const text2 = ref('这是一段示例文本。\n可以尝试输入更多内容来测试自动撑开和滚动条效果。\n继续输入更多内容...')
const text3 = ref('这是禁用状态的文本')
const text4 = ref('这是只读状态的文本，可以选择但不能编辑')
const text5 = ref('')

const eventLogs = ref<string[]>([])

const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', currentTheme.value)
  localStorage.setItem('cl-rich-input-theme', currentTheme.value)
}

const handleFocus = () => {
  const timestamp = new Date().toLocaleTimeString()
  eventLogs.value.unshift(`[${timestamp}] 获得焦点`)
  if (eventLogs.value.length > 5) {
    eventLogs.value.pop()
  }
}

const handleBlur = () => {
  const timestamp = new Date().toLocaleTimeString()
  eventLogs.value.unshift(`[${timestamp}] 失去焦点`)
  if (eventLogs.value.length > 5) {
    eventLogs.value.pop()
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('cl-rich-input-theme') as 'light' | 'dark' || 'light'
  currentTheme.value = savedTheme
  document.documentElement.setAttribute('data-theme', savedTheme)
})
</script>

<style scoped lang="scss">
.cl-rich-input-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background: var(--white);
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  .demo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
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
        box-shadow: 0 1px 3px var(--bg-black-08);
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
      color: var(--gray-600);
      line-height: 1.6;
    }
  }

  .demo-section {
    margin-bottom: 48px;
    padding: 24px;
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: 8px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;

      h4 {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--gray-900);
      }

      p {
        margin: 0;
        font-size: 14px;
        color: var(--gray-600);
      }
    }

    .demo-container {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .input-wrapper {
        padding: 12px;
        background: var(--gray-50);
        border: 1px solid var(--gray-200);
        border-radius: 6px;
      }

      .output {
        padding: 12px;
        background: var(--gray-900);
        border-radius: 6px;
        color: var(--gray-100);
        font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        font-size: 13px;

        strong {
          display: block;
          margin-bottom: 8px;
          color: var(--gray-300);
        }

        pre {
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
        }
      }

      .event-log {
        padding: 12px;
        background: var(--gray-50);
        border: 1px solid var(--gray-200);
        border-radius: 6px;

        strong {
          display: block;
          margin-bottom: 8px;
          color: var(--gray-700);
        }

        .log-item {
          padding: 4px 0;
          font-size: 13px;
          color: var(--gray-600);
          font-family: 'SF Mono', Monaco, monospace;
        }
      }
    }
  }

  .props-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: 8px;
    overflow: hidden;

    thead {
      background: var(--gray-100);

      tr th {
        padding: 12px 16px;
        text-align: left;
        font-size: 14px;
        font-weight: 600;
        color: var(--gray-800);
        border-bottom: 1px solid var(--gray-200);
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

  .feature-list {
    margin: 0;
    padding-left: 20px;

    li {
      margin-bottom: 8px;
      font-size: 14px;
      color: var(--gray-700);
      line-height: 1.6;
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
          box-shadow: 0 1px 3px var(--bg-black-3);
        }
      }
    }

    .demo-description p {
      color: var(--gray-400);
    }

    .demo-section {
      background: var(--gray-800);
      border-color: var(--gray-700);

      .section-header {
        h4 {
          color: var(--gray-200);
        }

        p {
          color: var(--gray-400);
        }
      }

      .demo-container {
        .input-wrapper {
          background: var(--gray-750);
          border-color: var(--gray-600);
        }

        .output {
          background: var(--black);
          border-color: var(--gray-700);

          strong {
            color: var(--gray-400);
          }
        }

        .event-log {
          background: var(--gray-750);
          border-color: var(--gray-600);

          strong {
            color: var(--gray-300);
          }

          .log-item {
            color: var(--gray-400);
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

    .feature-list li {
      color: var(--gray-300);
    }
  }
}

@media (max-width: 768px) {
  .cl-rich-input-demo {
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
      padding: 16px;
      margin-bottom: 32px;
    }

    .props-table {
      font-size: 12px;

      thead tr th,
      tbody tr td {
        padding: 8px 12px;
      }
    }
  }
}
</style>
