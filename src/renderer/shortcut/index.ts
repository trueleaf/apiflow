


export const bindGlobalShortCut = () => {
  const bind = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'r' || e.key === 'R')) { //强制刷新条件需要前置，防止ctrl+r先执行
      window.electronAPI?.reloadIgnoringCache()
    } else if (e.ctrlKey && (e.key === 'r' || e.key === 'R')) {
      window.electronAPI?.reload()
    } 
  }
  document.documentElement.removeEventListener('keydown', bind)
  document.documentElement.addEventListener('keydown', bind)

}