import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

type Suggestions = {
  label: {
    label: string,
    description: string
  },
  kind: monaco.languages.CompletionItemKind,
  insertText: string,
  keyword: string,
  sortText?: string
}[]

const requestSuggestions = [{
  label: {
    label: 'request',
    description: 'WebSocket请求参数'
  },
  kind: monaco.languages.CompletionItemKind.Method,
  insertText: 'request',
  sortText: '3',
  keyword: 'af.request',
}, {
  label: {
    label: 'url',
    description: 'WebSocket连接URL信息(prefix、path、url)'
  },
  sortText: 'a',
  kind: monaco.languages.CompletionItemKind.Module,
  insertText: 'url',
  keyword: 'af.request.url',
}, {
  label: {
    label: 'prefix',
    description: 'WebSocket URL前缀'
  },
  sortText: '1',
  kind: monaco.languages.CompletionItemKind.Property,
  insertText: 'prefix',
  keyword: 'af.request.url.prefix',
}, {
  label: {
    label: 'path',
    description: 'WebSocket URL路径'
  },
  sortText: '2',
  kind: monaco.languages.CompletionItemKind.Property,
  insertText: 'path',
  keyword: 'af.request.url.path',
}, {
  label: {
    label: 'url',
    description: '完整WebSocket URL'
  },
  sortText: '3',
  kind: monaco.languages.CompletionItemKind.Property,
  insertText: 'url',
  keyword: 'af.request.url.url',
}, {
  label: {
    label: 'headers',
    description: 'WebSocket请求头'
  },
  sortText: '3c',
  kind: monaco.languages.CompletionItemKind.Module,
  insertText: 'headers',
  keyword: 'af.request.headers',
}, {
  label: {
    label: 'queryParams',
    description: 'WebSocket连接query参数'
  },
  sortText: 'd',
  kind: monaco.languages.CompletionItemKind.Module,
  insertText: 'queryParams',
  keyword: 'af.request.queryParams',
}, {
  label: {
    label: 'protocol',
    description: '协议类型(ws|wss)'
  },
  sortText: 'e',
  kind: monaco.languages.CompletionItemKind.Property,
  insertText: 'protocol',
  keyword: 'af.request.protocol',
}, {
  label: {
    label: 'replaceUrl',
    description: '替换WebSocket连接URL(最终连接替换后的URL)'
  },
  sortText: 'j',
  kind: monaco.languages.CompletionItemKind.Method,
  insertText: 'replaceUrl("替换后的url eg:wss://example.com/ws")',
  keyword: 'af.request.replaceUrl',
}]

const httpSuggestions = [
  {
    label: {
      label: 'http',
      description: '发送HTTP请求'
    },
    sortText: '2',
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: 'http',
    keyword: 'af.http',
  }, {
    label: {
      label: 'get',
      description: '发送GET请求'
    },
    sortText: '1',
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: 'get("请求url", { headers: {}, params: {}, body: {} })',
    keyword: 'af.http.get',
  }, {
    label: {
      label: 'post',
      description: '发送POST请求'
    },
    sortText: '2',
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: 'post("请求url", { headers: {}, params: {}, body: {} })',
    keyword: 'af.http.post',
  }, {
    label: {
      label: 'put',
      description: '发送PUT请求'
    },
    sortText: '3',
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: 'put("请求url", { headers: {}, params: {}, body: {} })',
    keyword: 'af.http.put',
  }, {
    label: {
      label: 'delete',
      description: '发送DELETE请求'
    },
    sortText: '4',
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: 'delete("请求url", { headers: {}, params: {}, body: {} })',
    keyword: 'af.http.delete',
  }
]

const sessionStorageSuggestions = [{
  label: {
    label: 'sessionStorage',
    description: '会话数据(刷新后消失)'
  },
  kind: monaco.languages.CompletionItemKind.Module,
  insertText: 'sessionStorage',
  sortText: '4',
  keyword: 'af.sessionStorage',
}]

const localStorageSuggestions = [{
  label: {
    label: 'localStorage',
    description: '持久数据(清空缓存后消失)'
  },
  kind: monaco.languages.CompletionItemKind.Module,
  insertText: 'localStorage',
  sortText: '5',
  keyword: 'af.localStorage',
}]

const cookiesSuggestions = [{
  label: {
    label: 'cookies',
    description: 'Cookie数据(浏览器cookie)'
  },
  kind: monaco.languages.CompletionItemKind.Module,
  insertText: 'cookies',
  sortText: '6',
  keyword: 'af.cookies',
}]

const variableSuggestions = [{
  label: {
    label: 'variables',
    description: '变量数据(全局、项目、环境变量)'
  },
  kind: monaco.languages.CompletionItemKind.Module,
  insertText: 'variables',
  sortText: '7',
  keyword: 'af.variables',
}]

const suggestions: Suggestions = [{
  label: {
    label: 'af',
    description: 'WebSocket全局对象'
  },
  kind: monaco.languages.CompletionItemKind.Function,
  insertText: 'af',
  keyword: 'af',
},
{
  label: {
    label: 'console',
    description: '控制台输出'
  },
  kind: monaco.languages.CompletionItemKind.Function,
  insertText: 'console.log()',
  keyword: 'console',
},
...httpSuggestions,
...sessionStorageSuggestions,
...localStorageSuggestions,
...cookiesSuggestions,
...variableSuggestions,
...requestSuggestions]

export const useCompletionItem = (): monaco.IDisposable => {
  return monaco.languages.registerCompletionItemProvider('javascript', {
    triggerCharacters: ['.', '('],
    provideCompletionItems(model, position) {
      const currentLineStr = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 0,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      });
      const lineStrArr = currentLineStr.replace('\t', '').split(' ');
      const activeStr = lineStrArr[lineStrArr.length - 1];
      const matchedSuggestions = suggestions.filter(v => {
        const replacedStr = activeStr.replace(/^[^(]+\(\s*/, '')
        const activeStrArr = replacedStr.split('.');
        const keywordArr = v.keyword.split('.');
        
        // 精确匹配：确保层级数量匹配
        if (activeStrArr.length !== keywordArr.length) {
          return false;
        }
        
        // 检查每一层是否匹配（除了最后一层）
        for (let i = 0; i < activeStrArr.length - 1; i += 1) {
          if (activeStrArr[i] !== keywordArr[i]) {
            return false;
          }
        }
        
        // 最后一层：检查是否以当前输入开头
        const lastActive = activeStrArr[activeStrArr.length - 1];
        const lastKeyword = keywordArr[keywordArr.length - 1];
        return lastKeyword.startsWith(lastActive);
      });
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      };
      const result: monaco.languages.CompletionItem[] = matchedSuggestions.map(v => {
        const data = {
          label: v.label,
          kind: v.kind,
          insertText: v.insertText,
          range,
          sortText: v.sortText || v.label.label,
          preselect: true
        }
        return data;
      })
      return {
        suggestions: result
      };
    }
  })
}
