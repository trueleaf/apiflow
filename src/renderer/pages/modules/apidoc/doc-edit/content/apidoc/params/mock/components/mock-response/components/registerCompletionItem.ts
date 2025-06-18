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
