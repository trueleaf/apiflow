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
        v-for="tab in tabList"
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="handleTabChange(tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="demo-content">
      <section
        v-for="tab in tabList"
        :key="`section-${tab.id}`"
        class="demo-section"
        v-show="activeTab === tab.id"
      >
        <div class="section-header">
          <div>
            <h4>{{ tab.title }}</h4>
            <p>{{ tab.description }}</p>
          </div>
          <button
            class="code-toggle-btn"
            @click="toggleCode(tab.id)"
            :class="{ active: showCodeMap[tab.id] }"
            :title="$t('查看源码')"
          >
            <component
              :is="showCodeMap[tab.id] ? BookOpenCheck : Code2"
              class="code-toggle-icon"
            />
            <span class="code-text">{{ showCodeMap[tab.id] ? $t('隐藏代码') : $t('查看代码') }}</span>
          </button>
        </div>
        <div
          v-if="activeTab === tab.id && isEditorReady"
          class="editor-wrapper"
          :class="{ 'fixed-height-wrapper': tab.fixedHeight }"
        >
          <CodeEditor
            v-model="editorValues[tab.id]"
            :language="tab.language"
            :read-only="tab.readOnly === true"
            :auto-height="tab.autoHeight"
            :min-height="tab.minHeight ?? 150"
            :max-height="tab.maxHeight ?? 300"
            :show-format-button="tab.showFormatButton === true"
            :placeholder="tab.placeholder || ''"
          />
        </div>
        <div v-else class="loading-placeholder">{{ $t('编辑器加载中...') }}</div>
        <div v-if="showCodeMap[tab.id]" class="code-preview">
          <pre class="code-block">{{ tab.snippet }}</pre>
        </div>
      </section>
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
// Vue 核心 API
import { computed, onMounted, reactive, ref } from 'vue'

// 第三方库
import { useI18n } from 'vue-i18n'

// 图标库
import { BookOpenCheck, Code2 } from 'lucide-vue-next'

// 本地组件
import CodeEditor from '../CodeEditor.vue'

// 类型定义
type TabId = 'basic' | 'typescript' | 'readonly' | 'format' | 'fixed' | 'placeholder'
type TabMeta = {
  id: TabId
  label: string
  title: string
  description: string
  language: 'javascript' | 'typescript'
  autoHeight: boolean
  minHeight?: number
  maxHeight?: number
  readOnly?: boolean
  showFormatButton?: boolean
  placeholder?: string
  fixedHeight?: boolean
  snippet: string
}
const { t } = useI18n()
// 响应式变量
const activeTab = ref<TabId>('basic')
const isEditorReady = ref(false)
const showCodeMap = reactive<Record<TabId, boolean>>({
  basic: false,
  typescript: false,
  readonly: false,
  format: false,
  fixed: false,
  placeholder: false
})
const editorValues = reactive<Record<TabId, string>>({
  basic: `// JavaScript 示例
const greeting = 'Hello, World!';
const sayHello = (name) => {
  return \`Hello, \${name}!\`;
};
const result = sayHello('Monaco Editor');
console.log(result);`,
  typescript: `// TypeScript 示例
type User = {
  id: number
  name: string
  email: string
}
const createUser = (data: Partial<User>): User => ({
  id: Date.now(),
  name: data.name || 'Anonymous',
  email: data.email || 'user@example.com'
})
const user = createUser({ name: 'Alice' })
console.log(user)`,
  readonly: `// 只读模式示例
// 这段代码不能被编辑
const readOnlyExample = {
  message: '这是只读模式',
  canEdit: false
}`,
  format: 'const unformattedCode={name:"test",value:123,nested:{data:[1,2,3]}};function process(input){return input.map((value)=>value*2);}',
  fixed: `// 固定高度编辑器
// 高度由外层容器控制
const data = [1, 2, 3, 4, 5]
const doubled = data.map((value) => value * 2)
console.log(doubled)

// 添加更多内容会出现滚动条
const tripled = data.map((value) => value * 3)
console.log(tripled)`,
  placeholder: ''
})
// 常量
const snippetMap: Record<TabId, string> = {
  basic: `<template>
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
<\/script>`,
  typescript: `<template>
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

const code = ref(\`type User = {
  id: number
  name: string
}\`)
<\/script>`,
  readonly: `<template>
  <CodeEditor
    v-model="code"
    language="javascript"
    :read-only="true"
    :auto-height="true"
    :min-height="120"
    :max-height="250"
  />
</template>

<script setup>
import { ref } from 'vue'
import CodeEditor from '@/components/ui/cleanDesign/codeEditor/CodeEditor.vue'

const code = ref(\`const example = 'read-only';\`)
<\/script>`,
  format: `<template>
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
<\/script>`,
  fixed: `<template>
  <div class="fixed-editor-container">
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
<\/script>

<style scoped>
.fixed-editor-container {
  height: 200px;
}
</style>`,
  placeholder: `<template>
  <CodeEditor
    v-model="code"
    language="javascript"
    placeholder="请输入 JavaScript 代码..."
    :auto-height="true"
    :min-height="120"
    :max-height="250"
  />
</template>

<script setup>
import { ref } from 'vue'
import CodeEditor from '@/components/ui/cleanDesign/codeEditor/CodeEditor.vue'

const code = ref('')
<\/script>`
}
// Computed
const tabList = computed<TabMeta[]>(() => [
  {
    id: 'basic',
    label: t('基础用法'),
    title: t('基础用法'),
    description: t('支持 JavaScript 和 TypeScript 语言'),
    language: 'javascript',
    autoHeight: true,
    minHeight: 150,
    maxHeight: 300,
    snippet: snippetMap.basic
  },
  {
    id: 'typescript',
    label: t('TypeScript'),
    title: t('TypeScript 支持'),
    description: t('切换到 TypeScript 语言模式'),
    language: 'typescript',
    autoHeight: true,
    minHeight: 150,
    maxHeight: 300,
    snippet: snippetMap.typescript
  },
  {
    id: 'readonly',
    label: t('只读模式'),
    title: t('只读模式'),
    description: t('禁止编辑，仅用于展示代码'),
    language: 'javascript',
    autoHeight: true,
    minHeight: 120,
    maxHeight: 250,
    readOnly: true,
    snippet: snippetMap.readonly
  },
  {
    id: 'format',
    label: t('格式化'),
    title: t('带格式化按钮'),
    description: t('显示格式化按钮，一键格式化代码'),
    language: 'javascript',
    autoHeight: true,
    minHeight: 150,
    maxHeight: 300,
    showFormatButton: true,
    snippet: snippetMap.format
  },
  {
    id: 'fixed',
    label: t('固定高度'),
    title: t('固定高度'),
    description: t('不使用自动高度，设置固定容器高度'),
    language: 'javascript',
    autoHeight: false,
    fixedHeight: true,
    snippet: snippetMap.fixed
  },
  {
    id: 'placeholder',
    label: t('占位符'),
    title: t('带占位符'),
    description: t('编辑器为空时显示占位符文本'),
    language: 'javascript',
    autoHeight: true,
    minHeight: 120,
    maxHeight: 250,
    placeholder: t('请输入 JavaScript 代码...'),
    snippet: snippetMap.placeholder
  }
])
// 方法定义
// 事件处理
const handleTabChange = (id: TabId) => {
  activeTab.value = id
}
const toggleCode = (id: TabId) => {
  showCodeMap[id] = !showCodeMap[id]
}
// 生命周期
onMounted(() => {
  setTimeout(() => {
    isEditorReady.value = true
  }, 100)
})
</script>

<style scoped lang="scss">
.code-editor-demo {
  width: 100%;
  min-width: 1200px;
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
          color: var(--white);
        }
        .code-toggle-icon {
          width: 16px;
          height: 16px;
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
.fixed-height-wrapper {
  height: 200px;
}
.fixed-editor-container {
  height: 200px;
}
</style>
