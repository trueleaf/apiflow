import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

type HoverInfo = {
  keyword: string;
  title: string;
  description: string;
  examples?: string[];
}

const hoverInfoList: HoverInfo[] = [
  {
    keyword: 'ws',
    title: '**WebSocket全局对象**',
    description: 'WebSocket前置脚本的全局对象，提供WebSocket连接前的配置和操作能力',
  },
  {
    keyword: 'ws.request',
    title: '**WebSocket请求对象**',
    description: '包含WebSocket连接的所有请求信息，如URL、请求头、查询参数等',
  },
  {
    keyword: 'ws.request.url',
    title: '**URL对象**',
    description: 'WebSocket连接URL相关信息',
    examples: [
      'ws.request.url.prefix // 获取URL前缀',
      'ws.request.url.path // 获取URL路径',
      'ws.request.url.url // 获取完整URL',
    ]
  },
  {
    keyword: 'ws.request.headers',
    title: '**请求头对象**',
    description: '修改WebSocket连接的请求头',
    examples: [
      'ws.request.headers["Authorization"] = "Bearer token"',
      'ws.request.headers["Custom-Header"] = "value"',
    ]
  },
  {
    keyword: 'ws.request.queryParams',
    title: '**查询参数对象**',
    description: '修改WebSocket连接的查询参数',
    examples: [
      'ws.request.queryParams["userId"] = "123"',
      'ws.request.queryParams["token"] = ws.variables["authToken"]',
    ]
  },
  {
    keyword: 'ws.request.protocol',
    title: '**协议类型**',
    description: 'WebSocket协议类型(ws或wss)',
    examples: [
      'ws.request.protocol // 获取当前协议',
      'ws.request.protocol = "wss" // 修改为安全协议',
    ]
  },
  {
    keyword: 'ws.request.replaceUrl',
    title: '**替换URL方法**',
    description: '完全替换WebSocket连接URL',
    examples: [
      'ws.request.replaceUrl("wss://example.com/ws")',
    ]
  },
  {
    keyword: 'ws.variables',
    title: '**变量对象**',
    description: '访问和修改全局、项目、环境变量',
    examples: [
      'const token = ws.variables["authToken"]',
      'ws.variables["userId"] = "123"',
    ]
  },
  {
    keyword: 'ws.sessionStorage',
    title: '**会话存储**',
    description: '临时存储数据，页面刷新后消失',
    examples: [
      'ws.sessionStorage["tempData"] = "value"',
      'const data = ws.sessionStorage["tempData"]',
    ]
  },
  {
    keyword: 'ws.localStorage',
    title: '**本地存储**',
    description: '持久化存储数据，清空缓存后消失',
    examples: [
      'ws.localStorage["persistData"] = "value"',
      'const data = ws.localStorage["persistData"]',
    ]
  },
  {
    keyword: 'ws.cookies',
    title: '**Cookie对象**',
    description: '访问浏览器Cookie数据',
    examples: [
      'const sessionId = ws.cookies["SESSIONID"]',
    ]
  },
  {
    keyword: 'ws.http',
    title: '**HTTP请求对象**',
    description: '在前置脚本中发送HTTP请求',
  },
  {
    keyword: 'ws.http.get',
    title: '**发送GET请求**',
    description: '发送HTTP GET请求获取数据',
    examples: [
      'const response = await ws.http.get("https://api.example.com/token")',
      'ws.variables["token"] = response.data.token',
    ]
  },
  {
    keyword: 'ws.http.post',
    title: '**发送POST请求**',
    description: '发送HTTP POST请求',
    examples: [
      'const response = await ws.http.post("https://api.example.com/auth", {',
      '  body: { username: "user", password: "pass" }',
      '})',
    ]
  },
]

export const useHoverProvider = (): monaco.IDisposable => {
  return monaco.languages.registerHoverProvider('javascript', {
    provideHover(model, position) {
      const currentLineStr = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 0,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      });

      // 提取当前位置的关键词
      const lineStrArr = currentLineStr.replace('\t', '').split(' ');
      const activeStr = lineStrArr[lineStrArr.length - 1];

      // 匹配悬停信息
      let matchedInfo: HoverInfo | null = null;
      let maxMatchLength = 0;

      for (const info of hoverInfoList) {
        if (activeStr.includes(info.keyword) && info.keyword.length > maxMatchLength) {
          matchedInfo = info;
          maxMatchLength = info.keyword.length;
        }
      }

      if (!matchedInfo) {
        return null;
      }

      // 构建悬停内容
      const contents: monaco.IMarkdownString[] = [
        { value: matchedInfo.title },
        { value: matchedInfo.description },
      ];

      if (matchedInfo.examples && matchedInfo.examples.length > 0) {
        contents.push({ value: '**示例:**' });
        matchedInfo.examples.forEach(example => {
          contents.push({
            value: '```javascript\n' + example + '\n```'
          });
        });
      }

      return {
        range: new monaco.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column
        ),
        contents
      };
    }
  })
}
