import type MarkdownIt from 'markdown-it'

// 限制所有 AI Markdown 链接的协议与新窗口访问能力
export const secureAIMarkdown = (markdown: MarkdownIt): void => {
  markdown.validateLink = url => {
    try { return ['http:', 'https:', 'mailto:'].includes(new URL(url).protocol) } catch { return false }
  }
  markdown.renderer.rules.link_open = (tokens, index, options, _environment, renderer) => {
    tokens[index].attrSet('target', '_blank')
    tokens[index].attrSet('rel', 'noopener noreferrer')
    return renderer.renderToken(tokens, index, options)
  }
}
