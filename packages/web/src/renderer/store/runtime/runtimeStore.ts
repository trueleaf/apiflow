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
    token: '',
  });
  const language = ref<Language>(runtimeCache.getLanguage());
  const setNetworkMode = (mode: RuntimeNetworkMode): void => {
    networkMode.value = mode;
    runtimeCache.setNetworkMode(mode);
  }
  // 设置用户信息
  const setUserInfo = (payload: PermissionUserInfo): void => {
    userInfo.value = {
      id: payload.id,
      loginName: payload.loginName,
      phone: payload.phone,
      realName: payload.realName,
      roleIds: payload.roleIds,
      token: payload.token,
    };
    runtimeCache.setUserInfo(payload);
  }
  // 初始化用户信息（从缓存中恢复）
  const initUserInfo = (): void => {
    const cachedUserInfo = runtimeCache.getUserInfo();
    if (cachedUserInfo) {
      userInfo.value = cachedUserInfo;
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
      token: '',
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
    setUserInfo,
    initUserInfo,
    clearUserInfo,
    setLanguage,
  }
})

