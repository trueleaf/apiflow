import { onMounted, onUnmounted } from "vue";
import { shortcutManager } from "../shortcut/index.ts";

export function useShortcut(keys: string, handler: (e: KeyboardEvent) => void) {
  onMounted(() => {
    shortcutManager.register(keys, handler);
  });

  onUnmounted(() => {
    shortcutManager.unregister(keys, handler);
  });
}