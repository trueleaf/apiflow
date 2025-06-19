


export const bindGlobalShortCut = () => {
  const bind = (e: KeyboardEvent) => {
   
  }
  document.documentElement.removeEventListener('keydown', bind)
  document.documentElement.addEventListener('keydown', bind)

}