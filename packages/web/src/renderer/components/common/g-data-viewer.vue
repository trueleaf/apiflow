<template>
  <div class="s-data-viewer">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <!-- 左侧标签页切换 -->
      <div class="tab-container">
        <div 
          v-for="tab in tabs" 
          :key="tab.key"
          class="tab-item"
          :class="{ active: activeTab === tab.key }"
          @click="handleTabChange(tab.key)"
        >
          {{ tab.label }}
        </div>
      </div>
      
      <!-- 右侧操作按钮 -->
      <div class="action-container">
        <div class="action-btn" title="下载" @click="handleDownload">
          <i class="iconfont iconxiazai"></i>
        </div>
        <div class="action-btn" title="复制" @click="handleCopy">
          <i class="iconfont iconweibiaoti-_huabanfuben"></i>
        </div>
        <div class="action-btn" title="搜索" @click="handleSearch">
          <i class="iconfont icongaojishaixuan"></i>
        </div>
      </div>
    </div>
    
    <!-- 内容展示区域 -->
    <div class="content-container">
      <SJsonEditor
        :model-value="displayContent"
        :read-only="true"
        :config="editorConfig"
        :auto-height="false"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue';
import { copy } from '@/helper';
import { ElMessage } from 'element-plus';

/*
|--------------------------------------------------------------------------
| Props 定义
|--------------------------------------------------------------------------
*/
interface Props {
  content: string;
  rawContent: string;
  prettyType?: string;
}

const props = withDefaults(defineProps<Props>(), {
  prettyType: 'json'
});

/*
|--------------------------------------------------------------------------
| 响应式数据
|--------------------------------------------------------------------------
*/
const activeTab = ref<'pretty' | 'hex' | 'raw'>('pretty');

// 标签页配置
const tabs = [
  { key: 'pretty' as const, label: '格式化' },
  { key: 'hex' as const, label: '十六进制' },
  { key: 'raw' as const, label: '原始' }
];

/*
|--------------------------------------------------------------------------
| 计算属性
|--------------------------------------------------------------------------
*/
// 显示内容
const displayContent = computed(() => {
  switch (activeTab.value) {
    case 'pretty':
      return props.content;
    case 'hex':
      return convertToHex(props.rawContent);
    case 'raw':
      return props.rawContent;
    default:
      return props.content;
  }
});

// 编辑器配置
const editorConfig = computed(() => {
  const baseConfig = {
    fontSize: 13,
    wordWrap: 'on' as const,
    readOnly: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true
  };

  switch (activeTab.value) {
    case 'pretty':
      return {
        ...baseConfig,
        language: props.prettyType || 'json'
      };
    case 'hex':
      return {
        ...baseConfig,
        language: 'plaintext'
      };
    case 'raw':
      return {
        ...baseConfig,
        language: 'plaintext'
      };
    default:
      return baseConfig;
  }
});

/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
// 标签页切换
const handleTabChange = (tab: 'pretty' | 'hex' | 'raw') => {
  activeTab.value = tab;
};

// 转换为十六进制
const convertToHex = (content: string): string => {
  try {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(content);
    let hexString = '';
    let offset = 0;
    
    for (let i = 0; i < bytes.length; i += 16) {
      // 偏移地址
      const offsetStr = offset.toString(16).padStart(8, '0').toUpperCase();
      
      // 十六进制字节
      const hexBytes = [];
      const asciiChars = [];
      
      for (let j = 0; j < 16; j++) {
        if (i + j < bytes.length) {
          const byte = bytes[i + j];
          hexBytes.push(byte.toString(16).padStart(2, '0').toUpperCase());
          // ASCII 字符（可打印字符显示，否则显示点）
          asciiChars.push(byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.');
        } else {
          hexBytes.push('  ');
          asciiChars.push(' ');
        }
      }
      
      // 格式化输出
      const hexPart1 = hexBytes.slice(0, 8).join(' ');
      const hexPart2 = hexBytes.slice(8, 16).join(' ');
      const asciiPart = asciiChars.join('');
      
      hexString += `${offsetStr}  ${hexPart1}  ${hexPart2}  |${asciiPart}|\n`;
      offset += 16;
    }
    
    return hexString;
  } catch (error) {
    console.error('转换十六进制失败:', error);
    return content;
  }
};

// 下载文件
const handleDownload = () => {
  try {
    const content = displayContent.value;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    
    // 根据当前标签页设置文件名
    let fileName = 'data';
    switch (activeTab.value) {
      case 'pretty':
        fileName += `.${props.prettyType || 'json'}`;
        break;
      case 'hex':
        fileName += '.hex';
        break;
      case 'raw':
        fileName += '.txt';
        break;
    }
    
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    ElMessage.success('下载成功');
  } catch (error) {
    console.error('下载失败:', error);
    ElMessage.error('下载失败');
  }
};

// 复制内容
const handleCopy = () => {
  try {
    copy(displayContent.value);
    ElMessage.success('复制成功');
  } catch (error) {
    console.error('复制失败:', error);
    ElMessage.error('复制失败');
  }
};

// 搜索功能
const handleSearch = () => {
  // 触发编辑器的搜索功能
  // 这里可以通过 ref 调用编辑器的搜索方法
  // 或者发送事件给父组件处理
  ElMessage.info('搜索功能开发中');
};

/*
|--------------------------------------------------------------------------
| 暴露方法
|--------------------------------------------------------------------------
*/
defineExpose({
  switchTab: handleTabChange,
  download: handleDownload,
  copy: handleCopy,
  search: handleSearch
});
</script>

<style lang="scss" scoped>
.s-data-viewer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color-base, #dcdfe6);
  border-radius: var(--border-radius-base, 4px);
  background: var(--white, #ffffff);

  .toolbar {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid var(--border-color-lighter, #ebeef5);
    background: var(--fill-color-extra-light, #fafcff);

    .tab-container {
      display: flex;
      gap: 4px;

      .tab-item {
        padding: 6px 12px;
        font-size: 13px;
        color: var(--text-color-regular, #606266);
        background: transparent;
        border: 1px solid var(--border-color-lighter, #ebeef5);
        border-radius: var(--border-radius-small, 3px);
        cursor: pointer;
        transition: all 0.2s;
        user-select: none;

        &:hover {
          color: var(--color-primary, #409eff);
          border-color: var(--color-primary-light-7, #c6e2ff);
          background: var(--color-primary-light-9, #ecf5ff);
        }

        &.active {
          color: var(--white, #ffffff);
          background: var(--color-primary, #409eff);
          border-color: var(--color-primary, #409eff);
        }
      }
    }

    .action-container {
      display: flex;
      gap: 8px;

      .action-btn {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-color-regular, #606266);
        background: transparent;
        border: 1px solid var(--border-color-lighter, #ebeef5);
        border-radius: var(--border-radius-small, 3px);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          color: var(--color-primary, #409eff);
          border-color: var(--color-primary-light-7, #c6e2ff);
          background: var(--color-primary-light-9, #ecf5ff);
        }

        .iconfont {
          font-size: 14px;
        }
      }
    }
  }

  .content-container {
    flex: 1;
    height: calc(100% - 50px);
    overflow: hidden;
  }
}
</style>
