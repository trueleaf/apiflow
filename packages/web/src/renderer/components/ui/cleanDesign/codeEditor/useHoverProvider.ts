import * as monaco from 'monaco-editor';
import type { HoverInfo } from './types';

// 注册 Hover 提示提供器
export const useHoverProvider = (
  language: string,
  hoverInfos: HoverInfo[]
): monaco.IDisposable => {
  return monaco.languages.registerHoverProvider(language, {
    provideHover(model: monaco.editor.ITextModel, position: monaco.Position) {
      const wordInfo = model.getWordAtPosition(position);
      if (!wordInfo) {
        return null;
      }
      const matchedHover = hoverInfos.find(info => info.keyword === wordInfo.word);
      if (!matchedHover) {
        return null;
      }
      return {
        range: new monaco.Range(
          position.lineNumber,
          wordInfo.startColumn,
          position.lineNumber,
          wordInfo.endColumn
        ),
        contents: matchedHover.content.map(text => ({ value: text }))
      };
    }
  })
}
