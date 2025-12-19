
<template>
  <el-dialog :model-value="modelValue" top="10vh" :title="t('新增角色')" :before-close="handleClose">
    <div class="g-role">
      <SFieldset :title="t('基本信息')">
        <SForm ref="form" :edit-data="formInfo">
          <SFormItem :label="t('角色名称')" prop="roleName" required one-line></SFormItem>
          <SFormItem :label="t('备注')" prop="remark" required one-line></SFormItem>
        </SForm>
      </SFieldset>
      <SFieldset :title="t('权限选择')">
        <el-tabs v-model="activeName">
          <!-- 前端路由 -->
          <el-tab-pane name="clientRoute" :label="t('前端路由')">
            <SClientRoutes @change="handleChangeClientRoutes"></SClientRoutes>
          </el-tab-pane>
          <!-- 后端路由 -->
          <el-tab-pane name="serverRoute" :label="t('后端路由')">
            <SServerRoutes @change="handleChangeServerRoutes"></SServerRoutes>
          </el-tab-pane>
          <!-- 前端菜单 -->
          <el-tab-pane name="clientMenu" :label="t('前端菜单')">
            <SClientMenus @change="handleChangeClientMenus"></SClientMenus>
          </el-tab-pane>
        </el-tabs>
      </SFieldset>
    </div>
    <template #footer>
      <el-button @click="handleClose">{{ t("取消") }}</el-button>
      <el-button :loading="loading" type="primary" @click="handleSaveRole">{{ t("确定") }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { nextTick, ref } from 'vue'
import SClientMenus from './components/ClientMenus.vue'
import SClientRoutes from './components/ClientRoutes.vue'
import SServerRoutes from './components/ServerRoutes.vue'
import SForm from '@/components/common/forms/form/ClForm.vue'
import SFormItem from '@/components/common/forms/form/ClFormItem.vue'
import SFieldset from '@/components/common/fieldset/ClFieldset.vue'
import { FormInstance } from 'element-plus'
import { request } from '@/api/api'
import { useI18n } from 'vue-i18n'

const modelValue = defineModel<boolean>({
  default: false
})
const emits = defineEmits(['success']);
const formInfo = ref<{
  clientBanner: string[];
  clientRoutes: string[]; 
  serverRoutes: string[];
}>({
  clientBanner: [], //菜单ids
  clientRoutes: [], //已选前端路由
  serverRoutes: [], //已选后端路由
});
const { t } = useI18n()

const activeName = ref('clientRoute');
const loading = ref(false);
const form = ref<FormInstance>()
/*
|--------------------------------------------------------------------------
| 函数定义
|--------------------------------------------------------------------------
*/
//选择客户端路由
const handleChangeClientRoutes = (val: string[]) => {
  formInfo.value.clientRoutes = val;
}
//选择服务端路由
const handleChangeServerRoutes = (val: string[]) => {
  formInfo.value.serverRoutes = val;
}
//选择菜单
const handleChangeClientMenus = (val: string[]) => {
  formInfo.value.clientBanner = val;
}
//关闭弹窗
const handleClose = () => {
  modelValue.value = false;
}
//保存角色
const handleSaveRole = () => {
  form.value?.validate((valid) => {
    if (valid) {
      const formData = (form.value as any).formInfo;
      const params = {
        roleName: formData.roleName,
        remark: formData.remark,
        ...formInfo.value,
      };
      loading.value = true;
      request.post('/api/security/role', params).then(() => {
        emits('success');
        handleClose();
      }).catch((err) => {
        console.error(err);
      }).finally(() => {
        loading.value = false;
      });
    } else {
      nextTick(() => {
        const input: HTMLInputElement = document.querySelector('.el-form-item.is-error input') as HTMLInputElement;
        if (input) {
          input.focus();
        }
      });
    }
  });
}
</script>

