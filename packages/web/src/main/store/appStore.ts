import Store from 'electron-store';
import { brandConfig } from '@src/config/brand';

type StoreSchema = {
  onlineUrl: string;
  mcpSettings: {
    enabled: boolean;
    port: number;
  };
}

const store = new Store<StoreSchema>({
  name: 'apiflow-config',
  defaults: {
    onlineUrl: '',
    mcpSettings: {
      enabled: true,
      port: 34180,
    },
  },
});

//获取在线URL配置
export const getOnlineUrl = (): string => {
  if (brandConfig.offlineOnly) {
    return '';
  }
  return store.get('onlineUrl', '');
}
//设置在线URL配置
export const setOnlineUrl = (url: string): void => {
  if (brandConfig.offlineOnly) {
    store.delete('onlineUrl');
    return;
  }
  store.set('onlineUrl', url);
}
//获取MCP服务配置
export const getMcpSettings = () => {
  return store.get('mcpSettings', { enabled: true, port: 34180 });
}
//设置MCP服务配置
export const setMcpSettings = (settings: { enabled: boolean; port: number }): void => {
  store.set('mcpSettings', settings);
}
//清除在线URL配置
export const clearOnlineUrl = (): void => {
  store.delete('onlineUrl');
}
//清空所有electron-store缓存
export const clearStore = (): void => {
  store.clear();
}
