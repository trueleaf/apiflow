<template>
  <div class="s-mock-select" @click.stop="() => { }">
    <el-tabs v-model="activeName">
      <el-tab-pane :name="t('常用')">
        <template #label>
          <span>{{ t("常用") }}</span>
          <span>
            <span>(</span>
            <span v-if="activeName === t('常用')">{{ mockEnum.length }}</span>
            <span v-else>{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === t("常用"))).length }}</span>
            <span>/{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === t("常用"))).length }}</span>
            <span>)</span>
          </span>
        </template>
      </el-tab-pane>
      <el-tab-pane :name="t('全部')">
        <template #label>
          <span>{{ t("全部") }}</span>
          <span>
            <span>(</span>
            <span v-if="activeName === t('全部')">{{ mockEnum.length }}</span>
            <span v-else>{{ cpMockEnum.length }}</span>
            <span>/{{ cpMockEnum.length }}</span>
            <span>)</span>
          </span>
        </template>
      </el-tab-pane>
      <el-tab-pane :name="t('日期/时间')">
        <template #label>
          <span>{{ t("日期/时间") }}</span>
          <span>
            <span>(</span>
            <span v-if="activeName === t('日期/时间')">{{ mockEnum.length }}</span>
            <span v-else>{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === t("日期/时间"))).length }}</span>
            <span>/{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === t("日期/时间"))).length }}</span>
            <span>)</span>
          </span>
        </template>
      </el-tab-pane>
      <el-tab-pane :name="t('图片')">
        <template #label>
          <span>{{ t("图片") }}</span>
          <span>
            <span>(</span>
            <span v-if="activeName === t('图片')">{{ mockEnum.length }}</span>
            <span v-else>{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === t("图片"))).length }}</span>
            <span>/{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === t("图片"))).length }}</span>
            <span>)</span>
          </span>
        </template>
      </el-tab-pane>
      <el-tab-pane :name="t('中文文本')">
        <template #label>
          <span>{{ t("中文文本") }}</span>
          <span>
            <span>(</span>
            <span v-if="activeName === t('中文文本')">{{ mockEnum.length }}</span>
            <span v-else>{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === t("中文文本"))).length }}</span>
            <span>/{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === t("中文文本"))).length }}</span>
            <span>)</span>
          </span>
        </template>
      </el-tab-pane>
      <el-tab-pane :name="t('英文文本')">
        <template #label>
          <span>{{ t("英文文本") }}</span>
          <span>
            <span>(</span>
            <span v-if="activeName === t('英文文本')">{{ mockEnum.length }}</span>
            <span v-else>{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === t("英文文本"))).length }}</span>
            <span>/{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === t("英文文本"))).length }}</span>
            <span>)</span>
          </span>
        </template>
      </el-tab-pane>
      <el-tab-pane :name="t('地区相关')">
        <template #label>
          <span>{{ t("地区相关") }}</span>
          <span>
            <span>(</span>
            <span v-if="activeName === t('地区相关')">{{ mockEnum.length }}</span>
            <span v-else>{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === t("地区相关"))).length }}</span>
            <span>/{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === t("地区相关"))).length }}</span>
            <span>)</span>
          </span>
        </template>
      </el-tab-pane>
      <el-tab-pane :name="t('颜色')">
        <template #label>
          <span>{{ t("颜色") }}</span>
          <span>
            <span>(</span>
            <span v-if="activeName === t('颜色')">{{ mockEnum.length }}</span>
            <span v-else>{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === t("颜色"))).length }}</span>
            <span>/{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === t("颜色"))).length }}</span>
            <span>)</span>
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>
    <div class="wrap">
      <div class="list" tabindex="-1">
        <div v-for="(item, index) in mockEnum" :key="index" v-copy="`@${item.value}`" class="list-item"
          @mouseenter="handleMockView(item)" @click="handleSelectMockData(item, $event)">
          <span class="flex0 mr-5">{{ item.value }}</span>
          <span>{{ item.name }}</span>
        </div>
      </div>
      <div class="bar"></div>
      <div class="preview">
        <span v-if="mockTags.indexOf(t('图片')) === -1">{{ mockValue }}</span>
        <el-image v-else :src="mockValue" fit="contain"></el-image>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { t } from 'i18next'
import type { MockItem } from '@src/types/global'
import Mock from '@/server/mock/mock'
import localMockEnum from './mock-enum';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

// const cpMockEnum: MockItem[] = JSON.parse(JSON.stringify(mockEnum));

const props = defineProps({
  /**
   * 过滤值
   */
  searchValue: {
    type: String,
    default: '',
  },
  /**
   * 点击非内容区域是否关闭
   */
  closeOnClickModal: {
    type: Boolean,
    default: true
  },
  /**
   * 自动拷贝选中数据
   */
  autoCopy: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['select', 'close']);
const cpMockEnum = ref<MockItem[]>(JSON.parse(JSON.stringify(localMockEnum)));
const activeName = ref(t('常用'));
const mockValue = ref('');
const mockTags = ref<string[]>([]);
const currentSelectMockData = ref<MockItem | null>(null);
const mockEnum = computed(() => {
  const matchedMockData = localMockEnum.filter((mock) => {
    const mockValue = mock.value;
    const searchValue = props.searchValue.toString().replace('@', '')
    return mockValue.includes(searchValue)
  });
  if (activeName.value === t('全部')) {
    return matchedMockData;
  }
  return matchedMockData.filter((val) => val.tags.find((tag) => tag === activeName.value))
})
watch(() => props.searchValue, () => {
  currentSelectMockData.value = localMockEnum[0];
})

/*
|--------------------------------------------------------------------------
| 函数定义
|--------------------------------------------------------------------------
*/
const handleMockView = (item: MockItem) => {
  mockValue.value = Mock.mock(`@${item.value}`)
  mockTags.value = item.tags;
}
const handleSelectMockData = (item: MockItem, e: MouseEvent) => {
  if (!props.autoCopy) {
    e.stopImmediatePropagation();
  }
  emits('select', item);
}
const handleCloseModel = () => {
  emits('close');
}
onMounted(() => {
  document.documentElement.addEventListener('click', handleCloseModel)
})
onUnmounted(() => {
  document.documentElement.removeEventListener('click', handleCloseModel)
})

</script>

<style lang='scss' scoped>
.s-mock-select {
  width: size(800);
  height: size(250);
  background: $white;

  .wrap {
    height: size(220);
    display: flex;

    .list {
      padding: size(10) 0;
      flex: 0 0 75%;
      height: 100%;
      overflow-y: auto;

      .list-item {
        height: size(30);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 size(10);

        &.active {
          background: $gray-200;
        }

        &:hover {
          background: $gray-200;
          cursor: pointer;
        }
      }
    }

    .bar {
      height: 100%;
      width: size(1);
      background: $gray-400;
    }

    .preview {
      padding: size(10);
      height: 100%;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: fz(16);
      overflow: hidden;
    }
  }

  .el-tabs__header {
    margin-bottom: 0;
  }
}
</style>
