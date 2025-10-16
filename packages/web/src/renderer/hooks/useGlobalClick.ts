import { onMounted, onUnmounted } from 'vue';

export const useGlobalClick = (handler: (event: MouseEvent) => void) => {
  const mountedHandler = (e: MouseEvent) => {
    handler(e)
  }

  onMounted(() => {
    window.addEventListener('click', mountedHandler)
  })

  onUnmounted(() => {
    window.removeEventListener('click', mountedHandler)
  })
}