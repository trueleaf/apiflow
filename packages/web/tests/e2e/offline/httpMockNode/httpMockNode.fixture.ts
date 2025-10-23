import { test, expect, getPages } from '../../../fixtures/fixtures';
import { type Page } from '@playwright/test';

// ==================== 类型定义 ====================

export interface MockNodeConfig {
  port: number;
  url: string;
  methods: string[];
  dataType: 'json' | 'text' | 'image' | 'file' | 'binary' | 'sse';
  responseData?: any;
}

export interface ProjectData {
  _id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface MockNodeData {
  _id: string;
  name: string;
  type: 'httpMock';
  pid: string; // project id
  config: {
    port: number;
    url: string;
    methods: string[];
  };
  response: Array<{
    name: string;
    statusCode: number;
    dataType: string;
    jsonConfig?: any;
    textConfig?: any;
    imageConfig?: any;
    sseConfig?: any;
  }>;
}

// ==================== 数据初始化函数 ====================

/**
 * 直接在IndexedDB中创建项目
 * 跳过UI操作，快速准备测试环境
 */
export async function createProjectInDB(page: Page, projectData: ProjectData): Promise<void> {
  await page.evaluate((data) => {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('apiflow-offline', 1);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['projects'], 'readwrite');
        const store = transaction.objectStore('projects');

        store.add(data);

        transaction.oncomplete = () => {
          db.close();
          resolve();
        };

        transaction.onerror = () => {
          db.close();
          reject(transaction.error);
        };
      };

      request.onerror = () => reject(request.error);
    });
  }, projectData);
}

/**
 * 直接在IndexedDB中创建Mock节点
 */
export async function createMockNodeInDB(page: Page, mockNodeData: MockNodeData): Promise<void> {
  await page.evaluate((data) => {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('apiflow-offline', 1);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['nodes'], 'readwrite');
        const store = transaction.objectStore('nodes');

        store.add(data);

        transaction.oncomplete = () => {
          db.close();
          resolve();
        };

        transaction.onerror = () => {
          db.close();
          reject(transaction.error);
        };
      };

      request.onerror = () => reject(request.error);
    });
  }, mockNodeData);
}

/**
 * 清除所有测试数据
 */
export async function clearTestData(page: Page): Promise<void> {
  try {
    await page.evaluate(() => {
      return new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('apiflow-offline', 1);

        request.onsuccess = () => {
          const db = request.result;

          // 检查对象存储是否存在
          if (!db.objectStoreNames.contains('projects') || !db.objectStoreNames.contains('nodes')) {
            db.close();
            resolve();
            return;
          }

          const transaction = db.transaction(['projects', 'nodes'], 'readwrite');

          transaction.objectStore('projects').clear();
          transaction.objectStore('nodes').clear();

          transaction.oncomplete = () => {
            db.close();
            resolve();
          };

          transaction.onerror = () => {
            db.close();
            reject(transaction.error);
          };
        };

        request.onerror = () => {
          // IndexedDB不存在或无法打开，直接resolve
          resolve();
        };

        request.onupgradeneeded = () => {
          // 数据库正在升级，直接resolve
          resolve();
        };
      });
    });
  } catch (error) {
    // 如果页面正在导航，忽略错误
    if (String(error).includes('Execution context was destroyed')) {
      return;
    }
    throw error;
  }
}

// ==================== 数据工厂函数 ====================

/**
 * 创建标准的测试项目数据
 */
export function createTestProject(overrides: Partial<ProjectData> = {}): ProjectData {
  const timestamp = Date.now();
  return {
    _id: `test-project-${timestamp}`,
    name: `测试项目_${timestamp}`,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

/**
 * 创建标准的测试Mock节点数据
 */
export function createTestMockNode(projectId: string, overrides: Partial<MockNodeData> = {}): MockNodeData {
  const timestamp = Date.now();
  return {
    _id: `test-mock-${timestamp}`,
    name: `测试Mock_${timestamp}`,
    type: 'httpMock',
    pid: projectId,
    config: {
      port: 3000,
      url: '/api/test',
      methods: ['GET'],
    },
    response: [
      {
        name: '默认响应',
        statusCode: 200,
        dataType: 'json',
        jsonConfig: {
          mode: 'fixed',
          fixedValue: '{"message": "Hello World"}',
        },
      },
    ],
    ...overrides,
  };
}

// ==================== 页面导航函数 ====================

/**
 * 导航到项目编辑页面
 */
export async function navigateToProjectEdit(page: Page, projectId: string): Promise<void> {
  await page.evaluate((id) => {
    (window as any).location.hash = `#/doc-edit?id=${id}`;
  }, projectId);
  await page.waitForTimeout(1000);
  await page.waitForLoadState('domcontentloaded');
}

/**
 * 导航到Mock节点编辑页面
 */
export async function navigateToMockEdit(page: Page, projectId: string, mockId: string): Promise<void> {
  await page.evaluate((data) => {
    (window as any).location.hash = `#/doc-edit?id=${data.projectId}&nodeId=${data.mockId}`;
  }, { projectId, mockId });
  await page.waitForTimeout(1000);
  await page.waitForLoadState('domcontentloaded');
}

/**
 * 导航到首页
 */
export async function navigateToHome(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as any).location.hash = '#/home';
  });
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
}

// ==================== UI操作函数 ====================

/**
 * 等待Mock配置页面加载完成
 */
export async function waitForMockConfigReady(page: Page, timeout = 5000): Promise<void> {
  try {
    await page.waitForSelector('.mock-config-wrapper, .http-mock-node-wrapper', {
      state: 'visible',
      timeout
    });
    await page.waitForTimeout(500);
  } catch (error) {
    // 如果主选择器不存在，尝试其他可能的选择器
    const anyVisible = await page.locator('.el-form, .config-form, [class*="mock"]').first().isVisible();
    if (!anyVisible) {
      throw new Error('Mock配置页面未能加载完成');
    }
  }
}

/**
 * 切换到日志标签页
 */
export async function switchToLogsTab(page: Page): Promise<void> {
  const logsTab = page.locator('.el-tabs__item:has-text("日志"), .tab-item:has-text("日志")');
  await logsTab.click();
  await page.waitForTimeout(500);
}

/**
 * 切换到配置标签页
 */
export async function switchToConfigTab(page: Page): Promise<void> {
  const configTab = page.locator('.el-tabs__item:has-text("配置"), .tab-item:has-text("配置")');
  if (await configTab.count() > 0) {
    await configTab.click();
    await page.waitForTimeout(500);
  }
}

/**
 * 保存Mock配置
 */
export async function saveMockConfig(page: Page): Promise<void> {
  const saveBtn = page.locator('button:has-text("保存"), button:has-text("Save")');
  await saveBtn.click();
  await page.waitForTimeout(1000);
}

/**
 * 刷新Mock配置
 */
export async function refreshMockConfig(page: Page): Promise<void> {
  const refreshBtn = page.locator('button:has-text("刷新"), button:has-text("Refresh")');
  await refreshBtn.click();
  await page.waitForTimeout(1000);
}

/**
 * 启用/禁用Mock服务
 */
export async function toggleMockService(page: Page, enable: boolean): Promise<void> {
  const switchElement = page.locator('.el-switch, .enable-switch').first();
  const isEnabled = await switchElement.evaluate((el: any) => {
    return el.classList.contains('is-checked') || el.checked;
  });

  if (isEnabled !== enable) {
    await switchElement.click();
    await page.waitForTimeout(1500); // 等待服务启动/停止
  }
}

/**
 * 配置基本的Mock设置
 */
export async function configureMockBasics(
  page: Page,
  config: { port?: number; url?: string; methods?: string[]; statusCode?: number }
): Promise<void> {
  if (config.port !== undefined) {
    const portInput = page.locator('input[placeholder*="端口"], input[type="number"]').first();
    await portInput.fill(String(config.port));
    await page.waitForTimeout(200);
  }

  if (config.url !== undefined) {
    const urlInput = page.locator('input[placeholder*="URL"], input[placeholder*="路径"]').first();
    await urlInput.fill(config.url);
    await page.waitForTimeout(200);
  }

  if (config.statusCode !== undefined) {
    const statusCodeInput = page.locator('input[placeholder*="状态码"], input[placeholder*="status"]').first();
    await statusCodeInput.fill(String(config.statusCode));
    await page.waitForTimeout(200);
  }

  if (config.methods && config.methods.length > 0) {
    for (const method of config.methods) {
      const checkbox = page.locator(`.el-checkbox:has-text("${method}")`);
      if (await checkbox.count() > 0) {
        const isChecked = await checkbox.evaluate((el: any) => {
          return el.classList.contains('is-checked');
        });
        if (!isChecked) {
          await checkbox.click();
          await page.waitForTimeout(200);
        }
      }
    }
  }
}

/**
 * 切换响应数据类型
 */
export async function switchResponseDataType(
  page: Page,
  dataType: 'json' | 'text' | 'image' | 'file' | 'binary' | 'sse'
): Promise<void> {
  // 使用更精确的选择器
  const typeMap: Record<string, string> = {
    json: 'JSON',
    text: 'Text',
    image: 'Image',
    file: 'File',
    binary: 'Binary',
    sse: 'SSE',
  };

  // 等待按钮组可见
  await page.waitForSelector('.el-radio-button', { timeout: 5000 });

  // 点击对应的按钮
  const radioButton = page.locator(`.el-radio-button:has-text("${typeMap[dataType]}")`).first();
  await radioButton.click();
  await page.waitForTimeout(800);
}

// ==================== Mock服务测试函数 ====================

/**
 * 向Mock服务发送HTTP请求
 */
export async function sendRequestToMock(
  port: number,
  url: string,
  method: string = 'GET',
  body?: any
): Promise<{ status: number; data: any; headers: any }> {
  const response = await fetch(`http://localhost:${port}${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.text();
  let parsedData;
  try {
    parsedData = JSON.parse(data);
  } catch {
    parsedData = data;
  }

  return {
    status: response.status,
    data: parsedData,
    headers: Object.fromEntries(response.headers.entries()),
  };
}

/**
 * 验证Mock服务是否正在运行
 */
export async function isMockServiceRunning(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}/_health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}

// ==================== 日志相关函数 ====================

/**
 * 获取日志列表数量
 */
export async function getLogCount(page: Page): Promise<number> {
  const logs = page.locator('.log-item, .log-row, [class*="log-entry"]');
  return await logs.count();
}

/**
 * 清除所有日志
 */
export async function clearAllLogs(page: Page): Promise<void> {
  const clearBtn = page.locator('button:has-text("清除"), button:has-text("Clear")');
  await clearBtn.click();
  await page.waitForTimeout(500);

  // 如果有确认对话框，点击确认
  const confirmBtn = page.locator('.el-message-box button:has-text("确定"), .el-message-box button:has-text("OK")');
  if (await confirmBtn.count() > 0) {
    await confirmBtn.click();
    await page.waitForTimeout(500);
  }
}

/**
 * 按关键字筛选日志
 */
export async function filterLogsByKeyword(page: Page, keyword: string): Promise<void> {
  const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="search"]').first();
  await searchInput.fill(keyword);
  await page.waitForTimeout(500);
}

// ==================== 工具函数 ====================

/**
 * 等待并验证元素存在
 */
export async function waitAndVerifyElement(
  page: Page,
  selector: string,
  timeout = 5000
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * 生成唯一ID
 */
export function generateUniqueId(prefix = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 等待指定时间
 */
export async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== 扩展辅助函数 (用于补充测试) ====================

/**
 * 配置响应延迟
 */
export async function configureResponseDelay(page: Page, delay: number): Promise<void> {
  const delayInput = page.locator('input[placeholder*="延迟"], input[placeholder*="delay"]').first();
  await delayInput.fill(String(delay));
  await page.waitForTimeout(200);
}

/**
 * 配置HTTP状态码
 */
export async function configureStatusCode(page: Page, statusCode: number): Promise<void> {
  const statusInput = page.locator('input[placeholder*="状态码"], input[type="number"]').filter({ hasText: /^[1-5]\d{2}$/ }).first();
  await statusInput.fill(String(statusCode));
  await page.waitForTimeout(200);
}

/**
 * 切换JSON模式 (固定/随机/AI)
 */
export async function switchJsonMode(page: Page, mode: 'fixed' | 'random' | 'ai'): Promise<void> {
  const modeMap = {
    fixed: '固定',
    random: '随机',
    ai: 'AI'
  };
  const radio = page.locator(`.el-radio:has-text("${modeMap[mode]}")`).first();
  await radio.click();
  await page.waitForTimeout(500);
}

/**
 * 切换Text类型
 */
export async function switchTextType(page: Page, type: 'plain' | 'html' | 'xml' | 'yaml' | 'csv'): Promise<void> {
  const typeMap = {
    plain: 'Plain',
    html: 'HTML',
    xml: 'XML',
    yaml: 'YAML',
    csv: 'CSV'
  };
  const select = page.locator('.el-select').first();
  await select.click();
  await page.waitForTimeout(300);

  const option = page.locator(`.el-select-dropdown__item:has-text("${typeMap[type]}")`);
  await option.click();
  await page.waitForTimeout(500);
}

/**
 * 添加新响应
 */
export async function addNewResponse(page: Page, responseName: string): Promise<void> {
  const addBtn = page.locator('button:has-text("添加响应"), button:has-text("新增")').first();
  await addBtn.click();
  await page.waitForTimeout(500);

  const nameInput = page.locator('input[placeholder*="响应名称"]').first();
  await nameInput.fill(responseName);

  const confirmBtn = page.locator('button:has-text("确定"), button:has-text("确认")').first();
  await confirmBtn.click();
  await page.waitForTimeout(500);
}

/**
 * 切换到指定响应
 */
export async function switchToResponse(page: Page, responseName: string): Promise<void> {
  const responseTab = page.locator(`.response-tab:has-text("${responseName}"), .el-tabs__item:has-text("${responseName}")`).first();
  await responseTab.click();
  await page.waitForTimeout(500);
}

/**
 * 添加响应头
 */
export async function addResponseHeader(page: Page, key: string, value: string): Promise<void> {
  const addBtn = page.locator('button:has-text("添加响应头"), button:has-text("添加")').first();
  await addBtn.click();
  await page.waitForTimeout(300);

  const keyInput = page.locator('input[placeholder*="header"], input[placeholder*="键"]').last();
  await keyInput.fill(key);

  const valueInput = page.locator('input[placeholder*="值"], input[placeholder*="value"]').last();
  await valueInput.fill(value);

  await page.waitForTimeout(200);
}

/**
 * 添加触发条件
 */
export async function addTriggerCondition(page: Page, conditionScript: string): Promise<void> {
  const addBtn = page.locator('button:has-text("添加条件"), button:has-text("添加触发条件")').first();
  await addBtn.click();
  await page.waitForTimeout(500);

  const scriptEditor = page.locator('textarea, .monaco-editor').first();
  await scriptEditor.fill(conditionScript);

  const saveBtn = page.locator('button:has-text("保存"), button:has-text("确定")').first();
  await saveBtn.click();
  await page.waitForTimeout(500);
}

/**
 * 配置SSE事件ID
 */
export async function configureSseEventId(
  page: Page,
  enabled: boolean,
  mode?: 'increment' | 'timestamp' | 'random'
): Promise<void> {
  const checkbox = page.locator('.el-checkbox:has-text("事件ID")').first();
  const isChecked = await checkbox.evaluate((el: any) => el.classList.contains('is-checked'));

  if (isChecked !== enabled) {
    await checkbox.click();
    await page.waitForTimeout(300);
  }

  if (enabled && mode) {
    const modeMap = {
      increment: '自增',
      timestamp: '时间戳',
      random: '随机'
    };
    const radio = page.locator(`.el-radio:has-text("${modeMap[mode]}")`).first();
    await radio.click();
    await page.waitForTimeout(300);
  }
}

/**
 * 配置SSE事件名称
 */
export async function configureSseEventName(page: Page, enabled: boolean, eventName?: string): Promise<void> {
  const checkbox = page.locator('.el-checkbox:has-text("事件名称")').first();
  const isChecked = await checkbox.evaluate((el: any) => el.classList.contains('is-checked'));

  if (isChecked !== enabled) {
    await checkbox.click();
    await page.waitForTimeout(300);
  }

  if (enabled && eventName) {
    const nameInput = page.locator('input[placeholder*="事件名称"]').first();
    await nameInput.fill(eventName);
    await page.waitForTimeout(200);
  }
}

/**
 * 配置图片响应参数
 */
export async function configureImageResponse(
  page: Page,
  config: { url?: string; format?: string; width?: number; height?: number; size?: number }
): Promise<void> {
  if (config.url) {
    const urlInput = page.locator('input[placeholder*="URL"], input[placeholder*="地址"], input[placeholder*="图片"]').first();
    await urlInput.fill(config.url);
    await page.waitForTimeout(200);
  }

  if (config.format) {
    const formatSelect = page.locator('.el-select').first();
    await formatSelect.click();
    await page.waitForTimeout(300);

    const option = page.locator(`.el-select-dropdown__item:has-text("${config.format.toUpperCase()}")`);
    await option.click();
    await page.waitForTimeout(300);
  }

  if (config.width) {
    const widthInput = page.locator('input[placeholder*="宽度"], input[placeholder*="width"]').first();
    await widthInput.fill(String(config.width));
    await page.waitForTimeout(200);
  }

  if (config.height) {
    const heightInput = page.locator('input[placeholder*="高度"], input[placeholder*="height"]').first();
    await heightInput.fill(String(config.height));
    await page.waitForTimeout(200);
  }

  if (config.size) {
    const sizeInput = page.locator('input[placeholder*="大小"], input[placeholder*="size"]').first();
    await sizeInput.fill(String(config.size));
    await page.waitForTimeout(200);
  }
}
// 重新导出通用功能
export { test, expect, getPages };
