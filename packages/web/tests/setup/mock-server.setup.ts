import { test as setup } from '@playwright/test';
import { startServer, PORT } from '../mock-server/index';

setup('启动 Mock 服务器', async () => {
  console.log('🚀 启动 Mock 服务器...');
  await startServer();
  console.log(`✅ Mock 服务器已在端口 ${PORT} 上成功启动`);
});
