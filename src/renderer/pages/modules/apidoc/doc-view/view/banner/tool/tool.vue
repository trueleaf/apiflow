/*
    创建者：shuxiaokai
    创建时间：2021-07-27 21:24
    模块名称：banner菜单顶部搜索和操作区域
    备注：
*/
<template>
  <div class="tool">
    <h2 v-if="projectName" class="gray-700 f-lg text-center text-ellipsis" :title="projectName">{{ projectName }}</h2>
    <h2 v-else class="gray-700 f-lg text-center text-ellipsis" :title="projectName">/</h2>
    <div class="p-relative">
      <el-input v-model="formInfo.iptValue" class="doc-search" :placeholder="t('文档名称、文档url')" clearable @change="handleFilterBanner"></el-input>
      <el-badge :is-dot="hasFilterCondition" class="badge">
        <el-popover placement="right-end" transition="none" width="50vw" trigger="click">
          <template #reference>
            <div class="advance" :title="t('高级筛选')">
              <i class="iconfont icongaojishaixuan"></i>
            </div>
          </template>
          <SFieldset title="过滤条件" class="search-panel">
            <!-- 操作人员 -->
            <div class="op-item a-center">
              <div class="flex0">{{ t("操作人员") }}：</div>
              <el-checkbox-group v-model="formInfo.maintainers">
                <el-checkbox v-for="(item, index) in maintainerEnum" :key="index" :value="item"></el-checkbox>
                <el-button link type="primary" text class="ml-2" @click="handleClearMaintainer">{{ t("清空") }}</el-button>
              </el-checkbox-group>
            </div>
            <!-- 日期范围 -->
            <div class="op-item">
              <div class="flex0">
                <span>{{ t("录入日期") }}&nbsp;</span>
                <span>：</span>
              </div>
              <el-radio-group v-model="dateRange">
                <el-radio value="1d">{{ t("今天") }}</el-radio>
                <el-radio value="2d">{{ t("近两天") }}</el-radio>
                <el-radio value="3d">{{ t("近三天") }}</el-radio>
                <el-radio value="7d">{{ t("近七天") }}</el-radio>
                <el-radio :value="t('自定义')">{{ t("自定义") }}</el-radio>
                <el-date-picker
                  v-if="dateRange === t('自定义')"
                  v-model="customDateRange"
                  type="datetimerange"
                  :range-separator="t('至')"
                  value-format="x"
                  :start-placeholder="t('开始日期')"
                  class="mr-1"
                  :end-placeholder="t('结束日期')"
                >
                </el-date-picker>
                <el-button link type="primary" text @click="handleClearDate">{{ t("清空") }}</el-button>
              </el-radio-group>
            </div>
            <!-- 最近多少条数据 -->
            <div class="op-item">
              <div class="flex0">
                <span>{{ t("最近多少条") }}&nbsp;</span>
                <span>：</span>
              </div>
              <el-radio-group v-model="formInfo.recentNum">
                <el-radio :value="2">{{ t("2条") }}</el-radio>
                <el-radio :value="5">{{ t("5条") }}</el-radio>
                <el-radio :value="10">{{ t("10条") }}</el-radio>
                <el-radio :value="15">{{ t("15条") }}</el-radio>
                <el-button link type="primary" text @click="handleClearRecentNum">{{ t("清空") }}</el-button>
              </el-radio-group>
            </div>
          </SFieldset>
        </el-popover>
      </el-badge>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import type { ApidocBanner } from '@src/types/global'
import { store } from '@/pages/modules/apidoc/doc-view/store/index'
import { forEachForest } from '@/helper/index'

const emits = defineEmits(['fresh', 'filter'])
//=====================================操作栏数据====================================//
const bannerData = computed(() => {
  const originBannerData = store.state['apidoc/banner'].banner;
  return originBannerData
})
const projectName = computed(() => store.state['apidoc/baseInfo'].projectName)
//=====================================操作相关数据====================================//

/*
|--------------------------------------------------------------------------
| 数据过滤
|--------------------------------------------------------------------------
*/
const formInfo = ref({
  iptValue: '', //u
  startTime: null as null | number, //--起始日期
  endTime: null as null | number, //----结束日期
  maintainers: [] as string[], //----操作者信息
  recentNum: 0, //-显示最近多少条
})
//是否存在过滤条件
const hasFilterCondition = computed(() => {
  const hasTimeCondition = formInfo.value.startTime && formInfo.value.endTime;
  const hasOperatorCondition = formInfo.value.maintainers.length > 0;
  const hasRecentNumCondition = formInfo.value.recentNum;
  return !!(hasTimeCondition || hasOperatorCondition || hasRecentNumCondition);
})
//用户列表
const maintainerEnum = computed(() => {
  const { banner } = store.state['apidoc/banner'];
  const allBanner: string[] = [];
  forEachForest(banner, (bannerInfo) => {
    if (bannerInfo.maintainer && !allBanner.includes(bannerInfo.maintainer)) {
      allBanner.push(bannerInfo.maintainer);
    }
  })
  return allBanner;
});
//=====================================日期相关====================================//
//日期范围
const dateRange = ref('');
//自定义日期范围
const customDateRange = ref([]);
//清空日期
const handleClearDate = () => {
  dateRange.value = ''
}
//监听日起段变化
watch(() => dateRange.value, (val) => {
  let startTime: number | null = new Date(new Date().setHours(0, 0, 0, 0)).valueOf();
  let endTime = null;
  switch (val) {
  case '1d':
    endTime = Date.now();
    break;
  case '2d':
    endTime = Date.now();
    startTime = endTime - 86400000;
    break;
  case '3d':
    endTime = Date.now();
    startTime = endTime - 3 * 86400000;
    break;
  case '7d':
    endTime = Date.now();
    startTime = endTime - 7 * 86400000;
    break;
  case 'yesterday':
    endTime = startTime;
    startTime -= 86400000;
    break;
  default: //自定义
    startTime = null;
    endTime = null;
    customDateRange.value = [];
    break;
  }
  formInfo.value.startTime = startTime;
  formInfo.value.endTime = endTime;
})
//监听日期段变化
watch(() => customDateRange.value, (val) => {
  if (!val || val.length === 0) {
    formInfo.value.startTime = null;
    formInfo.value.endTime = null;
  } else {
    formInfo.value.startTime = val[0];
    formInfo.value.endTime = val[1];
  }
})
//=====================================维护者信息====================================//
//清除所有的维护者数据
const handleClearMaintainer = () => {
  formInfo.value.maintainers = [];
}
//=====================================最近数据条数====================================//
//清除最近新增条数条件
const handleClearRecentNum = () => {
  formInfo.value.recentNum = 0;
}
//=====================================监听数据变化====================================//
watch(() => formInfo.value, (formData) => {
  let plainBannerData: ApidocBanner[] = [];
  const { startTime, endTime, maintainers, recentNum } = formData;
  forEachForest(bannerData.value, (v) => {
    if (!v.isFolder) {
      plainBannerData.push(v);
    }
  })
  if (maintainers.length === 0 && !startTime && !recentNum) {
    emits('filter', {
      iptValue: formData.iptValue,
      recentNumIds: null,
    });
    return
  }

  //录入人员
  if (maintainers.length > 0) {
    plainBannerData = plainBannerData.filter(v => maintainers.find(v2 => v2 === v.maintainer))
  }
  //录入时间
  if (startTime && endTime) {
    plainBannerData = plainBannerData.filter(v => {
      const updateTimestamp = new Date(v.updatedAt).getTime();
      return updateTimestamp > startTime && updateTimestamp < endTime;
    })
  }
  //录入数据个数
  if (recentNum) {
    plainBannerData = plainBannerData.sort((a, b) => {
      const aTime = new Date(a.updatedAt).getTime();
      const bTime = new Date(b.updatedAt).getTime();
      return bTime - aTime;
    }).slice(0, recentNum)
  }
  emits('filter', {
    iptValue: formData.iptValue,
    recentNumIds: plainBannerData.map(v => v._id),
  });
}, {
  deep: true,
  immediate: true,
});

const handleFilterBanner = () => {
  let plainBannerData: ApidocBanner[] = [];
  const { startTime, endTime, maintainers, recentNum } = formInfo.value;
  forEachForest(bannerData.value, (v) => {
    if (!v.isFolder) {
      plainBannerData.push(v);
    }
  })
  if (maintainers.length === 0 && !startTime && !recentNum) {
    emits('filter', {
      iptValue: formInfo.value.iptValue,
      recentNumIds: null,
    });
    return
  }
  //录入人员
  if (maintainers.length > 0) {
    plainBannerData = plainBannerData.filter(v => maintainers.find(v2 => v2 === v.maintainer))
  }
  //录入时间
  if (startTime && endTime) {
    plainBannerData = plainBannerData.filter(v => {
      const updateTimestamp = new Date(v.updatedAt).getTime();
      return updateTimestamp > startTime && updateTimestamp < endTime;
    })
  }
  //录入数据个数
  if (formInfo.value.recentNum) {
    plainBannerData.sort((a, b) => {
      const aTime = new Date(a.updatedAt).getTime();
      const bTime = new Date(b.updatedAt).getTime();
      return aTime - bTime;
    }).slice(0, formInfo.value.recentNum)
  }
  emits('filter', {
    iptValue: formInfo.value.iptValue,
    recentNumIds: plainBannerData.map(v => v._id),
  });
}
</script>

<style lang="scss" scoped>
.tool {
    position: relative;
    padding: 0 size(20);
    height: size(150);
    background: $gray-200;
    flex: 0 0 auto;
    .badge {
        width: size(25);
        height: size(25);
        position: absolute;
        top: size(8);
        right: size(18);
        display: flex;
        align-items: center;
        justify-content: center;
        .el-badge__content {
            transition: none;
        }
    }
    //高级筛选按钮
    .advance {
        &>i {
            font-size: fz(14);
            cursor: pointer;
            color: $gray-600;
        }
    }
    // 搜索框样式
    .doc-search {
        border-radius: 20px;
    }
    // 快捷方式样式
    .tool-icon {
        position: relative;
        align-items: center;
        display: flex;
        .item {
            outline: none;
        }
        .operation {
            width: 85%;
            display: flex;
            justify-content: space-between;
        }
        .more {
            display: flex;
            justify-content: center;
            margin-left: auto;
            width: 10%;
            position: relative;
        }
        .svg-icon {
            width: size(25);
            height: size(25);
            padding: size(5);
            &:hover {
                background: $gray-400;
            }
        }
    }
    .more-op {
        width: size(25);
        height: size(25);
        line-height: size(25);
        text-align: center;
        cursor: pointer;
        &:hover {
            background: $gray-400;
        }
    }
}
.dropdown-item {
    height: size(40);
    width: 100%;
    padding: 0 size(10) 0 size(20);
    display: flex;
    align-items: center;
    // cursor: default;
    .label {
        width: size(120);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
    }
    .shortcut {
        width: size(100);
        color: $gray-500;
    }
    .svg-icon {
        width: size(25);
        height: size(25);
        padding: size(5);
    }
    .pin {
        cursor: pointer;
        color: $gray-400;
        &.active {
            color: $theme-color;
            &:hover {
                color: $theme-color;
            }
        }
    }
    &:hover {
        background: $gray-200;
    }
}
.toolbar-close {
    @include rt-close;
}
.el-popover.el-popper.tool-panel {
    padding: 0;
}
.search-panel {
    flex: 0 0 auto;
    .el-checkbox, .el-radio {
        margin-right: size(15);
    }
    .op-item {
        min-height: size(40);
        display: flex;
        align-items: center;
        margin-bottom: size(20);
        &:not(:last-of-type) {
            border-bottom: 1px dashed $gray-300;
        }
        .el-button--text {
            padding-top: size(5);
            padding-bottom: size(5);
        }
        .el-radio-group {
            display: flex;
            align-items: center;
        }
    }
}
</style>
