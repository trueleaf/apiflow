import { ref, Ref, computed, ComputedRef, onMounted, onBeforeUnmount } from 'vue'
import { router } from '@/router/index'
import { t } from 'i18next'
import { ApidocProjectParamsTemplate } from '@src/types/apidoc/base-info';
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { useApidocTas } from '@/store/apidoc/tabs';

type Response = {
  showTemplateIndex: Ref<number>;
  templateFilterString: Ref<string>;
  paramsTemplatedialogVisible: Ref<boolean>;
  jsonTemplateList: ComputedRef<ApidocProjectParamsTemplate[]>;
  curentOperationIndex: Ref<number>;
  handleOpenTempateTab: () => void;
  handleOpenTemplateDialog: (index: number) => void;
}

export default function useImportParams(): Response {
  const showTemplateIndex = ref(-1);//是否显示模板
  const templateFilterString = ref('');//模板过滤参数
  const paramsTemplatedialogVisible = ref(false); //模板维护弹窗
  const curentOperationIndex = ref(0); //当前操作数据index值
  const apidocBaseInfoStore = useApidocBaseInfo()
  const apidocTabsStore = useApidocTas()
  //模板列表
  const jsonTemplateList = computed(() => {
    const templates = apidocBaseInfoStore.paramsTemplate;
    const result = templates.filter(template => template.presetParamsType === 'responseParams').filter(template => {
      if (!templateFilterString.value) {
        return true;
      }
      return template.name.includes(templateFilterString.value);
    })
    return result;
  })
  const projectId = router.currentRoute.value.query.id as string;
  const handleOpenTempateTab = () => {
    apidocTabsStore.addTab({
      _id: 'paramsTemplate',
      projectId,
      tabType: 'paramsTemplate',
      label: t('模板维护'),
      head: {
        icon: 'iconvariable',
        color: ''
      },
      saved: true,
      fixed: true,
      selected: true,
    })
  }
  //打开保存参数模板弹窗
  const handleOpenTemplateDialog = (index: number) => {
    paramsTemplatedialogVisible.value = true;
    curentOperationIndex.value = index;
  }
  //处理模板点击空白区域关闭
  const bindClick = () => {
    showTemplateIndex.value = -1;
  }
  onMounted(() => {
    document.documentElement.addEventListener('click', bindClick)
  })
  onBeforeUnmount(() => {
    document.documentElement.removeEventListener('click', bindClick)
  })
  return {
    showTemplateIndex,
    paramsTemplatedialogVisible,
    templateFilterString,
    jsonTemplateList,
    curentOperationIndex,
    handleOpenTempateTab,
    handleOpenTemplateDialog,
  }
}
