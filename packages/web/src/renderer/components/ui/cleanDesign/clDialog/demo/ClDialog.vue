<template>
  <div class="cl-dialog-demo" :data-theme="currentTheme">
    <div class="demo-header">
      <h3>ClDialog 组件演示</h3>
      <button
        class="theme-toggle"
        @click="toggleTheme"
        :title="currentTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
      >
        <span class="theme-icon">{{ currentTheme === 'dark' ? '☀️' : '🌙' }}</span>
      </button>
    </div>
    <div class="demo-description">
      <p>基于 Element Plus el-dialog 的轻量级封装，提供统一的主题适配和常用配置</p>
    </div>
    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>基础用法</h4>
          <p>最简单的对话框示例</p>
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
      <button class="demo-btn" @click="showDialog1 = true">打开基础对话框</button>
      <ClDialog v-model="showDialog1" title="基础对话框">
        <div class="demo-content">
          <p>这是一个基础的对话框示例</p>
          <p>ClDialog 是对 el-dialog 的轻量级封装</p>
          <p>自动支持亮色/暗色主题切换</p>
        </div>
        <template #footer>
          <el-button @click="showDialog1 = false">取消</el-button>
          <el-button type="primary" @click="showDialog1 = false">确定</el-button>
        </template>
      </ClDialog>
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
          <h4>不同宽度</h4>
          <p>通过 width 参数自定义对话框宽度，支持百分比、视口单位或像素值</p>
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
        <button class="demo-btn" @click="showDialog2 = true">宽度 40vw</button>
        <button class="demo-btn" @click="showDialog3 = true">宽度 50%</button>
        <button class="demo-btn" @click="showDialog4 = true">宽度 600px</button>
      </div>
      <ClDialog v-model="showDialog2" title="宽度 40vw" width="40vw">
        <div class="demo-content">
          <p>这是一个宽度为 40vw 的对话框</p>
          <p>适合中等内容量的场景</p>
        </div>
        <template #footer>
          <el-button @click="showDialog2 = false">关闭</el-button>
        </template>
      </ClDialog>
      <ClDialog v-model="showDialog3" title="宽度 50%" width="50%">
        <div class="demo-content">
          <p>这是一个宽度为 50% 的对话框</p>
          <p>占据屏幕宽度的一半</p>
        </div>
        <template #footer>
          <el-button @click="showDialog3 = false">关闭</el-button>
        </template>
      </ClDialog>
      <ClDialog v-model="showDialog4" title="宽度 600px" width="600px">
        <div class="demo-content">
          <p>这是一个宽度为 600px 的对话框</p>
          <p>固定像素宽度，适合固定尺寸的内容</p>
        </div>
        <template #footer>
          <el-button @click="showDialog4 = false">关闭</el-button>
        </template>
      </ClDialog>
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
    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>位置控制</h4>
          <p>通过 top 参数控制对话框距离顶部的距离</p>
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
        <button class="demo-btn" @click="showDialog5 = true">顶部 5vh</button>
        <button class="demo-btn" @click="showDialog6 = true">顶部 10vh（默认）</button>
        <button class="demo-btn" @click="showDialog7 = true">顶部 20vh</button>
      </div>
      <ClDialog v-model="showDialog5" title="顶部 5vh" top="5vh">
        <div class="demo-content">
          <p>距离顶部较近的对话框</p>
          <p>适合内容较多的场景</p>
        </div>
        <template #footer>
          <el-button @click="showDialog5 = false">关闭</el-button>
        </template>
      </ClDialog>
      <ClDialog v-model="showDialog6" title="顶部 10vh（默认）" top="10vh">
        <div class="demo-content">
          <p>默认的顶部距离</p>
          <p>适合大多数场景</p>
        </div>
        <template #footer>
          <el-button @click="showDialog6 = false">关闭</el-button>
        </template>
      </ClDialog>
      <ClDialog v-model="showDialog7" title="顶部 20vh" top="20vh">
        <div class="demo-content">
          <p>距离顶部较远的对话框</p>
          <p>视觉上更居中</p>
        </div>
        <template #footer>
          <el-button @click="showDialog7 = false">关闭</el-button>
        </template>
      </ClDialog>
      <div v-if="showCode3" class="code-preview">
        <div class="code-header">
          <span class="code-title">位置控制源码</span>
          <button @click="copyCode(topVariantsCode)" class="copy-btn" title="复制代码">
            📋
          </button>
        </div>
        <pre class="code-block"><code>{{ topVariantsCode }}</code></pre>
      </div>
    </div>
    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>点击遮罩关闭</h4>
          <p>通过 closeOnClickModal 控制是否允许点击遮罩关闭对话框</p>
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
        <button class="demo-btn" @click="showDialog8 = true">允许点击遮罩关闭（默认）</button>
        <button class="demo-btn" @click="showDialog9 = true">禁止点击遮罩关闭</button>
      </div>
      <ClDialog v-model="showDialog8" title="允许点击遮罩关闭" :close-on-click-modal="true">
        <div class="demo-content">
          <p>点击对话框外的遮罩层可以关闭对话框</p>
          <p>这是默认行为，适合大多数场景</p>
        </div>
        <template #footer>
          <el-button @click="showDialog8 = false">关闭</el-button>
        </template>
      </ClDialog>
      <ClDialog v-model="showDialog9" title="禁止点击遮罩关闭" :close-on-click-modal="false">
        <div class="demo-content">
          <p>点击对话框外的遮罩层无法关闭对话框</p>
          <p>适合需要用户明确操作的场景（如表单提交）</p>
          <p>只能通过右上角关闭按钮或底部按钮关闭</p>
        </div>
        <template #footer>
          <el-button @click="showDialog9 = false">关闭</el-button>
        </template>
      </ClDialog>
      <div v-if="showCode4" class="code-preview">
        <div class="code-header">
          <span class="code-title">点击遮罩关闭源码</span>
          <button @click="copyCode(modalClickCode)" class="copy-btn" title="复制代码">
            📋
          </button>
        </div>
        <pre class="code-block"><code>{{ modalClickCode }}</code></pre>
      </div>
    </div>
    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>关闭时销毁子组件</h4>
          <p>对比 destroyOnClose 参数的效果 - 点击计数器按钮，关闭后再打开观察计数器状态</p>
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
      <div class="demo-buttons">
        <button class="demo-btn" @click="showDialog10 = true">不销毁（默认）</button>
        <button class="demo-btn" @click="showDialog11 = true">关闭时销毁</button>
      </div>
      <ClDialog v-model="showDialog10" title="不销毁子组件" :destroy-on-close="false">
        <div class="demo-content">
          <p>关闭对话框后，子组件状态会保留</p>
          <p>计数器当前值：{{ counter1 }}</p>
          <el-button @click="counter1++">点击计数 +1</el-button>
          <p class="tip">提示：关闭后再打开，计数器值会保留</p>
        </div>
        <template #footer>
          <el-button @click="showDialog10 = false">关闭</el-button>
        </template>
      </ClDialog>
      <ClDialog v-model="showDialog11" title="关闭时销毁子组件" :destroy-on-close="true">
        <div class="demo-content">
          <p>关闭对话框后，子组件会被销毁</p>
          <p>计数器当前值：{{ counter2 }}</p>
          <el-button @click="counter2++">点击计数 +1</el-button>
          <p class="tip">提示：关闭后再打开，计数器值会重置为 0</p>
        </div>
        <template #footer>
          <el-button @click="handleCloseDialog11">关闭</el-button>
        </template>
      </ClDialog>
      <div v-if="showCode5" class="code-preview">
        <div class="code-header">
          <span class="code-title">销毁子组件源码</span>
          <button @click="copyCode(destroyOnCloseCode)" class="copy-btn" title="复制代码">
            📋
          </button>
        </div>
        <pre class="code-block"><code>{{ destroyOnCloseCode }}</code></pre>
      </div>
    </div>
    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>事件处理</h4>
          <p>监听 opened、closed、close 事件</p>
        </div>
        <button
          class="code-toggle-btn"
          @click="showCode6 = !showCode6"
          :class="{ active: showCode6 }"
          title="查看源码"
        >
          <span class="code-icon">{{ showCode6 ? '📖' : '💻' }}</span>
          <span class="code-text">{{ showCode6 ? '隐藏代码' : '查看代码' }}</span>
        </button>
      </div>
      <button class="demo-btn" @click="showDialog12 = true">打开对话框（查看事件日志）</button>
      <div v-if="eventLogs.length > 0" class="event-logs">
        <div class="log-header">
          <span>事件日志：</span>
          <button class="clear-btn" @click="eventLogs = []">清空</button>
        </div>
        <div class="log-item" v-for="(log, index) in eventLogs" :key="index">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-event">{{ log.event }}</span>
        </div>
      </div>
      <ClDialog
        v-model="showDialog12"
        title="事件处理示例"
        @opened="handleOpened"
        @closed="handleClosed"
        @close="handleClose"
      >
        <div class="demo-content">
          <p>打开、关闭对话框时会触发相应事件</p>
          <p>查看下方的事件日志了解执行顺序</p>
          <ul class="event-desc">
            <li><strong>opened</strong>: 对话框打开动画结束后触发</li>
            <li><strong>close</strong>: 对话框关闭时立即触发</li>
            <li><strong>closed</strong>: 对话框关闭动画结束后触发</li>
          </ul>
        </div>
        <template #footer>
          <el-button @click="showDialog12 = false">关闭</el-button>
        </template>
      </ClDialog>
      <div v-if="showCode6" class="code-preview">
        <div class="code-header">
          <span class="code-title">事件处理源码</span>
          <button @click="copyCode(eventsCode)" class="copy-btn" title="复制代码">
            📋
          </button>
        </div>
        <pre class="code-block"><code>{{ eventsCode }}</code></pre>
      </div>
    </div>
    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>关闭前钩子</h4>
          <p>使用 beforeClose 在关闭前执行自定义逻辑，例如二次确认</p>
        </div>
        <button
          class="code-toggle-btn"
          @click="showCode7 = !showCode7"
          :class="{ active: showCode7 }"
          title="查看源码"
        >
          <span class="code-icon">{{ showCode7 ? '📖' : '💻' }}</span>
          <span class="code-text">{{ showCode7 ? '隐藏代码' : '查看代码' }}</span>
        </button>
      </div>
      <button class="demo-btn" @click="showDialog13 = true">打开对话框（关闭时需要确认）</button>
      <ClDialog
        v-model="showDialog13"
        title="关闭前确认"
        :before-close="handleBeforeClose"
      >
        <div class="demo-content">
          <p>尝试关闭对话框时，会弹出确认提示</p>
          <p>这在有未保存数据的场景中非常有用</p>
          <p>点击右上角关闭按钮或点击遮罩都会触发确认</p>
        </div>
        <template #footer>
          <el-button @click="showDialog13 = false">尝试关闭</el-button>
          <el-button type="primary" @click="forceClose">强制关闭</el-button>
        </template>
      </ClDialog>
      <div v-if="showCode7" class="code-preview">
        <div class="code-header">
          <span class="code-title">关闭前钩子源码</span>
          <button @click="copyCode(beforeCloseCode)" class="copy-btn" title="复制代码">
            📋
          </button>
        </div>
        <pre class="code-block"><code>{{ beforeCloseCode }}</code></pre>
      </div>
    </div>
    <div class="demo-section">
      <div class="section-header">
        <div>
          <h4>自定义插槽</h4>
          <p>使用 header 和 footer 插槽自定义对话框内容</p>
        </div>
        <button
          class="code-toggle-btn"
          @click="showCode8 = !showCode8"
          :class="{ active: showCode8 }"
          title="查看源码"
        >
          <span class="code-icon">{{ showCode8 ? '📖' : '💻' }}</span>
          <span class="code-text">{{ showCode8 ? '隐藏代码' : '查看代码' }}</span>
        </button>
      </div>
      <div class="demo-buttons">
        <button class="demo-btn" @click="showDialog14 = true">自定义头部</button>
        <button class="demo-btn" @click="showDialog15 = true">自定义底部</button>
        <button class="demo-btn" @click="showDialog16 = true">完全自定义</button>
      </div>
      <ClDialog v-model="showDialog14" width="500px">
        <template #header>
          <div class="custom-header">
            <span class="header-icon">📌</span>
            <span class="header-title">自定义头部样式</span>
          </div>
        </template>
        <div class="demo-content">
          <p>通过 header 插槽可以完全自定义头部内容</p>
          <p>例如添加图标、徽章或其他元素</p>
        </div>
        <template #footer>
          <el-button @click="showDialog14 = false">关闭</el-button>
        </template>
      </ClDialog>
      <ClDialog v-model="showDialog15" title="自定义底部">
        <div class="demo-content">
          <p>通过 footer 插槽可以自定义底部按钮</p>
          <p>可以添加多个操作按钮或自定义布局</p>
        </div>
        <template #footer>
          <div class="custom-footer">
            <div class="footer-left">
              <el-checkbox v-model="dontShowAgain">不再提示</el-checkbox>
            </div>
            <div class="footer-right">
              <el-button @click="showDialog15 = false">取消</el-button>
              <el-button type="warning" @click="showDialog15 = false">稍后处理</el-button>
              <el-button type="primary" @click="showDialog15 = false">立即处理</el-button>
            </div>
          </div>
        </template>
      </ClDialog>
      <ClDialog v-model="showDialog16" width="600px">
        <template #header>
          <div class="custom-header advanced">
            <div class="header-main">
              <span class="header-icon">⚙️</span>
              <div class="header-text">
                <div class="header-title">高级设置</div>
                <div class="header-subtitle">配置系统参数</div>
              </div>
            </div>
            <div class="header-actions">
              <el-button size="small" text>帮助</el-button>
            </div>
          </div>
        </template>
        <div class="demo-content">
          <p>完全自定义的对话框，包含复杂的头部和底部布局</p>
          <p>可以根据业务需求自由定制</p>
        </div>
        <template #footer>
          <div class="custom-footer">
            <div class="footer-left">
              <el-button text @click="showDialog16 = false">重置默认值</el-button>
            </div>
            <div class="footer-right">
              <el-button @click="showDialog16 = false">取消</el-button>
              <el-button type="primary" @click="showDialog16 = false">保存设置</el-button>
            </div>
          </div>
        </template>
      </ClDialog>
      <div v-if="showCode8" class="code-preview">
        <div class="code-header">
          <span class="code-title">自定义插槽源码</span>
          <button @click="copyCode(slotsCode)" class="copy-btn" title="复制代码">
            📋
          </button>
        </div>
        <pre class="code-block"><code>{{ slotsCode }}</code></pre>
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
            <td>显示/隐藏控制 (v-model)</td>
            <td>boolean</td>
            <td>-</td>
          </tr>
          <tr>
            <td><code>title</code></td>
            <td>对话框标题</td>
            <td>string</td>
            <td>''</td>
          </tr>
          <tr>
            <td><code>width</code></td>
            <td>对话框宽度</td>
            <td>string | number</td>
            <td>'50%'</td>
          </tr>
          <tr>
            <td><code>top</code></td>
            <td>距离顶部距离</td>
            <td>string</td>
            <td>'10vh'</td>
          </tr>
          <tr>
            <td><code>closeOnClickModal</code></td>
            <td>点击遮罩是否关闭</td>
            <td>boolean</td>
            <td>true</td>
          </tr>
          <tr>
            <td><code>destroyOnClose</code></td>
            <td>关闭时销毁子组件</td>
            <td>boolean</td>
            <td>false</td>
          </tr>
          <tr>
            <td><code>beforeClose</code></td>
            <td>关闭前回调</td>
            <td>(done: () => void) => void</td>
            <td>-</td>
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
            <td>v-model 双向绑定事件</td>
            <td>value: boolean</td>
          </tr>
          <tr>
            <td><code>opened</code></td>
            <td>对话框打开动画结束后触发</td>
            <td>-</td>
          </tr>
          <tr>
            <td><code>closed</code></td>
            <td>对话框关闭动画结束后触发</td>
            <td>-</td>
          </tr>
          <tr>
            <td><code>close</code></td>
            <td>对话框关闭时立即触发</td>
            <td>-</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="demo-section">
      <h4>Slots 插槽</h4>
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
            <td>对话框主体内容</td>
          </tr>
          <tr>
            <td><code>header</code></td>
            <td>对话框头部内容（会覆盖 title）</td>
          </tr>
          <tr>
            <td><code>footer</code></td>
            <td>对话框底部内容（通常放置操作按钮）</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="demo-section">
      <h4>特性说明</h4>
      <ul class="feature-list">
        <li>✓ 基于 Element Plus el-dialog 封装</li>
        <li>✓ 自动适配亮色/暗色主题</li>
        <li>✓ 使用 CSS 变量，支持主题定制</li>
        <li>✓ 完整的 TypeScript 类型定义</li>
        <li>✓ 支持所有常用配置参数</li>
        <li>✓ 灵活的插槽系统，完全由使用者控制</li>
        <li>✓ 向后兼容，可透传所有 el-dialog 原生参数</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ClDialog from '../ClDialog.vue'
import { ClConfirm } from '@/components/ui/cleanDesign/clConfirm/ClConfirm'
const currentTheme = ref<'light' | 'dark'>('light')
const showCode1 = ref(false)
const showCode2 = ref(false)
const showCode3 = ref(false)
const showCode4 = ref(false)
const showCode5 = ref(false)
const showCode6 = ref(false)
const showCode7 = ref(false)
const showCode8 = ref(false)
const showDialog1 = ref(false)
const showDialog2 = ref(false)
const showDialog3 = ref(false)
const showDialog4 = ref(false)
const showDialog5 = ref(false)
const showDialog6 = ref(false)
const showDialog7 = ref(false)
const showDialog8 = ref(false)
const showDialog9 = ref(false)
const showDialog10 = ref(false)
const showDialog11 = ref(false)
const showDialog12 = ref(false)
const showDialog13 = ref(false)
const showDialog14 = ref(false)
const showDialog15 = ref(false)
const showDialog16 = ref(false)
const counter1 = ref(0)
const counter2 = ref(0)
const dontShowAgain = ref(false)
interface EventLog {
  time: string
  event: string
}
const eventLogs = ref<EventLog[]>([])
const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', currentTheme.value)
  localStorage.setItem('cl-dialog-theme', currentTheme.value)
}
const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
  } catch (err) {
    ElMessage.error('复制失败')
  }
}
const handleCloseDialog11 = () => {
  showDialog11.value = false
  counter2.value = 0
}
const addEventLog = (event: string) => {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  eventLogs.value.push({ time, event })
}
const handleOpened = () => {
  addEventLog('opened - 对话框已打开')
}
const handleClosed = () => {
  addEventLog('closed - 对话框已关闭')
}
const handleClose = () => {
  addEventLog('close - 开始关闭对话框')
}
const handleBeforeClose = (done: () => void) => {
  ClConfirm({
    content: '确定要关闭对话框吗？',
    title: '提示',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    done()
  }).catch(() => {
  })
}
const forceClose = () => {
  showDialog13.value = false
}
onMounted(() => {
  const savedTheme = localStorage.getItem('cl-dialog-theme') as 'light' | 'dark' || 'light'
  currentTheme.value = savedTheme
  document.documentElement.setAttribute('data-theme', savedTheme)
})
const basicUsageCode = `<template>
  <button @click="visible = true">打开基础对话框</button>
  <ClDialog v-model="visible" title="基础对话框">
    <div>
      <p>这是一个基础的对话框示例</p>
      <p>ClDialog 是对 el-dialog 的轻量级封装</p>
      <p>自动支持亮色/暗色主题切换</p>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="visible = false">确定</el-button>
    </template>
  </ClDialog>
</template>

<script setup>
import { ref } from 'vue'
const visible = ref(false)
<\/script>`

const widthVariantsCode = `<template>
  <!-- 40vw 宽度 -->
  <ClDialog v-model="visible1" title="宽度 40vw" width="40vw">
    <p>这是一个宽度为 40vw 的对话框</p>
    <template #footer>
      <el-button @click="visible1 = false">关闭</el-button>
    </template>
  </ClDialog>

  <!-- 50% 宽度 -->
  <ClDialog v-model="visible2" title="宽度 50%" width="50%">
    <p>这是一个宽度为 50% 的对话框</p>
    <template #footer>
      <el-button @click="visible2 = false">关闭</el-button>
    </template>
  </ClDialog>

  <!-- 600px 宽度 -->
  <ClDialog v-model="visible3" title="宽度 600px" width="600px">
    <p>这是一个宽度为 600px 的对话框</p>
    <template #footer>
      <el-button @click="visible3 = false">关闭</el-button>
    </template>
  </ClDialog>
</template>`

const topVariantsCode = `<template>
  <!-- 顶部 5vh -->
  <ClDialog v-model="visible1" title="顶部 5vh" top="5vh">
    <p>距离顶部较近的对话框</p>
    <template #footer>
      <el-button @click="visible1 = false">关闭</el-button>
    </template>
  </ClDialog>

  <!-- 顶部 10vh（默认） -->
  <ClDialog v-model="visible2" title="顶部 10vh" top="10vh">
    <p>默认的顶部距离</p>
    <template #footer>
      <el-button @click="visible2 = false">关闭</el-button>
    </template>
  </ClDialog>

  <!-- 顶部 20vh -->
  <ClDialog v-model="visible3" title="顶部 20vh" top="20vh">
    <p>距离顶部较远的对话框</p>
    <template #footer>
      <el-button @click="visible3 = false">关闭</el-button>
    </template>
  </ClDialog>
</template>`

const modalClickCode = `<template>
  <!-- 允许点击遮罩关闭（默认） -->
  <ClDialog
    v-model="visible1"
    title="允许点击遮罩关闭"
    :close-on-click-modal="true"
  >
    <p>点击对话框外的遮罩层可以关闭对话框</p>
    <template #footer>
      <el-button @click="visible1 = false">关闭</el-button>
    </template>
  </ClDialog>

  <!-- 禁止点击遮罩关闭 -->
  <ClDialog
    v-model="visible2"
    title="禁止点击遮罩关闭"
    :close-on-click-modal="false"
  >
    <p>点击对话框外的遮罩层无法关闭对话框</p>
    <p>只能通过右上角关闭按钮或底部按钮关闭</p>
    <template #footer>
      <el-button @click="visible2 = false">关闭</el-button>
    </template>
  </ClDialog>
</template>`

const destroyOnCloseCode = `<template>
  <!-- 不销毁子组件（默认） -->
  <ClDialog
    v-model="visible1"
    title="不销毁子组件"
    :destroy-on-close="false"
  >
    <p>计数器当前值：{{ counter1 }}</p>
    <el-button @click="counter1++">点击计数 +1</el-button>
    <p>提示：关闭后再打开，计数器值会保留</p>
    <template #footer>
      <el-button @click="visible1 = false">关闭</el-button>
    </template>
  </ClDialog>

  <!-- 关闭时销毁子组件 -->
  <ClDialog
    v-model="visible2"
    title="关闭时销毁子组件"
    :destroy-on-close="true"
  >
    <p>计数器当前值：{{ counter2 }}</p>
    <el-button @click="counter2++">点击计数 +1</el-button>
    <p>提示：关闭后再打开，计数器值会重置为 0</p>
    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </ClDialog>
</template>

<script setup>
import { ref } from 'vue'
const counter1 = ref(0)
const counter2 = ref(0)
const handleClose = () => {
  visible2.value = false
  counter2.value = 0
}
<\/script>`

const eventsCode = `<template>
  <ClDialog
    v-model="visible"
    title="事件处理示例"
    @opened="handleOpened"
    @closed="handleClosed"
    @close="handleClose"
  >
    <p>打开、关闭对话框时会触发相应事件</p>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </ClDialog>
</template>

<script setup>
import { ref } from 'vue'
const visible = ref(false)
const handleOpened = () => {
  console.log('对话框已打开')
}
const handleClosed = () => {
  console.log('对话框已关闭')
}
const handleClose = () => {
  console.log('开始关闭对话框')
}
<\/script>`

const beforeCloseCode = `<template>
  <ClDialog
    v-model="visible"
    title="关闭前确认"
    :before-close="handleBeforeClose"
  >
    <p>尝试关闭对话框时，会弹出确认提示</p>
    <template #footer>
      <el-button @click="visible = false">尝试关闭</el-button>
      <el-button type="primary" @click="forceClose">强制关闭</el-button>
    </template>
  </ClDialog>
</template>

<script setup>
import { ref } from 'vue'
import { ClConfirm } from '@/components/ui/cleanDesign/clConfirm/ClConfirm'
const visible = ref(false)
const handleBeforeClose = (done: () => void) => {
  ClConfirm({
    content: '确定要关闭对话框吗？',
    title: '提示',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    done()
  }).catch(() => {})
}
const forceClose = () => {
  visible.value = false
}
<\/script>`

const slotsCode = `<template>
  <!-- 自定义头部 -->
  <ClDialog v-model="visible1">
    <template #header>
      <div class="custom-header">
        <span>📌</span>
        <span>自定义头部样式</span>
      </div>
    </template>
    <p>通过 header 插槽可以完全自定义头部内容</p>
    <template #footer>
      <el-button @click="visible1 = false">关闭</el-button>
    </template>
  </ClDialog>

  <!-- 自定义底部 -->
  <ClDialog v-model="visible2" title="自定义底部">
    <p>通过 footer 插槽可以自定义底部按钮</p>
    <template #footer>
      <div style="display: flex; justify-content: space-between;">
        <el-checkbox v-model="dontShowAgain">不再提示</el-checkbox>
        <div>
          <el-button @click="visible2 = false">取消</el-button>
          <el-button type="primary" @click="visible2 = false">确定</el-button>
        </div>
      </div>
    </template>
  </ClDialog>
</template>`
</script>

<style lang="scss" scoped>
.cl-dialog-demo {
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
      margin: 0 0 12px 0;
      font-size: 14px;
      color: var(--gray-700);
      line-height: 1.6;
      &:last-child {
        margin-bottom: 0;
      }
    }
    .tip {
      margin-top: 12px;
      padding: 8px 12px;
      background: var(--blue-50);
      border-left: 3px solid var(--theme-color);
      color: var(--gray-600);
      font-size: 13px;
    }
    .event-desc {
      margin: 12px 0 0 0;
      padding-left: 20px;
      li {
        margin-bottom: 6px;
        font-size: 13px;
        color: var(--gray-600);
        line-height: 1.5;
        strong {
          color: var(--theme-color);
          font-family: 'SF Mono', Monaco, monospace;
          font-weight: 500;
        }
      }
    }
  }
  .event-logs {
    margin-top: 16px;
    padding: 12px;
    background: var(--gray-900);
    border-radius: 6px;
    max-height: 200px;
    overflow-y: auto;
    .log-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--gray-700);
      span {
        font-size: 13px;
        font-weight: 500;
        color: var(--gray-300);
      }
      .clear-btn {
        padding: 2px 8px;
        background: transparent;
        border: 1px solid var(--gray-600);
        border-radius: 3px;
        color: var(--gray-400);
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        &:hover {
          border-color: var(--gray-500);
          color: var(--gray-300);
        }
      }
    }
    .log-item {
      display: flex;
      gap: 12px;
      padding: 4px 0;
      font-size: 13px;
      font-family: 'SF Mono', Monaco, monospace;
      .log-time {
        color: var(--gray-500);
        flex-shrink: 0;
      }
      .log-event {
        color: var(--gray-300);
      }
    }
  }
  .custom-header {
    display: flex;
    align-items: center;
    gap: 8px;
    .header-icon {
      font-size: 18px;
    }
    .header-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--gray-900);
    }
    &.advanced {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      .header-main {
        display: flex;
        align-items: center;
        gap: 12px;
        .header-text {
          .header-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--gray-900);
            margin-bottom: 2px;
          }
          .header-subtitle {
            font-size: 12px;
            color: var(--gray-600);
          }
        }
      }
    }
  }
  .custom-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    .footer-left {
      flex: 1;
    }
    .footer-right {
      display: flex;
      gap: 8px;
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
      .tip {
        background: var(--bg-primary-10);
        color: var(--gray-400);
      }
      .event-desc li {
        color: var(--gray-400);
      }
    }
    .custom-header {
      .header-title {
        color: var(--gray-100);
      }
      &.advanced .header-main .header-text {
        .header-title {
          color: var(--gray-100);
        }
        .header-subtitle {
          color: var(--gray-400);
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
@media (max-width: 768px) {
  .cl-dialog-demo {
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
    .code-preview .code-block {
      padding: 12px;
      font-size: 12px;
    }
  }
}
</style>
