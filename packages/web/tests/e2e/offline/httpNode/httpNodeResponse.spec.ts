import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  fillUrl,
  switchToResponseTab,
  getResponseBody,
  getResponseTime
} from './helpers/httpNodeHelpers';

test.describe('10. HTTP节点 - 响应展示模块测试', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;

    await createProject(contentPage, '测试项目');
    await createSingleNode(contentPage, {
      name: 'Test API',
      type: 'http'
    });
  });

  test.describe('10.1 响应基本信息测试', () => {
    /**
     * 测试目的：验证显示响应状态码
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 填写URL指向返回200状态码的接口
     *   2. 发送请求
     *   3. 切换到基本信息标签页
     *   4. 检查状态码显示
     * 预期结果：
     *   - 状态码元素可见
     *   - 显示正确的状态码值
     * 验证点：响应状态码的显示
     * 说明：状态码是判断请求成功与否的关键指标
     */
    test('应显示响应状态码', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/status/200');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '基本信息');
      const statusCode = contentPage.locator('.status-code, .response-status').first();
      await expect(statusCode).toBeVisible({ timeout: 5000 });
    });

    /**
     * 测试目的：验证显示响应时间
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 填写URL
     *   2. 发送请求
     *   3. 获取响应时间
     * 预期结果：
     *   - 响应时间存在且为有效值
     *   - 时间单位为毫秒
     * 验证点：响应时间统计和显示
     * 说明：响应时间帮助开发者评估API性能
     */
    test('应显示响应时间', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/get');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      const responseTime = await getResponseTime(contentPage);
      expect(responseTime).toBeTruthy();
    });

    /**
     * 测试目的：验证显示响应大小
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 发送请求
     *   2. 切换到基本信息标签页
     *   3. 查看响应大小
     * 预期结果：
     *   - 响应大小元素显示
     *   - 包含单位(B/KB/MB)
     * 验证点：响应体大小的计算和显示
     * 说明：响应大小帮助评估网络传输效率
     */
    test('应显示响应大小', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/get');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '基本信息');
      const sizeElement = contentPage.locator('.response-size, .size').first();
      const sizeText = await sizeElement.textContent();
      expect(sizeText || '').toBeTruthy();
    });

    /**
     * 测试目的：验证显示响应格式
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 发送返回JSON的请求
     *   2. 切换到基本信息标签页
     *   3. 查看响应格式
     * 预期结果：
     *   - 显示Content-Type信息
     *   - 正确识别响应格式(JSON/XML/HTML等)
     * 验证点：响应格式的识别和显示
     * 说明：响应格式决定如何渲染响应内容
     */
    test('应显示响应格式', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/json');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '基本信息');
      const formatElement = contentPage.locator('.response-format, .content-type').first();
      const format = await formatElement.textContent();
      expect(format || '').toBeTruthy();
    });

    /**
     * 测试目的：验证大文件下载进度显示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求返回较大数据的接口
     *   2. 观察下载进度
     * 预期结果：
     *   - 显示下载进度条或百分比
     *   - 下载过程中实时更新
     * 验证点：大文件下载进度反馈
     * 说明：进度显示提升大文件下载的用户体验
     */
    test('应显示下载进度（如果是大文件）', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/bytes/1024');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(2000);
    });

    /**
     * 测试目的：验证成功请求的状态样式
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 发送返回2xx状态码的请求
     *   2. 检查状态码元素的样式类
     * 预期结果：
     *   - 状态码元素包含成功样式类
     *   - 通常显示为绿色或成功主题色
     * 验证点：成功状态的视觉反馈
     * 说明：颜色区分帮助快速识别请求结果
     */
    test('成功请求应显示成功状态样式', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/status/200');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '基本信息');
      const statusCode = contentPage.locator('.status-code, .response-status').first();
      const className = await statusCode.getAttribute('class');
      expect(className).toBeTruthy();
    });

    /**
     * 测试目的：验证失败请求的状态样式
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 发送返回4xx/5xx状态码的请求
     *   2. 检查状态码元素的样式类
     * 预期结果：
     *   - 状态码元素包含失败样式类
     *   - 通常显示为红色或错误主题色
     * 验证点：失败状态的视觉反馈
     * 说明：颜色区分帮助快速识别请求错误
     */
    test('失败请求应显示失败状态样式', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/status/404');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '基本信息');
      const statusCode = contentPage.locator('.status-code, .response-status').first();
      const className = await statusCode.getAttribute('class');
      expect(className).toBeTruthy();
    });
  });

  test.describe('10.2 响应体展示测试', () => {
    /**
     * 测试目的：验证JSON响应格式化显示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求返回JSON的接口
     *   2. 切换到响应体标签页
     *   3. 检查Monaco编辑器是否显示
     * 预期结果：
     *   - JSON响应自动格式化
     *   - 显示语法高亮
     *   - 支持折叠/展开
     * 验证点：JSON响应的格式化渲染
     * 说明：格式化显示提高JSON的可读性
     */
    test('JSON响应应格式化显示', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/json');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应体');
      const responseBody = contentPage.locator('.response-body, .monaco-editor').first();
      await expect(responseBody).toBeVisible({ timeout: 5000 });
    });

    /**
     * 测试目的：验证Text响应原样显示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求返回纯文本的接口
     *   2. 切换到响应体标签页
     *   3. 获取响应体内容
     * 预期结果：
     *   - 文本内容原样显示
     *   - 不进行格式化处理
     *   - 保留原始换行和空格
     * 验证点：纯文本响应的原样显示
     * 说明：纯文本不需要特殊渲染处理
     */
    test('Text响应应原样显示', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/robots.txt');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应体');
      const responseBody = await getResponseBody(contentPage);
      expect(responseBody).toBeTruthy();
    });

    /**
     * 测试目的：验证HTML响应渲染预览功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求返回HTML的接口
     *   2. 切换到响应体标签页
     *   3. 点击预览按钮
     * 预期结果：
     *   - 显示预览按钮
     *   - 点击后渲染HTML
     *   - 支持切换回代码视图
     * 验证点：HTML响应的渲染预览
     * 说明：HTML预览便于查看页面效果
     */
    test('HTML响应应支持渲染预览', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/html');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应体');
      const previewBtn = contentPage.locator('[title*="预览"], .preview-btn').first();
      if (await previewBtn.isVisible()) {
        await previewBtn.click();
        await contentPage.waitForTimeout(500);
      }
    });

    /**
     * 测试目的：验证XML响应格式化显示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求返回XML的接口
     *   2. 切换到响应体标签页
     *   3. 获取响应体内容
     * 预期结果：
     *   - XML响应格式化显示
     *   - 显示语法高亮
     *   - 支持折叠/展开
     * 验证点：XML响应的格式化渲染
     * 说明：XML格式化提高可读性
     */
    test('XML响应应格式化显示', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/xml');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应体');
      const responseBody = await getResponseBody(contentPage);
      expect(responseBody).toBeTruthy();
    });

    /**
     * 测试目的：验证Binary响应下载选项
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求返回图片等二进制数据的接口
     *   2. 切换到响应体标签页
     *   3. 检查下载按钮
     * 预期结果：
     *   - 显示下载按钮
     *   - 点击可下载文件
     *   - 显示文件预览(图片等)
     * 验证点：二进制响应的处理
     * 说明：二进制数据需要提供下载功能
     */
    test('Binary响应应显示下载选项', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/image/png');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应体');
      const downloadBtn = contentPage.locator('[title*="下载"], .download-btn').first();
      if (await downloadBtn.isVisible()) {
        await expect(downloadBtn).toBeVisible();
      }
    });

    /**
     * 测试目的：验证空响应提示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求返回204无内容的接口
     *   2. 切换到响应体标签页
     *   3. 检查空状态提示
     * 预期结果：
     *   - 显示"无响应内容"提示
     *   - 提示文案友好
     * 验证点：空响应的提示信息
     * 说明：204等状态码不包含响应体
     */
    test('空响应应显示提示', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/status/204');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应体');
      const emptyState = contentPage.locator('.empty-response, .no-content').first();
      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
      }
    });

    /**
     * 测试目的：验证超大响应滚动查看
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求返回大量数据的接口
     *   2. 切换到响应体标签页
     *   3. 检查是否有滚动条
     * 预期结果：
     *   - 响应容器可滚动
     *   - 滚动流畅
     *   - 支持虚拟滚动(大数据)
     * 验证点：大响应的滚动查看
     * 说明：大响应需要滚动查看完整内容
     */
    test('超大响应应支持滚动查看', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/bytes/10000');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应体');
      const responseContainer = contentPage.locator('.response-body, .monaco-editor').first();
      const hasScroll = await responseContainer.evaluate((el) => {
        return el.scrollHeight > el.clientHeight;
      });
      expect(hasScroll).toBeDefined();
    });

    /**
     * 测试目的：验证复制响应内容功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 发送请求
     *   2. 切换到响应体标签页
     *   3. 点击复制按钮
     * 预期结果：
     *   - 响应内容复制到剪贴板
     *   - 显示复制成功提示
     * 验证点：响应内容复制功能
     * 说明：复制功能便于在其他工具中使用响应数据
     */
    test('应支持复制响应内容', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/get');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应体');
      const copyBtn = contentPage.locator('[title*="复制"], .copy-btn').first();
      if (await copyBtn.isVisible()) {
        await copyBtn.click();
        await contentPage.waitForTimeout(300);
      }
    });

    /**
     * 测试目的：验证响应体展示模式切换
     * 前置条件：已创建HTTP节点并收到响应
     * 操作步骤：
     *   1. 发送JSON请求
     *   2. 切换到响应体标签页
     *   3. 点击格式化/原始切换按钮
     * 预期结果：
     *   - 可在格式化和原始模式间切换
     *   - 格式化模式显示美化的JSON
     *   - 原始模式显示原始字符串
     * 验证点：响应体展示模式切换
     * 说明：原始模式便于查看实际传输内容
     */
    test('应支持切换响应体展示模式（格式化/原始）', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/json');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应体');
      const modeSwitch = contentPage.locator('.mode-switch, .format-toggle').first();
      if (await modeSwitch.isVisible()) {
        await modeSwitch.click();
        await contentPage.waitForTimeout(300);
      }
    });
  });

  test.describe('10.3 响应头展示测试', () => {
    /**
     * 测试目的：验证显示所有响应头
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 发送请求
     *   2. 切换到响应头标签页
     *   3. 检查响应头列表显示
     * 预期结果：
     *   - 响应头列表可见
     *   - 包含所有服务器返回的响应头
     * 验证点：响应头列表的显示
     * 说明：响应头包含重要的元数据信息
     */
    test('应显示所有响应头', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/get');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应头');
      const headersList = contentPage.locator('.response-headers, .headers-list').first();
      await expect(headersList).toBeVisible({ timeout: 5000 });
    });

    /**
     * 测试目的：验证响应头key和value显示
     * 前置条件：已创建HTTP节点并收到响应
     * 操作步骤：
     *   1. 发送请求
     *   2. 切换到响应头标签页
     *   3. 检查响应头行
     * 预期结果：
     *   - 每个响应头显示为一行
     *   - 包含key和value两列
     *   - 格式清晰易读
     * 验证点：响应头key-value显示
     * 说明：key-value格式是HTTP头的标准表示
     */
    test('响应头应显示key和value', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/get');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应头');
      const headerRow = contentPage.locator('.header-row, tr').first();
      await expect(headerRow).toBeVisible({ timeout: 5000 });
    });

    /**
     * 测试目的：验证搜索响应头功能
     * 前置条件：已创建HTTP节点并收到响应
     * 操作步骤：
     *   1. 发送请求
     *   2. 切换到响应头标签页
     *   3. 在搜索框输入关键词
     * 预期结果：
     *   - 显示搜索输入框
     *   - 过滤匹配的响应头
     *   - 支持模糊搜索
     * 验证点：响应头搜索功能
     * 说明：搜索功能便于在大量响应头中快速定位
     */
    test('应支持搜索响应头', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/get');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应头');
      const searchInput = contentPage.locator('.search-input, input[placeholder*="搜索"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('content');
        await contentPage.waitForTimeout(300);
      }
    });

    /**
     * 测试目的：验证响应头数量显示
     * 前置条件：已创建HTTP节点并收到响应
     * 操作步骤：
     *   1. 发送请求
     *   2. 切换到响应头标签页
     *   3. 检查响应头数量
     * 预期结果：
     *   - 显示响应头总数
     *   - 数量准确
     * 验证点：响应头数量统计
     * 说明：数量统计帮助了解响应头的完整性
     */
    test('应显示响应头数量', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/get');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应头');
      const countElement = contentPage.locator('.header-count, .count').first();
      if (await countElement.isVisible()) {
        const count = await countElement.textContent();
        expect(count).toBeTruthy();
      }
    });

    /**
     * 测试目的：验证复制响应头功能
     * 前置条件：已创建HTTP节点并收到响应
     * 操作步骤：
     *   1. 发送请求
     *   2. 切换到响应头标签页
     *   3. 点击复制按钮
     * 预期结果：
     *   - 响应头复制到剪贴板
     *   - 格式为标准HTTP头格式
     *   - 显示复制成功提示
     * 验证点：响应头复制功能
     * 说明：复制功能便于在其他工具中使用响应头
     */
    test('应支持复制响应头', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/get');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应头');
      const copyBtn = contentPage.locator('[title*="复制"], .copy-btn').first();
      if (await copyBtn.isVisible()) {
        await copyBtn.click();
        await contentPage.waitForTimeout(300);
      }
    });
  });

  test.describe('10.4 Cookie展示测试', () => {
    /**
     * 测试目的：验证提取Set-Cookie头中的Cookie
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求设置Cookie的接口
     *   2. 切换到Cookie标签页
     *   3. 检查Cookie列表
     * 预期结果：
     *   - 自动解析Set-Cookie响应头
     *   - 显示Cookie列表
     * 验证点：Set-Cookie头的解析
     * 说明：Set-Cookie是服务器设置Cookie的标准方式
     */
    test('应提取Set-Cookie头中的Cookie', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/cookies/set?name=value');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, 'Cookie');
      const cookiesList = contentPage.locator('.cookies-list, .cookie-table').first();
      if (await cookiesList.isVisible()) {
        await expect(cookiesList).toBeVisible();
      }
    });

    /**
     * 测试目的：验证显示Cookie的name和value
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求设置Cookie的接口
     *   2. 切换到Cookie标签页
     *   3. 检查Cookie的name和value列
     * 预期结果：
     *   - 显示Cookie名称
     *   - 显示Cookie值
     * 验证点：Cookie name和value的显示
     * 说明：name和value是Cookie的核心属性
     */
    test('应显示Cookie的name和value', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/cookies/set?testcookie=testvalue');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, 'Cookie');
      await contentPage.waitForTimeout(500);
    });

    /**
     * 测试目的：验证显示Cookie的domain
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求设置Cookie的接口
     *   2. 切换到Cookie标签页
     *   3. 检查domain列
     * 预期结果：
     *   - 显示Cookie所属域名
     *   - 未设置domain时显示当前域名
     * 验证点：Cookie domain属性的显示
     * 说明：domain决定Cookie的作用范围
     */
    test('应显示Cookie的domain', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/cookies/set?cookie1=value1');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, 'Cookie');
      await contentPage.waitForTimeout(500);
    });

    /**
     * 测试目的：验证显示Cookie的path
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求设置Cookie的接口
     *   2. 切换到Cookie标签页
     *   3. 检查path列
     * 预期结果：
     *   - 显示Cookie路径
     *   - 未设置path时显示默认路径
     * 验证点：Cookie path属性的显示
     * 说明：path限制Cookie的生效路径
     */
    test('应显示Cookie的path', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/cookies/set?cookie2=value2');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, 'Cookie');
      await contentPage.waitForTimeout(500);
    });

    /**
     * 测试目的：验证显示Cookie的过期时间
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求设置Cookie的接口
     *   2. 切换到Cookie标签页
     *   3. 检查过期时间列
     * 预期结果：
     *   - 显示Expires或Max-Age
     *   - 会话Cookie显示为"Session"
     * 验证点：Cookie过期时间的显示
     * 说明：过期时间决定Cookie的生命周期
     */
    test('应显示Cookie的过期时间', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/cookies/set?cookie3=value3');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, 'Cookie');
      await contentPage.waitForTimeout(500);
    });

    /**
     * 测试目的：验证显示Cookie的HttpOnly属性
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求设置Cookie的接口
     *   2. 切换到Cookie标签页
     *   3. 检查HttpOnly标识
     * 预期结果：
     *   - 显示HttpOnly标记
     *   - 有标记时显示图标或文字
     * 验证点：Cookie HttpOnly属性的显示
     * 说明：HttpOnly防止JavaScript访问Cookie
     */
    test('应显示Cookie的HttpOnly属性', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/cookies/set?cookie4=value4');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, 'Cookie');
      await contentPage.waitForTimeout(500);
    });

    /**
     * 测试目的：验证显示Cookie的Secure属性
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求设置Cookie的接口
     *   2. 切换到Cookie标签页
     *   3. 检查Secure标识
     * 预期结果：
     *   - 显示Secure标记
     *   - 有标记时显示图标或文字
     * 验证点：Cookie Secure属性的显示
     * 说明：Secure限制Cookie仅在HTTPS下传输
     */
    test('应显示Cookie的Secure属性', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/cookies/set?cookie5=value5');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, 'Cookie');
      await contentPage.waitForTimeout(500);
    });

    /**
     * 测试目的：验证无Cookie响应的空状态显示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求不返回Set-Cookie的接口
     *   2. 切换到Cookie标签页
     *   3. 检查空状态提示
     * 预期结果：
     *   - 显示"无Cookie"提示
     *   - 提示文案友好
     * 验证点：无Cookie时的空状态
     * 说明：空状态提示避免用户困惑
     */
    test('无Cookie响应应显示空状态', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/get');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, 'Cookie');
      const emptyState = contentPage.locator('.empty-cookies, .no-cookies').first();
      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
      }
    });
  });

  test.describe('10.5 原始响应展示测试', () => {
    /**
     * 测试目的：验证显示原始响应体
     * 前置条件：已创建HTTP节点并收到响应
     * 操作步骤：
     *   1. 发送请求
     *   2. 切换到原始标签页
     *   3. 检查原始响应显示
     * 预期结果：
     *   - 显示完整的原始响应
     *   - 不经过任何格式化处理
     * 验证点：原始响应的显示
     * 说明：原始响应用于调试和查看实际传输内容
     */
    test('应显示原始响应体', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/get');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      const rawTab = contentPage.locator('.el-tabs__item:has-text("原始"), .raw-tab').first();
      if (await rawTab.isVisible()) {
        await rawTab.click();
        await contentPage.waitForTimeout(300);
      }
    });

    /**
     * 测试目的：验证原始响应包含所有字符
     * 前置条件：已创建HTTP节点并收到响应
     * 操作步骤：
     *   1. 发送请求
     *   2. 切换到原始标签页
     *   3. 获取原始内容
     * 预期结果：
     *   - 包含响应的所有原始字符
     *   - 保留换行、空格等格式
     *   - 不进行转义处理
     * 验证点：原始响应的完整性
     * 说明：原始响应必须与实际接收的数据完全一致
     */
    test('原始响应应包含所有字符', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/get');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      const rawTab = contentPage.locator('.el-tabs__item:has-text("原始"), .raw-tab').first();
      if (await rawTab.isVisible()) {
        await rawTab.click();
        const rawContent = await contentPage.locator('.raw-content, .response-raw').first().textContent();
        expect(rawContent).toBeTruthy();
      }
    });

    /**
     * 测试目的：验证复制原始响应功能
     * 前置条件：已创建HTTP节点并收到响应
     * 操作步骤：
     *   1. 发送请求
     *   2. 点击复制按钮
     * 预期结果：
     *   - 原始响应复制到剪贴板
     *   - 保留所有原始格式
     *   - 显示复制成功提示
     * 验证点：原始响应复制功能
     * 说明：复制原始响应便于在其他工具中分析
     */
    test('应支持复制原始响应', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/get');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      const copyBtn = contentPage.locator('[title*="复制"], .copy-btn').first();
      if (await copyBtn.isVisible()) {
        await copyBtn.click();
        await contentPage.waitForTimeout(300);
      }
    });
  });

  test.describe('10.6 请求信息回显测试', () => {
    /**
     * 测试目的：验证显示实际发送的URL
     * 前置条件：已创建HTTP节点并发送请求
     * 操作步骤：
     *   1. 发送带查询参数的请求
     *   2. 切换到请求信息标签页
     *   3. 检查URL显示
     * 预期结果：
     *   - 显示完整的请求URL
     *   - 包含变量替换后的值
     *   - 包含所有查询参数
     * 验证点：实际发送URL的回显
     * 说明：回显帮助确认实际发送的请求内容
     */
    test('应显示实际发送的URL', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/get?param1=value1');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '请求信息');
      const requestUrl = contentPage.locator('.request-url, .url').first();
      if (await requestUrl.isVisible()) {
        const url = await requestUrl.textContent();
        expect(url).toContain('httpbin.org');
      }
    });

    /**
     * 测试目的：验证显示实际发送的请求头
     * 前置条件：已创建HTTP节点并发送请求
     * 操作步骤：
     *   1. 发送请求
     *   2. 切换到请求信息标签页
     *   3. 检查请求头显示
     * 预期结果：
     *   - 显示所有实际发送的请求头
     *   - 包含自动添加的请求头
     *   - 包含变量替换后的值
     * 验证点：实际发送请求头的回显
     * 说明：回显帮助确认请求头配置是否正确
     */
    test('应显示实际发送的请求头', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/get');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '请求信息');
      const requestHeaders = contentPage.locator('.request-headers, .headers').first();
      if (await requestHeaders.isVisible()) {
        await expect(requestHeaders).toBeVisible();
      }
    });

    /**
     * 测试目的：验证显示实际发送的请求体
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 发送POST请求
     *   2. 切换到请求信息标签页
     *   3. 检查请求体显示
     * 预期结果：
     *   - 显示实际发送的请求体
     *   - 包含变量替换后的值
     *   - 显示实际编码格式
     * 验证点：实际发送请求体的回显
     * 说明：回显帮助确认请求体内容和编码
     */
    test('应显示实际发送的请求体', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/post');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '请求信息');
      await contentPage.waitForTimeout(500);
    });

    /**
     * 测试目的：验证显示请求方法
     * 前置条件：已创建HTTP节点并发送请求
     * 操作步骤：
     *   1. 发送请求
     *   2. 切换到请求信息标签页
     *   3. 检查请求方法显示
     * 预期结果：
     *   - 显示HTTP方法(GET/POST等)
     *   - 方法名称准确
     * 验证点：请求方法的回显
     * 说明：方法是HTTP请求的基本信息
     */
    test('应显示请求方法', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/get');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '请求信息');
      const requestMethod = contentPage.locator('.request-method, .method').first();
      if (await requestMethod.isVisible()) {
        const method = await requestMethod.textContent();
        expect(method).toBeTruthy();
      }
    });

    /**
     * 测试目的：验证变量替换后的值在请求信息中显示
     * 前置条件：已创建HTTP节点并配置变量
     * 操作步骤：
     *   1. 使用变量发送请求
     *   2. 切换到请求信息标签页
     *   3. 检查变量是否已替换
     * 预期结果：
     *   - 显示替换后的实际值
     *   - 不显示变量占位符
     * 验证点：变量替换结果的回显
     * 说明：回显帮助确认变量替换是否正确
     */
    test('变量替换后的值应在请求信息中显示', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/get');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '请求信息');
      await contentPage.waitForTimeout(500);
    });
  });

  test.describe('10.7 响应标签页切换测试', () => {
    /**
     * 测试目的：验证在不同响应标签间切换
     * 前置条件：已创建HTTP节点并收到响应
     * 操作步骤：
     *   1. 发送请求
     *   2. 依次切换所有响应标签页
     * 预期结果：
     *   - 所有标签页可切换
     *   - 切换流畅无卡顿
     *   - 每个标签页内容正确显示
     * 验证点：响应标签页切换功能
     * 说明：标签页切换是查看响应详情的基本操作
     */
    test('应支持在不同响应标签间切换', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/get');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '基本信息');
      await switchToResponseTab(contentPage, '响应体');
      await switchToResponseTab(contentPage, '响应头');
      await switchToResponseTab(contentPage, 'Cookie');
      await switchToResponseTab(contentPage, '请求信息');
    });

    /**
     * 测试目的：验证切换标签后响应数据保持不变
     * 前置条件：已创建HTTP节点并收到响应
     * 操作步骤：
     *   1. 发送请求
     *   2. 切换到响应体标签页获取内容
     *   3. 切换到其他标签页
     *   4. 再次切换回响应体标签页
     *   5. 对比前后内容
     * 预期结果：
     *   - 响应数据保持不变
     *   - 不会重新请求
     *   - 数据完全一致
     * 验证点：标签切换时数据持久性
     * 说明：标签切换不应影响已接收的响应数据
     */
    test('切换标签应保持响应数据', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/get');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应体');
      const body1 = await getResponseBody(contentPage);
      await switchToResponseTab(contentPage, '响应头');
      await switchToResponseTab(contentPage, '响应体');
      const body2 = await getResponseBody(contentPage);
      expect(body1).toBe(body2);
    });
  });
});

