import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

test.describe('SettingsAdminModulesContract', () => {
  // 设置中心系统管理菜单需保持权限门禁与 admin 三大路由页入口的源码契约
  test('admin 菜单门禁与客户端/服务端路由/系统配置入口契约', async () => {
    const settingsSource = await fs.readFile(path.resolve('src/renderer/pages/settings/Settings.vue'), 'utf8');
    // 校验系统管理菜单显示门禁：仅 online + admin + 已登录用户可见
    expect(settingsSource).toContain("runtimeStore.networkMode === 'online'");
    expect(settingsSource).toContain("runtimeStore.userInfo.role === 'admin'");
    expect(settingsSource).toContain("Boolean(runtimeStore.userInfo.id)");
    // 校验系统管理菜单动作与内容区组件挂载保持一致
    expect(settingsSource).toContain("action: 'admin-client-routes'");
    expect(settingsSource).toContain("action: 'admin-server-routes'");
    expect(settingsSource).toContain("action: 'admin-system-config'");
    expect(settingsSource).toContain("<AdminClientRoutes v-if=\"activeTab === 'admin-client-routes'\" />");
    expect(settingsSource).toContain("<AdminServerRoutes v-if=\"activeTab === 'admin-server-routes'\" />");
    expect(settingsSource).toContain("<AdminSystemConfig v-if=\"activeTab === 'admin-system-config'\" />");
  });
  // 权限变更链路需保留用户/角色配置的核心请求入口，确保菜单可见后可执行关键操作
  test('admin 用户与角色核心操作接口契约', async () => {
    const adminClientRoutesSource = await fs.readFile(path.resolve('src/renderer/pages/settings/adminClientRoutes/ClientRoutes.vue'), 'utf8');
    const adminServerRoutesSource = await fs.readFile(path.resolve('src/renderer/pages/settings/adminServerRoutes/ServerRoutes.vue'), 'utf8');
    const adminSystemConfigSource = await fs.readFile(path.resolve('src/renderer/pages/settings/adminSystemConfig/SystemConfig.vue'), 'utf8');
    const adminUserEditSource = await fs.readFile(path.resolve('src/renderer/pages/settings/adminUser/edit/Edit.vue'), 'utf8');
    const adminRoleEditSource = await fs.readFile(path.resolve('src/renderer/pages/settings/adminRole/edit/Edit.vue'), 'utf8');
    // 校验三个管理页核心流程入口：列表获取 + 新增/编辑/删除或配置保存
    expect(adminClientRoutesSource).toContain("url=\"/api/security/client_routes\"");
    expect(adminClientRoutesSource).toContain("request.delete('/api/security/client_routes'");
    expect(adminServerRoutesSource).toContain("url=\"/api/security/server_routes\"");
    expect(adminServerRoutesSource).toContain("request.delete('/api/security/server_routes'");
    expect(adminSystemConfigSource).toContain('await systemConfigStore.fetchConfig()');
    expect(adminSystemConfigSource).toContain('await systemConfigStore.updateConfig({');
    // 校验权限变更核心接口仍存在，避免角色/权限联动流程失效
    expect(adminUserEditSource).toContain("request.put('/api/security/user_permission', params)");
    expect(adminRoleEditSource).toContain("request.put('/api/security/role', params)");
  });
});

