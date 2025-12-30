import * as monaco from 'monaco-editor';

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
    description: '请求参数'
  },
  kind: monaco.languages.CompletionItemKind.Method,
  insertText: 'request',
  sortText: '3',
  keyword: 'af.request',
}, {
  label: {
    label: 'url',
    description: '请求url信息(prefix、path、url)'
  },
  sortText: 'a',
  kind: monaco.languages.CompletionItemKind.Module,
  insertText: 'url',
  keyword: 'af.request.url',
}, {
  label: {
    label: 'prefix',
    description: '请求前缀'
  },
  sortText: '1',
  kind: monaco.languages.CompletionItemKind.Property,
  insertText: 'prefix',
  keyword: 'af.request.url.prefix',
}, {
  label: {
    label: 'path',
    description: '请求路径'
  },
  sortText: '2',
  kind: monaco.languages.CompletionItemKind.Property,
  insertText: 'path',
  keyword: 'af.request.url.path',
}, {
  label: {
    label: 'url',
    description: '完整请求路径'
  },
  sortText: '3',
  kind: monaco.languages.CompletionItemKind.Property,
  insertText: 'url',
  keyword: 'af.request.url.url',
}, {
  label: {
    label: 'headers',
    description: '请求头'
  },
  sortText: '3c',
  kind: monaco.languages.CompletionItemKind.Module,
  insertText: 'headers',
  keyword: 'af.request.headers',
}, {
  label: {
    label: 'queryParams',
    description: '请求query参数'
  },
  sortText: 'd',
  kind: monaco.languages.CompletionItemKind.Module,
  insertText: 'queryParams',
  keyword: 'af.request.queryParams',
}, {
  label: {
    label: 'pathParams',
    description: '请求path参数'
  },
  sortText: 'e',
  kind: monaco.languages.CompletionItemKind.Module,
  insertText: 'pathParams',
  keyword: 'af.request.pathParams',
}, {
  label: {
    label: 'body',
    description: '请求body参数'
  },
  sortText: 'f',
  kind: monaco.languages.CompletionItemKind.Module,
  insertText: 'body',
  keyword: 'af.request.body',
}, {
  label: {
    label: 'json',
    description: 'json参数'
  },
  sortText: '1',
  kind: monaco.languages.CompletionItemKind.Module,
  insertText: 'json',
  keyword: 'af.request.body.json',
}, {
  label: {
    label: 'formdata',
    description: 'formdata参数'
  },
  sortText: '2',
  kind: monaco.languages.CompletionItemKind.Module,
  insertText: 'formdata',
  keyword: 'af.request.body.formdata',
}, {
  label: {
    label: 'urlencoded',
    description: 'urlencoded参数'
  },
  sortText: '3',
  kind: monaco.languages.CompletionItemKind.Module,
  insertText: 'urlencoded',
  keyword: 'af.request.body.urlencoded',
}, {
  label: {
    label: 'raw',
    description: 'raw参数'
  },
  sortText: '4',
  kind: monaco.languages.CompletionItemKind.Property,
  insertText: 'raw',
  keyword: 'af.request.body.raw',
}, {
  label: {
    label: 'method',
    description: '请求方法(GET|POST|PUT...)'
  },
  sortText: 'g',
  kind: monaco.languages.CompletionItemKind.Property,
  insertText: 'method',
  keyword: 'af.request.method',
}, {
  label: {
    label: 'envs',
    description: '所有环境信息'
  },
  kind: monaco.languages.CompletionItemKind.Property,
  insertText: 'envs',
  sortText: 'h',
  keyword: 'af.request.envs',
}, {
  label: {
    label: 'currentEnv',
    description: '当前环境'
  },
  kind: monaco.languages.CompletionItemKind.Property,
  insertText: 'currentEnv',
  sortText: 'i',
  keyword: 'af.request.currentEnv',
}, {
  label: {
    label: 'replaceUrl',
    description: '替换url(最终发送替换后的url)'
  },
  sortText: 'j',
  kind: monaco.languages.CompletionItemKind.Method,
  insertText: 'replaceUrl("替换后的url eg:https://www.baidu.com")',
  keyword: 'af.request.replaceUrl',
}]
const responseSuggestions = [{
  label: {
    label: 'response',
    description: '返回参数'
  },
  kind: monaco.languages.CompletionItemKind.Method,
  insertText: 'response',
  sortText: '2',
  keyword: 'af.response',
}, {
  label: {
    label: 'cookie',
    description: '对象形式的cookie'
  },
  sortText: 'a',
  kind: monaco.languages.CompletionItemKind.Module,
  insertText: 'cookie',
  keyword: 'af.response.cookie',
}, {
  label: {
    label: 'cookies',
    description: '数组形式的cookie'
  },
  sortText: 'b',
  kind: monaco.languages.CompletionItemKind.Module,
  insertText: 'cookies',
  keyword: 'af.response.cookies',
}, {
  label: {
    label: 'header',
    description: '对象形式header'
  },
  sortText: 'c',
  kind: monaco.languages.CompletionItemKind.Module,
  insertText: 'header',
  keyword: 'af.response.header',
}, {
  label: {
    label: 'headers',
    description: '数组形式header'
  },
  sortText: 'd',
  kind: monaco.languages.CompletionItemKind.Module,
  insertText: 'headers',
  keyword: 'af.response.headers',
}, {
  label: {
    label: 'httpVersion',
    description: 'http协议版本'
  },
  sortText: 'e',
  kind: monaco.languages.CompletionItemKind.Property,
  insertText: 'httpVersion',
  keyword: 'af.response.httpVersion',
}, {
  label: {
    label: 'ip',
    description: '远端ip地址'
  },
  sortText: 'f',
  kind: monaco.languages.CompletionItemKind.Property,
  insertText: 'ip',
  keyword: 'af.response.ip',
}, {
  label: {
    label: 'rt',
    description: '返回时长'
  },
  sortText: 'g',
  kind: monaco.languages.CompletionItemKind.Property,
  insertText: 'rt',
  keyword: 'af.response.rt',
}, {
  label: {
    label: 'size',
    description: '返回体大小(单位b)'
  },
  sortText: 'h',
  kind: monaco.languages.CompletionItemKind.Property,
  insertText: 'size',
  keyword: 'af.response.size',
}, {
  label: {
    label: 'statusCode',
    description: 'http状态码'
  },
  sortText: 'i',
  kind: monaco.languages.CompletionItemKind.Property,
  insertText: 'statusCode',
  keyword: 'af.response.statusCode',
}]
const httpSuggestions = [
  {
    label: {
      label: 'http',
      description: '发送http请求'
    },
    sortText: '4',
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: 'http',
    keyword: 'af.http',
  }, {
    label: {
      label: 'get',
      description: '发送get请求'
    },
    sortText: '1',
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: 'get("请求url", { headers: {}, params: {}, body: {} })',
    keyword: 'af.http.get',
  }, {
    label: {
      label: 'post',
      description: '发送post请求'
    },
    sortText: '2',
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: 'post("请求url", { headers: {}, params: {}, body: {} })',
    keyword: 'af.http.post',
  }, {
    label: {
      label: 'put',
      description: '发送put请求'
    },
    sortText: '3',
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: 'put("请求url", { headers: {}, params: {}, body: {} })',
    keyword: 'af.http.put',
  }, {
    label: {
      label: 'delete',
      description: '发送delete请求'
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
    description: 'Cookie数据(浏览器cookie)'
  },
  kind: monaco.languages.CompletionItemKind.Module,
  insertText: 'variables',
  sortText: '7',
  keyword: 'af.variables',
}]
const suggestions: Suggestions = [{
  label: {
    label: 'af',
    description: '全局对象'
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
...responseSuggestions,
...sessionStorageSuggestions,
...localStorageSuggestions,
...cookiesSuggestions,
...variableSuggestions,
...requestSuggestions]

export const useCompletionItem = (): monaco.IDisposable => {
  return monaco.languages.registerCompletionItemProvider('javascript', {
    triggerCharacters: ['.', '('],
    provideCompletionItems(model: monaco.editor.ITextModel, position: monaco.Position) {
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
        for (let i = 0; i < activeStrArr.length - 1; i += 1) {
          if (activeStrArr[i] !== keywordArr[i]) {
            return false;
          }
        }
        if (activeStrArr.length < keywordArr.length) return false;
        // console.log(v.keyword, activeStr)
        const matchedTrigger = v.keyword.includes(replacedStr);
        return matchedTrigger
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
