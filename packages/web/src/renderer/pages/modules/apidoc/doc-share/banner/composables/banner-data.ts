import { request } from '@/api/api';
import { ref } from 'vue';
import { ApidocBanner } from '@src/types/global';
import { ElMessage } from 'element-plus';
import { apidocCache } from '@/cache/apidoc.ts';
import { $t } from '@/i18n/i18n';

type ReturnData = {
  getBannerData: () => Promise<void>,
  loading: any,
  bannerData: any,
};

export function useShareBannerData(shareId: string, useForHtml: boolean = false): ReturnData {
  const loading = ref(false);
  const bannerData = ref<ApidocBanner[]>([]);
  
  // 从 window.SHARE_DATA 获取 banner 数据
  const getBannerDataFromWindow = () => {
    try {
      const shareData = (window as any).SHARE_DATA
      if (shareData && shareData.docs && Array.isArray(shareData.docs)) {
        bannerData.value = shareData.docs
        return true
      }
    } catch (error) {
      console.error('从 window.SHARE_DATA 获取 banner 数据失败:', error)
    }
    return false
  }
  
  const getBannerData = async () => {
    if (!shareId && !useForHtml) {
      console.warn($t('shareId为空，无法获取banner数据'));
      return;
    }
    
    // 如果是HTML模式，从window.SHARE_DATA获取数据
    if (useForHtml) {
      const success = getBannerDataFromWindow()
      if (success) {
        return
      }
    }
    
    try {
      if (loading.value) {
        return
      }
      loading.value = true
      const response = await request.get('/api/project/export/share_banner', {
        params: { 
          shareId,
          password: apidocCache.getSharePassword(shareId)
         }
      });
      bannerData.value = response.data || [];
      loading.value = false
    } catch (error: any) {
      console.error($t('获取分享banner数据失败:'), error);
      ElMessage.error($t('获取分享数据失败，请检查分享链接是否有效'));
      loading.value = false
    }
  }
  
  return {
    getBannerData,
    loading,
    bannerData,
  };
} 