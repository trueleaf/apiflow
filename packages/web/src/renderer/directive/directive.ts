import { App } from 'vue'

export const customDirective = {
  install(app: App) {
    //=====================================拷贝指令====================================//
    //存储每个元素的事件处理函数，避免冲突
    const copyHandlers = new WeakMap<HTMLElement, (e: MouseEvent) => void>();
    //显示复制提示
    const showCopyTip = (x: number, y: number, success: boolean) => {
      const span = document.createElement('span');
      span.innerHTML = success ? '复制成功' : '复制失败';
      span.style.transition = 'all .6s';
      span.style.color = success ? '#2c2' : '#f56c6c';
      span.style.position = 'fixed';
      span.style.left = `${x}px`;
      span.style.top = `${y}px`;
      span.style.whiteSpace = 'nowrap';
      span.style.zIndex = 'var(--zIndex-copy)';
      span.style.transform = 'translate3D(0, -1em, 0)';
      span.style.opacity = '1';
      document.documentElement.appendChild(span);
      requestAnimationFrame(() => {
        span.style.transform = 'translate3D(0, -2.5em, 0)';
        span.style.opacity = '0';
      });
      setTimeout(() => {
        if (span.parentNode) {
          document.documentElement.removeChild(span);
        }
      }, 800);
    };
    //使用现代 Clipboard API 复制文本
    const copyToClipboard = async (text: string): Promise<boolean> => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          return true;
        } else {
          //降级方案：使用 document.execCommand
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.top = '-9999px';
          textarea.style.left = '-9999px';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          const success = document.execCommand('copy');
          document.body.removeChild(textarea);
          return success;
        }
      } catch (err) {
        console.error('复制失败:', err);
        return false;
      }
    };
    //复制处理函数
    const handleCopy = async (e: MouseEvent, el: HTMLElement) => {
      const text = el.dataset.value || '';
      const success = await copyToClipboard(text);
      showCopyTip(e.clientX, e.clientY, success);
    };
    app.directive('copy', {
      mounted(el: HTMLElement, binding) {
        el.dataset.value = binding.value;
        const copyFn = (e: MouseEvent) => handleCopy(e, el);
        copyHandlers.set(el, copyFn);
        el.addEventListener('click', copyFn);
      },
      updated(el: HTMLElement, binding) {
        el.dataset.value = binding.value;
      },
      unmounted(el: HTMLElement) {
        const copyFn = copyHandlers.get(el);
        if (copyFn) {
          el.removeEventListener('click', copyFn);
          copyHandlers.delete(el);
        }
      }
    })
  }
}
