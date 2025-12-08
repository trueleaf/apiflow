/*
  模块名称：用户设置
  备注：
*/
<template>
  <div class="user-setting">
    <div class="d-flex a-centetr back f-base my-5 back-link cursor-pointer" @click="handleBack">
      <el-icon :size="18">
        <Back />
      </el-icon>
      <span>{{ t('返回上级') }}</span>
    </div>
    <Card v-loading="loading" element-loading-background="var(--el-mask-color)">
      <div class="base-info px-3">
        <div class="w-50 flex0">
          <div class="d-flex a-center">
            <h2>{{ userInfo.realName || userInfo.loginName }}</h2>
            <el-button link type="primary" text class="ml-3" @click="dialogVisible = true">{{ t('修改密码') }}</el-button>
          </div>
          <div class="px-3">
            <SLabelValue :label="t('登录名称') + '：'" :value="userInfo.loginName" class="w-45" />
            <SLabelValue :label="t('手机号') + '：'" :value="userInfo.phone" class="w-45" />
            <SLabelValue :label="t('最后登录') + '：'" class="w-45">
              <span class="orange">{{ formatDate(userInfo.lastLogin) }}</span>
            </SLabelValue>
          </div>
        </div>
      </div>
    </Card>
    <el-dialog v-model="dialogVisible" :title="t('修改密码')">
      <el-form v-if="dialogVisible" ref="form" :model="formInfo" :rules="rules" label-width="150px">
        <el-form-item :label="t('原密码')" prop="oldPassword">
          <el-input v-model="formInfo.oldPassword" :size="config.renderConfig.layout.size" show-password
            :placeholder="t('请输入原密码')" class="w-100" maxlength="100"></el-input>
        </el-form-item>
        <el-form-item :label="t('新密码')" prop="newPassword">
          <el-input v-model="formInfo.newPassword" :size="config.renderConfig.layout.size" show-password
            :placeholder="t('请输入新密码')" class="w-100" maxlength="100"></el-input>
        </el-form-item>
        <el-form-item :label="t('确认密码')" prop="newPassword2">
          <el-input v-model="formInfo.newPassword2" :size="config.renderConfig.layout.size" show-password
            :placeholder="t('请再次输入新密码')" class="w-100" maxlength="100"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div>
          <el-button @click="dialogVisible = false">{{ t('取消') }}</el-button>
          <el-button :loading="loading2" type="primary" @click="handleChangePassword">{{ t('确定') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { Back } from '@element-plus/icons-vue'
import type { CommonResponse } from '@src/types'
import Card from '@/components/common/card/ClCard.vue'
import { useI18n } from 'vue-i18n'
import { nextTick, onMounted, ref } from 'vue';
import type { FormInstance } from 'element-plus';
import { request } from '@/api/api';
import { useRouter } from 'vue-router';
import { config } from '@src/config/config';
import { formatDate } from '@/helper'
import { message } from '@/helper'


type UserInfo = {
  realName: string,
  loginName: string,
  phone: string,
  lastLogin: string,
}

const userInfo = ref<UserInfo>({
  realName: '',
  loginName: '',
  phone: '',
  lastLogin: '',
}); // 用户信息
const { t } = useI18n()

const formInfo = ref({
  oldPassword: '', //------原始密码
  newPassword: '', //------新密码
  newPassword2: '', //-----重复新密码
})
const dialogVisible = ref(false) //-----修改用户密码
const loading = ref(false) //-----------获取用户信息
const loading2 = ref(false) //----------确认修改密码
const form = ref<FormInstance>()
/*
|--------------------------------------------------------------------------
| 函数定义
|--------------------------------------------------------------------------
*/
const validatePassword = (_: unknown, value: string, callback: (err?: Error) => void) => {
  const matchString = /[a-zA-Z]/;
  const matchNumber = /\d/;
  const inValidKey = /[^\w\d!@#]/;
  if (value.trim() === '') {
    callback(new Error(t('请输入密码')));
  } else if (value.match(inValidKey)) {
    callback(new Error(t('只允许 数字  字符串 ! @ # 不允许其他字符串')));
  } else if (!value.match(matchString) || !value.match(matchNumber) || value.length < 8) {
    callback(new Error(t('数字+字符串，并且大于8位')));
  } else {
    if (formInfo.value.newPassword2 !== '') {
      form.value?.validateField('newPassword2');
    }
    callback();
  }
}
const validatePassword2 = (_: unknown, value: string, callback: (err?: Error) => void) => {
  const matchString = /[a-zA-Z]/;
  const matchNumber = /\d/;
  const inValidKey = /[^\w\d!@#]/;
  if (value === '') {
    callback(new Error(t('请再次输入密码')));
  } else if (value.match(inValidKey)) {
    callback(new Error(t('只允许 数字  字符串 ! @ # 不允许其他字符串')));
  } else if (!value.match(matchString) || !value.match(matchNumber) || value.length < 8) {
    callback(new Error(t('数字+字符串，并且大于8位')));
  } else if (value !== formInfo.value.newPassword) {
    callback(new Error(t('两次输入密码不一致!')));
  } else {
    callback();
  }
}
//=====================================获取远程数据==================================//
const getUserBaseInfo = () => {
  loading.value = true;
  request.get<CommonResponse<UserInfo>, CommonResponse<UserInfo>>('/api/security/user_info').then((res) => {
    userInfo.value = res.data;
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
}

//=====================================前后端交互====================================//
const handleChangePassword = () => {
  form.value?.validate((valid) => {
    if (valid) {
      loading2.value = true;
      request.put('/api/security/user_password', formInfo).then(() => {
        dialogVisible.value = false;
        message.success(t('修改成功'));
      }).catch((err) => {
        console.error(err)
      }).finally(() => {
        loading2.value = false;
        formInfo.value = {
          oldPassword: '', //------原始密码
          newPassword: '', //------新密码
          newPassword2: '', //-----重复新密码
        };
      });
    } else {
      nextTick(() => {
        const input = document.querySelector('.el-form-item.is-error input') as HTMLInputElement;
        if (input) {
          input.focus();
        }
      });
      message.warning(t('请完善必填信息'));
      loading.value = false;
    }
  });
}
//=====================================其他操作=====================================//
const router = useRouter()
const handleBack = () => {
  router.go(-1);
}
const rules = ref({
  oldPassword: [{ required: true, message: t('请输入原密码'), trigger: 'blur' }],
  newPassword: [
    { required: true, message: t('请输入密码'), trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' },
  ],
  newPassword2: [
    { required: true, message: t('请再次输入密码'), trigger: 'blur' },
    { validator: validatePassword2, trigger: 'blur' }
  ]
})

onMounted(() => {
  getUserBaseInfo();
})
</script>

<style lang='scss' scoped>
.user-setting {
  max-width: 1440px;
  margin: auto;

  .base-info {
    display: flex;
  }
  .back-link {
    &:hover {
      color: var(--theme-color);
    }
  }
}
</style>
