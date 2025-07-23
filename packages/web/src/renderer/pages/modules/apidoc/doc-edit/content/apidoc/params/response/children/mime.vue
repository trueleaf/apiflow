<template>
  <div class="status">
    <template v-for="(item, index) in mimeTypes" :key="index">
      <div class="text-bold mt-1">{{ t(item.title) }}</div>
      <div class="px-3 d-flex flex-wrap">
        <el-tooltip v-for="(mime, index2) in item.values" :key="index2" :show-after="800" :content="mime.mimeType"
          placement="top" :effect="Effect.LIGHT">
          <div class="item" @click="handleSelect(mime.mimeType)">{{ mime.alias }}</div>
        </el-tooltip>
      </div>
    </template>
    <div class="close" @click="emits('close')">
      <el-icon>
        <Close />
      </el-icon>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Effect } from 'element-plus';
import { Close } from '@element-plus/icons-vue'
import mimeTypes from './mime'
import { useTranslation } from 'i18next-vue'

const { t } = useTranslation()

const emits = defineEmits(['close', 'select']);
const handleSelect = (mimeType: string) => {
  emits('select', mimeType);
  emits('close');
}
</script>

<style lang='scss' scoped>
.status {
  position: relative;

  .item {
    padding: 1px 8px;
    border: 1px solid var(--gray-400);
    border-radius: 2px;
    margin-right: 10px;
    margin-top: 5px;
    margin-bottom: 10px;
    color: var(--white);
    background-color: var(--theme-color);

    &:hover {
      color: var(--white);
      background-color: var(--theme-color);
    }
  }

  .close {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: 5px;
    top: 5px;
    font-size: 18px;
    width: 22px;
    height: 22px;
    color: #f56c6c;
    cursor: pointer;
    border-radius: 50%;
    &:hover {
      background: #dee2e6;
    }
  }
}
</style>
