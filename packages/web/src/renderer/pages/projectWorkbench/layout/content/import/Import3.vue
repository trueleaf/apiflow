<template>
  <div class="api-import-page">
    <!-- 头部区域 -->
    <div class="import-header">
      <div class="header-icon">
        <i class="iconfont iconbaocun white f-ex"></i>
      </div>
      <div>
        <div class="import-title">{{ t('导入文档') }}</div>
        <div class="import-desc">{{ t('支持openapi3.0规范文档、postman文档、apiflow格式文档') }}</div>
      </div>
    </div>
    <!-- 可导入类型tab卡片式切换 -->
    <div class="import-type-cards d-flex a-center mb-4">
      <div
        v-for="item in importTypes"
        :key="item.value"
        :class="['import-type-card', { active: importType === item.value }]"
        @click="handleTabChange(item.value)"
      >
        <div class="icon-wrap" :style="{ background: item.bg }">
          <i :class="item.icon"></i>
        </div>
        <div class="card-content">
          <div class="card-title">{{ t(item.label) }}</div>
          <div class="card-desc">{{ t(item.desc) }}</div>
        </div>
      </div>
    </div>
    <div class="import-type-content">
      <div v-if="importType === 'file'">
        <g-card>{{ t('上传本地文件') }}</g-card>
      </div>
      <div v-else-if="importType === 'url'">
        <g-card>{{ t('从URL中导入') }}</g-card>
      </div>
      <div v-else-if="importType === 'paste'">
        <g-card>{{ t('从粘贴内容中导入') }}</g-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
// import gCard from '@/components/common/card/GCard.vue'
import { useI18n } from 'vue-i18n'

/*
|--------------------------------------------------------------------------
| 变量定义
|--------------------------------------------------------------------------
*/
const importTypes = [
  {
    label: '上传本地文件',
    value: 'file',
    desc: '上传JSON或YAML文件',
    icon: 'iconfont iconshangchuan',
    bg: 'var(--blue)',
  },
  {
    label: '从URL中导入',
    value: 'url',
    desc: '从远程URL加载文档',
    icon: 'iconfont iconlianjie',
    bg: 'var(--green)',
  },
  {
    label: '从粘贴内容中导入',
    value: 'paste',
    desc: '粘贴JSON或YAML内容',
    icon: 'iconfont iconfuzhi',
    bg: 'var(--theme-color)',
  },
]
const { t } = useI18n()

const importType = ref('file')

/*
|--------------------------------------------------------------------------
| 初始化数据获取逻辑
|--------------------------------------------------------------------------
*/
// 无

/*
|--------------------------------------------------------------------------
| 逻辑处理函数
|--------------------------------------------------------------------------
*/
function handleTabChange(type: string) {
  importType.value = type
}

/*
|--------------------------------------------------------------------------
| 生命周期
|--------------------------------------------------------------------------
*/
// 无
</script>

<style lang="scss" scoped>
.api-import-page {
  padding: 20px;
  width: 100%;
  height: 100%;
  overflow: auto;
}
.import-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}
.header-icon {
  width: 48px;
  height: 48px;
  background: var(--blue);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}
.import-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 4px;
}
.import-desc {
  font-size: 14px;
  color: var(--gray-600);
}
.import-type-cards {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  gap: 24px;
}
.import-type-card {
  display: flex;
  align-items: flex-start;
  background: var(--white);
  border: 2px solid var(--gray-200);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow-sm);
  padding: 20px 28px 20px 20px;
  min-width: 240px;
  cursor: pointer;
  transition: border 0.2s, box-shadow 0.2s;
  position: relative;
}
.import-type-card .icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: var(--white);
  font-size: 22px;
}
.import-type-card .card-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.import-type-card .card-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
  color: var(--gray-900);
}
.import-type-card .card-desc {
  font-size: 13px;
  color: var(--gray-600);
}
.import-type-card.active {
  border: 2px solid var(--blue);
  box-shadow: 0 0 0 2px rgba(64,158,255,0.08);
  background: var(--white);
}
.import-type-card.active .card-title {
  color: var(--blue);
}
.import-type-card.active .icon-wrap {
  box-shadow: 0 0 0 4px rgba(64,158,255,0.10);
}
.import-type-content {
  margin-top: 16px;
}
</style>
