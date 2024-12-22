/*
  模块名称：用户设置
  备注：
*/
<template>
  <div class="user-setting">
    <div class="d-flex a-centetr back f-base my-5 hover-theme-color cursor-pointer" @click="handleBack">
      <el-icon :size="18">
        <Back />
      </el-icon>
      <span>返回上级</span>
    </div>
    <SCard v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.9)" shadow>
      <div class="base-info px-3">
        <div class="w-50 flex0">
          <div class="d-flex a-center">
            <h2>{{ userInfo.realName || userInfo.loginName }}</h2>
            <el-button link type="primary" text class="ml-3" @click="dialogVisible = true">修改密码</el-button>
          </div>
          <div class="px-3">
            <s-label-value label="登录名称：" :value="userInfo.loginName" class="w-45"></s-label-value>
            <s-label-value label="手机号码：" :value="userInfo.phone" class="w-45"></s-label-value>
            <s-label-value label="最后登录：" class="w-45">
              <span class="orange">{{ formatDate(userInfo.lastLogin) }}</span>
            </s-label-value>
          </div>
        </div>
      </div>
    </SCard>
    <SDialog v-model="dialogVisible" title="修改密码">
      <el-form v-if="dialogVisible" ref="form" :model="formInfo" :rules="rules" label-width="150px">
        <el-form-item label="原始密码" prop="oldPassword">
          <el-input v-model="formInfo.oldPassword" :size="config.renderConfig.layout.size" show-password
            placeholder="请输入原始密码" class="w-100" maxlength="100"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="formInfo.newPassword" :size="config.renderConfig.layout.size" show-password
            placeholder="请输入新密码,至少6位，必须至少包含 数字 和 字母 " class="w-100" maxlength="100"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="newPassword2">
          <el-input v-model="formInfo.newPassword2" :size="config.renderConfig.layout.size" show-password
            placeholder="请再次输入新密码" class="w-100" maxlength="100"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div>
          <el-button :loading="loading2" type="primary" @click="handleChangePassword">确定</el-button>
          <el-button type="warning" @click="dialogVisible = false">取消</el-button>
        </div>
      </template>
    </SDialog>
  </div>
</template>

<script lang="ts" setup>
import { Back } from '@element-plus/icons-vue'
import type { Response } from '@src/types/global'
import SCard from '@/components/common/card/g-card.vue'
import { t } from 'i18next'
import { nextTick, onMounted, ref } from 'vue';
import { ElMessage, FormInstance } from 'element-plus';
import { request } from '@/api/api';
import { useRouter } from 'vue-router';
import { config } from '@src/config/config';
import { formatDate } from '@/helper'


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
  request.get<Response<UserInfo>, Response<UserInfo>>('/api/security/user_info').then((res) => {
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
        ElMessage.success('修改成功');
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
      ElMessage.warning('请完善必填信息');
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
  oldPassword: [{ required: true, message: '请输入原始密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' },
  ],
  newPassword2: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePassword2, trigger: 'blur' }
  ]
})

onMounted(() => {
  getUserBaseInfo();
})
</script>

<style  scoped>
.user-setting {
  max-width: size(1440);
  margin: auto;

  .base-info {
    display: flex;
  }
}
</style>
