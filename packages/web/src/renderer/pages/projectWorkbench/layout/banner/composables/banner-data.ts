import { useBanner } from '@/store/projectWorkbench/bannerStore';
import { useRoute } from 'vue-router'

type ReturnData = {
  getBannerData: () => Promise<void>,
};

export const useBannerData = (): ReturnData => {
  const bannerStore = useBanner()
  const route = useRoute()
  const getBannerData = async () => {
    try {
      const projectId = route.query.id as string;
      if (bannerStore.bannerLoading) {
        return
      }
      bannerStore.changeBannerLoading(true)
      await bannerStore.getDocBanner({ projectId });
      bannerStore.changeBannerLoading(false)
    } catch {
      bannerStore.changeBannerLoading(false)
    }
  }
  return {
    getBannerData,
  };
}
