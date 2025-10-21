import { onMounted, onUnmounted } from 'vue';

type WindowEventMap = {
  click: MouseEvent;
  keydown: KeyboardEvent;
  keyup: KeyboardEvent;
  resize: Event;
  scroll: Event;
}

export const useWindowEvent = <K extends keyof WindowEventMap>(
  eventType: K,
  handler: (event: WindowEventMap[K]) => void
) => {
  const mountedHandler = (e: Event) => {
    handler(e as WindowEventMap[K])
  }

  onMounted(() => {
    window.addEventListener(eventType, mountedHandler)
  })

  onUnmounted(() => {
    window.removeEventListener(eventType, mountedHandler)
  })
}
