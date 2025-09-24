<template>
  <div class="clean-tabs-demo" :data-theme="currentTheme">
    <div class="demo-header">
      <h3>CleanTabs 组件演示</h3>
      <button 
        class="theme-toggle"
        @click="toggleTheme"
        :title="currentTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
      >
        <span class="theme-icon">{{ currentTheme === 'dark' ? '☀️' : '🌙' }}</span>
      </button>
    </div>

    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>基础用法</h4>
          <p>当前激活的标签：<strong>{{ activeTab1 }}</strong></p>
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
      <CleanTabs v-model="activeTab1">
        <CleanTabPane name="first" label="配置">
          <div class="demo-content">
            <h5>配置管理</h5>
            <p>这里是配置管理的内容，展示如何使用 CleanTabs 组件进行内容分组。</p>
          </div>
        </CleanTabPane>
        <CleanTabPane name="second" label="响应">
          <div class="demo-content">
            <h5>响应设置</h5>
            <p>响应设置页面，演示标签页切换功能。</p>
          </div>
        </CleanTabPane>
        <CleanTabPane name="third" label="日志" :disabled="false">
          <div class="demo-content">
            <h5>日志查看</h5>
            <p>系统日志和错误信息查看界面。</p>
          </div>
        </CleanTabPane>
      </CleanTabs>
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
          <h4>卡片样式（等宽模式）</h4>
          <p>当前激活的标签：<strong>{{ activeTab2 }}</strong></p>
          <p class="sub-text">卡片模式下，所有tab会自动等宽平分容器宽度</p>
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
      <CleanTabs v-model="activeTab2" type="card">
        <CleanTabPane name="params" label="参数">
          <div class="demo-content">
            <h5>请求参数</h5>
            <p>API 请求参数配置和管理。</p>
          </div>
        </CleanTabPane>
        <CleanTabPane name="body" label="请求体">
          <div class="demo-content">
            <h5>请求体设置</h5>
            <p>HTTP 请求体内容编辑器。</p>
          </div>
        </CleanTabPane>
        <CleanTabPane name="headers" label="请求头">
          <div class="demo-content">
            <h5>请求头配置</h5>
            <p>自定义 HTTP 请求头设置。</p>
          </div>
        </CleanTabPane>
      </CleanTabs>
      <div v-if="showCode2" class="code-preview">
        <div class="code-header">
          <span class="code-title">卡片样式源码</span>
          <button @click="copyCode(cardStyleCode)" class="copy-btn" title="复制代码">
            📋
          </button>
        </div>
        <pre class="code-block"><code>{{ cardStyleCode }}</code></pre>
      </div>
    </div>

    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>多标签等宽演示</h4>
          <p>当前激活的标签：<strong>{{ activeTab4 }}</strong></p>
          <p class="sub-text">展示不同数量标签的等宽效果</p>
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
      <CleanTabs v-model="activeTab4" type="card">
        <CleanTabPane name="tab1" label="标签一">
          <div class="demo-content">
            <h5>标签一内容</h5>
            <p>5个标签，每个占20%宽度</p>
          </div>
        </CleanTabPane>
        <CleanTabPane name="tab2" label="标签二">
          <div class="demo-content">
            <h5>标签二内容</h5>
            <p>演示等宽分布效果</p>
          </div>
        </CleanTabPane>
        <CleanTabPane name="tab3" label="标签三">
          <div class="demo-content">
            <h5>标签三内容</h5>
            <p>所有标签平均分配宽度</p>
          </div>
        </CleanTabPane>
        <CleanTabPane name="tab4" label="标签四">
          <div class="demo-content">
            <h5>标签四内容</h5>
            <p>自动适应容器宽度</p>
          </div>
        </CleanTabPane>
        <CleanTabPane name="tab5" label="标签五">
          <div class="demo-content">
            <h5>标签五内容</h5>
            <p>响应式等宽布局</p>
          </div>
        </CleanTabPane>
      </CleanTabs>
      <div v-if="showCode4" class="code-preview">
        <div class="code-header">
          <span class="code-title">多标签等宽源码</span>
          <button @click="copyCode(multiTabCode)" class="copy-btn" title="复制代码">
            📋
          </button>
        </div>
        <pre class="code-block"><code>{{ multiTabCode }}</code></pre>
      </div>
    </div>

    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>插槽用法（类似 el-tabs）</h4>
          <p>当前激活的标签：<strong>{{ activeTab3 }}</strong></p>
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
      <CleanTabs v-model="activeTab3">
        <CleanTabPane name="SParams">
          <template #label>
            <span class="custom-label">
              <i class="demo-icon">📝</i>
              Params
              <span class="badge" v-if="hasParams">•</span>
            </span>
          </template>
          <div class="demo-content">
            <h5>参数配置</h5>
            <p>支持自定义标签内容，可以添加图标、徽章等元素。</p>
          </div>
        </CleanTabPane>
        <CleanTabPane name="SRequestBody">
          <template #label>
            <span class="custom-label">
              <i class="demo-icon">📄</i>
              Body
              <span class="badge" v-if="hasBody">•</span>
            </span>
          </template>
          <div class="demo-content">
            <h5>请求体</h5>
            <p>展示如何在标签中添加徽章指示器。</p>
          </div>
        </CleanTabPane>
        <CleanTabPane name="SRequestHeaders">
          <template #label>
            <span class="custom-label">
              <i class="demo-icon">🔧</i>
              Headers
              <span class="badge" v-if="hasHeaders">•</span>
            </span>
          </template>
          <div class="demo-content">
            <h5>请求头</h5>
            <p>完全自定义的标签内容，支持任意 HTML 结构。</p>
          </div>
        </CleanTabPane>
      </CleanTabs>
      <div v-if="showCode3" class="code-preview">
        <div class="code-header">
          <span class="code-title">插槽用法源码</span>
          <button @click="copyCode(slotUsageCode)" class="copy-btn" title="复制代码">
            📋
          </button>
        </div>
        <pre class="code-block"><code>{{ slotUsageCode }}</code></pre>
      </div>
    </div>

    <div class="demo-section">
      <h4>API 示例</h4>
      <div class="api-example">
        <pre><code>&lt;CleanTabs v-model="activeTab" type="card"&gt;
        &lt;CleanTabPane name="first" label="标签一"&gt;
        内容一
        &lt;/CleanTabPane&gt;
        &lt;CleanTabPane name="second" label="标签二"&gt;
        内容二
        &lt;/CleanTabPane&gt;
        &lt;/CleanTabs&gt;</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CleanTabs from '../src/CleanTabs'
import CleanTabPane from '../src/CleanTabPane'

// 响应式数据
const activeTab1 = ref('first')
const activeTab2 = ref('params')
const activeTab3 = ref('SParams')
const activeTab4 = ref('tab1')

// 主题切换
const currentTheme = ref<'light' | 'dark'>('light')

// 源码展示控制
const showCode1 = ref(false)
const showCode2 = ref(false)
const showCode3 = ref(false)
const showCode4 = ref(false)

// 模拟数据
const hasParams = ref(true)
const hasBody = ref(false)
const hasHeaders = ref(true)

// 主题切换功能
const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  // 应用主题到 document
  document.documentElement.setAttribute('data-theme', currentTheme.value)
  // 保存主题设置
  localStorage.setItem('clean-tabs-theme', currentTheme.value)
}

// 复制代码功能
const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    // 可以添加一个简单的提示
    console.log('代码已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 初始化主题
onMounted(() => {
  const savedTheme = localStorage.getItem('clean-tabs-theme') as 'light' | 'dark' || 'light'
  currentTheme.value = savedTheme
  document.documentElement.setAttribute('data-theme', savedTheme)
})

// 源码内容
const basicUsageCode = `<CleanTabs v-model="activeTab1">
  <CleanTabPane name="first" label="配置">
    <div class="demo-content">
      <h5>配置管理</h5>
      <p>这里是配置管理的内容，展示如何使用 CleanTabs 组件进行内容分组。</p>
    </div>
  </CleanTabPane>
  <CleanTabPane name="second" label="响应">
    <div class="demo-content">
      <h5>响应设置</h5>
      <p>响应设置页面，演示标签页切换功能。</p>
    </div>
  </CleanTabPane>
  <CleanTabPane name="third" label="日志" :disabled="false">
    <div class="demo-content">
      <h5>日志查看</h5>
      <p>系统日志和错误信息查看界面。</p>
    </div>
  </CleanTabPane>
</CleanTabs>`

const cardStyleCode = `<!-- 卡片模式下自动启用等宽布局 -->
<CleanTabs v-model="activeTab2" type="card">
  <CleanTabPane name="params" label="参数">
    <div class="demo-content">
      <h5>请求参数</h5>
      <p>API 请求参数配置和管理。</p>
    </div>
  </CleanTabPane>
  <CleanTabPane name="body" label="请求体">
    <div class="demo-content">
      <h5>请求体设置</h5>
      <p>HTTP 请求体内容编辑器。</p>
    </div>
  </CleanTabPane>
  <CleanTabPane name="headers" label="请求头">
    <div class="demo-content">
      <h5>请求头配置</h5>
      <p>自定义 HTTP 请求头设置。</p>
    </div>
  </CleanTabPane>
</CleanTabs>`

const slotUsageCode = `<CleanTabs v-model="activeTab3">
  <CleanTabPane name="SParams">
    <template #label>
      <span class="custom-label">
        <i class="demo-icon">📝</i>
        Params
        <span class="badge" v-if="hasParams">•</span>
      </span>
    </template>
    <div class="demo-content">
      <h5>参数配置</h5>
      <p>支持自定义标签内容，可以添加图标、徽章等元素。</p>
    </div>
  </CleanTabPane>
  <CleanTabPane name="SRequestBody">
    <template #label>
      <span class="custom-label">
        <i class="demo-icon">📄</i>
        Body
        <span class="badge" v-if="hasBody">•</span>
      </span>
    </template>
    <div class="demo-content">
      <h5>请求体</h5>
      <p>展示如何在标签中添加徽章指示器。</p>
    </div>
  </CleanTabPane>
  <CleanTabPane name="SRequestHeaders">
    <template #label>
      <span class="custom-label">
        <i class="demo-icon">🔧</i>
        Headers
        <span class="badge" v-if="hasHeaders">•</span>
      </span>
    </template>
    <div class="demo-content">
      <h5>请求头</h5>
      <p>完全自定义的标签内容，支持任意 HTML 结构。</p>
    </div>
  </CleanTabPane>
</CleanTabs>`

const multiTabCode = `<CleanTabs v-model="activeTab4" type="card">
  <CleanTabPane name="tab1" label="标签一">
    <div class="demo-content">
      <h5>标签一内容</h5>
      <p>5个标签，每个占20%宽度</p>
    </div>
  </CleanTabPane>
  <CleanTabPane name="tab2" label="标签二">
    <div class="demo-content">
      <h5>标签二内容</h5>
      <p>演示等宽分布效果</p>
    </div>
  </CleanTabPane>
  <CleanTabPane name="tab3" label="标签三">
    <div class="demo-content">
      <h5>标签三内容</h5>
      <p>所有标签平均分配宽度</p>
    </div>
  </CleanTabPane>
  <CleanTabPane name="tab4" label="标签四">
    <div class="demo-content">
      <h5>标签四内容</h5>
      <p>自动适应容器宽度</p>
    </div>
  </CleanTabPane>
  <CleanTabPane name="tab5" label="标签五">
    <div class="demo-content">
      <h5>标签五内容</h5>
      <p>响应式等宽布局</p>
    </div>
  </CleanTabPane>
</CleanTabs>`
</script>

<style lang="scss" scoped>
.clean-tabs-demo {
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

      .sub-text {
        font-size: 12px;
        color: var(--gray-500);
        margin-top: 4px;
      }
      
      .code-toggle-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: var(--gray-50);
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

  .demo-content {
    padding: 24px;
    background: var(--gray-50);
    border-radius: 8px;
    border: 1px solid var(--gray-100);

    h5 {
      margin: 0 0 12px 0;
      color: var(--gray-800);
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    p {
      margin: 0;
      color: var(--gray-600);
      line-height: 1.6;
      font-size: 14px;
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
      background: var(--gray-50);
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

  .custom-label {
    display: flex;
    align-items: center;
    gap: 8px;

    .demo-icon {
      font-size: 14px;
      opacity: 0.8;
    }

    .badge {
      width: 6px;
      height: 6px;
      background: var(--red-500);
      border-radius: 50%;
      display: inline-block;
      animation: pulse 2s infinite;
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
    
    .demo-content {
      background: var(--gray-800);
      border-color: var(--gray-700);
      
      h5 {
        color: var(--gray-200);
      }
      
      p {
        color: var(--gray-400);
      }
    }
    
    .code-preview {
      background: var(--gray-800);
      border-color: var(--gray-700);
      
      .code-header {
        background: var(--gray-750);
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
      
      .code-block {
        background: var(--gray-900);
        color: var(--gray-100);
      }
    }
  }

  .api-example {
    background: var(--gray-50);
    border: 1px solid var(--gray-200);
    border-radius: 8px;
    padding: 20px;
    margin-top: 24px;

    pre {
      margin: 0;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
      font-size: 13px;
      line-height: 1.6;

      code {
        color: var(--gray-800);
      }
    }
  }
}

// 动画
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .clean-tabs-demo {
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
    
    .demo-content {
      padding: 16px;
    }
    
    .code-preview {
      .code-block {
        padding: 12px;
        font-size: 12px;
      }
    }
  }
}

@media (max-width: 480px) {
  .clean-tabs-demo {
    padding: 12px;
    
    .demo-header {
      h3 {
        font-size: 20px;
      }
    }
    
    .demo-section {
      .section-header {
        h4 {
          font-size: 16px;
        }
      }
    }
  }
}
</style>