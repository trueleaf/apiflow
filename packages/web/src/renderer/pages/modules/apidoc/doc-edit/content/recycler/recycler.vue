<template>
  <div class="recycler">
    <!-- 头部 -->
    <div class="recycler-header">
      <div class="header-title mr-4 d-flex a-center">
        <span class="title-text">接口回收站</span>
      </div>
    </div>
    <!-- 过滤条件 -->
    <div class="search">
      <!-- 操作人员 -->
      <div class="op-item">
        <div>操作人员：</div>
        <el-checkbox-group v-model="formInfo.operators">
          <el-checkbox v-for="(item, index) in memberEnum" :key="index" :value="item._id">{{ item.realName }}</el-checkbox>
        </el-checkbox-group>
        <el-button link type="primary" text @click="handleClearOperator">清空</el-button>
      </div>
      <!-- 日期范围 -->
      <div class="op-item">
        <div class="flex0">
          <span>日期范围&nbsp;</span>
          <span>：</span>
        </div>
        <el-radio-group v-model="dateRange">
          <el-radio value="1d">今天</el-radio>
          <el-radio value="yesterday">昨天</el-radio>
          <el-radio value="2d">近两天</el-radio>
          <el-radio value="3d">近三天</el-radio>
          <el-radio value="7d">近七天</el-radio>
          <el-radio value="自定义">自定义</el-radio>
          <el-date-picker v-if="dateRange === '自定义'" v-model="customDateRange" type="datetimerange" range-separator="至"
            value-format="x" start-placeholder="开始日期" class="mr-1" end-placeholder="结束日期">
          </el-date-picker>
          <el-button link type="primary" text @click="handleClearDate">清空</el-button>
        </el-radio-group>
      </div>
      <!-- 接口名称和接口url -->
      <div class="op-item">
        <div class="d-flex a-center mr-5">
          <div class="flex0">接口名称：</div>
          <el-input v-model="formInfo.docName" :size="config.renderConfig.layout.size" placeholder="通过接口名称匹配"
            maxlength="100" clearable></el-input>
        </div>
        <div class="d-flex a-center mr-5">
          <div class="flex0">接口url：</div>
          <el-input v-model="formInfo.url" :size="config.renderConfig.layout.size" placeholder="通过接口url匹配"
            maxlength="100" clearable></el-input>
        </div>
        <div>
          <el-button type="info" @click="clearAll">全部清空</el-button>
          <el-button :loading="loading" type="success" @click="getData">刷新</el-button>
        </div>
      </div>
    </div>
    <!-- 列表展示 -->
    <SLoading v-if="deletedList.length > 0" :loading="loading" class="list">
      <div v-for="(item, index) in deletedInfo" :key="index" class="list-wrap">
        <h2 class="title">{{ item.title }}</h2>
        <div class="oneday-wrap">
          <div v-for="(chunkDeleteInfo, key) in item.deleted" :key="key" class="date-chunk">
            <h3 class="date my-2">{{ formatDate(key, "a HH:mm") }}</h3>
            <div class="date-list-wrap">
              <div v-for="(docInfo, index3) in chunkDeleteInfo" :key="index3" class="docinfo">
                <div class="op-area mr-4">
                  <el-button link type="primary" text :loading="loading2" @click="handleRestore(docInfo)">恢复</el-button>
                  <el-divider direction="vertical"></el-divider>
                  <el-popover :visible="docInfo._visible" placement="right" width="auto" transition="none" trigger="click">
                    <doc-detail v-if="docInfo._visible" :id="docInfo._id"
                      @close="docInfo._visible = false;"></doc-detail>
                    <template #reference>
                      <el-button link type="primary" text @click.stop="handleShowDetail(docInfo)">详情</el-button>
                    </template>
                  </el-popover>
                </div>
                <div class="operator mr-1">{{ docInfo.deletePerson }}</div>
                <div class="mr-2">删除了</div>
                <div v-if="docInfo.isFolder" class="d-flex a-center">
                  <img :src="folderUrl" width="16" height="16" class="mr-1" />
                  <span>{{ docInfo.name }}</span>
                </div>
                <div v-else class="d-flex a-center">
                  <img :src="fileUrl" width="16" height="16" class="mr-1" />
                  <span class="mr-2">{{ docInfo.name }}</span>
                  <template v-for="(req) in validRequestMethods">
                    <span v-if="docInfo.method === req.value.toLowerCase()" :key="req.value" class="mr-1"
                      :style="{ color: req.iconColor }">{{ req.name }}</span>
                  </template>
                  <span>{{ docInfo.path }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SLoading>
  </div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, onUnmounted, watch, computed } from 'vue'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'
import 'dayjs/locale/zh-cn'
import 'element-plus/es/components/message-box/style/css';
import { ElMessageBox } from 'element-plus'
import type { ApidocHttpRequestMethod, ApidocType, ResponseTable } from '@src/types/global'
import { router } from '@/router/index'
import { request } from '@/api/api'
import SLoading from '@/components/common/loading/g-loading.vue'
import { forEachForest, debounce, event } from '@/helper'
import docDetail from './components/doc-detail.vue'
import { useApidocBanner } from '@/store/apidoc/banner'
import { useApidocBaseInfo } from '@/store/apidoc/base-info'
import { config } from '@src/config/config'
import { formatDate } from '@/helper'
import { Delete } from '@element-plus/icons-vue'


dayjs.extend(isYesterday)
dayjs.extend(isToday);
//todo 日期国际化
dayjs.locale('zh-cn')

type DeleteInfo = {
  _id: string, //项目id
  deletePerson: string, //删除人
  deletePersonId: string, //删除人id
  host: string, //host信息
  isFolder: boolean, //是否为文件夹
  method: ApidocHttpRequestMethod, //请求方法
  name: string, //文件名称
  path: string, //请求路径
  pid: string, //父元素id
  type: ApidocType, //文档类型
  updatedAt: string, //更新时间
  _visible?: boolean,
};
type SearchInfo = {
  projectId: string, //项目id
  startTime: number | null, //--起始日期
  endTime: number | null, //----结束日期
  docName: string, //---------请求名称
  url: string, //----------请求url
  operators: string[], //----操作者信息
}

const projectId = router.currentRoute.value.query.id as string; //项目id
const folderUrl = new URL('@/assets/imgs/apidoc/folder.png', import.meta.url).href;
const fileUrl = new URL('@/assets/imgs/apidoc/file.png', import.meta.url).href;
const formInfo: Ref<SearchInfo> = ref({
  projectId, //项目id
  startTime: null, //--起始日期
  endTime: null, //----结束日期
  docName: '', //---------请求名称
  url: '', //----------请求url
  operators: [], //----操作者信息
})
const apidocBannerStore = useApidocBanner()
const apidocBaseInfoStore = useApidocBaseInfo()
/*
|--------------------------------------------------------------------------
| 获取已删除数据信息
|--------------------------------------------------------------------------
*/
const loading = ref(false); //获取数据加载状态
const deletedList: Ref<DeleteInfo[]> = ref([]); //已删除数据列表
const getData = () => {
  loading.value = true;
  const params = formInfo.value;
  request.post<ResponseTable<DeleteInfo[]>, ResponseTable<DeleteInfo[]>>('/api/docs/docs_deleted_list', params).then((res) => {
    deletedList.value = res.data.rows;
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
}

/*
|--------------------------------------------------------------------------
| 搜索相关内容
|--------------------------------------------------------------------------
*/
const memberEnum: Ref<{ loginName: string, realName: string, _id: string }[]> = ref([]); //操作人员
const dateRange: Ref<string> = ref(''); //日期范围
const customDateRange: Ref<string[]> = ref([]); //自定义日期范围
//获取操作人员枚举
const getOperatorEnum = () => {
  const params = {
    projectId,
  };
  request.get('/api/docs/docs_history_operator_enum', { params }).then((res) => {
    memberEnum.value = res.data;
  }).catch((err) => {
    console.error(err);
  });
}
//清空操作人员
const handleClearOperator = () => {
  formInfo.value.operators = [];
}
//清空日期范围
const handleClearDate = () => {
  dateRange.value = ''; //startTime和endTime会在watch中发送改变
}
//全部清空
const clearAll = () => {
  handleClearOperator();
  handleClearDate();
  formInfo.value.url = '';
  formInfo.value.docName = '';
}
//自定义日期范围
watch(() => dateRange.value, (val) => {
  let startTime: number | null = new Date(new Date().setHours(0, 0, 0, 0)).valueOf();
  let endTime: number | null = null;
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
watch(() => customDateRange.value, (val) => {
  if (!val || val.length === 0) {
    formInfo.value.startTime = null;
    formInfo.value.endTime = null;
  } else {
    formInfo.value.startTime = Number(val[0]);
    formInfo.value.endTime = Number(val[1]);
  }
})

const debounceGetData = debounce(getData, 500);
// 监听接口名称、url，节流搜索
watch(() => [formInfo.value.docName, formInfo.value.url], () => {
  debounceGetData();
});
// 监听操作人员、开始和结束时间，实时搜索
watch(() => [formInfo.value.operators, formInfo.value.startTime, formInfo.value.endTime], () => {
  getData();
});

onMounted(() => {
  getData();
  getOperatorEnum();
  document.documentElement.addEventListener('click', closeAllDetailPopovers);
  event.on('apidoc/deleteDocs', getData);
});

onUnmounted(() => {
  document.documentElement.removeEventListener('click', closeAllDetailPopovers);
});
/*
|--------------------------------------------------------------------------
| 列表数据
|--------------------------------------------------------------------------
*/
//被删除数据
const deletedInfo = computed(() => {
  const result: Record<string, {
    title: string,
    deleted: Record<string, DeleteInfo[]>
  }> = {};
  deletedList.value.forEach((item) => {
    const { updatedAt } = item;
    const ymdString = dayjs(updatedAt).format('YYYY-MM-DD');
    const ymdhmString = dayjs(updatedAt).format('YYYY-MM-DD HH:mm');
    if (!result[ymdString]) {
      let title = '';
      if (dayjs(updatedAt).isToday()) {
        title = '今天'
      } else if (dayjs(updatedAt).isYesterday()) {
        title = '昨天'
      } else {
        title = dayjs(updatedAt).format('YYYY年M月DD号');
      }
      result[ymdString] = {
        title,
        deleted: {},
      };
    }
    if (!result[ymdString].deleted[ymdhmString]) {
      result[ymdString].deleted[ymdhmString] = [];
    }
    result[ymdString].deleted[ymdhmString].push(item);
  })
  return result;
})
//请求方法
const validRequestMethods = computed(() => apidocBaseInfoStore.rules.requestMethods)

/*
|--------------------------------------------------------------------------
| 列表数据相关操作
|--------------------------------------------------------------------------
*/
const loading2 = ref(false); //回复按钮
//恢复接口
const restoreDocDirectly = (docInfo: DeleteInfo) => {
  ElMessageBox.confirm(`确实要恢复 ${docInfo.name} 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    loading2.value = true;
    const params = {
      _id: docInfo._id,
      projectId,
    };
    request.put('/api/docs/docs_restore', params).then((res) => {
      const delIds = res.data;
      for (let i = 0; i < delIds.length; i += 1) {
        const id = delIds[i];
        const delIndex = deletedList.value.findIndex((val) => val._id === id);
        deletedList.value.splice(delIndex, 1)
      }
      apidocBannerStore.getDocBanner({ projectId });
    }).catch((err) => {
      console.error(err);
    }).finally(() => {
      loading2.value = false;
    });
  }).catch((err) => {
    if (err === 'cancel' || err === 'close') {
      return;
    }
    console.error(err);
  });
}
//恢复接口
const handleRestore = (docInfo: DeleteInfo) => {
  const banner = apidocBannerStore.banner;
  const { pid, isFolder } = docInfo;
  let hasParent = false;
  forEachForest(banner, (node) => {
    if (node._id === pid) {
      hasParent = true;
    }
  });
  if (!pid && !isFolder) { //文档，根元素
    restoreDocDirectly(docInfo)
  } else if (pid && !isFolder && hasParent) { //文档，非根元素,存在父元素
    restoreDocDirectly(docInfo)
  } else if (pid && !isFolder && !hasParent) { //文档，非根元素,不存在父元素
    restoreDocDirectly(docInfo)
  } else {
    restoreDocDirectly(docInfo)
  }
}
//关闭所有详情popover
const closeAllDetailPopovers = () => {
  deletedList.value.forEach((item) => {
    item._visible = false;
  });
}
//查看详情
const handleShowDetail = (docInfo: DeleteInfo) => {
  closeAllDetailPopovers();
  docInfo._visible = true;
};

</script>

<style lang='scss' scoped>
.recycler {
  padding: 0 20px 10px;
  height: calc(100vh - 100px);
  width: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  // 头部
  .recycler-header {
    display: flex;
    flex-direction: column;
    padding: 15px 0;

    .header-title {
      font-size: 22px;
      font-weight: bold;

      .title-text {
        font-size: 22px;
        font-weight: bold;
        margin-left: 4px;
      }
    }

    .desc {
      color: #888;
      font-size: 14px;
      margin-left: 12px;
    }
  }

  // 搜索
  .search {
    flex: 0 0 auto;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    border: 1px solid var(--gray-300);
    border-radius: 4px;
    padding: 5px 20px;

    .el-checkbox,
    .el-radio {
      margin-right: 15px;
    }

    .op-item {
      min-height: 40px;
      display: flex;
      align-items: center;

      .el-button--text {
        padding-top: 5px;
        padding-bottom: 5px;
      }
    }
  }

  // 列表展示
  .list {
    flex: 1;
    overflow-y: auto;
    .date-chunk {
      margin-left: 30px;
      display: flex;
      flex-direction: column;
      .date-list-wrap {
        margin-left: 30px;
        .docinfo {
          display: flex;
          align-items: center;
          height: 30px;
          &:hover {
            background: var(--gray-200);
          }
        }
      }
    }
  }

}
</style>
