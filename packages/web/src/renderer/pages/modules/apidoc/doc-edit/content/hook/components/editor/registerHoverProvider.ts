import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export function useHoverProvider(): monaco.IDisposable {
  return monaco.languages.registerHoverProvider('javascript', {
    provideHover(model, position) {
      const wordInfo = model.getWordAtPosition(position);
      if (wordInfo?.word !== 'pm') {
        return null;
      }
      return {
        range: new monaco.Range(
          position.lineNumber,
          position.column,
          model.getLineCount(),
          model.getLineMaxColumn(model.getLineCount())
        ),
        contents: [
          { value: '**标题**' },
        ]
      };
    }
  })
}
