<template>
  <div class="draggable-dialog-demo" :data-theme="currentTheme">
    <div class="demo-header">
      <h3>DraggableDialog 组件演示</h3>
      <button
        class="theme-toggle"
        @click="toggleTheme"
        :title="currentTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
      >
        <span class="theme-icon">{{ currentTheme === 'dark' ? '☀️' : '🌙' }}</span>
      </button>
    </div>

    <div class="demo-description">
      <p>极简风格的可拖拽弹窗组件，支持通过标题栏拖拽移动位置</p>
    </div>

    <!-- 基础用法 -->
    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>基础用法</h4>
          <p>基本的可拖拽弹窗示例</p>
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
      <button class="demo-btn" @click="showDialog1 = true">打开基础弹窗</button>
      <DraggableDialog v-model="showDialog1" title="基础弹窗">
        <div class="demo-content">
          <p>这是一个基础的可拖拽弹窗示例</p>
          <p>您可以拖拽标题栏来移动弹窗位置</p>
          <p>点击右上角的 ✕ 按钮关闭弹窗</p>
        </div>
      </DraggableDialog>
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

    <!-- 不同宽度 -->
    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>不同宽度</h4>
          <p>自定义弹窗宽度，支持数字或字符串</p>
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
        <button class="demo-btn" @click="showDialog2 = true">宽度 400px</button>
        <button class="demo-btn" @click="showDialog3 = true">宽度 600px</button>
        <button class="demo-btn" @click="showDialog4 = true">宽度 800px</button>
      </div>
      <DraggableDialog v-model="showDialog2" title="400px 宽度" :width="400">
        <div class="demo-content">
          <p>这是一个宽度为 400px 的弹窗</p>
        </div>
      </DraggableDialog>
      <DraggableDialog v-model="showDialog3" title="600px 宽度" :width="600">
        <div class="demo-content">
          <p>这是一个宽度为 600px 的弹窗</p>
        </div>
      </DraggableDialog>
      <DraggableDialog v-model="showDialog4" title="800px 宽度" :width="800">
        <div class="demo-content">
          <p>这是一个宽度为 800px 的弹窗</p>
        </div>
      </DraggableDialog>
      <div v-if="showCode2" class="code-preview">
        <div class="code-header">
          <span class="code-title">不同宽度源码</span>
          <button @click="copyCode(widthVariantsCode)" class="copy-btn" title="复制代码">
            📋
          </button>
        </div>
        <pre class="code-block"><code>{{ widthVariantsCode }}</code></pre>
      </div>
    </div>

    <!-- 不同内容高度 -->
    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>不同内容高度</h4>
          <p>高度自适应内容，超过最大高度（60vh）时显示滚动条</p>
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
      <div class="demo-buttons">
        <button class="demo-btn" @click="showDialog5 = true">短内容</button>
        <button class="demo-btn" @click="showDialog6 = true">长内容（滚动）</button>
      </div>
      <DraggableDialog v-model="showDialog5" title="短内容">
        <div class="demo-content">
          <p>这是一个内容较少的弹窗</p>
          <p>高度会自适应内容</p>
        </div>
      </DraggableDialog>
      <DraggableDialog v-model="showDialog6" title="长内容（最大高度 60vh）">
        <div class="demo-content">
          <h4>这是一个内容很多的弹窗</h4>
          <p v-for="i in 50" :key="i">这是第 {{ i }} 行内容，当内容超过最大高度 60vh 时，内容区域会出现滚动条</p>
        </div>
      </DraggableDialog>
      <div v-if="showCode3" class="code-preview">
        <div class="code-header">
          <span class="code-title">内容高度源码</span>
          <button @click="copyCode(heightContentCode)" class="copy-btn" title="复制代码">
            📋
          </button>
        </div>
        <pre class="code-block"><code>{{ heightContentCode }}</code></pre>
      </div>
    </div>

    <!-- 自定义内容 -->
    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>自定义内容</h4>
          <p>弹窗可以包含各种自定义内容，如表单、表格等</p>
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
      <div class="demo-buttons">
        <button class="demo-btn" @click="showDialog7 = true">用户信息</button>
        <button class="demo-btn" @click="showDialog8 = true">系统设置</button>
        <button class="demo-btn" @click="showDialog9 = true">数据统计</button>
      </div>
      <DraggableDialog v-model="showDialog7" title="用户信息" :width="500">
        <div class="demo-content">
          <div class="info-row">
            <span class="label">用户名:</span>
            <span class="value">张三</span>
          </div>
          <div class="info-row">
            <span class="label">邮箱:</span>
            <span class="value">zhangsan@example.com</span>
          </div>
          <div class="info-row">
            <span class="label">角色:</span>
            <span class="value">管理员</span>
          </div>
        </div>
      </DraggableDialog>
      <DraggableDialog v-model="showDialog8" title="系统设置" :width="600">
        <div class="demo-content">
          <div class="setting-item">
            <label>自动保存</label>
            <input type="checkbox" checked />
          </div>
          <div class="setting-item">
            <label>消息通知</label>
            <input type="checkbox" />
          </div>
          <div class="setting-item">
            <label>主题模式</label>
            <select>
              <option>浅色</option>
              <option>深色</option>
              <option>自动</option>
            </select>
          </div>
        </div>
      </DraggableDialog>
      <DraggableDialog v-model="showDialog9" title="数据统计" :width="700">
        <div class="demo-content">
          <table class="stats-table">
            <thead>
              <tr>
                <th>指标</th>
                <th>数值</th>
                <th>增长率</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>访问量</td>
                <td>12,345</td>
                <td class="positive">+15%</td>
              </tr>
              <tr>
                <td>用户数</td>
                <td>8,234</td>
                <td class="positive">+8%</td>
              </tr>
              <tr>
                <td>转化率</td>
                <td>23.5%</td>
                <td class="negative">-2%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DraggableDialog>
      <div v-if="showCode4" class="code-preview">
        <div class="code-header">
          <span class="code-title">自定义内容源码</span>
          <button @click="copyCode(customContentCode)" class="copy-btn" title="复制代码">
            📋
          </button>
        </div>
        <pre class="code-block"><code>{{ customContentCode }}</code></pre>
      </div>
    </div>

    <!-- API 文档 - Props -->
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
            <td>显示/隐藏控制 (v-model)</td>
            <td>boolean</td>
            <td>-</td>
          </tr>
          <tr>
            <td><code>title</code></td>
            <td>弹窗标题</td>
            <td>string</td>
            <td>'弹窗'</td>
          </tr>
          <tr>
            <td><code>width</code></td>
            <td>弹窗宽度</td>
            <td>string | number</td>
            <td>'500px'</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- API 文档 - 插槽 -->
    <div class="demo-section">
      <h4>插槽</h4>
      <table class="props-table">
        <thead>
          <tr>
            <th>插槽名</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>default</code></td>
            <td>弹窗主内容区域</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 特性说明 -->
    <div class="demo-section">
      <h4>特性说明</h4>
      <ul class="feature-list">
        <li>✓ Tailwind 极简风格设计</li>
        <li>✓ 无圆角，简洁现代</li>
        <li>✓ 可通过标题栏拖拽移动位置</li>
        <li>✓ 宽度可自定义，不可拖拽调整</li>
        <li>✓ 高度自适应内容，最大高度 60vh</li>
        <li>✓ 内容超出时显示滚动条</li>
        <li>✓ 首次打开自动居中显示</li>
        <li>✓ 支持淡入淡出动画效果</li>
        <li>✓ 右上角关闭按钮</li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import DraggableDialog from '../DraggableDialog.vue'

// 弹窗显示控制
const showDialog1 = ref(false)
const showDialog2 = ref(false)
const showDialog3 = ref(false)
const showDialog4 = ref(false)
const showDialog5 = ref(false)
const showDialog6 = ref(false)
const showDialog7 = ref(false)
const showDialog8 = ref(false)
const showDialog9 = ref(false)

// 主题切换
const currentTheme = ref<'light' | 'dark'>('light')

// 源码展示控制
const showCode1 = ref(false)
const showCode2 = ref(false)
const showCode3 = ref(false)
const showCode4 = ref(false)

// 主题切换功能
const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', currentTheme.value)
  localStorage.setItem('draggable-dialog-theme', currentTheme.value)
}

// 复制代码功能
const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    console.log('代码已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 初始化主题
onMounted(() => {
  const savedTheme = localStorage.getItem('draggable-dialog-theme') as 'light' | 'dark' || 'light'
  currentTheme.value = savedTheme
  document.documentElement.setAttribute('data-theme', savedTheme)
})

// 源码内容
const basicUsageCode = `<template>
  <button @click="showDialog = true">打开基础弹窗</button>
  <DraggableDialog v-model="showDialog" title="基础弹窗">
    <div>
      <p>这是一个基础的可拖拽弹窗示例</p>
      <p>您可以拖拽标题栏来移动弹窗位置</p>
      <p>点击右上角的 ✕ 按钮关闭弹窗</p>
    </div>
  </DraggableDialog>
</template>

<script setup>
import { ref } from 'vue'
const showDialog = ref(false)
<\/script>`

const widthVariantsCode = `<template>
  <!-- 400px 宽度 -->
  <DraggableDialog v-model="showDialog1" title="400px 宽度" :width="400">
    <p>这是一个宽度为 400px 的弹窗</p>
  </DraggableDialog>

  <!-- 600px 宽度 -->
  <DraggableDialog v-model="showDialog2" title="600px 宽度" :width="600">
    <p>这是一个宽度为 600px 的弹窗</p>
  </DraggableDialog>

  <!-- 800px 宽度 -->
  <DraggableDialog v-model="showDialog3" title="800px 宽度" :width="800">
    <p>这是一个宽度为 800px 的弹窗</p>
  </DraggableDialog>
</template>`

const heightContentCode = `<template>
  <!-- 短内容 - 高度自适应 -->
  <DraggableDialog v-model="showDialog1" title="短内容">
    <div>
      <p>这是一个内容较少的弹窗</p>
      <p>高度会自适应内容</p>
    </div>
  </DraggableDialog>

  <!-- 长内容 - 超过最大高度时显示滚动条 -->
  <DraggableDialog v-model="showDialog2" title="长内容（最大高度 60vh）">
    <div>
      <h4>这是一个内容很多的弹窗</h4>
      <p v-for="i in 50" :key="i">
        这是第 {{ i }} 行内容，当内容超过最大高度 60vh 时，
        内容区域会出现滚动条
      </p>
    </div>
  </DraggableDialog>
</template>`

const customContentCode = `<template>
  <!-- 用户信息表单 -->
  <DraggableDialog v-model="showDialog1" title="用户信息" :width="500">
    <div class="info-row">
      <span class="label">用户名:</span>
      <span class="value">张三</span>
    </div>
    <div class="info-row">
      <span class="label">邮箱:</span>
      <span class="value">zhangsan@example.com</span>
    </div>
  </DraggableDialog>

  <!-- 数据统计表格 -->
  <DraggableDialog v-model="showDialog2" title="数据统计" :width="700">
    <table>
      <thead>
        <tr>
          <th>指标</th>
          <th>数值</th>
          <th>增长率</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>访问量</td>
          <td>12,345</td>
          <td class="positive">+15%</td>
        </tr>
      </tbody>
    </table>
  </DraggableDialog>
</template>`
</script>

<style lang="scss" scoped>
.draggable-dialog-demo {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  // 主题头部
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
    padding: 20px;
    background: var(--gray-50);
    border: 1px solid var(--gray-200);
    border-radius: 8px;

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

    h4 {
      color: var(--gray-800);
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
    }
  }

  .demo-btn {
    padding: 8px 16px;
    background: var(--theme-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;

    &:hover {
      opacity: 0.9;
    }
  }

  .demo-buttons {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .demo-content {
    p {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: var(--gray-700);
      line-height: 1.6;
    }

    h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: var(--gray-900);
    }
  }

  .info-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .label {
      width: 80px;
      font-weight: 500;
      color: var(--gray-600);
    }

    .value {
      color: var(--gray-900);
    }
  }

  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--gray-200);

    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    label {
      font-size: 14px;
      color: var(--gray-900);
    }

    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    select {
      padding: 4px 8px;
      border: 1px solid var(--gray-200);
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      background: var(--white);
      color: var(--gray-900);
    }
  }

  .stats-table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid var(--gray-200);
    }

    th {
      font-weight: 500;
      color: var(--gray-600);
      background: var(--gray-100);
    }

    td {
      color: var(--gray-900);
    }

    .positive {
      color: var(--el-color-success);
    }

    .negative {
      color: var(--el-color-danger);
    }
  }

  // 源码预览区域
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

  // API 表格
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

  // 暗色主题
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

      h4 {
        color: var(--gray-200);
      }
    }

    .demo-content {
      p {
        color: var(--gray-400);
      }

      h4 {
        color: var(--gray-100);
      }
    }

    .info-row {
      .label {
        color: var(--gray-400);
      }

      .value {
        color: var(--gray-100);
      }
    }

    .setting-item {
      border-color: var(--gray-700);

      label {
        color: var(--gray-100);
      }

      select {
        background: var(--gray-700);
        border-color: var(--gray-600);
        color: var(--gray-100);
      }
    }

    .stats-table {
      th {
        background: var(--gray-750);
        color: var(--gray-400);
        border-color: var(--gray-700);
      }

      td {
        color: var(--gray-100);
        border-color: var(--gray-700);
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

      thead tr th {
        background: var(--gray-750);
        color: var(--gray-200);
        border-color: var(--gray-700);
      }

      tbody tr {
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

    .feature-list li {
      color: var(--gray-400);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .draggable-dialog-demo {
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
      padding: 16px;

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;

        .code-toggle-btn {
          align-self: flex-end;
        }
      }
    }

    .demo-buttons {
      flex-direction: column;
    }

    .code-preview {
      .code-block {
        padding: 12px;
        font-size: 12px;
      }
    }
  }
}
</style>
