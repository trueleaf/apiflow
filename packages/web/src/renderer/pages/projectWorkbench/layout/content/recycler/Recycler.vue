<template>
  <div class="recycler">
    <!-- 头部 -->
    <div class="recycler-header">
      <div class="header-title mr-4 d-flex a-center">
        <span class="title-text">{{ t('接口回收站') }}</span>
      </div>
    </div>
    <!-- 过滤条件 -->
    <div class="search">
      <!-- 操作人员 -->
      <div v-if="!isStandalone" class="op-item">
        <div>{{ t('操作人员') }}：</div>
        <el-checkbox-group v-model="formInfo.operators">
          <el-checkbox v-for="(item, index) in memberEnum" :key="index" :value="item._id">{{ item.realName }}</el-checkbox>
        </el-checkbox-group>
        <el-button link type="primary" text @click="handleClearOperator">{{ t('清空') }}</el-button>
      </div>
      <!-- 日期范围 -->
      <div class="op-item">
        <div class="flex0">
          <span>{{ t('日期范围') }}&nbsp;</span>
          <span>：</span>
        </div>
        <el-radio-group v-model="dateRange">
          <el-radio value="1d">{{ t('今天') }}</el-radio>
          <el-radio value="yesterday">{{ t('昨天') }}</el-radio>
          <el-radio value="2d">{{ t('近两天') }}</el-radio>
          <el-radio value="3d">{{ t('近三天') }}</el-radio>
          <el-radio value="7d">{{ t('近七天') }}</el-radio>
          <el-radio value="自定义">{{ t('自定义') }}</el-radio>
          <el-date-picker v-if="dateRange === '自定义'" v-model="customDateRange" type="datetimerange" :range-separator="t('至')"
            value-format="x" :start-placeholder="t('开始日期')" class="mr-1" :end-placeholder="t('结束日期')">
          </el-date-picker>
          <el-button link type="primary" text @click="handleClearDate">{{ t('清空') }}</el-button>
        </el-radio-group>
      </div>
      <!-- 接口名称和接口url -->
      <div class="op-item">
        <div class="d-flex a-center mr-5">
          <div class="flex0">{{ t('接口名称') }}：</div>
          <el-input v-model="formInfo.docName" :size="config.renderConfig.layout.size" :placeholder="t('通过接口名称匹配')"
            maxlength="100" clearable></el-input>
        </div>
        <div class="d-flex a-center mr-5">
          <div class="flex0">{{ t('接口url') }}：</div>
          <el-input v-model="formInfo.url" :size="config.renderConfig.layout.size" :placeholder="t('通过接口url匹配')"
            maxlength="100" clearable></el-input>
        </div>
        <div>
          <el-button type="info" @click="clearAll">{{ t('全部清空') }}</el-button>
          <el-button :loading="loading" type="success" @click="getData">{{ t('刷新') }}</el-button>
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
                  <el-button link type="primary" text :loading="loading2" @click="handleRestore(docInfo)">{{ t('恢复') }}</el-button>
                  <el-divider direction="vertical"></el-divider>
                  <el-popover :visible="docInfo._visible" placement="right" width="auto" transition="none" trigger="click">
                    <doc-detail v-if="docInfo._visible" :id="docInfo._id"
                      @close="docInfo._visible = false;"></doc-detail>
                    <template #reference>
                      <el-button link type="primary" text @click.stop="handleShowDetail(docInfo)">{{ t('详情') }}</el-button>
                    </template>
                  </el-popover>
                </div>
                <div class="operator mr-1">{{ docInfo.deletePerson }}</div>
                <div class="mr-2">{{ t('删除了') }}</div>
                <!-- 节点图标和名称展示 -->
                <div class="node-info">
                  <!-- folder 类型 -->
                  <template v-if="docInfo.type === 'folder'">
                    <i class="iconfont folder-icon iconweibiaoti-_huabanfuben"></i>
                    <span>{{ docInfo.name }}</span>
                  </template>
                  <!-- http 类型 -->
                  <template v-else-if="docInfo.type === 'http'">
                    <template v-for="(req) in validRequestMethods">
                      <span v-if="docInfo.method?.toLowerCase() === req.value.toLowerCase()" :key="req.value"
                        class="file-icon" :style="{ color: req.iconColor }">{{ req.name }}</span>
                    </template>
                    <span class="mr-2">{{ docInfo.name }}</span>
                    <span class="node-path">{{ docInfo.path }}</span>
                  </template>
                  <!-- httpMock 类型 -->
                  <template v-else-if="docInfo.type === 'httpMock'">
                    <span class="mock-icon">mock</span>
                    <span class="mr-2">{{ docInfo.name }}</span>
                    <span class="node-path">{{ docInfo.path }}</span>
                  </template>
                  <!-- websocket 类型 -->
                  <template v-else-if="docInfo.type === 'websocket'">
                    <span class="ws-icon">{{ (docInfo.protocol || 'ws').toUpperCase() }}</span>
                    <span class="mr-2">{{ docInfo.name }}</span>
                    <span class="node-path">{{ docInfo.path }}</span>
                  </template>
                  <!-- websocketMock 类型 -->
                  <template v-else-if="docInfo.type === 'websocketMock'">
                    <Radio class="ws-mock-icon" :size="14" />
                    <span class="mr-2">{{ docInfo.name }}</span>
                    <span class="node-path">{{ docInfo.path }}</span>
                  </template>

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
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'
import 'dayjs/locale/zh-cn'
import { ClConfirm } from '@/components/ui/cleanDesign/clConfirm/ClConfirm2';
import type { HttpNodeRequestMethod, ApidocType, ResponseTable, ApiNode, HttpNode, WebSocketNode, HttpMockNode, WebSocketMockNode } from '@src/types'
import { router } from '@/router/index'
import { request } from '@/api/api'
import SLoading from '@/components/common/loading/ClLoading.vue'
import { formatDate } from '@/helper'
import { eventEmitter } from '@/helper'
import { forEachForest } from '@/helper'
import { debounce } from "lodash-es"
import docDetail from './components/DocDetail.vue'
import { useBanner } from '@/store/projectWorkbench/bannerStore'
import { requestMethods as validRequestMethods } from '@/data/data'

const { t } = useI18n()
import { config } from '@src/config/config'
// import { Delete } from '@element-plus/icons-vue'
import { apiNodesCache } from '@/cache/nodes/nodesCache'
import { useRuntime } from '@/store/runtime/runtimeStore'
import { Radio } from 'lucide-vue-next'


dayjs.extend(isYesterday)
dayjs.extend(isToday);
//todo 日期国际化
dayjs.locale('zh-cn')

type DeleteInfo = {
  _id: string, //项目id
  deletePerson: string, //删除人
  deletePersonId: string, //删除人id
  method: HttpNodeRequestMethod, //请求方法
  name: string, //文件名称
  path: string, //请求路径
  pid: string, //父元素id
  type: ApidocType, //文档类型
  protocol?: 'ws' | 'wss', //websocket协议类型
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
const runtimeStore = useRuntime();
const isStandalone = computed(() => runtimeStore.networkMode === 'offline')
const formInfo: Ref<SearchInfo> = ref({
  projectId, //项目id
  startTime: null, //--起始日期
  endTime: null, //----结束日期
  docName: '', //---------请求名称
  url: '', //----------请求url
  operators: [], //----操作者信息
})
const bannerStore = useBanner()
//将 ApiNode 转换为 DeleteInfo 格式
const convertNodeToDeleteInfo = (node: ApiNode): DeleteInfo => {
  const base = {
    _id: node._id,
    pid: node.pid,
    name: node.info.name,
    type: node.info.type,
    deletePerson: node.info.deletePerson || '',
    deletePersonId: '',
    updatedAt: node.updatedAt,
    _visible: false,
  };
  switch (node.info.type) {
    case 'http':
      return {
        ...base,
        method: (node as HttpNode).item.method,
        path: (node as HttpNode).item.url.path,
      };
    case 'websocket':
      return {
        ...base,
        method: 'GET',
        path: (node as WebSocketNode).item.url.path,
        protocol: (node as WebSocketNode).item.protocol,
      };
    case 'httpMock': {
      const mockMethod = (node as HttpMockNode).requestCondition.method[0];
      return {
        ...base,
        method: mockMethod === 'ALL' ? 'GET' : (mockMethod || 'GET'),
        path: (node as HttpMockNode).requestCondition.url,
      };
    }
    case 'websocketMock':
      return {
        ...base,
        method: 'GET',
        path: (node as WebSocketMockNode).requestCondition.path,
      };
    default:
      return {
        ...base,
        method: 'GET',
        path: '',
      };
  }
};
/*
|--------------------------------------------------------------------------
| 获取已删除数据信息
|--------------------------------------------------------------------------
*/
const loading = ref(false); //获取数据加载状态
const deletedList: Ref<DeleteInfo[]> = ref([]); //已删除数据列表
const getData = async () => {
  if (isStandalone.value) {
    const nodes = await apiNodesCache.getDeletedNodesList(projectId);
    deletedList.value = nodes.map((node) => convertNodeToDeleteInfo(node as ApiNode));
    return;
  }
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
  if (!isStandalone.value) {
    getOperatorEnum();
  }
  document.documentElement.addEventListener('click', closeAllDetailPopovers);
  eventEmitter.on('apidoc/deleteDocs', getData);
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

/*
|--------------------------------------------------------------------------
| 列表数据相关操作
|--------------------------------------------------------------------------
*/
const loading2 = ref(false); //回复按钮
//恢复接口
const restoreDocDirectly = (docInfo: DeleteInfo) => {
  ClConfirm({
    content: `确实要恢复 ${docInfo.name} 吗?`,
    title: '提示',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    if (isStandalone.value) {
      const delIds = await apiNodesCache.restoreNode(docInfo._id);
      for (let i = 0; i < delIds.length; i += 1) {
        const id = delIds[i];
        const delIndex = deletedList.value.findIndex((val) => val._id === id);
        if (delIndex !== -1) {
          deletedList.value.splice(delIndex, 1)
        }
      }
      bannerStore.getDocBanner({ projectId });
      return;
    }
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
        if (delIndex !== -1) {
          deletedList.value.splice(delIndex, 1)
        }
      }
      bannerStore.getDocBanner({ projectId });
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
  const banner = bannerStore.banner;
  const { pid, type } = docInfo;
  let hasParent = false;
  forEachForest(banner, (node) => {
    if (node._id === pid) {
      hasParent = true;
    }
  });
  if (!pid && type !== 'folder') { //文档，根元素
    restoreDocDirectly(docInfo)
  } else if (pid && type !== 'folder' && hasParent) { //文档，非根元素,存在父元素
    restoreDocDirectly(docInfo)
  } else if (pid && type !== 'folder' && !hasParent) { //文档，非根元素,不存在父元素
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
      color: var(--text-gray-500);
      font-size: 14px;
      margin-left: 12px;
    }
  }

  // 搜索
  .search {
    flex: 0 0 auto;
    box-shadow: var(--box-shadow-sm);
    border: 1px solid var(--border-base);
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
            background: var(--bg-hover);
          }
          .node-info {
            display: flex;
            align-items: center;
          }
          .file-icon {
            font-size: 14px;
            margin-right: 5px;
          }
          .mock-icon {
            font-size: 10px;
            margin-right: 5px;
            color: var(--blue);
          }
          .ws-icon {
            font-size: 14px;
            margin-right: 5px;
            color: var(--red);
          }
          .ws-mock-icon {
            margin-right: 5px;
            color: var(--purple);
            flex-shrink: 0;
          }
          .folder-icon {
            color: var(--yellow);
            width: 16px;
            height: 16px;
            margin-right: 5px;
          }
          .md-icon {
            font-size: 12px;
            margin-right: 5px;
            color: var(--text-tertiary);
          }
          .node-path {
            color: var(--text-tertiary);
          }
        }
      }
    }
  }

}
</style>
