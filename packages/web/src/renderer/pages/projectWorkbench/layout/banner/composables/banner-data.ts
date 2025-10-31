import { useApidocBanner } from '@/store/share/bannerStore';
import { useRoute } from 'vue-router'

type ReturnData = {
  getBannerData: () => Promise<void>,
};

export const useBannerData = (): ReturnData => {
  const apidocBannerStore = useApidocBanner()
  const route = useRoute()
  const getBannerData = async () => {
    try {
      const projectId = route.query.id as string;
      if (apidocBannerStore.loading) {
        return
      }
      apidocBannerStore.changeBannerLoading(true)
      await apidocBannerStore.getDocBanner({ projectId });
      apidocBannerStore.changeBannerLoading(false)
    } catch {
      apidocBannerStore.changeBannerLoading(false)
    }
  }
  return {
    getBannerData,
  };
}
