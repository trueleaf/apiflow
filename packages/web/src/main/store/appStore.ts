import Store from 'electron-store';
import { brandConfig } from '@src/config/brand';
import { randomBytes } from 'node:crypto';
import type { McpServerSettings, McpStoredSettings } from '@src/types/mcp';

type StoreSchema = {
  onlineUrl: string;
  mcpSettings: McpServerSettings & { authToken?: string };
  mcpLegacyOriginMigrated: boolean;
}

const store = new Store<StoreSchema>({
  name: 'apiflow-config',
  defaults: {
    onlineUrl: '',
    mcpLegacyOriginMigrated: false,
    mcpSettings: {
      enabled: true,
      port: 34180,
      readOnly: false,
      allowDestructive: false,
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
export const getMcpSettings = (): McpStoredSettings => {
  const saved = store.get('mcpSettings', { enabled: true, port: 34180 });
  const settings = { ...saved, readOnly: saved.readOnly ?? false, allowDestructive: saved.allowDestructive ?? false, authToken: saved.authToken || randomBytes(32).toString('hex') };
  if (!saved.authToken) store.set('mcpSettings', settings);
  return settings;
}
//设置MCP服务配置
export const setMcpSettings = (settings: McpServerSettings): void => {
  store.set('mcpSettings', { ...getMcpSettings(), ...settings });
}
// 获取旧 MCP 来源数据迁移状态
export const hasMigratedLegacyMcpData = (): boolean => store.get('mcpLegacyOriginMigrated', false);
// 标记旧 MCP 来源数据已完成迁移
export const markLegacyMcpDataMigrated = (): void => { store.set('mcpLegacyOriginMigrated', true); }
//清除在线URL配置
export const clearOnlineUrl = (): void => {
  store.delete('onlineUrl');
}
//清空所有electron-store缓存
export const clearStore = (): void => {
  store.clear();
}
