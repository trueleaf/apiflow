/// <reference types="vite/client" />
/// <reference types="@vue/runtime-dom" />

import type { VNode } from 'vue'

declare const __APP_BUILD_TIME__: string
declare const __MODE__: string;
declare const __COMMAND__: 'build' | 'serve';

// Vue JSX 类型支持
declare module '@vue/runtime-dom' {
  export interface HTMLAttributes {
    [key: string]: any
  }
}

// JSX 命名空间声明
declare global {
  namespace JSX {
    interface Element extends VNode {}
    interface ElementClass {
      $props: {}
    }
    interface ElementAttributesProperty {
      $props: {}
    }
    interface IntrinsicElements {
      [elem: string]: any
    }
    interface IntrinsicAttributes {
      key?: string | number
    }
  }
}

