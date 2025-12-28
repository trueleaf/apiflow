import { defineStore } from 'pinia'
import { ref } from 'vue'
import { runtimeCache } from '@/cache/runtime/runtimeCache'
import type { RuntimeNetworkMode } from '@src/types/runtime'
import type { PermissionUserInfo } from '@src/types'
import type { Language } from '@src/types/common'

export const useRuntime = defineStore('runtime', () => {
  const networkMode = ref<RuntimeNetworkMode>(runtimeCache.getNetworkMode())
  const userInfo = ref<PermissionUserInfo>({
    id: "",
    loginName: '',
    phone: '',
    realName: '',
    roleIds: [],
    role: 'user',
    token: '',
    avatar: '',
  });
  const language = ref<Language>(runtimeCache.getLanguage());
  const setNetworkMode = (mode: RuntimeNetworkMode): void => {
    networkMode.value = mode;
    runtimeCache.setNetworkMode(mode);
  }
  // 更新用户信息
  const updateUserInfo = (payload: Partial<PermissionUserInfo>): void => {
    userInfo.value = {
      ...userInfo.value,
      ...payload,
    };
    runtimeCache.updateUserInfo(payload);
  }
  // 初始化用户信息（从缓存中恢复）
  const initUserInfo = (): void => {
    const cachedUserInfo = runtimeCache.getUserInfo();
    if (cachedUserInfo) {
      userInfo.value = {
        ...userInfo.value,
        ...cachedUserInfo,
      };
    }
  };
  // 清除用户信息
  const clearUserInfo = (): void => {
    userInfo.value = {
      id: "",
      loginName: '',
      phone: '',
      realName: '',
      roleIds: [],
      role: 'user',
      token: '',
      avatar: '',
    };
    runtimeCache.clearUserInfo();
  };
  // 设置语言
  const setLanguage = (lang: Language): void => {
    language.value = lang;
    runtimeCache.setLanguage(lang);
  };
  return {
    networkMode,
    userInfo,
    language,
    setNetworkMode,
    updateUserInfo,
    initUserInfo,
    clearUserInfo,
    setLanguage,
  }
})
