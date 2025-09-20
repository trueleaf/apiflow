type ShortcutHandler = (event: KeyboardEvent) => void;

type Shortcut = {
  keys: string; // 例如 "ctrl+s"
  handler: ShortcutHandler;
};

class ShortcutManager {
  private shortcuts: Shortcut[] = [];

  register(keys: string, handler: ShortcutHandler) {
    this.shortcuts.push({ keys, handler });
  }

  unregister(keys: string, handler: ShortcutHandler) {
    this.shortcuts = this.shortcuts.filter(
      (s) => !(s.keys === keys && s.handler === handler)
    );
  }

  handleKeydown = (event: KeyboardEvent) => {
    const combo = [
      event.ctrlKey ? "ctrl" : "",
      event.shiftKey ? "shift" : "",
      event.altKey ? "alt" : "",
      event.key.toLowerCase(),
    ]
      .filter(Boolean)
      .join("+");
      
    // console.log(123, combo, this.shortcuts);
    this.shortcuts.forEach((s) => {
      if (s.keys === combo) {
        event.preventDefault();
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
