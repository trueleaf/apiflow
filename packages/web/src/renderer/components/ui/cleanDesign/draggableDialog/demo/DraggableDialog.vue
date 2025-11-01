<template>
  <div class="demo-container">
    <h3 class="demo-title">可拖拽弹窗组件</h3>
    <div class="demo-description">
      <p>极简风格的可拖拽弹窗组件，支持通过标题栏拖拽移动位置</p>
    </div>
    <div class="demo-section">
      <h4 class="section-title">基础用法</h4>
      <button class="demo-btn" @click="showDialog1 = true">打开基础弹窗</button>
      <DraggableDialog v-model="showDialog1" title="基础弹窗">
        <div class="demo-content">
          <p>这是一个基础的可拖拽弹窗示例</p>
          <p>您可以拖拽标题栏来移动弹窗位置</p>
          <p>点击右上角的 ✕ 按钮关闭弹窗</p>
        </div>
      </DraggableDialog>
    </div>
    <div class="demo-section">
      <h4 class="section-title">不同宽度</h4>
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
    </div>
    <div class="demo-section">
      <h4 class="section-title">不同内容高度</h4>
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
    </div>
    <div class="demo-section">
      <h4 class="section-title">自定义标题</h4>
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
    </div>
    <div class="demo-section">
      <h4 class="section-title">Props 参数</h4>
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
            <td>modelValue</td>
            <td>显示/隐藏控制 (v-model)</td>
            <td>boolean</td>
            <td>-</td>
          </tr>
          <tr>
            <td>title</td>
            <td>弹窗标题</td>
            <td>string</td>
            <td>'弹窗'</td>
          </tr>
          <tr>
            <td>width</td>
            <td>弹窗宽度</td>
            <td>string | number</td>
            <td>'500px'</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="demo-section">
      <h4 class="section-title">插槽</h4>
      <table class="props-table">
        <thead>
          <tr>
            <th>插槽名</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>default</td>
            <td>弹窗主内容区域</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="demo-section">
      <h4 class="section-title">特性说明</h4>
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
import { ref } from 'vue'
import DraggableDialog from '../DraggableDialog.vue'

const showDialog1 = ref(false)
const showDialog2 = ref(false)
const showDialog3 = ref(false)
const showDialog4 = ref(false)
const showDialog5 = ref(false)
const showDialog6 = ref(false)
const showDialog7 = ref(false)
const showDialog8 = ref(false)
const showDialog9 = ref(false)
</script>

<style lang="scss" scoped>
.demo-container {
  padding: 20px;
  max-width: 1000px;
}
.demo-title {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}
.demo-description {
  margin-bottom: 24px;
  p {
    margin: 0;
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
  }
}
.demo-section {
  margin-bottom: 32px;
  padding: 20px;
  background: #f9f9f9;
  border: 1px solid #e5e5e5;
}
.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}
.demo-btn {
  padding: 8px 16px;
  background: #007aff;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
  &:hover {
    background: #0056cc;
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
    color: #606266;
    line-height: 1.6;
  }
  h4 {
    margin: 0 0 12px 0;
    font-size: 16px;
    color: #333;
  }
}
.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  .label {
    width: 80px;
    font-weight: 500;
    color: #606266;
  }
  .value {
    color: #333;
  }
}
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
  label {
    font-size: 14px;
    color: #333;
  }
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  select {
    padding: 4px 8px;
    border: 1px solid #dcdfe6;
    font-size: 14px;
    cursor: pointer;
  }
}
.stats-table {
  width: 100%;
  border-collapse: collapse;
  th,
  td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ebeef5;
  }
  th {
    font-weight: 500;
    color: #606266;
    background: #f5f5f5;
  }
  td {
    color: #333;
  }
  .positive {
    color: #52c41a;
  }
  .negative {
    color: #ff4d4f;
  }
}
.props-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  th,
  td {
    padding: 12px;
    text-align: left;
    border: 1px solid #e5e5e5;
  }
  th {
    font-weight: 500;
    color: #333;
    background: #fafafa;
  }
  td {
    color: #606266;
    font-size: 14px;
  }
}
.feature-list {
  margin: 0;
  padding-left: 20px;
  li {
    margin-bottom: 8px;
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
  }
}
</style>
