<template>
  <div class="cookies-page">
    <div class="mx-5">
      <!-- 搜索添加区域 -->
      <div class="d-flex a-center j-between mb-2">
        <span class="title">Cookies 管理</span>
        <div class="d-flex a-center" style="gap: 16px;">
          <el-input v-model="filterName" placeholder="按名称搜索" clearable class="w-200px" />
          <el-select v-model="filterDomain" placeholder="按域名筛选" clearable class="w-200px">
            <el-option v-for="domain in domainOptions" :key="domain" :label="domain || 'HostOnly'" :value="domain" />
          </el-select>
          <el-button type="primary" @click="handleAddDialog">新增 Cookie</el-button>
        </div>
      </div>
      <!-- 表格展示 -->
      <el-table :data="filteredCookies" border stripe size="small">
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
            <div>
              <div v-if="scope.row.expires">
                <el-popover
                  placement="top"
                  trigger="click"
                  :width="180"
                  :show-after="0"
                  :hide-after="0"
                >
                  <template #reference>
                    <span style="cursor: pointer; border-bottom: 1px dashed #aaa;">{{ scope.row.expires }}</span>
                  </template>
                  <div style="font-size: 13px; color: #666;">{{ getExpiresCountdown(scope.row.expires) }}</div>
                </el-popover>
              </div>
              <div v-else>Session</div>
            </div>
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
        <el-table-column align="center" label="操作" width="120">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleEditDialog(scope.row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleRemoveCookie(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editMode ? '编辑 Cookie' : '新增 Cookie'" width="40vw">
      <el-form :model="editCookie" label-width="80px" :rules="rules" ref="formRef">
        <el-form-item label="Name" prop="name">
          <el-input v-model="editCookie.name" />
        </el-form-item>
        <el-form-item label="Value" prop="value">
          <el-input v-model="editCookie.value" type="textarea" :autosize="{ minRows: 3, maxRows: 8 }"/>
        </el-form-item>
        <el-form-item label="Domain" prop="domain">
          <el-input v-model="editCookie.domain" />
        </el-form-item>
        <el-form-item label="Path" prop="path">
          <el-input v-model="editCookie.path" />
        </el-form-item>
        <el-form-item label="Expires" prop="expires">
          <div class="d-flex flex-column">
            <el-date-picker
              v-model="expiresDate"
              type="datetime"
              placeholder="选择过期时间"
              :teleported="false"
              :disabled-date="disabledExpiresDate"
              :shortcuts="expiresShortcuts"
              @change="handleExpiresDateChange"
            />
            <div v-if="expiresDate" >
              实际保存值：{{ formatCookieExpires(expiresDate) }}
            </div>
          </div>
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
        <el-button type="primary" @click="handleSaveCookie">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue';
import { useCookies } from '@/store/apidoc/cookies';
import { ElMessage } from 'element-plus';
import type { ApidocCookie } from '@/store/apidoc/cookies';
import { t } from 'i18next';
import { uuid } from '@/helper';
import dayjs from 'dayjs';

const cookiesStore = useCookies();
const cookies = computed(() => cookiesStore.cookies);

const dialogVisible = ref(false);
const editMode = ref(false);
const editCookie = ref<Partial<ApidocCookie>>({});

const filterName = ref('');
const filterDomain = ref('');

const domainOptions = computed(() => {
  const set = new Set<string>();
  cookies.value.forEach(c => set.add(c.domain));
  return Array.from(set);
});

const filteredCookies = computed(() => {
  return cookies.value.filter(c => {
    const matchName = !filterName.value || c.name.toLowerCase().includes(filterName.value.toLowerCase());
    const matchDomain = !filterDomain.value || c.domain === filterDomain.value;
    return matchName && matchDomain;
  });
});

const formRef = ref();
const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  value: [{ required: true, message: '请输入值', trigger: 'blur' }],
};
const showDatePicker = ref(false);
const expiresDate = ref<Date | ''>('');
const now = ref(new Date());
let timer: number | null = null;

watch(() => dialogVisible.value, (val) => {
  if (!val) {
    showDatePicker.value = false;
    expiresDate.value = '';
  } else if (editCookie.value.expires) {
    try {
      const d = new Date(editCookie.value.expires);
      expiresDate.value = isNaN(d.getTime()) ? '' : d;
    } catch {
      expiresDate.value = '';
    }
  }
});

const handleExpiresDateChange = (val: Date | string) => {
  if (val) {
    let date: Date | null = null;
    if (val instanceof Date) {
      date = val;
    } else if (typeof val === 'string') {
      const parsed = new Date(val);
      date = isNaN(parsed.getTime()) ? null : parsed;
    }
    expiresDate.value = date || '';
  } else {
    expiresDate.value = '';
  }
};

const disabledExpiresDate = (date: Date) => {
  const now = new Date();
  // 只允许今天及以后
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (date < today) return true;
  // 如果是今天，小时和分钟限制
  if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()) {
    if (date.getHours() < now.getHours()) return true;
    if (date.getHours() === now.getHours() && date.getMinutes() < now.getMinutes()) return true;
  }
  return false;
};

const expiresShortcuts = [
  {
    text: '12小时后',
    value: () => {
      const d = new Date();
      d.setHours(d.getHours() + 12);
      return d;
    }
  },
  {
    text: '24小时后',
    value: () => {
      const d = new Date();
      d.setHours(d.getHours() + 24);
      return d;
    }
  },
  {
    text: '7天后',
    value: () => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d;
    }
  }
];

const formatCookieExpires = (date: Date | null) => {
  if (!date) return '';
  if (isNaN(date.getTime())) return '';
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
};

const handleAddDialog = () => {
  editMode.value = false;
  editCookie.value = { name: '', value: '', domain: '', path: '/', expires: '', httpOnly: false, secure: false, sameSite: '' };
  dialogVisible.value = true;
  nextTick(() => formRef.value?.clearValidate());
};
const handleEditDialog = (row: ApidocCookie) => {
  editMode.value = true;
  editCookie.value = { ...row };
  dialogVisible.value = true;
  nextTick(() => formRef.value?.clearValidate());
};
const handleSaveCookie = () => {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) return;
    if (editMode.value) {
      // 编辑
      // changeCookieById(editCookie.value.id!, editCookie.value as ApidocCookie);
      ElMessage.success('修改成功');
    } else {
      // 新增
      const newCookie: ApidocCookie = {
        id: uuid(),
        name: editCookie.value.name!,
        value: editCookie.value.value!,
        domain: editCookie.value.domain || '',
        path: editCookie.value.path || '/',
        expires: expiresDate.value && typeof expiresDate.value !== 'string' && !isNaN(expiresDate.value.getTime()) ? formatCookieExpires(expiresDate.value) : '',
        httpOnly: !!editCookie.value.httpOnly,
        secure: !!editCookie.value.secure,
        sameSite: editCookie.value.sameSite || '',
      };
      cookies.value.push(newCookie);
      ElMessage.success('新增成功');
    }
    dialogVisible.value = false;
  });
};
const handleRemoveCookie = (id: string) => {
  const idx = cookies.value.findIndex(c => c.id === id);
  if (idx !== -1) {
    cookies.value.splice(idx, 1);
    ElMessage.success('删除成功');
  }
};
const getExpiresCountdown = (expires: string) => {
  if (!expires) return '';
  let expireDate: Date;
  try {
    expireDate = new Date(expires);
    if (isNaN(expireDate.getTime())) return '无效时间';
  } catch {
    return '无效时间';
  }
  const diff = expireDate.getTime() - now.value.getTime();
  if (diff <= 0) return '已过期';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  let str = '';
  if (days > 0) str += `${days}天`;
  if (hours > 0) str += `${hours}小时`;
  if (minutes > 0) str += `${minutes}分`;
  str += `${seconds}秒`;
  return `剩余${str}`;
};
onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date();
  }, 1000);
});
onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped lang="scss">
.cookies-page {
  margin: 0 auto;
  padding: 32px 0;
  .expire-tip {
    border-bottom: 1px dashed $gray-500;
    cursor: pointer;
  }
  .title {
    font-size: 20px;
    font-weight: bold;
  }
}
</style>