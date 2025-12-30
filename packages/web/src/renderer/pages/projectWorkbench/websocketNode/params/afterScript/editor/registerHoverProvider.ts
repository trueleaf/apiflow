import * as monaco from 'monaco-editor';

type HoverInfo = {
  keyword: string;
  title: string;
  description: string;
  examples?: string[];
}

const hoverInfoList: HoverInfo[] = [
  {
    keyword: 'ws',
    title: '**WebSocket后置脚本全局对象**',
    description: 'WebSocket后置脚本的全局对象，在接收到消息后执行，可用于处理响应数据、提取信息、保存变量等',
  },
  {
    keyword: 'ws.response',
    title: '**WebSocket响应对象**',
    description: '包含接收到的WebSocket消息的所有信息',
  },
  {
    keyword: 'ws.response.data',
    title: '**消息数据**',
    description: '接收到的WebSocket消息内容',
    examples: [
      'const message = ws.response.data',
      'console.log("收到消息:", ws.response.data)',
      'const json = JSON.parse(ws.response.data)',
    ]
  },
  {
    keyword: 'ws.response.type',
    title: '**消息类型**',
    description: '消息类型，可能是 "text" 或 "binary"',
    examples: [
      'if (ws.response.type === "text") {',
      '  console.log("文本消息:", ws.response.data)',
      '}',
    ]
  },
  {
    keyword: 'ws.response.timestamp',
    title: '**时间戳**',
    description: '接收到消息的时间戳（毫秒）',
    examples: [
      'const receiveTime = new Date(ws.response.timestamp)',
      'console.log("消息接收时间:", receiveTime)',
    ]
  },
  {
    keyword: 'ws.response.size',
    title: '**消息大小**',
    description: '消息的字节大小',
    examples: [
      'console.log("消息大小:", ws.response.size, "bytes")',
    ]
  },
  {
    keyword: 'ws.variables',
    title: '**变量对象**',
    description: '访问和修改全局、项目、环境变量',
    examples: [
      '// 解析响应并保存到变量',
      'const data = JSON.parse(ws.response.data)',
      'ws.variables["userId"] = data.userId',
      'ws.variables["sessionToken"] = data.token',
    ]
  },
  {
    keyword: 'ws.sessionStorage',
    title: '**会话存储**',
    description: '临时存储数据，页面刷新后消失',
    examples: [
      'ws.sessionStorage["lastMessage"] = ws.response.data',
      'const count = (ws.sessionStorage["messageCount"] || 0) + 1',
      'ws.sessionStorage["messageCount"] = count',
    ]
  },
  {
    keyword: 'ws.localStorage',
    title: '**本地存储**',
    description: '持久化存储数据，清空缓存后消失',
    examples: [
      'ws.localStorage["lastConnectTime"] = Date.now()',
      'const history = ws.localStorage["messageHistory"] || []',
      'history.push(ws.response.data)',
      'ws.localStorage["messageHistory"] = history',
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
    description: '在后置脚本中发送HTTP请求',
  },
  {
    keyword: 'ws.http.post',
    title: '**发送POST请求**',
    description: '发送HTTP POST请求，可用于将WebSocket消息转发到其他服务',
    examples: [
      '// 将收到的消息转发到其他API',
      'const response = await ws.http.post("https://api.example.com/webhook", {',
      '  body: { message: ws.response.data, timestamp: ws.response.timestamp }',
      '})',
    ]
  },
]

export const useHoverProvider = (): monaco.IDisposable => {
  return monaco.languages.registerHoverProvider('javascript', {
    provideHover(model: monaco.editor.ITextModel, position: monaco.Position) {
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
