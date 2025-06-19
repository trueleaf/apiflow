import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

type Suggestions = {
  label: {
    label: string,
    description: string
  },
  kind: monaco.languages.CompletionItemKind,
  insertText: string,
  keyword: string,
  arrayItem?: boolean,
  sortText?: string
}[]
const suggestions: Suggestions = [{
  label: {
    label: 'docInfo',
    description: '请求对象'
  },
  kind: monaco.languages.CompletionItemKind.Class,
  insertText: 'docInfo',
  keyword: 'docInfo',
}, {
  label: {
    label: 'url',
    description: '请求url对象'
  },
  kind: monaco.languages.CompletionItemKind.Field,
  insertText: 'url',
  keyword: 'docInfo.url',
}, {
  label: {
    label: 'host',
    description: '请求Host,eg:http://demo.com'
  },
  kind: monaco.languages.CompletionItemKind.Field,
  insertText: 'host',
  keyword: 'docInfo.url.path',
}, {
  label: {
    label: 'path',
    description: '请求路径,eg:/api/login'
  },
  kind: monaco.languages.CompletionItemKind.Field,
  insertText: 'path',
  keyword: 'docInfo.url.path',
}, {
  label: {
    label: 'url',
    description: '请求地址,eg: http://demo.com/api/login'
  },
  kind: monaco.languages.CompletionItemKind.Field,
  insertText: 'url',
  keyword: 'docInfo.url.path',
}, {
  label: {
    label: 'method',
    description: '请求方法, Record<string, string>'
  },
  kind: monaco.languages.CompletionItemKind.Field,
  insertText: 'method',
  keyword: 'docInfo.method',
}, {
  label: {
    label: 'queryParams',
    description: 'query参数, Record<string, string>'
  },
  kind: monaco.languages.CompletionItemKind.Field,
  insertText: 'queryParams',
  keyword: 'docInfo.queryParams',
}, {
  label: {
    label: 'pathParams',
    description: 'path参数, Record<string, string>'
  },
  kind: monaco.languages.CompletionItemKind.Field,
  insertText: 'pathParams',
  keyword: 'docInfo.pathParams',
}, {
  label: {
    label: 'formdataParams',
    description: 'formdata参数, Record<string, string>'
  },
  kind: monaco.languages.CompletionItemKind.Field,
  insertText: 'formdataParams',
  keyword: 'docInfo.formdataParams',
}, {
  label: {
    label: 'urlencodedParams',
    description: 'urlencoded参数, Record<string, string>'
  },
  kind: monaco.languages.CompletionItemKind.Field,
  insertText: 'urlencodedParams',
  keyword: 'docInfo.urlencodedParams',
}, {
  label: {
    label: 'headers',
    description: '请求头, Record<string, string>'
  },
  kind: monaco.languages.CompletionItemKind.Field,
  insertText: 'headers',
  keyword: 'docInfo.headers',
}, {
  label: {
    label: 'response',
    description: '返回参数, Record<string, response>'
  },
  kind: monaco.languages.CompletionItemKind.Field,
  insertText: 'response',
  keyword: 'docInfo.response',
}, {
  label: {
    label: 'title',
    description: '返回描述, eg: 成功返回'
  },
  kind: monaco.languages.CompletionItemKind.Field,
  arrayItem: true,
  insertText: 'title',
  keyword: 'docInfo.response.title',
}, {
  label: {
    label: 'statusCode',
    description: 'HTTP状态码, eg: 200'
  },
  kind: monaco.languages.CompletionItemKind.Field,
  arrayItem: true,
  insertText: 'statusCode',
  keyword: 'docInfo.response.statusCode',
}, {
  label: {
    label: 'dataType',
    description: '返回参数类型, eg: application/json'
  },
  kind: monaco.languages.CompletionItemKind.Field,
  arrayItem: true,
  insertText: 'dataType',
  keyword: 'docInfo.response.dataType',
}, {
  label: {
    label: 'json',
    description: 'json类型返回结果'
  },
  kind: monaco.languages.CompletionItemKind.Field,
  arrayItem: true,
  insertText: 'json',
  keyword: 'docInfo.response.json',
}]

export function useCompletionItem(): monaco.IDisposable {
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
        const activeStrArr = activeStr.split('.');
        const keywordArr = v.keyword.split('.');
        // console.log(22, v, activeStr.replace(/\[\d+\]/, ""))

        for (let i = 0; i < activeStrArr.length - 1; i += 1) {
          let item = activeStrArr[i];
          if (v.arrayItem) {
            item = item.replace(/\[\d+\]/, '')
          }
          if (item !== keywordArr[i]) {
            return false;
          }
        }
        if (activeStrArr.length < keywordArr.length) return false;
        if (v.arrayItem && !activeStr.match(/\[\d+\]\.?$/)) {
          return false;
        }
        const matchedTrigger = v.keyword.includes(activeStr.replace(/\[\d+\]/, ''));
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
