import { defineComponent, ref, computed, provide, watch } from 'vue'
import '../style/index.css'
import type { TabPane, TabsContext, CleanTabsProps } from '../types'
import '@vue/runtime-dom' // 引入JSX类型声明

export default defineComponent({
  name: 'CleanTabs',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    class: {
      type: String,
      default: ''
    },
    type: {
      type: String as () => 'card' | '',
      default: ''
    },
    size: {
      type: String as () => 'normal' | 'small',
      default: 'normal'
    }
  },
  emits: {
    'update:modelValue': (value: string) => typeof value === 'string',
    'tab-click': (_pane: TabPane, _event: Event) => true,
    'tab-change': (name: string) => typeof name === 'string'
  },
  setup(props: CleanTabsProps, { emit, slots }) {
    const customClass = computed(() => props.class)
    const tabPanes = ref<TabPane[]>([])
    const activeTabName = ref(props.modelValue || '')
    const hasContent = ref(false)
    
    const registerPane = (pane: TabPane) => {
      tabPanes.value.push(pane)
      // 如果当前没有激活的tab，且这是第一个tab，则激活它
      if (!activeTabName.value && tabPanes.value.length === 1) {
        activeTabName.value = pane.name
        emit('update:modelValue', pane.name)
      }
    }
    
    const updateHasContent = (hasSlotContent: boolean) => {
      hasContent.value = hasSlotContent
    }

    // 注销TabPane
    const unregisterPane = (uid: number) => {
      const index = tabPanes.value.findIndex((pane: TabPane) => pane.uid === uid)
      if (index !== -1) {
        tabPanes.value.splice(index, 1)
      }
    }

    // 处理tab点击
    const handleTabClick = (paneName: string, pane: TabPane) => {
      if (pane.disabled) return
      
      if (activeTabName.value !== paneName) {
        activeTabName.value = paneName
        emit('update:modelValue', paneName)
        emit('tab-change', paneName)
      }
      emit('tab-click', pane, new Event('click'))
    }

    // 监听modelValue变化
    watch(() => props.modelValue, (newValue) => {
      if (newValue !== activeTabName.value) {
        activeTabName.value = newValue || ''
      }
    }, { immediate: true })

    // 向子组件提供上下文
    const tabsContext: TabsContext = {
      registerPane,
      unregisterPane,
      activeTabName: computed(() => activeTabName.value),
      updateHasContent
    }

    provide('cleanTabsContext', tabsContext)

    return () => (
      <div 
        class={[
          'clean-tabs',
          customClass.value,
          {
            'clean-tabs--card': props.type === 'card',
            'clean-tabs--small': props.size === 'small'
          }
        ]}
      >
        <div class="clean-tabs__header">
          {tabPanes.value.map((pane, index) => (
            <div 
              key={pane.name || index}
              class={[
                'clean-tabs__item',
                { 
                  'is-active': activeTabName.value === pane.name,
                  'is-disabled': pane.disabled 
                }
              ]}
              onClick={() => handleTabClick(pane.name, pane)}
            >
              {slots[`label-${pane.name}`] ? 
                slots[`label-${pane.name}`]?.({ pane, index }) : 
                pane.label
              }
            </div>
          ))}
        </div>
        <div class={[
          'clean-tabs__content',
          { 'has-content': hasContent.value }
        ]}>
          {slots.default?.()}
        </div>
      </div>
    )
  }
})