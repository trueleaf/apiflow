import type * as monaco from 'monaco-editor';

// 代码提示项配置
export type CompletionSuggestion = {
  label: {
    label: string
    description: string
  }
  kind: monaco.languages.CompletionItemKind
  insertText: string
  keyword: string
  sortText?: string
}

// Hover 提示配置
export type HoverInfo = {
  keyword: string
  content: string[]
}

// 编辑器配置
export type EditorConfig = {
  completionSuggestions?: CompletionSuggestion[]
  hoverInfos?: HoverInfo[]
  triggerCharacters?: string[]
  enableCompletion?: boolean
  enableHover?: boolean
  editorOptions?: monaco.editor.IStandaloneEditorConstructionOptions
}

// 光标位置
export type CursorPosition = monaco.Position | null
