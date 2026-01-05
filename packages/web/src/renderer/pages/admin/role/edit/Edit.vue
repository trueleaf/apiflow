
<template>
  <el-dialog :model-value="modelValue" top="10vh" :title="t('修改角色')" :before-close="handleClose">
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
            <SClientRoutes ref="clientRouteRef" @change="handleChangeClientRoutes"></SClientRoutes>
          </el-tab-pane>
          <!-- 后端路由 -->
          <el-tab-pane name="serverRoute" :label="t('后端路由')">
            <SServerRoutes ref="serverRouteRef" @change="handleChangeServerRoutes"></SServerRoutes>
          </el-tab-pane>
          <!-- 前端菜单 -->
          <el-tab-pane name="clientMenu" :label="t('前端菜单')">
            <SClientMenus ref="clientMenuRef" @change="handleChangeClientMenus"></SClientMenus>
          </el-tab-pane>
        </el-tabs>
      </SFieldset>
    </div>
    <template #footer>
      <el-button @click="handleClose">{{ t("取消") }}</el-button>
      <el-button :loading="loading" type="primary" @click="handleEditRole">{{ t('确定/AdminRoleEdit') }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import type { TreeNodeOptions } from 'element-plus/lib/components/tree/src/tree.type'
import { CommonResponse } from '@src/types'
import { nextTick, onMounted, ref } from 'vue'
import SClientMenus from './components/ClientMenus.vue'
import SClientRoutes from './components/ClientRoutes.vue'
import SServerRoutes from './components/ServerRoutes.vue'
import SForm from '@/components/common/forms/form/ClForm.vue'
import SFormItem from '@/components/common/forms/form/ClFormItem.vue'
import { request } from '@/api/api'
import { FormInstance } from 'element-plus'
import { useI18n } from 'vue-i18n'
import SFieldset from '@/components/common/fieldset/ClFieldset.vue'

type RoleInfo = {
  remark: string,
  roleName: string,
  clientBanner: string[],
  clientRoutes: string[],
  serverRoutes: string[],
}

const modelValue = defineModel<boolean>({
  default: false
})
const props = defineProps({
  userId: {
    type: String,
    default: ''
  },
})
const emits = defineEmits(['success']);
const { t } = useI18n()

const formInfo = ref({
  roleName: '', //-------------------角色名称
  remark: '', //---------------------备注
  clientBanner: [] as string[], //---菜单ids
  clientRoutes: [] as string[], //---已选前端路由
  serverRoutes: [] as string[], //---已选后端路由
})
// const clientMenu = ref<string[]>([])
const activeName = ref('clientRoute')
const loading = ref(false);
const clientMenuRef = ref<{ tree: TreeNodeOptions['store'] }>();
const clientRouteRef = ref<{ selectedData: string[] }>({
  selectedData: []
});
const serverRouteRef = ref<{ selectedData: string[] }>({
  selectedData: []
});
const form = ref<FormInstance>();
/*
|--------------------------------------------------------------------------
| 函数定义
|--------------------------------------------------------------------------
*/
//获取角色信息
const getRoleInfo = () => {
  loading.value = true;
  const params = {
    _id: props.userId,
  };
  request.get<CommonResponse<RoleInfo>, CommonResponse<RoleInfo>>('/api/security/role_info', { params }).then((res) => {
    // res.data.clientBanner.forEach((val) => {
    //     ($refs.clientMenu as { tree: TreeNodeOptions["store"] }).tree.setChecked(val, true, false);
    // });
    setTimeout(() => { //hack不知道为什么不回显数据
      res.data.clientBanner.forEach((val) => {
        clientMenuRef.value?.tree.setChecked(val, true, false);
      });
    }, 1000);
    clientRouteRef.value!.selectedData = res.data.clientRoutes;
    serverRouteRef.value!.selectedData = res.data.serverRoutes;
    formInfo.value.clientBanner = res.data.clientBanner;
    formInfo.value.clientRoutes = res.data.clientRoutes;
    formInfo.value.serverRoutes = res.data.serverRoutes;
    formInfo.value.roleName = res.data.roleName;
    formInfo.value.remark = res.data.remark;
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
}
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
//保存角色
const handleEditRole = () => {
  form.value?.validate((valid) => {
    if (valid) {
      const formData = (form.value as any).formInfo;
      const params = {
        _id: props.userId,
        ...formInfo.value,
        roleName: formData.roleName,
        remark: formData.remark,
      };
      loading.value = true;
      request.put('/api/security/role', params).then(() => {
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
//关闭弹窗
const handleClose = () => {
  modelValue.value = false;
}
onMounted(() => {
  getRoleInfo();
})

</script>
