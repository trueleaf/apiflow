<template>
  <div class="code-editor-demo">
    <div class="demo-header">
      <h3>{{ $t('CodeEditor 组件演示') }}</h3>
    </div>
    <div class="demo-description">
      <p>{{ $t('基于 Monaco Editor 的代码编辑器组件，支持多种编程语言、代码高亮、自动补全、主题切换等功能') }}</p>
    </div>
    <div class="demo-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="demo-content">
      <div v-show="activeTab === 'basic'" class="demo-section">
        <div class="section-header">
          <div>
            <h4>{{ $t('基础用法') }}</h4>
            <p>{{ $t('支持 JavaScript 和 TypeScript 语言') }}</p>
          </div>
          <button
            class="code-toggle-btn"
            @click="showCode1 = !showCode1"
            :class="{ active: showCode1 }"
            :title="$t('查看源码')"
          >
            <span class="code-icon">{{ showCode1 ? '📖' : '💻' }}</span>
            <span class="code-text">{{ showCode1 ? $t('隐藏代码') : $t('查看代码') }}</span>
          </button>
        </div>
        <div v-if="isEditorReady" class="editor-wrapper">
          <CodeEditor
            v-model="code1"
            language="javascript"
            :auto-height="true"
            :min-height="150"
            :max-height="300"
          />
        </div>
        <div v-else class="loading-placeholder">{{ $t('编辑器加载中...') }}</div>
        <div v-if="showCode1" class="code-preview">
          <pre class="code-block">{{ basicUsageCode }}</pre>
        </div>
      </div>
      <div v-show="activeTab === 'typescript'" class="demo-section">
        <div class="section-header">
          <div>
            <h4>{{ $t('TypeScript 支持') }}</h4>
            <p>{{ $t('切换到 TypeScript 语言模式') }}</p>
          </div>
          <button
            class="code-toggle-btn"
            @click="showCode2 = !showCode2"
            :class="{ active: showCode2 }"
            :title="$t('查看源码')"
          >
            <span class="code-icon">{{ showCode2 ? '📖' : '💻' }}</span>
            <span class="code-text">{{ showCode2 ? $t('隐藏代码') : $t('查看代码') }}</span>
          </button>
        </div>
        <div v-if="activeTab === 'typescript' && isEditorReady" class="editor-wrapper">
          <CodeEditor
            v-model="code2"
            language="typescript"
            :auto-height="true"
            :min-height="150"
            :max-height="300"
          />
        </div>
        <div v-if="showCode2" class="code-preview">
          <pre class="code-block">{{ typescriptCode }}</pre>
        </div>
      </div>
      <div v-show="activeTab === 'readonly'" class="demo-section">
        <div class="section-header">
          <div>
            <h4>{{ $t('只读模式') }}</h4>
            <p>{{ $t('禁止编辑，仅用于展示代码') }}</p>
          </div>
          <button
            class="code-toggle-btn"
            @click="showCode3 = !showCode3"
            :class="{ active: showCode3 }"
            :title="$t('查看源码')"
          >
            <span class="code-icon">{{ showCode3 ? '📖' : '💻' }}</span>
            <span class="code-text">{{ showCode3 ? $t('隐藏代码') : $t('查看代码') }}</span>
          </button>
        </div>
        <div v-if="activeTab === 'readonly' && isEditorReady" class="editor-wrapper">
          <CodeEditor
            v-model="code3"
            language="javascript"
            :read-only="true"
            :auto-height="true"
            :min-height="120"
            :max-height="250"
          />
        </div>
        <div v-if="showCode3" class="code-preview">
          <pre class="code-block">{{ readOnlyCode }}</pre>
        </div>
      </div>
      <div v-show="activeTab === 'format'" class="demo-section">
        <div class="section-header">
          <div>
            <h4>{{ $t('带格式化按钮') }}</h4>
            <p>{{ $t('显示格式化按钮，一键格式化代码') }}</p>
          </div>
          <button
            class="code-toggle-btn"
            @click="showCode4 = !showCode4"
            :class="{ active: showCode4 }"
            :title="$t('查看源码')"
          >
            <span class="code-icon">{{ showCode4 ? '📖' : '💻' }}</span>
            <span class="code-text">{{ showCode4 ? $t('隐藏代码') : $t('查看代码') }}</span>
          </button>
        </div>
        <div v-if="activeTab === 'format' && isEditorReady" class="editor-wrapper">
          <CodeEditor
            v-model="code4"
            language="javascript"
            :show-format-button="true"
            :auto-height="true"
            :min-height="150"
            :max-height="300"
          />
        </div>
        <div v-if="showCode4" class="code-preview">
          <pre class="code-block">{{ formatButtonCode }}</pre>
        </div>
      </div>
      <div v-show="activeTab === 'fixed'" class="demo-section">
        <div class="section-header">
          <div>
            <h4>{{ $t('固定高度') }}</h4>
            <p>{{ $t('不使用自动高度，设置固定容器高度') }}</p>
          </div>
          <button
            class="code-toggle-btn"
            @click="showCode5 = !showCode5"
            :class="{ active: showCode5 }"
            :title="$t('查看源码')"
          >
            <span class="code-icon">{{ showCode5 ? '📖' : '💻' }}</span>
            <span class="code-text">{{ showCode5 ? $t('隐藏代码') : $t('查看代码') }}</span>
          </button>
        </div>
        <div v-if="activeTab === 'fixed' && isEditorReady" class="editor-wrapper" style="height: 200px;">
          <CodeEditor
            v-model="code5"
            language="javascript"
            :auto-height="false"
          />
        </div>
        <div v-if="showCode5" class="code-preview">
          <pre class="code-block">{{ fixedHeightCode }}</pre>
        </div>
      </div>
      <div v-show="activeTab === 'placeholder'" class="demo-section">
        <div class="section-header">
          <div>
            <h4>{{ $t('带占位符') }}</h4>
            <p>{{ $t('编辑器为空时显示占位符文本') }}</p>
          </div>
          <button
            class="code-toggle-btn"
            @click="showCode6 = !showCode6"
            :class="{ active: showCode6 }"
            :title="$t('查看源码')"
          >
            <span class="code-icon">{{ showCode6 ? '📖' : '💻' }}</span>
            <span class="code-text">{{ showCode6 ? $t('隐藏代码') : $t('查看代码') }}</span>
          </button>
        </div>
        <div v-if="activeTab === 'placeholder' && isEditorReady" class="editor-wrapper">
          <CodeEditor
            v-model="code6"
            language="javascript"
            :placeholder="$t('请输入 JavaScript 代码...')"
            :auto-height="true"
            :min-height="120"
            :max-height="250"
          />
        </div>
        <div v-if="showCode6" class="code-preview">
          <pre class="code-block">{{ placeholderCode }}</pre>
        </div>
      </div>
    </div>
    <div class="api-section">
      <h4>{{ $t('Props 属性') }}</h4>
      <table class="api-table">
        <thead>
          <tr>
            <th>{{ $t('属性名') }}</th>
            <th>{{ $t('说明') }}</th>
            <th>{{ $t('类型') }}</th>
            <th>{{ $t('默认值') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>modelValue</code></td>
            <td>{{ $t('编辑器内容') }}</td>
            <td>string</td>
            <td>''</td>
          </tr>
          <tr>
            <td><code>language</code></td>
            <td>{{ $t('编程语言') }}</td>
            <td>'javascript' | 'typescript'</td>
            <td>'javascript'</td>
          </tr>
          <tr>
            <td><code>readOnly</code></td>
            <td>{{ $t('是否只读') }}</td>
            <td>boolean</td>
            <td>false</td>
          </tr>
          <tr>
            <td><code>autoHeight</code></td>
            <td>{{ $t('是否自动高度') }}</td>
            <td>boolean</td>
            <td>false</td>
          </tr>
          <tr>
            <td><code>minHeight</code></td>
            <td>{{ $t('最小高度') }}</td>
            <td>string | number</td>
            <td>'100px'</td>
          </tr>
          <tr>
            <td><code>maxHeight</code></td>
            <td>{{ $t('最大高度') }}</td>
            <td>string | number</td>
            <td>'500px'</td>
          </tr>
          <tr>
            <td><code>showFormatButton</code></td>
            <td>{{ $t('显示格式化按钮') }}</td>
            <td>boolean</td>
            <td>false</td>
          </tr>
          <tr>
            <td><code>placeholder</code></td>
            <td>{{ $t('占位符文本') }}</td>
            <td>string</td>
            <td>''</td>
          </tr>
          <tr>
            <td><code>disableValidation</code></td>
            <td>{{ $t('禁用语法校验') }}</td>
            <td>boolean</td>
            <td>false</td>
          </tr>
          <tr>
            <td><code>config</code></td>
            <td>{{ $t('编辑器配置') }}</td>
            <td>EditorConfig</td>
            <td>{}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="api-section">
      <h4>{{ $t('Events 事件') }}</h4>
      <table class="api-table">
        <thead>
          <tr>
            <th>{{ $t('事件名') }}</th>
            <th>{{ $t('说明') }}</th>
            <th>{{ $t('参数') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>update:modelValue</code></td>
            <td>{{ $t('内容改变时触发') }}</td>
            <td>(value: string)</td>
          </tr>
          <tr>
            <td><code>change</code></td>
            <td>{{ $t('内容改变时触发') }}</td>
            <td>(value: string)</td>
          </tr>
          <tr>
            <td><code>ready</code></td>
            <td>{{ $t('编辑器初始化完成') }}</td>
            <td>-</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="feature-section">
      <h4>{{ $t('特性说明') }}</h4>
      <ul class="feature-list">
        <li>✓ {{ $t('基于 Monaco Editor，提供强大的代码编辑能力') }}</li>
        <li>✓ {{ $t('支持 JavaScript 和 TypeScript 语言') }}</li>
        <li>✓ {{ $t('自动适配亮色/暗色主题') }}</li>
        <li>✓ {{ $t('支持代码高亮、自动补全、语法检查') }}</li>
        <li>✓ {{ $t('支持自动高度或固定高度模式') }}</li>
        <li>✓ {{ $t('支持只读模式') }}</li>
        <li>✓ {{ $t('内置代码格式化功能') }}</li>
        <li>✓ {{ $t('支持自定义配置和代码提示') }}</li>
        <li>✓ {{ $t('完整的 TypeScript 类型定义') }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CodeEditor from '../CodeEditor.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const activeTab = ref('basic')
const isEditorReady = ref(false)
const showCode1 = ref(false)
const showCode2 = ref(false)
const showCode3 = ref(false)
const showCode4 = ref(false)
const showCode5 = ref(false)
const showCode6 = ref(false)
const tabs = [
  { id: 'basic', label: t('基础用法') },
  { id: 'typescript', label: t('TypeScript') },
  { id: 'readonly', label: t('只读模式') },
  { id: 'format', label: t('格式化') },
  { id: 'fixed', label: t('固定高度') },
  { id: 'placeholder', label: t('占位符') }
]
const code1 = ref(`// JavaScript 示例
const greeting = 'Hello, World!';
function sayHello(name) {
  return \`Hello, \${name}!\`;
}
const result = sayHello('Monaco Editor');
console.log(result);`)
const code2 = ref(`// TypeScript 示例
interface User {
  id: number;
  name: string;
  email: string;
}
const createUser = (data: Partial<User>): User => {
  return {
    id: Date.now(),
    name: data.name || 'Anonymous',
    email: data.email || 'user@example.com'
  };
};
const user = createUser({ name: 'Alice' });
console.log(user);`)
const code3 = ref(`// 只读模式示例
// 这段代码不能被编辑
const readOnlyExample = {
  message: '这是只读模式',
  canEdit: false
};`)
const code4 = ref(`const unformattedCode={name:"test",value:123,nested:{data:[1,2,3]}};function process(input){return input.map(x=>x*2);}`)
const code5 = ref(`// 固定高度编辑器
// 高度由外层容器控制
const data = [1, 2, 3, 4, 5];
const doubled = data.map(x => x * 2);
console.log(doubled);

// 添加更多内容会出现滚动条
const tripled = data.map(x => x * 3);
console.log(tripled);`)
const code6 = ref('')
onMounted(() => {
  setTimeout(() => {
    isEditorReady.value = true
  }, 100)
})
const basicUsageCode = `<template>
  <CodeEditor
    v-model="code"
    language="javascript"
    :auto-height="true"
    :min-height="150"
    :max-height="300"
  />
</template>

<script setup>
import { ref } from 'vue'
import CodeEditor from '@/components/ui/cleanDesign/codeEditor/CodeEditor.vue'

const code = ref(\`const greeting = 'Hello, World!';\`)
<\/script>`
const typescriptCode = `<template>
  <CodeEditor
    v-model="code"
    language="typescript"
    :auto-height="true"
    :min-height="150"
    :max-height="300"
  />
</template>

<script setup>
import { ref } from 'vue'
import CodeEditor from '@/components/ui/cleanDesign/codeEditor/CodeEditor.vue'

const code = ref(\`interface User {
  id: number;
  name: string;
}\`)
<\/script>`
const readOnlyCode = `<template>
  <CodeEditor
    v-model="code"
    language="javascript"
    :read-only="true"
    :auto-height="true"
  />
</template>

<script setup>
import { ref } from 'vue'
import CodeEditor from '@/components/ui/cleanDesign/codeEditor/CodeEditor.vue'

const code = ref(\`const example = 'read-only';\`)
<\/script>`
const formatButtonCode = `<template>
  <CodeEditor
    v-model="code"
    language="javascript"
    :show-format-button="true"
    :auto-height="true"
  />
</template>

<script setup>
import { ref } from 'vue'
import CodeEditor from '@/components/ui/cleanDesign/codeEditor/CodeEditor.vue'

const code = ref(\`const data={name:"test"};\`)
<\/script>`
const fixedHeightCode = `<template>
  <div style="height: 200px;">
    <CodeEditor
      v-model="code"
      language="javascript"
      :auto-height="false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CodeEditor from '@/components/ui/cleanDesign/codeEditor/CodeEditor.vue'

const code = ref(\`const data = [1, 2, 3];\`)
<\/script>`
const placeholderCode = `<template>
  <CodeEditor
    v-model="code"
    language="javascript"
    placeholder="请输入 JavaScript 代码..."
    :auto-height="true"
  />
</template>

<script setup>
import { ref } from 'vue'
import CodeEditor from '@/components/ui/cleanDesign/codeEditor/CodeEditor.vue'

const code = ref('')
<\/script>`
</script>

<style scoped lang="scss">
.code-editor-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background: var(--white);
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
  }
  .demo-description {
    margin-bottom: 24px;
    p {
      margin: 0;
      font-size: 15px;
      line-height: 1.6;
      color: var(--gray-600);
    }
  }
  .demo-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    border-bottom: 1px solid var(--gray-200);
    padding-bottom: 8px;
    .tab-button {
      padding: 8px 16px;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      font-size: 14px;
      color: var(--gray-600);
      transition: all 0.2s;
      &:hover {
        color: var(--theme-color);
      }
      &.active {
        color: var(--theme-color);
        border-bottom-color: var(--theme-color);
        font-weight: 500;
      }
    }
  }
  .demo-content {
    min-height: 400px;
  }
  .demo-section {
    margin-bottom: 24px;
    padding: 20px;
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: 12px;
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
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
          font-size: 13px;
        }
      }
    }
    .editor-wrapper {
      margin-bottom: 0;
    }
    .loading-placeholder {
      padding: 40px;
      text-align: center;
      color: var(--gray-500);
      font-size: 14px;
    }
    .code-preview {
      margin-top: 16px;
      border-top: 1px solid var(--gray-200);
      padding-top: 16px;
      .code-block {
        margin: 0;
        padding: 16px;
        background: var(--gray-50);
        border: 1px solid var(--gray-200);
        border-radius: 8px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 13px;
        line-height: 1.6;
        color: var(--gray-800);
        overflow-x: auto;
        white-space: pre;
      }
    }
  }
  .api-section {
    margin-bottom: 32px;
    h4 {
      color: var(--gray-800);
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    .api-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--white);
      border: 1px solid var(--gray-200);
      border-radius: 8px;
      overflow: hidden;
      thead {
        background: var(--gray-50);
        th {
          padding: 12px 16px;
          text-align: left;
          font-size: 13px;
          font-weight: 600;
          color: var(--gray-700);
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
        }
        td {
          padding: 12px 16px;
          font-size: 13px;
          color: var(--gray-700);
          code {
            padding: 2px 6px;
            background: var(--gray-100);
            border: 1px solid var(--gray-200);
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 12px;
            color: var(--theme-color);
          }
        }
      }
    }
  }
  .feature-section {
    margin-bottom: 32px;
    h4 {
      color: var(--gray-800);
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: -0.01em;
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
  }
}
</style>
