import { ref, Ref } from 'vue'

type Response = {
  importParamsdialogVisible: Ref<boolean>;
  handleOpenImportParams: (index: number) => void;
}

export default function useImportParams(): Response {
  const importParamsdialogVisible = ref(false); //导入参数弹窗
  const currentEditResponseIndex = ref(0);
  //打开导入参数弹窗
  const handleOpenImportParams = (index: number) => {
    currentEditResponseIndex.value = index;
    importParamsdialogVisible.value = true;
  }
  
  return {
    importParamsdialogVisible,
    handleOpenImportParams,
  }
}
