// 判断当前页面是否为 MCP 后台执行窗口
export const isMcpExecutorWindow = (): boolean => {
  return typeof window !== 'undefined' && (window.location.hostname === 'mcp.html' || window.location.pathname.endsWith('/mcp.html'))
}
