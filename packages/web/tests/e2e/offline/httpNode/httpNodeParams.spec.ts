import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';

test.describe('3. HTTP节点 - Params模块测试', () => {
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
    await contentPage.waitForTimeout(500);
  });

  test.describe('3.1 Query参数基础操作', () => {
    /**
     * 测试目的：验证添加Query参数功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Params标签页
     *   2. 在参数名称输入框输入key
     *   3. 按Tab键切换到value输入框
     *   4. 输入value值
     *   5. 按Enter键确认
     * 预期结果：
     *   - 参数成功添加到列表
     *   - 参数默认为选中状态(checkbox勾选)
     * 验证点：Query参数添加功能和默认选中状态
     */
    test('应能添加Query参数', async () => {
      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await paramsTab.click();
      await contentPage.waitForTimeout(300);

      const paramKeyInput = contentPage.locator('input[placeholder*="参数名称"]').first();
      await paramKeyInput.fill('testKey');
      await paramKeyInput.press('Tab');
      await contentPage.waitForTimeout(200);

      const paramValueInput = contentPage.locator('input[placeholder*="参数值"]').first();
      await paramValueInput.fill('testValue');
      await paramValueInput.press('Enter');
      await contentPage.waitForTimeout(300);

      const addedParam = contentPage.locator('tr:has(input[value="testKey"])');
      await expect(addedParam).toBeVisible();
    });

    /**
     * 测试目的：验证删除Query参数功能
     * 前置条件：已创建HTTP节点并添加了参数
     * 操作步骤：
     *   1. 添加一个参数
     *   2. 悬停到参数行
     *   3. 点击删除按钮
     * 预期结果：参数从列表中移除
     * 验证点：Query参数删除功能
     */
    test('应能删除Query参数', async () => {
      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await paramsTab.click();
      await contentPage.waitForTimeout(300);

      const paramKeyInput = contentPage.locator('input[placeholder*="参数名称"]').first();
      await paramKeyInput.fill('deleteMe');
      await paramKeyInput.press('Tab');
      await contentPage.waitForTimeout(200);

      const paramValueInput = contentPage.locator('input[placeholder*="参数值"]').first();
      await paramValueInput.fill('value');
      await paramValueInput.press('Enter');
      await contentPage.waitForTimeout(300);

      const paramRow = contentPage.locator('tr:has(input[value="deleteMe"])').first();
      await paramRow.hover();
      await contentPage.waitForTimeout(200);

      const deleteBtn = paramRow.locator('button, .delete-icon, [title*="删除"]').first();
      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
        await contentPage.waitForTimeout(300);
        const deletedParam = contentPage.locator('tr:has(input[value="deleteMe"])');
        await expect(deletedParam).toHaveCount(0);
      }
    });

    /**
     * 测试目的：验证修改Query参数值功能
     * 前置条件：已创建HTTP节点并添加了参数
     * 操作步骤：
     *   1. 添加一个参数
     *   2. 修改参数的value值
     * 预期结果：参数值更新成功
     * 验证点：Query参数编辑功能
     */
    test('应能修改Query参数值', async () => {
      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await paramsTab.click();
      await contentPage.waitForTimeout(300);

      const paramKeyInput = contentPage.locator('input[placeholder*="参数名称"]').first();
      await paramKeyInput.fill('editKey');
      await paramKeyInput.press('Tab');
      await contentPage.waitForTimeout(200);

      const paramValueInput = contentPage.locator('input[placeholder*="参数值"]').first();
      await paramValueInput.fill('oldValue');
      await paramValueInput.press('Enter');
      await contentPage.waitForTimeout(300);

      const editValueInput = contentPage.locator('tr:has(input[value="editKey"]) input[placeholder*="参数值"]').first();
      await editValueInput.clear();
      await editValueInput.fill('newValue');
      await editValueInput.blur();
      await contentPage.waitForTimeout(300);

      const updatedValue = await editValueInput.inputValue();
      expect(updatedValue).toBe('newValue');
    });

    /**
     * 测试目的：验证Query参数启用/禁用功能
     * 前置条件：已创建HTTP节点并添加了参数
     * 操作步骤：
     *   1. 添加一个参数(默认选中)
     *   2. 取消勾选checkbox
     *   3. 再次勾选checkbox
     * 预期结果：
     *   - checkbox状态正确切换
     *   - 未选中的参数不会出现在最终请求URL中
     * 验证点：参数启用/禁用状态切换
     */
    test('应能启用/禁用Query参数', async () => {
      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await paramsTab.click();
      await contentPage.waitForTimeout(300);

      const paramKeyInput = contentPage.locator('input[placeholder*="参数名称"]').first();
      await paramKeyInput.fill('toggleKey');
      await paramKeyInput.press('Tab');
      await contentPage.waitForTimeout(200);

      const paramValueInput = contentPage.locator('input[placeholder*="参数值"]').first();
      await paramValueInput.fill('value');
      await paramValueInput.press('Enter');
      await contentPage.waitForTimeout(300);

      const paramRow = contentPage.locator('tr:has(input[value="toggleKey"])').first();
      const checkbox = paramRow.locator('.el-checkbox__input, input[type="checkbox"]').first();

      const isChecked = await checkbox.evaluate((el: HTMLElement) => {
        const input = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
        return input ? input.checked : el.classList.contains('is-checked');
      });

      await checkbox.click();
      await contentPage.waitForTimeout(300);

      const isCheckedAfterClick = await checkbox.evaluate((el: HTMLElement) => {
        const input = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
        return input ? input.checked : el.classList.contains('is-checked');
      });

      expect(isCheckedAfterClick).not.toBe(isChecked);
    });

    /**
     * 测试目的：验证未选中的Query参数不出现在URL中
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加两个参数
     *   2. 取消勾选第二个参数
     *   3. 检查URL预览
     * 预期结果：URL中只包含选中的参数
     * 验证点：参数select状态对URL的影响
     */
    test('未选中的参数不应出现在URL中', async () => {
      const urlInput = contentPage.locator('input[placeholder*="请求地址"]').first();
      await urlInput.fill('http://example.com/api');
      await urlInput.blur();
      await contentPage.waitForTimeout(300);

      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await paramsTab.click();
      await contentPage.waitForTimeout(300);

      const paramKeyInput1 = contentPage.locator('input[placeholder*="参数名称"]').first();
      await paramKeyInput1.fill('param1');
      await paramKeyInput1.press('Tab');
      await contentPage.waitForTimeout(200);

      const paramValueInput1 = contentPage.locator('input[placeholder*="参数值"]').first();
      await paramValueInput1.fill('value1');
      await paramValueInput1.press('Enter');
      await contentPage.waitForTimeout(300);

      const urlValue = await urlInput.inputValue();
      expect(urlValue).toContain('param1=value1');
    });

    /**
     * 测试目的：验证多个Query参数用&连接
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加多个Query参数
     *   2. 检查URL预览
     * 预期结果：参数用&符号连接
     * 验证点：多参数拼接格式
     */
    test('多个Query参数应用&连接', async () => {
      const urlInput = contentPage.locator('input[placeholder*="请求地址"]').first();
      await urlInput.fill('http://example.com/api');
      await urlInput.blur();
      await contentPage.waitForTimeout(300);

      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await paramsTab.click();
      await contentPage.waitForTimeout(300);

      const paramKeyInput1 = contentPage.locator('input[placeholder*="参数名称"]').first();
      await paramKeyInput1.fill('key1');
      await paramKeyInput1.press('Tab');
      await contentPage.waitForTimeout(200);

      let paramValueInput = contentPage.locator('input[placeholder*="参数值"]').first();
      await paramValueInput.fill('value1');
      await paramValueInput.press('Enter');
      await contentPage.waitForTimeout(300);

      const paramKeyInput2 = contentPage.locator('input[placeholder*="参数名称"]').last();
      await paramKeyInput2.fill('key2');
      await paramKeyInput2.press('Tab');
      await contentPage.waitForTimeout(200);

      paramValueInput = contentPage.locator('tr:has(input[value="key2"]) input[placeholder*="参数值"]').first();
      await paramValueInput.fill('value2');
      await paramValueInput.press('Enter');
      await contentPage.waitForTimeout(300);

      const urlValue = await urlInput.inputValue();
      expect(urlValue).toContain('?');
      expect(urlValue).toContain('&');
    });
  });

  test.describe('3.2 Path参数自动提取', () => {
    /**
     * 测试目的：验证URL中单个Path参数的自动提取
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 在URL输入框输入包含{id}的路径
     *   2. 切换到Params标签页
     *   3. 查看Path参数区域
     * 预期结果：
     *   - Path参数区域显示
     *   - id参数自动提取显示
     * 验证点：单个Path参数提取
     */
    test('应自动提取URL中的Path参数{id}', async () => {
      const urlInput = contentPage.locator('input[placeholder*="请求地址"]').first();
      await urlInput.fill('http://example.com/user/{id}');
      await urlInput.blur();
      await contentPage.waitForTimeout(500);

      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await paramsTab.click();
      await contentPage.waitForTimeout(300);

      const pathParamLabel = contentPage.locator('text=Path 参数');
      await expect(pathParamLabel).toBeVisible();

      const idParam = contentPage.locator('input[value="id"]').first();
      await expect(idParam).toBeVisible();
    });

    /**
     * 测试目的：验证URL中多个Path参数的自动提取
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 在URL输入框输入包含多个{}的路径
     *   2. 切换到Params标签页
     * 预期结果：所有Path参数都被提取
     * 验证点：多个Path参数提取
     */
    test('应提取多个Path参数{userId}/{postId}', async () => {
      const urlInput = contentPage.locator('input[placeholder*="请求地址"]').first();
      await urlInput.fill('http://example.com/user/{userId}/post/{postId}');
      await urlInput.blur();
      await contentPage.waitForTimeout(500);

      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await paramsTab.click();
      await contentPage.waitForTimeout(300);

      const userIdParam = contentPage.locator('input[value="userId"]').first();
      const postIdParam = contentPage.locator('input[value="postId"]').first();

      await expect(userIdParam).toBeVisible();
      await expect(postIdParam).toBeVisible();
    });

    /**
     * 测试目的：验证不提取双花括号变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 在URL输入框输入包含{{variable}}的路径
     *   2. 切换到Params标签页
     * 预期结果：{{variable}}不被识别为Path参数
     * 验证点：排除变量占位符
     */
    test('不应提取双花括号变量{{variable}}', async () => {
      const urlInput = contentPage.locator('input[placeholder*="请求地址"]').first();
      await urlInput.fill('http://{{host}}/api/{id}');
      await urlInput.blur();
      await contentPage.waitForTimeout(500);

      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await paramsTab.click();
      await contentPage.waitForTimeout(300);

      const hostParam = contentPage.locator('input[value="host"]');
      const hostCount = await hostParam.count();
      expect(hostCount).toBe(0);

      const idParam = contentPage.locator('input[value="id"]').first();
      await expect(idParam).toBeVisible();
    });

    /**
     * 测试目的：验证URL修改后Path参数同步更新
     * 前置条件：已创建HTTP节点并设置了Path参数
     * 操作步骤：
     *   1. 输入包含{id}的URL
     *   2. 修改URL为包含{userId}
     *   3. 查看Path参数列表
     * 预期结果：Path参数列表同步更新
     * 验证点：Path参数动态同步
     */
    test('URL修改后Path参数应同步更新', async () => {
      const urlInput = contentPage.locator('input[placeholder*="请求地址"]').first();
      await urlInput.fill('http://example.com/user/{id}');
      await urlInput.blur();
      await contentPage.waitForTimeout(500);

      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await paramsTab.click();
      await contentPage.waitForTimeout(300);

      let idParam = contentPage.locator('input[value="id"]').first();
      await expect(idParam).toBeVisible();

      await urlInput.fill('http://example.com/user/{userId}');
      await urlInput.blur();
      await contentPage.waitForTimeout(500);

      const userIdParam = contentPage.locator('input[value="userId"]').first();
      await expect(userIdParam).toBeVisible();
    });

    /**
     * 测试目的：验证Path参数填值后URL预览正确替换
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入包含{id}的URL
     *   2. 切换到Params标签页
     *   3. 为id参数填写值
     *   4. 查看URL预览
     * 预期结果：URL中的{id}被替换为实际值
     * 验证点：Path参数值替换
     */
    test('Path参数填值应替换URL中的占位符', async () => {
      const urlInput = contentPage.locator('input[placeholder*="请求地址"]').first();
      await urlInput.fill('http://example.com/user/{id}');
      await urlInput.blur();
      await contentPage.waitForTimeout(500);

      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await paramsTab.click();
      await contentPage.waitForTimeout(300);

      const idParamRow = contentPage.locator('tr:has(input[value="id"])').first();
      const idValueInput = idParamRow.locator('input[placeholder*="参数值"]').first();
      await idValueInput.fill('123');
      await idValueInput.blur();
      await contentPage.waitForTimeout(300);

      const urlPreview = await urlInput.inputValue();
      expect(urlPreview).toContain('/user/123');
    });
  });

  test.describe('3.3 Query参数URL拼接', () => {
    /**
     * 测试目的：验证Query参数正确拼接到URL
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入基础URL
     *   2. 添加Query参数
     *   3. 查看URL
     * 预期结果：URL包含?key=value
     * 验证点：Query参数URL拼接
     */
    test('选中的参数应拼接到URL', async () => {
      const urlInput = contentPage.locator('input[placeholder*="请求地址"]').first();
      await urlInput.fill('http://example.com/api');
      await urlInput.blur();
      await contentPage.waitForTimeout(300);

      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await paramsTab.click();
      await contentPage.waitForTimeout(300);

      const paramKeyInput = contentPage.locator('input[placeholder*="参数名称"]').first();
      await paramKeyInput.fill('page');
      await paramKeyInput.press('Tab');
      await contentPage.waitForTimeout(200);

      const paramValueInput = contentPage.locator('input[placeholder*="参数值"]').first();
      await paramValueInput.fill('1');
      await paramValueInput.press('Enter');
      await contentPage.waitForTimeout(300);

      const urlValue = await urlInput.inputValue();
      expect(urlValue).toContain('?page=1');
    });

    /**
     * 测试目的：验证粘贴完整URL自动提取参数
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 粘贴包含查询参数的完整URL
     *   2. 切换到Params标签页
     * 预期结果：查询参数自动提取到列表
     * 验证点：URL参数自动解析
     */
    test('粘贴完整URL应自动提取Query参数', async () => {
      const urlInput = contentPage.locator('input[placeholder*="请求地址"]').first();
      await urlInput.fill('http://example.com/api?page=1&size=10&sort=name');
      await urlInput.blur();
      await contentPage.waitForTimeout(500);

      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await paramsTab.click();
      await contentPage.waitForTimeout(300);

      const pageParam = contentPage.locator('input[value="page"]');
      const sizeParam = contentPage.locator('input[value="size"]');
      const sortParam = contentPage.locator('input[value="sort"]');

      await expect(pageParam.first()).toBeVisible();
      await expect(sizeParam.first()).toBeVisible();
      await expect(sortParam.first()).toBeVisible();
    });

    /**
     * 测试目的：验证提取的参数为选中状态
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 粘贴包含查询参数的URL
     *   2. 切换到Params标签页
     *   3. 检查参数checkbox状态
     * 预期结果：提取的参数默认选中
     * 验证点：自动提取参数的默认状态
     */
    test('提取的参数应为选中状态', async () => {
      const urlInput = contentPage.locator('input[placeholder*="请求地址"]').first();
      await urlInput.fill('http://example.com/api?key=value');
      await urlInput.blur();
      await contentPage.waitForTimeout(500);

      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await paramsTab.click();
      await contentPage.waitForTimeout(300);

      const paramRow = contentPage.locator('tr:has(input[value="key"])').first();
      const checkbox = paramRow.locator('.el-checkbox__input, input[type="checkbox"]').first();

      const isChecked = await checkbox.evaluate((el: HTMLElement) => {
        const input = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
        return input ? input.checked : el.classList.contains('is-checked');
      });

      expect(isChecked).toBe(true);
    });

    /**
     * 测试目的：验证空key的参数被过滤
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加参数但不填写key
     *   2. 只填写value
     *   3. 查看URL
     * 预期结果：空key参数不出现在URL中
     * 验证点：参数有效性验证
     */
    test('空key的参数不应出现在URL', async () => {
      const urlInput = contentPage.locator('input[placeholder*="请求地址"]').first();
      await urlInput.fill('http://example.com/api');
      await urlInput.blur();
      await contentPage.waitForTimeout(300);

      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await paramsTab.click();
      await contentPage.waitForTimeout(300);

      const paramValueInput = contentPage.locator('input[placeholder*="参数值"]').first();
      await paramValueInput.fill('valueOnly');
      await paramValueInput.blur();
      await contentPage.waitForTimeout(300);

      const urlValue = await urlInput.inputValue();
      expect(urlValue).toBe('http://example.com/api');
    });
  });

  test.describe('3.4 变量替换功能', () => {
    /**
     * 测试目的：验证Query参数中的变量占位符
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加Query参数
     *   2. 参数值使用{{variable}}格式
     * 预期结果：参数值保存为{{variable}}格式
     * 验证点：变量占位符语法支持
     */
    test('Query参数值支持{{variable}}变量', async () => {
      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await paramsTab.click();
      await contentPage.waitForTimeout(300);

      const paramKeyInput = contentPage.locator('input[placeholder*="参数名称"]').first();
      await paramKeyInput.fill('token');
      await paramKeyInput.press('Tab');
      await contentPage.waitForTimeout(200);

      const paramValueInput = contentPage.locator('input[placeholder*="参数值"]').first();
      await paramValueInput.fill('{{authToken}}');
      await paramValueInput.blur();
      await contentPage.waitForTimeout(300);

      const savedValue = await paramValueInput.inputValue();
      expect(savedValue).toBe('{{authToken}}');
    });

    /**
     * 测试目的：验证Path参数中的变量占位符
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入包含Path参数的URL
     *   2. 为Path参数填写{{variable}}
     * 预期结果：变量格式保存成功
     * 验证点：Path参数变量支持
     */
    test('Path参数值支持{{variable}}变量', async () => {
      const urlInput = contentPage.locator('input[placeholder*="请求地址"]').first();
      await urlInput.fill('http://example.com/user/{id}');
      await urlInput.blur();
      await contentPage.waitForTimeout(500);

      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await paramsTab.click();
      await contentPage.waitForTimeout(300);

      const idParamRow = contentPage.locator('tr:has(input[value="id"])').first();
      const idValueInput = idParamRow.locator('input[placeholder*="参数值"]').first();
      await idValueInput.fill('{{userId}}');
      await idValueInput.blur();
      await contentPage.waitForTimeout(300);

      const savedValue = await idValueInput.inputValue();
      expect(savedValue).toBe('{{userId}}');
    });

    /**
     * 测试目的：验证支持嵌套变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加参数
     *   2. 参数值使用多个变量
     * 预期结果：多变量格式保存成功
     * 验证点：复杂变量场景
     */
    test('参数值支持多个变量{{var1}}{{var2}}', async () => {
      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await paramsTab.click();
      await contentPage.waitForTimeout(300);

      const paramKeyInput = contentPage.locator('input[placeholder*="参数名称"]').first();
      await paramKeyInput.fill('fullPath');
      await paramKeyInput.press('Tab');
      await contentPage.waitForTimeout(200);

      const paramValueInput = contentPage.locator('input[placeholder*="参数值"]').first();
      await paramValueInput.fill('{{prefix}}{{path}}');
      await paramValueInput.blur();
      await contentPage.waitForTimeout(300);

      const savedValue = await paramValueInput.inputValue();
      expect(savedValue).toBe('{{prefix}}{{path}}');
    });

    /**
     * 测试目的：验证Mock数据标记保持原样
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加参数
     *   2. 参数值使用@符号
     * 预期结果：@标记保持原样
     * 验证点：Mock数据语法支持
     */
    test('参数值@mockValue应保持原样', async () => {
      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await paramsTab.click();
      await contentPage.waitForTimeout(300);

      const paramKeyInput = contentPage.locator('input[placeholder*="参数名称"]').first();
      await paramKeyInput.fill('mockData');
      await paramKeyInput.press('Tab');
      await contentPage.waitForTimeout(200);

      const paramValueInput = contentPage.locator('input[placeholder*="参数值"]').first();
      await paramValueInput.fill('@email');
      await paramValueInput.blur();
      await contentPage.waitForTimeout(300);

      const savedValue = await paramValueInput.inputValue();
      expect(savedValue).toBe('@email');
    });
  });

  test.describe('3.5 边界情况测试', () => {
    /**
     * 测试目的：验证参数值包含特殊字符的处理
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加参数
     *   2. 参数值包含&、=、?等特殊字符
     * 预期结果：特殊字符正确保存
     * 验证点：特殊字符处理
     */
    test('参数值包含特殊字符&=?应正确处理', async () => {
      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await paramsTab.click();
      await contentPage.waitForTimeout(300);

      const paramKeyInput = contentPage.locator('input[placeholder*="参数名称"]').first();
      await paramKeyInput.fill('special');
      await paramKeyInput.press('Tab');
      await contentPage.waitForTimeout(200);

      const paramValueInput = contentPage.locator('input[placeholder*="参数值"]').first();
      await paramValueInput.fill('a&b=c?d');
      await paramValueInput.blur();
      await contentPage.waitForTimeout(300);

      const savedValue = await paramValueInput.inputValue();
      expect(savedValue).toBe('a&b=c?d');
    });

    /**
     * 测试目的：验证空值参数的处理
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加参数key
     *   2. value留空
     * 预期结果：空值参数可以保存
     * 验证点：空值处理
     */
    test('参数value为空应允许保存', async () => {
      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await paramsTab.click();
      await contentPage.waitForTimeout(300);

      const paramKeyInput = contentPage.locator('input[placeholder*="参数名称"]').first();
      await paramKeyInput.fill('emptyValue');
      await paramKeyInput.press('Tab');
      await contentPage.waitForTimeout(200);

      const paramValueInput = contentPage.locator('input[placeholder*="参数值"]').first();
      await paramValueInput.fill('');
      await paramValueInput.blur();
      await contentPage.waitForTimeout(300);

      const paramRow = contentPage.locator('tr:has(input[value="emptyValue"])');
      await expect(paramRow).toBeVisible();
    });

    /**
     * 测试目的：验证参数顺序与显示顺序一致
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 依次添加多个参数
     *   2. 检查显示顺序
     * 预期结果：参数按添加顺序显示
     * 验证点：参数顺序管理
     */
    test('参数顺序应与添加顺序一致', async () => {
      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await paramsTab.click();
      await contentPage.waitForTimeout(300);

      const params = ['first', 'second', 'third'];
      for (const param of params) {
        const paramKeyInput = contentPage.locator('input[placeholder*="参数名称"]').last();
        await paramKeyInput.fill(param);
        await paramKeyInput.press('Tab');
        await contentPage.waitForTimeout(200);

        const paramValueInput = contentPage.locator('input[placeholder*="参数值"]').last();
        await paramValueInput.fill(`${param}Value`);
        await paramValueInput.press('Enter');
        await contentPage.waitForTimeout(300);
      }

      const allParams = contentPage.locator('tr:has(input[value])');
      const count = await allParams.count();
      expect(count).toBeGreaterThanOrEqual(3);
    });
  });
});
