import { App, DirectiveBinding } from 'vue'

let domList: HTMLElement[] = [];

function createTipDom(left: number, top: number): HTMLElement {
  let tipDom: HTMLElement | null = null;
  tipDom = document.createElement('div');
  tipDom.style.position = 'fixed';
  tipDom.style.left = `${left}px`;
  tipDom.style.top = `${top}px`;
  tipDom.style.color = '#4c4';
  tipDom.style.zIndex = '99999';
  // tipDom.style.display = "none";
  tipDom.innerHTML = '操作成功';
  document.body.appendChild(tipDom);
  domList.push(tipDom);
  return tipDom
}

export const customDirective = {
  install(app: App) {
    //=====================================成功提示指令====================================//
    app.directive('success', {
      unmounted() {
        domList = [];
      },
      updated(el: Element, binding) {
        if (binding.value && !binding.oldValue) {
          const { left, top } = el.getBoundingClientRect();
          const tipDom = createTipDom(left, top);
          setTimeout(() => {
            tipDom.style.transition = 'transform .5s';
            tipDom.style.transform = 'translate3D(0, -30px, 0)';
          })
          setTimeout(() => {
            document.body.removeChild(tipDom);
          }, 500)
        }
      },
    });
    //=====================================flex指令====================================//
    app.directive('flex1', {
      mounted(el: HTMLElement, binding) {
        setTimeout(() => {
          const offsetY = el.getBoundingClientRect().y;
          const { value } = binding;
          el.style.height = `calc(100vh - ${offsetY + value}px)`;
          el.style.overflowY = 'auto';
        });
      },
      updated(el: HTMLElement, binding) {
        setTimeout(() => {
          const offsetY = el.getBoundingClientRect().y;
          const { value } = binding;
          el.style.height = `calc(100vh - ${offsetY + value}px)`;
          el.style.overflowY = 'auto';
        });
      },
    });
    //=====================================拷贝指令====================================//
    // const copyValue = ref("");
    const runCopy = (e: MouseEvent, el: HTMLElement) => {
      const x = e.clientX;
      const y = e.clientY;
      const dom = document.createElement('textarea');
      dom.value = el.dataset.value || '';
      dom.style.position = 'fixed';
      dom.style.top = '-9999px';
      dom.style.left = '-9999px';
      document.body.appendChild(dom);
      dom.select();
      document.execCommand('Copy', false);
      document.body.removeChild(dom);
      //提示
      const span = document.createElement('span');
      span.innerHTML = '复制成功';
      span.style.transition = 'all .6s';
      span.style.color = '#2c2';
      span.style.position = 'fixed';
      span.style.left = `${x}px`;
      span.style.top = `${y}px`;
      span.style.whiteSpace = 'nowrap';
      span.style.zIndex = 'var(--zIndex-copy)';
      span.style.transform = 'translate3D(0, -1em, 0)';
      document.documentElement.appendChild(span);
      requestAnimationFrame(() => {
        span.style.transform = 'translate3D(0, -2.5em, 0)';
      });
      setTimeout(() => {
        document.documentElement.removeChild(span);
      }, 800);
    };
    let bindCopyFn: ((e: MouseEvent) => void) | null = null;
    app.directive('copy', {
      mounted(el: HTMLElement, binding) {
        // copyValue.value = binding.value;
        el.dataset.value = binding.value
        bindCopyFn = (e: MouseEvent) => {
          runCopy(e, el);
        }
        el.addEventListener('click', bindCopyFn)
      },
      updated(el: HTMLElement, binding) {
        // copyValue.value = binding.value;
        el.dataset.value = binding.value
      },
      unmounted(el: HTMLElement) {
        if (bindCopyFn) {
          el.removeEventListener('click', bindCopyFn)
        }
      }
    })
    //=====================================倒计时指令====================================//
    const countdownTimers: number[] = [];
    const countdown = (el: HTMLElement, binding: DirectiveBinding<number>) => {
      let restTime = (binding.value - Date.now()) > 0 ? (binding.value - Date.now()) : 0;
      if (restTime === 0) {
        el.innerHTML = '已过期';
        countdownTimers.forEach(t => {
          clearInterval(t);
        })
        return;
      }
      const hasFullDay = restTime > 86400000;
      const day = hasFullDay ? Math.floor(restTime / 86400000) : 0;
      if (hasFullDay) {
        restTime %= 86400000
      }
      const hasFullHour = restTime > 3600000;
      const hour = hasFullHour ? Math.floor(restTime / 3600000) : 0;
      if (hasFullHour) {
        restTime %= 3600000;
      }
      const hasFullMinute = restTime > 60000;
      const minute = hasFullMinute ? Math.floor(restTime / 60000) : 0;
      if (hasFullMinute) {
        restTime %= 60000;
      }
      const second = Math.floor(restTime / 1000);
      el.innerHTML = `${day}天${hour}小时${minute}分${second}秒`;
    }
    const bindCountdown = (el: HTMLElement, binding: DirectiveBinding<number>) => {
      countdown(el, binding);
      const timer = window.setInterval(() => {
        countdown(el, binding);
      }, 1000)

      countdownTimers.push(timer);
    }
    app.directive('countdown', {
      mounted(el: HTMLElement, binding) {
        bindCountdown(el, binding);
      },
      updated(el: HTMLElement, binding) {
        countdownTimers.forEach(t => {
          clearInterval(t);
        })
        bindCountdown(el, binding);
      },
      unmounted() {
        countdownTimers.forEach(t => {
          clearInterval(t);
        })
      }
    })
    //=====================================focus指令====================================//
    app.directive('focus-select', { //如果当前元素不是input则递归查找
      mounted(el: HTMLElement, binding) {
        if (!binding.value) {
          return
        }
        if (el.tagName === 'INPUT') {
          setTimeout(() => {
            el.focus();
            (el as HTMLInputElement).select();
          });
        } else {
          const ipt = el.querySelector('input');
          setTimeout(() => {
            ipt?.select()
            ipt?.focus()
          });
        }
      }
    })
  }
}
