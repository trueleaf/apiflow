import * as monaco from 'monaco-editor';
import type { CompletionSuggestion } from '@/components/ui/cleanDesign/codeEditor/types';

// req 对象的代码提示配置
export const reqCompletionSuggestions: CompletionSuggestion[] = [
  {
    label: {
      label: 'req',
      description: '请求对象(包含所有请求信息)'
    },
    kind: monaco.languages.CompletionItemKind.Variable,
    insertText: 'req',
    keyword: 'req',
    sortText: '1'
  },
  {
    label: {
      label: 'method',
      description: '请求方法(GET、POST、PUT、DELETE等)'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'method',
    keyword: 'req.method',
    sortText: 'a'
  },
  {
    label: {
      label: 'url',
      description: '请求URL'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'url',
    keyword: 'req.url',
    sortText: 'b'
  },
  {
    label: {
      label: 'originalUrl',
      description: '原始请求URL'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'originalUrl',
    keyword: 'req.originalUrl',
    sortText: 'c'
  },
  {
    label: {
      label: 'path',
      description: '请求路径'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'path',
    keyword: 'req.path',
    sortText: 'd'
  },
  {
    label: {
      label: 'search',
      description: '查询字符串(包含?)'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'search',
    keyword: 'req.search',
    sortText: 'e'
  },
  {
    label: {
      label: 'query',
      description: '查询参数对象'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'query',
    keyword: 'req.query',
    sortText: 'f'
  },
  {
    label: {
      label: 'headers',
      description: '请求头对象'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'headers',
    keyword: 'req.headers',
    sortText: 'g'
  },
  {
    label: {
      label: 'body',
      description: '请求体数据'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'body',
    keyword: 'req.body',
    sortText: 'h'
  },
  {
    label: {
      label: 'cookies',
      description: 'Cookie对象'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'cookies',
    keyword: 'req.cookies',
    sortText: 'i'
  },
  {
    label: {
      label: 'ip',
      description: '客户端IP地址'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'ip',
    keyword: 'req.ip',
    sortText: 'j'
  },
  {
    label: {
      label: 'protocol',
      description: '请求协议(http或https)'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'protocol',
    keyword: 'req.protocol',
    sortText: 'k'
  },
  {
    label: {
      label: 'secure',
      description: '是否为HTTPS请求'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'secure',
    keyword: 'req.secure',
    sortText: 'l'
  },
  {
    label: {
      label: 'xhr',
      description: '是否为Ajax请求'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'xhr',
    keyword: 'req.xhr',
    sortText: 'm'
  },
  {
    label: {
      label: 'hostname',
      description: '主机名'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'hostname',
    keyword: 'req.hostname',
    sortText: 'n'
  },
  {
    label: {
      label: 'host',
      description: '主机(包含端口)'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'host',
    keyword: 'req.host',
    sortText: 'o'
  },
  {
    label: {
      label: 'origin',
      description: '请求来源'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'origin',
    keyword: 'req.origin',
    sortText: 'p'
  },
  {
    label: {
      label: 'get',
      description: '获取请求头的值'
    },
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: 'get("header-name")',
    keyword: 'req.get',
    sortText: 'q'
  },
  {
    label: {
      label: 'userAgent',
      description: '用户代理字符串'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'userAgent',
    keyword: 'req.userAgent',
    sortText: 'r'
  },
  {
    label: {
      label: 'contentType',
      description: '内容类型'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'contentType',
    keyword: 'req.contentType',
    sortText: 's'
  },
  {
    label: {
      label: 'referer',
      description: '来源页面URL'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'referer',
    keyword: 'req.referer',
    sortText: 't'
  },
  {
    label: {
      label: 'authorization',
      description: '认证信息'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'authorization',
    keyword: 'req.authorization',
    sortText: 'u'
  },
  {
    label: {
      label: 'accept',
      description: '可接受的内容类型'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'accept',
    keyword: 'req.accept',
    sortText: 'v'
  },
  {
    label: {
      label: 'acceptLanguage',
      description: '可接受的语言'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'acceptLanguage',
    keyword: 'req.acceptLanguage',
    sortText: 'w'
  },
  {
    label: {
      label: 'acceptEncoding',
      description: '可接受的编码方式'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'acceptEncoding',
    keyword: 'req.acceptEncoding',
    sortText: 'x'
  },
  {
    label: {
      label: 'contentLength',
      description: '内容长度'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'contentLength',
    keyword: 'req.contentLength',
    sortText: 'y'
  },
  {
    label: {
      label: 'timestamp',
      description: '请求时间戳(毫秒)'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'timestamp',
    keyword: 'req.timestamp',
    sortText: 'z'
  },
  {
    label: {
      label: 'datetime',
      description: '请求时间(ISO格式)'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'datetime',
    keyword: 'req.datetime',
    sortText: 'z1'
  },
  {
    label: {
      label: 'params',
      description: '路径参数对象'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'params',
    keyword: 'req.params',
    sortText: 'z2'
  },
  {
    label: {
      label: 'variables',
      description: '项目变量对象'
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: 'variables',
    keyword: 'req.variables',
    sortText: 'z3'
  },
  {
    label: {
      label: 'return',
      description: '返回布尔值'
    },
    kind: monaco.languages.CompletionItemKind.Keyword,
    insertText: 'return ',
    keyword: 'return',
    sortText: '0'
  },
  {
    label: {
      label: 'true',
      description: '布尔值:真'
    },
    kind: monaco.languages.CompletionItemKind.Keyword,
    insertText: 'true',
    keyword: 'true',
    sortText: '2'
  },
  {
    label: {
      label: 'false',
      description: '布尔值:假'
    },
    kind: monaco.languages.CompletionItemKind.Keyword,
    insertText: 'false',
    keyword: 'false',
    sortText: '3'
  }
];
