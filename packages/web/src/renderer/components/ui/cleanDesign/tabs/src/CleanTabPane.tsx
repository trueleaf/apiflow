import { defineComponent, inject, computed, getCurrentInstance, onMounted, onBeforeUnmount } from 'vue'
import type { TabsContext, CleanTabPaneProps } from '../types'

export default defineComponent({
  name: 'CleanTabPane',
  props: {
    name: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  setup(props: CleanTabPaneProps, { slots }) {
    // 获取当前组件实例
    const instance = getCurrentInstance()
    const uid = instance?.uid || 0

    // 注入父组件上下文
    const tabsContext = inject<TabsContext>('cleanTabsContext')

    // 是否激活
    const isActive = computed(() => {
      return tabsContext?.activeTabName.value === props.name
    })

    // 组件挂载时注册
    onMounted(() => {
      if (tabsContext) {
        tabsContext.registerPane({
          uid,
          name: props.name,
          label: props.label || props.name,
          disabled: props.disabled
        })
      }
    })

    // 组件卸载时注销
    onBeforeUnmount(() => {
      if (tabsContext) {
        tabsContext.unregisterPane(uid)
      }
    })

    return () => (
      isActive.value ? (
        <div 
          class="clean-tab-pane"
          id={`clean-tab-pane-${props.name}`}
          role="tabpanel"
        >
          {slots.default?.()}
        </div>
      ) : null
    )
  }
})