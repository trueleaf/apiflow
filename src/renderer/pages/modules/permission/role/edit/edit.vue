
<template>
  <SDialog :model-value="modelValue" top="10vh" :title="t('修改角色')" @close="handleClose">
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
            <SClientRoutes ref="clientRoute" @change="handleChangeClientRoutes"></SClientRoutes>
          </el-tab-pane>
          <!-- 后端路由 -->
          <el-tab-pane name="serverRoute" :label="t('后端路由')">
            <SServerRoutes ref="serverRoute" @change="handleChangeServerRoutes"></SServerRoutes>
          </el-tab-pane>
          <!-- 前端菜单 -->
          <el-tab-pane name="clientMenu" :label="t('前端菜单')">
            <SClientMenus ref="clientMenu" @change="handleChangeClientMenus"></SClientMenus>
          </el-tab-pane>
        </el-tabs>
      </SFieldset>
    </div>
    <template #footer>
      <el-button :loading="loading" type="primary" @click="handleEditRole">{{ t("确定") }}</el-button>
      <el-button type="warning" @click="handleClose">{{ t("取消") }}</el-button>
    </template>
  </SDialog>
</template>

<script lang="ts" setup>
import type { TreeNodeOptions } from 'element-plus/lib/components/tree/src/tree.type'
import { Response } from '@src/types/global'
import { nextTick, onMounted, ref } from 'vue'
import SClientMenus from './components/client-menus.vue'
import SClientRoutes from './components/client-routes.vue'
import SServerRoutes from './components/server-routes.vue'
import SDialog from '@/components/common/dialog/g-dialog.vue'
import SForm from '@/components/common/forms/form/g-form.vue'
import SFormItem from '@/components/common/forms/form/g-form-item.vue'
import { request } from '@/api/api'
import { FormInstance } from 'element-plus'
import { t } from 'i18next'
import SFieldset from '@/components/common/fieldset/g-fieldset.vue'

type RoleInfo = {
  remark: string,
  roleName: string,
  clientBanner: string[],
  clientRoutes: string[],
  serverRoutes: string[],
}

const props = defineProps({
  userId: {
    type: String,
    default: ''
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits(['update:modelValue', 'success']);
const formInfo = ref({
  roleName: '', //-------------------角色名称
  remark: '', //---------------------备注信息
  clientBanner: [] as string[], //---菜单ids
  clientRoutes: [] as string[], //---已选前端路由
  serverRoutes: [] as string[], //---已选后端路由
})
const clientMenu = ref<string[]>([])
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
  request.get<Response<RoleInfo>, Response<RoleInfo>>('/api/security/role_info', { params }).then((res) => {
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
        ...formInfo,
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
  emits('update:modelValue', false);
}
onMounted(() => {
  getRoleInfo();
})

</script>
