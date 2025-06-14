<template>
  <div class="cookies-page">
    <div>
      <div class="d-flex a-center j-between mb-2">
        <span class="title">Cookies 管理</span>
        <el-button type="primary" @click="openAddDialog">新增 Cookie</el-button>
      </div>
      <el-table :data="cookies" stripe border height="65vh" size="small">
        <el-table-column align="center" prop="name" label="Name"></el-table-column>
        <el-table-column align="center" prop="value" width='500' label="Value">
          <template #default="scope">
            <div class="value-wrap">{{ scope.row.value }}</div>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="domain" label="Domain">
          <template #default="scope">
            <span v-if="scope.row.domain">{{ scope.row.domain }}</span>
            <span v-else>{{ t('HostOnly') }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="path" label="Path">
          <template #default="scope">
            <span v-if="scope.row.path">{{ scope.row.path }}</span>
            <span v-else>/</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="expires" label="Expires">
          <template #default="scope">
            <span v-if="scope.row.expires">{{ scope.row.expires }}</span>
            <span v-else>Session</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="httpOnly" label="HttpOnly">
          <template #default="scope">
            <span v-if="scope.row.httpOnly === true">✔</span>
            <span v-else></span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="secure" label="Secure">
          <template #default="scope">
            <span v-if="scope.row.secure === true">✔</span>
            <span v-else></span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="sameSite" label="SameSite">
          <template #default="scope">
            <span v-if="scope.row.sameSite">{{ scope.row.sameSite }}</span>
            <span v-else>Lax</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editMode ? '编辑 Cookie' : '新增 Cookie'" width="400px">
      <el-form :model="editCookie" label-width="80px" :rules="rules" ref="formRef">
        <el-form-item label="Name" prop="name">
          <el-input v-model="editCookie.name" />
        </el-form-item>
        <el-form-item label="Value" prop="value">
          <el-input v-model="editCookie.value" />
        </el-form-item>
        <el-form-item label="Domain" prop="domain">
          <el-input v-model="editCookie.domain" />
        </el-form-item>
        <el-form-item label="Path" prop="path">
          <el-input v-model="editCookie.path" />
        </el-form-item>
        <el-form-item label="Expires" prop="expires">
          <el-input v-model="editCookie.expires" placeholder="如 2025-12-31T23:59:59Z 或空" />
        </el-form-item>
        <el-form-item label="HttpOnly" prop="httpOnly">
          <el-switch v-model="editCookie.httpOnly" />
        </el-form-item>
        <el-form-item label="Secure" prop="secure">
          <el-switch v-model="editCookie.secure" />
        </el-form-item>
        <el-form-item label="SameSite" prop="sameSite">
          <el-select v-model="editCookie.sameSite" clearable>
            <el-option label="Lax" value="Lax" />
            <el-option label="Strict" value="Strict" />
            <el-option label="None" value="None" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCookie">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useCookies } from '@/store/apidoc/cookies';
import { ElMessage } from 'element-plus';
import type { ApidocCookie } from '@/store/apidoc/cookies';
import { t } from 'i18next';

const { cookies, changeCookieById } = useCookies();
const dialogVisible = ref(false);
const editMode = ref(false);
const editCookie = ref<Partial<ApidocCookie>>({});
const formRef = ref();

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  value: [{ required: true, message: '请输入值', trigger: 'blur' }],
};

function openAddDialog() {
  editMode.value = false;
  editCookie.value = { name: '', value: '', domain: '', path: '/', expires: '', httpOnly: false, secure: false, sameSite: '' };
  dialogVisible.value = true;
  nextTick(() => formRef.value?.clearValidate());
}

function openEditDialog(row: ApidocCookie) {
  editMode.value = true;
  editCookie.value = { ...row };
  dialogVisible.value = true;
  nextTick(() => formRef.value?.clearValidate());
}

function saveCookie() {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) return;
    if (editMode.value) {
      // 编辑
      changeCookieById(editCookie.value._id!, editCookie.value as ApidocCookie);
      ElMessage.success('修改成功');
    } else {
      // 新增
      const newCookie: ApidocCookie = {
        _id: `${editCookie.value.name}_${editCookie.value.domain || ''}_${editCookie.value.path || '/'}`,
        name: editCookie.value.name!,
        value: editCookie.value.value!,
        domain: editCookie.value.domain || '',
        path: editCookie.value.path || '/',
        expires: editCookie.value.expires || '',
        httpOnly: !!editCookie.value.httpOnly,
        secure: !!editCookie.value.secure,
        sameSite: editCookie.value.sameSite || '',
      };
      // cookies.value.push(newCookie);
      ElMessage.success('新增成功');
    }
    dialogVisible.value = false;
  });
}

function removeCookie(id: string) {
  // const idx = cookies.value.findIndex(c => c._id === id);
  // if (idx !== -1) {
  //   cookies.value.splice(idx, 1);
  //   ElMessage.success('删除成功');
  // }
}
</script>

<style scoped>
.cookies-page {
  margin: 0 auto;
  padding: 32px 0;
}

.title {
  font-size: 20px;
  font-weight: bold;
}
</style>