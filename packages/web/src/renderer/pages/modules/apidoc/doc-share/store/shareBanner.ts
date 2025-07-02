import { defineStore } from 'pinia';
import { ref } from 'vue';
import { request } from '@/api/api';
import { findNodeById, forEachForest } from '@/helper';
import { ApidocBanner, Response } from '@src/types/global';

type SplicePayload = {
  opData?: ApidocBanner[];
  start: number;
  deleteCount?: number;
  item?: ApidocBanner;
};
type MapId = {
  oldId: string;
  newId: string;
  oldPid: string;
  newPid: string;
};
type EditBannerPayload<K extends keyof ApidocBanner> = {
  id: string;
  field: K;
  value: ApidocBanner[K];
};

export const useShareBannerStore = defineStore('shareBanner', () => {
  /*
  |--------------------------------------------------------------------------
  | 变量定义
  |--------------------------------------------------------------------------
  */
  const loading = ref(false);
  const banner = ref<ApidocBanner[]>([]);
  const defaultExpandedKeys = ref<string[]>([]);

  /*
  |--------------------------------------------------------------------------
  | 逻辑处理函数
  |--------------------------------------------------------------------------
  */
  const changeBannerInfoById = <K extends keyof ApidocBanner>(payload: EditBannerPayload<K>): void => {
    const { id, field, value } = payload;
    const editData = findNodeById(banner.value, id, { idKey: '_id' }) as ApidocBanner;
    editData[field] = value;
  };
  const changeAllDocBanner = (payload: ApidocBanner[]): void => {
    banner.value = payload;
  };
  const changeBannerIdAndPid = (mapIds: MapId[]): void => {
    forEachForest(banner.value, (node) => {
      const matchedIdInfo = mapIds.find((v) => v.oldId === node._id);
      if (matchedIdInfo) {
        node._id = matchedIdInfo.newId;
        node.pid = matchedIdInfo.newPid;
      }
    });
  };
  const splice = (payload: SplicePayload): void => {
    const { start, deleteCount = 0, item, opData } = payload;
    const currentOperationData = opData || banner.value;
    if (item) {
      currentOperationData.splice(start, deleteCount, item);
    } else {
      currentOperationData.splice(start, deleteCount);
    }
  };
  const addExpandItem = (payload: string): void => {
    defaultExpandedKeys.value.push(payload);
  };
  const changeExpandItems = (payload: string[]): void => {
    defaultExpandedKeys.value = payload;
  };
  const changeBannerLoading = (state: boolean): void => {
    loading.value = state;
  };
  const getDocBanner = async (payload: { shareId: string }): Promise<ApidocBanner[]> => {
    return new Promise((resolve, reject) => {
      const params = { shareId: payload.shareId };
      request.get('/api/project/export/share_banner', { params }).then((res) => {
        const result = res.data;
        changeAllDocBanner(result);
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  };
  return {
    loading,
    banner,
    defaultExpandedKeys,
    changeBannerInfoById,
    changeAllDocBanner,
    changeBannerIdAndPid,
    splice,
    addExpandItem,
    changeExpandItems,
    changeBannerLoading,
    getDocBanner,
  };
}); 