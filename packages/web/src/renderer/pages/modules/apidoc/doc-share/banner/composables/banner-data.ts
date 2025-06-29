import { request } from '@/api/api';
import { ref } from 'vue';
import { ApidocBanner } from '@src/types/global';
import { ElMessage } from 'element-plus';
import { apidocCache } from '@/cache/apidoc.ts';

type ReturnData = {
  getBannerData: () => Promise<void>,
  loading: any,
  bannerData: any,
};

export function useShareBannerData(shareId: string): ReturnData {
  const loading = ref(false);
  const bannerData = ref<ApidocBanner[]>([]);
  
  const getBannerData = async () => {
    if (!shareId) {
      console.warn('shareId为空，无法获取banner数据');
      return;
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
      console.error('获取分享banner数据失败:', error);
      ElMessage.error('获取分享数据失败，请检查分享链接是否有效');
      loading.value = false
    }
  }
  
  return {
    getBannerData,
    loading,
    bannerData,
  };
} 