<template>
  <div class="clean-card-demo" :data-theme="currentTheme">
    <div class="demo-header">
      <h3>CleanCard 组件演示</h3>
      <button
        class="theme-toggle"
        @click="toggleTheme"
        :title="currentTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
      >
        <span class="theme-icon">{{ currentTheme === 'dark' ? '☀️' : '🌙' }}</span>
      </button>
    </div>

    <!-- 基础卡片样式 -->
    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>基础卡片样式</h4>
          <p>默认的卡片外观和结构</p>
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
      <div class="card-grid">
        <div class="clean-card">
          <div class="card-header">
            <h3 class="card-title">项目信息</h3>
          </div>
          <div class="card-body">
            <p class="card-content">
              这是一个基础卡片组件，用于展示相关信息的容器，
              具有清晰的边界和层次结构。
            </p>
            <div class="card-actions">
              <button class="card-btn primary">查看详情</button>
              <button class="card-btn secondary">编辑</button>
            </div>
          </div>
        </div>
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

    <!-- 不同尺寸 -->
    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>不同尺寸</h4>
          <p>小、中、大三种尺寸的卡片</p>
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
      <div class="card-grid">
        <div class="clean-card card-small">
          <div class="card-header">
            <h3 class="card-title">小卡片</h3>
          </div>
          <div class="card-body">
            <p class="card-content">紧凑的卡片样式</p>
          </div>
        </div>
        <div class="clean-card card-medium">
          <div class="card-header">
            <h3 class="card-title">中等卡片</h3>
          </div>
          <div class="card-body">
            <p class="card-content">标准的卡片尺寸，适合大多数场景使用</p>
          </div>
        </div>
        <div class="clean-card card-large">
          <div class="card-header">
            <h3 class="card-title">大卡片</h3>
          </div>
          <div class="card-body">
            <p class="card-content">
              更大的卡片，适合展示更多内容和信息。
              提供更宽松的空间布局。
            </p>
          </div>
        </div>
      </div>
      <div v-if="showCode2" class="code-preview">
        <div class="code-header">
          <span class="code-title">不同尺寸源码</span>
          <button @click="copyCode(sizeVariantsCode)" class="copy-btn" title="复制代码">
            📋
          </button>
        </div>
        <pre class="code-block"><code>{{ sizeVariantsCode }}</code></pre>
      </div>
    </div>

    <!-- 阴影效果 -->
    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>阴影效果</h4>
          <p>不同深度的阴影样式</p>
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
      <div class="card-grid">
        <div class="clean-card shadow-none">
          <div class="card-header">
            <h3 class="card-title">无阴影</h3>
          </div>
          <div class="card-body">
            <p class="card-content">扁平化设计，没有阴影效果</p>
          </div>
        </div>
        <div class="clean-card shadow-light">
          <div class="card-header">
            <h3 class="card-title">浅阴影</h3>
          </div>
          <div class="card-body">
            <p class="card-content">轻微的阴影，适合简洁的界面</p>
          </div>
        </div>
        <div class="clean-card shadow-deep">
          <div class="card-header">
            <h3 class="card-title">深阴影</h3>
          </div>
          <div class="card-body">
            <p class="card-content">明显的阴影效果，增强层次感</p>
          </div>
        </div>
      </div>
      <div v-if="showCode3" class="code-preview">
        <div class="code-header">
          <span class="code-title">阴影效果源码</span>
          <button @click="copyCode(shadowVariantsCode)" class="copy-btn" title="复制代码">
            📋
          </button>
        </div>
        <pre class="code-block"><code>{{ shadowVariantsCode }}</code></pre>
      </div>
    </div>

    <!-- 交互状态 -->
    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>交互状态</h4>
          <p>可悬停和可点击的交互效果</p>
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
      <div class="card-grid">
        <div class="clean-card card-hoverable">
          <div class="card-header">
            <h3 class="card-title">可悬停卡片</h3>
          </div>
          <div class="card-body">
            <p class="card-content">鼠标悬停时有提升效果</p>
          </div>
        </div>
        <div class="clean-card card-clickable" @click="handleCardClick('点击卡片 1')">
          <div class="card-header">
            <h3 class="card-title">可点击卡片</h3>
          </div>
          <div class="card-body">
            <p class="card-content">整个卡片都可以点击</p>
          </div>
        </div>
        <div class="clean-card card-interactive" @click="handleCardClick('交互式卡片')">
          <div class="card-header">
            <h3 class="card-title">交互式卡片</h3>
          </div>
          <div class="card-body">
            <p class="card-content">结合悬停和点击效果</p>
          </div>
        </div>
      </div>
      <div v-if="lastClickedCard" class="interaction-status">
        <p>最后点击: <strong>{{ lastClickedCard }}</strong></p>
      </div>
      <div v-if="showCode4" class="code-preview">
        <div class="code-header">
          <span class="code-title">交互状态源码</span>
          <button @click="copyCode(interactiveCode)" class="copy-btn" title="复制代码">
            📋
          </button>
        </div>
        <pre class="code-block"><code>{{ interactiveCode }}</code></pre>
      </div>
    </div>

    <!-- API 文档 -->
    <div class="demo-section">
      <h4>CSS 类名参考</h4>
      <table class="props-table">
        <thead>
          <tr>
            <th>类名</th>
            <th>说明</th>
            <th>效果</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>clean-card</code></td>
            <td>基础卡片类</td>
            <td>必需的基础类名</td>
          </tr>
          <tr>
            <td><code>card-small</code></td>
            <td>小尺寸卡片</td>
            <td>紧凑的内边距</td>
          </tr>
          <tr>
            <td><code>card-medium</code></td>
            <td>中等尺寸卡片</td>
            <td>标准内边距（默认）</td>
          </tr>
          <tr>
            <td><code>card-large</code></td>
            <td>大尺寸卡片</td>
            <td>宽松的内边距</td>
          </tr>
          <tr>
            <td><code>shadow-none</code></td>
            <td>无阴影</td>
            <td>扁平化设计</td>
          </tr>
          <tr>
            <td><code>shadow-light</code></td>
            <td>浅阴影</td>
            <td>2px 轻微阴影</td>
          </tr>
          <tr>
            <td><code>shadow-deep</code></td>
            <td>深阴影</td>
            <td>8px 明显阴影</td>
          </tr>
          <tr>
            <td><code>card-hoverable</code></td>
            <td>可悬停</td>
            <td>鼠标悬停时提升</td>
          </tr>
          <tr>
            <td><code>card-clickable</code></td>
            <td>可点击</td>
            <td>添加指针光标和点击效果</td>
          </tr>
          <tr>
            <td><code>card-interactive</code></td>
            <td>交互式</td>
            <td>结合悬停和点击效果</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 结构说明 -->
    <div class="demo-section">
      <h4>卡片结构</h4>
      <table class="props-table">
        <thead>
          <tr>
            <th>元素</th>
            <th>类名</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>容器</td>
            <td><code>.clean-card</code></td>
            <td>卡片最外层容器</td>
          </tr>
          <tr>
            <td>头部</td>
            <td><code>.card-header</code></td>
            <td>卡片头部区域，通常包含标题</td>
          </tr>
          <tr>
            <td>标题</td>
            <td><code>.card-title</code></td>
            <td>卡片标题文字</td>
          </tr>
          <tr>
            <td>主体</td>
            <td><code>.card-body</code></td>
            <td>卡片主要内容区域</td>
          </tr>
          <tr>
            <td>内容</td>
            <td><code>.card-content</code></td>
            <td>卡片文本内容</td>
          </tr>
          <tr>
            <td>操作区</td>
            <td><code>.card-actions</code></td>
            <td>卡片底部按钮区域</td>
          </tr>
          <tr>
            <td>按钮</td>
            <td><code>.card-btn</code></td>
            <td>卡片中的按钮，配合 <code>.primary</code> 或 <code>.secondary</code></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 主题切换
const currentTheme = ref<'light' | 'dark'>('light')

// 源码展示控制
const showCode1 = ref(false)
const showCode2 = ref(false)
const showCode3 = ref(false)
const showCode4 = ref(false)

// 交互状态
const lastClickedCard = ref('')

// 主题切换功能
const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', currentTheme.value)
  localStorage.setItem('clean-card-theme', currentTheme.value)
}

// 卡片点击处理
const handleCardClick = (cardName: string) => {
  lastClickedCard.value = cardName
  console.log(`卡片被点击: ${cardName}`)
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
  const savedTheme = localStorage.getItem('clean-card-theme') as 'light' | 'dark' || 'light'
  currentTheme.value = savedTheme
  document.documentElement.setAttribute('data-theme', savedTheme)
})

// 源码内容
const basicUsageCode = `<div class="clean-card">
  <div class="card-header">
    <h3 class="card-title">项目信息</h3>
  </div>
  <div class="card-body">
    <p class="card-content">
      这是一个基础卡片组件，用于展示相关信息的容器，
      具有清晰的边界和层次结构。
    </p>
    <div class="card-actions">
      <button class="card-btn primary">查看详情</button>
      <button class="card-btn secondary">编辑</button>
    </div>
  </div>
</div>`

const sizeVariantsCode = `<!-- 小卡片 -->
<div class="clean-card card-small">
  <div class="card-header">
    <h3 class="card-title">小卡片</h3>
  </div>
  <div class="card-body">
    <p class="card-content">紧凑的卡片样式</p>
  </div>
</div>

<!-- 中等卡片（默认） -->
<div class="clean-card card-medium">
  <div class="card-header">
    <h3 class="card-title">中等卡片</h3>
  </div>
  <div class="card-body">
    <p class="card-content">标准的卡片尺寸</p>
  </div>
</div>

<!-- 大卡片 -->
<div class="clean-card card-large">
  <div class="card-header">
    <h3 class="card-title">大卡片</h3>
  </div>
  <div class="card-body">
    <p class="card-content">更大的卡片，适合展示更多内容</p>
  </div>
</div>`

const shadowVariantsCode = `<!-- 无阴影 -->
<div class="clean-card shadow-none">
  <div class="card-header">
    <h3 class="card-title">无阴影</h3>
  </div>
  <div class="card-body">
    <p class="card-content">扁平化设计</p>
  </div>
</div>

<!-- 浅阴影 -->
<div class="clean-card shadow-light">
  <div class="card-header">
    <h3 class="card-title">浅阴影</h3>
  </div>
  <div class="card-body">
    <p class="card-content">轻微的阴影效果</p>
  </div>
</div>

<!-- 深阴影 -->
<div class="clean-card shadow-deep">
  <div class="card-header">
    <h3 class="card-title">深阴影</h3>
  </div>
  <div class="card-body">
    <p class="card-content">明显的阴影效果</p>
  </div>
</div>`

const interactiveCode = `<!-- 可悬停卡片 -->
<div class="clean-card card-hoverable">
  <div class="card-header">
    <h3 class="card-title">可悬停卡片</h3>
  </div>
  <div class="card-body">
    <p class="card-content">鼠标悬停时有提升效果</p>
  </div>
</div>

<!-- 可点击卡片 -->
<div class="clean-card card-clickable" @click="handleClick">
  <div class="card-header">
    <h3 class="card-title">可点击卡片</h3>
  </div>
  <div class="card-body">
    <p class="card-content">整个卡片都可以点击</p>
  </div>
</div>

<!-- 交互式卡片 -->
<div class="clean-card card-interactive" @click="handleClick">
  <div class="card-header">
    <h3 class="card-title">交互式卡片</h3>
  </div>
  <div class="card-body">
    <p class="card-content">结合悬停和点击效果</p>
  </div>
</div>`
</script>

<style lang="scss" scoped>
.clean-card-demo {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  // 主题头部
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
  }

  // 卡片网格布局
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 16px;
  }

  // 基础卡片样式
  .clean-card {
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: all 0.3s ease;

    .card-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--gray-100);
      background: var(--gray-50);

      .card-title {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--gray-900);
      }
    }

    .card-body {
      padding: 20px;

      .card-content {
        margin: 0 0 16px 0;
        line-height: 1.6;
        color: var(--gray-600);
        font-size: 14px;
      }

      .card-actions {
        display: flex;
        gap: 8px;

        .card-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;

          &.primary {
            background: var(--theme-color);
            color: white;

            &:hover {
              opacity: 0.9;
            }
          }

          &.secondary {
            background: var(--gray-100);
            color: var(--gray-700);
            border: 1px solid var(--gray-200);

            &:hover {
              background: var(--gray-200);
            }
          }
        }
      }
    }
  }

  // 尺寸变体
  .card-small {
    .card-header {
      padding: 12px 16px;
    }
    .card-body {
      padding: 16px;
    }
  }

  .card-medium {
    // 默认尺寸
  }

  .card-large {
    .card-header {
      padding: 20px 24px;
    }
    .card-body {
      padding: 24px;
    }
  }

  // 阴影变体
  .shadow-none {
    box-shadow: none;
  }

  .shadow-light {
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .shadow-deep {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  // 交互状态
  .card-hoverable {
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }
  }

  .card-clickable {
    cursor: pointer;
    &:active {
      transform: scale(0.98);
    }
  }

  .card-interactive {
    cursor: pointer;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
    }
    &:active {
      transform: translateY(0);
    }
  }

  // 交互状态提示
  .interaction-status {
    margin-top: 16px;
    padding: 12px 16px;
    background: var(--gray-100);
    border-left: 3px solid var(--theme-color);
    border-radius: 4px;

    p {
      margin: 0;
      color: var(--gray-700);
      font-size: 14px;

      strong {
        color: var(--theme-color);
      }
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
    }

    .clean-card {
      background: var(--gray-800);
      border-color: var(--gray-700);

      .card-header {
        background: var(--gray-750);
        border-color: var(--gray-700);

        .card-title {
          color: var(--gray-100);
        }
      }

      .card-body {
        .card-content {
          color: var(--gray-400);
        }

        .card-actions {
          .card-btn {
            &.secondary {
              background: var(--gray-700);
              color: var(--gray-300);
              border-color: var(--gray-600);

              &:hover {
                background: var(--gray-600);
              }
            }
          }
        }
      }
    }

    .interaction-status {
      background: var(--gray-800);
      border-color: var(--theme-color);

      p {
        color: var(--gray-300);
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

// 响应式设计
@media (max-width: 768px) {
  .clean-card-demo {
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

    .card-grid {
      grid-template-columns: 1fr;
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
