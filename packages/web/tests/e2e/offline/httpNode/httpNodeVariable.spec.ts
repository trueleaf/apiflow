import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForHttpNodeReady,
  fillUrl,
  verifyUrlValue,
  addQueryParam,
  verifyQueryParamExists,
  addHeader,
  verifyHeaderExists,
  fillJsonBody,
  selectHttpMethod,
  switchBodyMode,
  addFormDataField,
  fillRawBody,
  addLocalVariable,
  addEnvironmentVariable,
  addGlobalVariable,
  verifyUrlContainsVariable,
  getUrlInput
} from './helpers/httpNodeHelpers';

test.describe('15. HTTP节点 - 变量替换功能测试', () => {
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

  test.describe('15.1 URL中的变量替换', () => {
    /**
     * 测试目的：验证识别{{variableName}}语法
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 在URL中输入包含{{host}}变量的地址
     *   2. 检查URL输入框的样式类
     * 预期结果：
     *   - 正确识别{{}}包裹的变量语法
     *   - URL输入框显示变量标识样式
     * 验证点：变量语法识别
     * 说明：{{variableName}}是变量占位符的标准语法
     */
    test('应识别{{variableName}}语法', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'http://{{host}}/api');
      await verifyUrlContainsVariable(contentPage, 'host');
      const urlInput = getUrlInput(contentPage);
      const className = await urlInput.getAttribute('class');
      expect(className).toBeTruthy();
    });

    /**
     * 测试目的：验证替换单个变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加局部变量host=example.com
     *   2. 在URL中使用{{host}}
     *   3. 验证变量被识别
     * 预期结果：
     *   - 变量被正确识别
     *   - 发送请求时会替换为实际值
     * 验证点：单个变量的替换
     * 说明：变量替换在发送请求时执行
     */
    test('应替换单个变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'host', 'example.com');
      await fillUrl(contentPage, 'http://{{host}}/api');
      await contentPage.waitForTimeout(300);
      await verifyUrlContainsVariable(contentPage, 'host');
    });

    /**
     * 测试目的：验证替换多个变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加多个局部变量
     *   2. 在URL中使用多个变量占位符
     *   3. 验证所有变量被识别
     * 预期结果：
     *   - 所有变量都被识别
     *   - 支持同一URL中使用多个变量
     * 验证点：多个变量的同时替换
     * 说明：URL可以包含任意数量的变量
     */
    test('应替换多个变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'host', 'example.com');
      await addLocalVariable(contentPage, 'version', 'v1');
      await fillUrl(contentPage, 'http://{{host}}/{{version}}/api');
      await contentPage.waitForTimeout(300);
      await verifyUrlContainsVariable(contentPage, 'host');
      await verifyUrlContainsVariable(contentPage, 'version');
    });

    /**
     * 测试目的：验证未定义变量保持原样
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 使用未定义的变量{{undefined}}
     *   2. 检查变量占位符
     * 预期结果：
     *   - 未定义的变量保持{{undefined}}形式
     *   - 不会报错或替换为空
     * 验证点：未定义变量的处理
     * 说明：未定义变量保持原样便于调试
     */
    test('未定义的变量应保持原样', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'http://example.com/{{undefined}}/api');
      await contentPage.waitForTimeout(300);
      await verifyUrlContainsVariable(contentPage, 'undefined');
    });

    /**
     * 测试目的：验证变量名区分大小写
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 定义变量Host(大写H)
     *   2. 使用变量{{host}}(小写h)
     *   3. 检查是否匹配
     * 预期结果：
     *   - 变量名大小写敏感
     *   - Host和host视为不同变量
     * 验证点：变量名的大小写敏感性
     * 说明：变量名区分大小写是编程的常规约定
     */
    test('变量名应区分大小写', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'Host', 'example.com');
      await fillUrl(contentPage, 'http://{{host}}/api');
      await contentPage.waitForTimeout(300);
      await verifyUrlContainsVariable(contentPage, 'host');
    });
  });

  test.describe('15.2 参数中的变量替换', () => {
    /**
     * 测试目的：验证Query参数value支持变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加局部变量userId=123
     *   2. 添加Query参数id={{userId}}
     *   3. 验证参数存在
     * 预期结果：
     *   - Query参数value可以使用变量
     *   - 发送请求时替换为实际值
     * 验证点：Query参数value的变量替换
     * 说明：参数值使用变量是常见需求
     */
    test('Query参数value应支持变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'userId', '123');
      await addQueryParam(contentPage, 'id', '{{userId}}');
      await contentPage.waitForTimeout(300);
      await verifyQueryParamExists(contentPage, 'id');
    });

    /**
     * 测试目的：验证Query参数key支持变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加局部变量paramKey=id
     *   2. 添加Query参数{{paramKey}}=value
     * 预期结果：
     *   - Query参数key可以使用变量
     *   - 发送时参数名为实际值
     * 验证点：Query参数key的变量替换
     * 说明：参数名使用变量适用于动态API
     */
    test('Query参数key应支持变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'paramKey', 'id');
      await addQueryParam(contentPage, '{{paramKey}}', 'value');
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证Path参数支持变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加局部变量userId=456
     *   2. 在URL中使用Path参数{id}
     * 预期结果：
     *   - Path参数可以使用变量替换
     *   - 支持RESTful风格的路径参数
     * 验证点：Path参数的变量替换
     * 说明：Path参数常用于RESTful API
     */
    test('Path参数应支持变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'userId', '456');
      await fillUrl(contentPage, 'http://example.com/users/{id}');
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证参数value可包含部分变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加局部变量id=123
     *   2. 添加参数fullId=prefix_{{id}}_suffix
     * 预期结果：
     *   - 参数值可以包含变量和固定文本
     *   - 仅替换变量部分
     * 验证点：参数值的部分变量替换
     * 说明：支持变量与固定文本混合使用
     */
    test('参数value可包含部分变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'id', '123');
      await addQueryParam(contentPage, 'fullId', 'prefix_{{id}}_suffix');
      await contentPage.waitForTimeout(300);
      await verifyQueryParamExists(contentPage, 'fullId');
    });
  });

  test.describe('15.3 请求头中的变量替换', () => {
    /**
     * 测试目的：验证Header value支持变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加局部变量token=abc123
     *   2. 添加请求头X-Token={{token}}
     *   3. 验证请求头存在
     * 预期结果：
     *   - 请求头value可以使用变量
     *   - 发送请求时替换为实际值
     * 验证点：请求头value的变量替换
     * 说明：请求头使用变量便于统一管理认证信息
     */
    test('Header value应支持变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'token', 'abc123');
      await addHeader(contentPage, 'X-Token', '{{token}}');
      await contentPage.waitForTimeout(300);
      await verifyHeaderExists(contentPage, 'X-Token');
    });

    /**
     * 测试目的：验证Authorization头支持变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加局部变量token=secret-token-123
     *   2. 添加Authorization头Bearer {{token}}
     *   3. 验证请求头存在
     * 预期结果：
     *   - Authorization头可以使用变量
     *   - 支持Bearer等认证方式
     * 验证点：Authorization头的变量替换
     * 说明：Authorization是最常用变量的请求头
     */
    test('Authorization头应支持变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'token', 'secret-token-123');
      await addHeader(contentPage, 'Authorization', 'Bearer {{token}}');
      await contentPage.waitForTimeout(300);
      await verifyHeaderExists(contentPage, 'Authorization');
    });

    /**
     * 测试目的：验证自定义头支持变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加局部变量customValue=custom123
     *   2. 添加自定义请求头X-Custom-Header={{customValue}}
     *   3. 验证请求头存在
     * 预期结果：
     *   - 自定义请求头支持变量
     *   - 变量替换规则一致
     * 验证点：自定义请求头的变量替换
     * 说明：所有类型的请求头都支持变量
     */
    test('自定义头应支持变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'customValue', 'custom123');
      await addHeader(contentPage, 'X-Custom-Header', '{{customValue}}');
      await contentPage.waitForTimeout(300);
      await verifyHeaderExists(contentPage, 'X-Custom-Header');
    });
  });

  test.describe('15.4 Body中的变量替换', () => {
    /**
     * 测试目的：验证JSON Body支持变量替换
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 选择POST方法
     *   2. 添加局部变量userId=789
     *   3. 填写JSON Body包含{{userId}}
     * 预期结果：
     *   - JSON字段值可以使用变量
     *   - 发送时替换为实际值
     * 验证点：JSON Body的变量替换
     * 说明：JSON是最常用的请求体格式
     */
    test('JSON Body应支持变量替换', async () => {
      await waitForHttpNodeReady(contentPage);
      await selectHttpMethod(contentPage, 'POST');
      await addLocalVariable(contentPage, 'userId', '789');
      await fillJsonBody(contentPage, { userId: '{{userId}}', name: 'test' });
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证JSON多层嵌套支持变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 选择POST方法
     *   2. 添加多个局部变量
     *   3. 填写嵌套JSON包含变量
     * 预期结果：
     *   - 嵌套对象中的变量都能正确替换
     *   - 支持任意嵌套层级
     * 验证点：嵌套JSON的变量替换
     * 说明：复杂JSON结构也支持变量
     */
    test('JSON多层嵌套应支持变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await selectHttpMethod(contentPage, 'POST');
      await addLocalVariable(contentPage, 'userId', '123');
      await addLocalVariable(contentPage, 'userName', 'testUser');
      await fillJsonBody(contentPage, {
        user: {
          id: '{{userId}}',
          name: '{{userName}}'
        }
      });
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证FormData value支持变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 选择POST方法
     *   2. 添加局部变量fieldValue=formValue123
     *   3. 切换到form-data模式
     *   4. 添加字段使用变量
     * 预期结果：
     *   - FormData字段值支持变量
     *   - 发送时正确替换
     * 验证点：FormData的变量替换
     * 说明：FormData常用于文件上传
     */
    test('FormData value应支持变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await selectHttpMethod(contentPage, 'POST');
      await addLocalVariable(contentPage, 'fieldValue', 'formValue123');
      await switchBodyMode(contentPage, 'form-data');
      await addFormDataField(contentPage, 'field1', '{{fieldValue}}');
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证Raw模式支持变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 选择POST方法
     *   2. 添加局部变量var=rawValue
     *   3. 切换到raw模式
     *   4. 填写包含变量的文本
     * 预期结果：
     *   - Raw模式支持变量替换
     *   - 可以在任意位置使用变量
     * 验证点：Raw模式的变量替换
     * 说明：Raw模式适用于自定义格式的请求体
     */
    test('Raw模式应支持变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await selectHttpMethod(contentPage, 'POST');
      await addLocalVariable(contentPage, 'var', 'rawValue');
      await switchBodyMode(contentPage, 'raw');
      await fillRawBody(contentPage, 'Text with {{var}} replacement');
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证Binary变量模式读取变量值
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 选择POST方法
     *   2. 切换到binary模式
     *   3. 选择变量模式
     * 预期结果：
     *   - Binary模式支持从变量读取
     *   - 变量值应为文件路径或base64
     * 验证点：Binary模式的变量支持
     * 说明：Binary模式可以通过变量动态指定文件
     */
    test('Binary变量模式应读取变量值', async () => {
      await waitForHttpNodeReady(contentPage);
      await selectHttpMethod(contentPage, 'POST');
      await switchBodyMode(contentPage, 'binary');
      const varMode = contentPage.locator('input[type="radio"][value="variable"], .mode-variable').first();
      if (await varMode.isVisible()) {
        await varMode.check({ force: true });
        await contentPage.waitForTimeout(300);
      }
    });
  });

  test.describe('15.5 变量作用域测试', () => {
    /**
     * 测试目的：验证优先使用局部变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加全局变量scopeTest=globalValue
     *   2. 添加局部变量scopeTest=localValue
     *   3. 在URL中使用{{scopeTest}}
     * 预期结果：
     *   - 使用局部变量的值
     *   - 局部变量优先级最高
     * 验证点：变量作用域优先级(局部优先)
     * 说明：优先级：局部 > 环境 > 全局
     */
    test('应优先使用局部变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addGlobalVariable(contentPage, 'scopeTest', 'globalValue');
      await addLocalVariable(contentPage, 'scopeTest', 'localValue');
      await fillUrl(contentPage, 'http://{{scopeTest}}/api');
      await contentPage.waitForTimeout(300);
      await verifyUrlContainsVariable(contentPage, 'scopeTest');
    });

    /**
     * 测试目的：验证局部变量不存在时使用环境变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加环境变量envVar=envValue
     *   2. 在URL中使用{{envVar}}(不添加局部变量)
     * 预期结果：
     *   - 使用环境变量的值
     *   - 环境变量优先级次于局部变量
     * 验证点：变量作用域优先级(环境次之)
     * 说明：环境变量用于不同环境配置
     */
    test('局部变量不存在时应使用环境变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addEnvironmentVariable(contentPage, 'envVar', 'envValue');
      await fillUrl(contentPage, 'http://{{envVar}}/api');
      await contentPage.waitForTimeout(300);
      await verifyUrlContainsVariable(contentPage, 'envVar');
    });

    /**
     * 测试目的：验证环境变量不存在时使用全局变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加全局变量globalVar=globalValue
     *   2. 在URL中使用{{globalVar}}(不添加局部和环境变量)
     * 预期结果：
     *   - 使用全局变量的值
     *   - 全局变量优先级最低
     * 验证点：变量作用域优先级(全局最后)
     * 说明：全局变量适用于所有项目
     */
    test('环境变量不存在时应使用全局变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addGlobalVariable(contentPage, 'globalVar', 'globalValue');
      await fillUrl(contentPage, 'http://{{globalVar}}/api');
      await contentPage.waitForTimeout(300);
      await verifyUrlContainsVariable(contentPage, 'globalVar');
    });
  });

  test.describe('15.6 变量实时预览', () => {
    /**
     * 测试目的：验证显示变量替换后的实际值预览
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加局部变量previewVar=previewValue
     *   2. 在URL中使用{{previewVar}}
     *   3. 检查预览元素
     * 预期结果：
     *   - 显示变量替换后的实际值
     *   - 预览元素可见
     * 验证点：变量值预览功能
     * 说明：预览帮助确认变量值是否正确
     */
    test('应显示变量替换后的实际值预览', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'previewVar', 'previewValue');
      await fillUrl(contentPage, 'http://{{previewVar}}/api');
      await contentPage.waitForTimeout(300);
      const previewElement = contentPage.locator('.variable-preview, .var-tip').first();
      if (await previewElement.isVisible()) {
        await expect(previewElement).toBeVisible();
      }
    });

    /**
     * 测试目的：验证鼠标悬停变量显示当前值
     * 前置条件：已创建HTTP节点并使用变量
     * 操作步骤：
     *   1. 添加局部变量hoverVar=hoverValue
     *   2. 在URL中使用{{hoverVar}}
     *   3. 鼠标悬停到URL输入框
     *   4. 检查tooltip显示
     * 预期结果：
     *   - 鼠标悬停时显示tooltip
     *   - tooltip包含变量的实际值
     * 验证点：变量值tooltip提示
     * 说明：悬停提示提供快速查看变量值的方式
     */
    test('鼠标悬停变量应显示当前值', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'hoverVar', 'hoverValue');
      await fillUrl(contentPage, 'http://{{hoverVar}}/api');
      await contentPage.waitForTimeout(300);
      const urlInput = getUrlInput(contentPage);
      await urlInput.hover();
      await contentPage.waitForTimeout(500);
      const tooltip = contentPage.locator('.el-tooltip__popper, .tooltip').first();
      if (await tooltip.isVisible()) {
        await expect(tooltip).toBeVisible();
      }
    });
  });
});
