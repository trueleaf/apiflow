import { request } from '@/api/api';
import { standaloneCache } from '@/cache/standalone.ts';
import { findNodeById, forEachForest } from "@/helper";
import { ApidocBanner, ApidocBannerOfWebsocketNode, ApidocBannerOfHttpNode, Response } from '@src/types';
import { defineStore } from "pinia";
import { ref } from "vue";

type SplicePayload = {
  opData?: ApidocBanner[],
  start: number,
  deleteCount?: number,
  item?: ApidocBanner,
}
type MapId = {
  oldId: string, //历史id
  newId: string, //新id
  oldPid: string, //历史pid
  newPid: string, //新pid
};
// 使用条件类型来确保类型安全
type EditBannerPayload<T extends ApidocBanner, K extends keyof T> = {
  id: string,
  field: K,
  value: T[K],
};

export const useApidocBanner = defineStore('apidocBanner', () => {
  const loading = ref(false);
  const banner = ref<ApidocBanner[]>([]);
  const defaultExpandedKeys = ref<string[]>([]);
  
  //根据id改变节点属性 - 使用类型断言但更安全
  const changeBannerInfoById = <T extends ApidocBanner, K extends keyof T>(payload: EditBannerPayload<T, K>): void => {
    const { id, field, value } = payload;
    const editData = findNodeById(banner.value, id, {
      idKey: '_id',
    }) as T;
    if (editData && field in editData) {
      editData[field] = value;
    }
  }
  
  // 类型安全的 WebSocket banner 更新方法
  const changeWebsocketBannerInfoById = <K extends keyof ApidocBannerOfWebsocketNode>(
    payload: EditBannerPayload<ApidocBannerOfWebsocketNode, K>
  ): void => {
    changeBannerInfoById<ApidocBannerOfWebsocketNode, K>(payload);
  }
  
  // 类型安全的 HTTP banner 更新方法
  const changeHttpBannerInfoById = <K extends keyof ApidocBannerOfHttpNode>(
    payload: EditBannerPayload<ApidocBannerOfHttpNode, K>
  ): void => {
    changeBannerInfoById<ApidocBannerOfHttpNode, K>(payload);
  }
  //改变文档banner
  const changeAllDocBanner = (payload: ApidocBanner[]): void => {
    banner.value = payload;
  }
  //改变文档的id和pid，一般用在粘贴多个文档的时候
  const changeBannerIdAndPid = (mapIds: MapId[]): void => {
    forEachForest(banner.value, (node) => {
      const matchedIdInfo = mapIds.find((v) => v.oldId === node._id)
      if (matchedIdInfo) {
        node._id = matchedIdInfo.newId;
        node.pid = matchedIdInfo.newPid;
      }
    });
  }
  //改变文档数据
  const splice = (payload: SplicePayload): void => {
    const { start, deleteCount = 0, item, opData } = payload;
    const currentOperationData = opData || banner.value;
    if (item) {
      currentOperationData.splice(start, deleteCount, item)
    } else {
      currentOperationData.splice(start, deleteCount)
    }
  }
  //新增一个展开项
  const addExpandItem = (payload: string): void => {
    defaultExpandedKeys.value.push(payload);
  }
  //改变整个展开项目
  const changeExpandItems = (payload: string[]): void => {
    defaultExpandedKeys.value = payload;
  }
  //改变加载状态
  const changeBannerLoading = (state: boolean): void => {
    loading.value = state
  }
  /*
  |--------------------------------------------------------------------------
  | 接口调用
  |--------------------------------------------------------------------------
  |
  */
   /**
   * 获取文档左侧导航数据
   */
  const getDocBanner = async(payload: { projectId: string }): Promise<ApidocBanner[]> => {
    return new Promise(async (resolve, reject) => {
      if (__STANDALONE__) {
        const banner = await standaloneCache.getApiNodesAsTree(payload.projectId);
        changeAllDocBanner(banner)
        resolve(banner)
        return
      }
      const params = {
        projectId: payload.projectId,
      };
      request.get('/api/project/doc_tree_node', { params }).then((res) => {
        const result = res.data;
        changeAllDocBanner(result)
        resolve(result)
      }).catch((err) => {
        reject(err);
      });
    });
  }
  /**
   * 获取分享文档左侧导航数据
   */
  const getSharedDocBanner = (payload: { shareId: string, password: string }): Promise<ApidocBanner[]> => {
    return new Promise((resolve, reject) => {
      const params = {
        shareId: payload.shareId,
        password: payload.password,
      };
      request.get<Response<ApidocBanner[]>, Response<ApidocBanner[]>>('/api/project/export/share_banner', { params }).then((res) => {
        if (res.code === 101005) {
          //todo
          // shareRouter.replace({
          //   path: '/check',
          //   query: {
          //     share_id: shareRouter.currentRoute.value.query.share_id,
          //     id: shareRouter.currentRoute.value.query.id,
          //   },
          // });
          return;
        }
        const result = res.data;
        changeAllDocBanner(result)
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }
  return {
    loading,
    banner,
    defaultExpandedKeys,
    changeBannerInfoById,
    changeWebsocketBannerInfoById,
    changeHttpBannerInfoById,
    changeAllDocBanner,
    changeBannerIdAndPid,
    splice,
    addExpandItem,
    changeExpandItems,
    changeBannerLoading,
    getDocBanner,
    getSharedDocBanner,
  }
})