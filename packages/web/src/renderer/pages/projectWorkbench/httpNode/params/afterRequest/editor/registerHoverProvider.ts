import * as monaco from 'monaco-editor';

export const useHoverProvider = (): monaco.IDisposable => {
  return monaco.languages.registerHoverProvider('javascript', {
    provideHover(model: monaco.editor.ITextModel, position: monaco.Position) {
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
