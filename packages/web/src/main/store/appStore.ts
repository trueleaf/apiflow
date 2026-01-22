import Store from 'electron-store';

type StoreSchema = {
  onlineUrl: string;
}

const store = new Store<StoreSchema>({
  name: 'apiflow-config',
  defaults: {
    onlineUrl: '',
  },
});

// 获取在线URL配置
export const getOnlineUrl = (): string => {
  return store.get('onlineUrl', '');
}
// 设置在线URL配置
export const setOnlineUrl = (url: string): void => {
  store.set('onlineUrl', url);
}
// 清除在线URL配置
export const clearOnlineUrl = (): void => {
  store.delete('onlineUrl');
}
