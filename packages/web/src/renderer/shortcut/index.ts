type ShortcutHandler = (event: KeyboardEvent) => void;

type Shortcut = {
  keys: string; // 例如 "ctrl+s", "cmd+z" (Mac)
  handler: ShortcutHandler;
};

class ShortcutManager {
  private shortcuts: Shortcut[] = [];
  private isMac: boolean;

  constructor() {
    // 检测是否为 Mac 操作系统
    this.isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  }

  register(keys: string, handler: ShortcutHandler) {
    this.shortcuts.push({ keys, handler });
  }

  unregister(keys: string, handler: ShortcutHandler) {
    this.shortcuts = this.shortcuts.filter(
      (s) => !(s.keys === keys && s.handler === handler)
    );
  }

  handleKeydown = (event: KeyboardEvent) => {
    // 支持跨平台快捷键
    // Windows/Linux: Ctrl, Mac: Cmd (Meta)
    const modifierKey = this.isMac && event.metaKey ? "cmd" : event.ctrlKey ? "ctrl" : "";

    const combo = [
      modifierKey,
      event.shiftKey ? "shift" : "",
      event.altKey ? "alt" : "",
      event.key.toLowerCase(),
    ]
      .filter(Boolean)
      .join("+");

    // console.log(123, combo, this.shortcuts);
    this.shortcuts.forEach((s) => {
      // 支持 ctrl 和 cmd 的兼容性
      // 例如注册 "ctrl+z" 时，在 Mac 上也会匹配 "cmd+z"
      let matched = s.keys === combo;

      // 如果是 Mac 系统，ctrl+key 的注册也应该响应 cmd+key
      if (!matched && this.isMac && s.keys.startsWith('ctrl+')) {
        const cmdVersion = s.keys.replace('ctrl+', 'cmd+');
        matched = cmdVersion === combo;
      }

      // 如果不是 Mac 系统，cmd+key 的注册也应该响应 ctrl+key
      if (!matched && !this.isMac && s.keys.startsWith('cmd+')) {
        const ctrlVersion = s.keys.replace('cmd+', 'ctrl+');
        matched = ctrlVersion === combo;
      }

      if (matched) {
        s.handler(event);
      }
    });
  };

  init() {
    window.addEventListener("keydown", this.handleKeydown);
  }

  destroy() {
    window.removeEventListener("keydown", this.handleKeydown);
  }
}

export const shortcutManager = new ShortcutManager();
