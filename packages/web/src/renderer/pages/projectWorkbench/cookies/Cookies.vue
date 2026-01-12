<template>
  <div class="cookies-page">
    <div class="mx-5">
      <!-- 搜索添加区域 -->
      <div class="d-flex a-center j-between mb-2">
        <span class="title">{{ t('Cookies 管理') }}</span>
        <div class="d-flex a-center" style="gap: 16px;">
          <el-input v-model="filterName" :placeholder="t('按名称搜索')" clearable class="w-200px" />
          <el-select v-model="filterDomain" :placeholder="t('按域名筛选')" clearable class="w-200px">
            <el-option v-for="domain in domainOptions" :key="domain" :label="domain || t('万能域名')" :value="domain" />
          </el-select>
          <el-button type="danger" :disabled="!selectedCookies.length" @click="handleBatchDelete">{{ t('批量删除') }}</el-button>
          <el-button type="primary" @click="handleOpenAddDialog">{{ t('新增 Cookie') }}</el-button>
        </div>
      </div>
      <!-- 表格展示 -->
      <el-table 
        :data="filteredCookies" 
        border 
         
        size="small"
        @selection-change="handleSelectionChange"
      >
        <template #empty>
          <el-empty :description="t('暂无Cookie数据')" />
        </template>
        <el-table-column type="selection" width="55" />
        <el-table-column align="center" prop="name" label="Name" sortable />
        <el-table-column align="center" prop="value" width='500' label="Value" sortable>
          <template #default="scope">
            <div class="value-wrap">{{ scope.row.value }}</div>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="domain" label="Domain" sortable>
          <template #default="scope">
            <span v-if="scope.row.domain">{{ scope.row.domain }}</span>
            <span v-else class="orange">{{ t('所有域名生效') }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="path" label="Path" sortable>
          <template #default="scope">
            <span v-if="scope.row.path">{{ scope.row.path }}</span>
            <span v-else>/</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="expires" label="Expires" sortable>
          <template #default="scope">
            <div v-if="scope.row.expires">
              <el-popover
                placement="top"
                trigger="click"
                :width="180"
                :show-after="0"
                :hide-after="0"
              >
                <template #reference>
                  <span style="cursor: pointer; border-bottom: 1px dashed var(--text-gray-500);">{{ scope.row.expires }}</span>
                </template>
                <div style="font-size: 13px; color: var(--text-gray-600);">{{ getExpiresCountdown(scope.row.expires) }}</div>
              </el-popover>
            </div>
            <div v-else>Session</div>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="httpOnly" label="HttpOnly" sortable>
          <template #default="scope">
            <span v-if="scope.row.httpOnly === true">✔</span>
            <span v-else></span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="secure" label="Secure" sortable>
          <template #default="scope">
            <span v-if="scope.row.secure === true">✔</span>
            <span v-else></span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="sameSite" label="SameSite" sortable>
          <template #default="scope">
            <span v-if="scope.row.sameSite">{{ scope.row.sameSite }}</span>
            <span v-else>Lax</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="size" label="Size" width="80" sortable>
          <template #default="scope">
            {{ getCookieSize(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="t('操作')" width="120">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleOpenEditDialog(scope.row)">{{ t('编辑') }}</el-button>
            <el-button type="danger" link size="small" @click="handleRemoveCookie(scope.row.id)">{{ t('删除') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editMode ? t('编辑 Cookie') : t('新增 Cookie')" width="40vw">
      <el-form :model="editCookie" label-width="80px" :rules="rules" ref="formRef">
        <el-form-item :label="t('名称')" prop="name">
          <el-input v-model="editCookie.name" />
        </el-form-item>
        <el-form-item :label="t('值')" prop="value">
          <el-input v-model="editCookie.value" type="textarea" :autosize="{ minRows: 3, maxRows: 8 }"/>
        </el-form-item>
        <el-form-item :label="t('域名')" prop="domain">
          <el-input v-model="editCookie.domain" :placeholder="t('Cookie 域名示例')"/>
          <div class="orange f-xs">
            {{ t('未填写则代表所有请求都会携带这个cookie') }}
          </div>
        </el-form-item>
        <el-form-item :label="t('路径')" prop="path">
          <el-input v-model="editCookie.path" :placeholder="t('Cookie 路径示例')"/>
          <div class="orange f-xs">
            {{ t('路径必须以 / 开头，否则无效') }}
          </div>
        </el-form-item>
        <el-form-item :label="t('过期时间')" prop="expires">
          <div class="d-flex flex-column">
            <el-date-picker
              v-model="expiresDate"
              type="datetime"
              :placeholder="t('选择过期时间')"
              :teleported="false"
              :shortcuts="expiresShortcuts"
            />
            <div v-if="expiresDate" >
              {{ t('实际保存值') }}：{{ formatCookieExpires(expiresDate) }}
            </div>
          </div>
        </el-form-item>
        <el-form-item :label="t('HttpOnly')" prop="httpOnly">
          <el-switch v-model="editCookie.httpOnly" />
        </el-form-item>
        <el-form-item :label="t('Secure')" prop="secure">
          <el-switch v-model="editCookie.secure" />
        </el-form-item>
        <el-form-item :label="t('SameSite')" prop="sameSite">
          <el-select v-model="editCookie.sameSite" clearable>
            <el-option :label="t('Lax')" value="Lax" />
            <el-option :label="t('Strict')" value="Strict" />
            <el-option :label="t('None')" value="None" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('取消') }}</el-button>
        <el-button type="primary" @click="handleSaveCookie">{{ t('保存') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCookies } from '@/store/projectWorkbench/cookiesStore';
import { ClConfirm } from '@/components/ui/cleanDesign/clConfirm/ClConfirm2';
import type { ApidocCookie } from '@src/types/projectWorkbench/cookies';
import { useI18n } from 'vue-i18n';
import { message } from '@/helper';
import { nanoid } from 'nanoid/non-secure';
import { useRoute } from 'vue-router'
import dayjs from 'dayjs';


const route = useRoute()
const { t } = useI18n()
const cookiesStore = useCookies();
const { cookies } = storeToRefs(cookiesStore);
const expiresShortcuts = [
  {
    text: t('12小时后'),
    value: () => {
      const d = new Date();
      d.setHours(d.getHours() + 12);
      return d;
    }
  },
  {
    text: t('24小时后'),
    value: () => {
      const d = new Date();
      d.setHours(d.getHours() + 24);
      return d;
    }
  },
  {
    text: t('7天后'),
    value: () => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d;
    }
  }
];

const dialogVisible = ref(false);
const editMode = ref(false);
const editCookie = ref<ApidocCookie>({
  id: '',
  name: '',
  value: '',
  domain: '',
  path: '/',
  expires: '',
  httpOnly: false,
  secure: false,
  sameSite: ''
});
const projectId = route.query.id as string;
const filterName = ref('');
const filterDomain = ref('');
const selectedCookies = ref<ApidocCookie[]>([]);

const domainOptions = computed(() => {
  const set = new Set<string>();
  cookies.value.forEach(c => {
    if (c.domain) {
      set.add(c.domain);
    } else {
      set.add(t('万能域名'));
    }
  });
  return Array.from(set);
});

const filteredCookies = computed(() => {
  return cookies.value.filter(c => {
    const matchName = !filterName.value || c.name.toLowerCase().includes(filterName.value.toLowerCase());
    // 万能域名：筛选条件为空或为万能域名时，domain为空字符串的cookie都应匹配
    const isUniversalDomain = !c.domain || c.domain === '';
    const matchDomain = !filterDomain.value || c.domain === filterDomain.value || (filterDomain.value === t('万能域名') && isUniversalDomain);
    return matchName && matchDomain;
  });
});

const formRef = ref();
const rules = {
  name: [{ required: true, message: t('请输入名称'), trigger: 'blur' }],
  value: [{ required: true, message: t('请输入值'), trigger: 'blur' }],
  path: [
    {
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (value && !value.startsWith('/')) {
          callback(new Error(t('路径必须以 / 开头')));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};
const expiresDate = ref<Date | ''>('');
const now = ref(new Date());
let timer: number | null = null;


const formatCookieExpires = (date: Date | null) => {
  if (!date) return '';
  if (isNaN(date.getTime())) return '';
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
};
/*
|--------------------------------------------------------------------------
| cookie操作，新增修改删除
|--------------------------------------------------------------------------
|
*/
const handleOpenAddDialog = () => {
  editMode.value = false;
  editCookie.value = { id: nanoid(), name: '', value: '', domain: '', path: '/', expires: '', httpOnly: false, secure: false, sameSite: '' };
  dialogVisible.value = true;
  nextTick(() => formRef.value?.clearValidate());
};
const handleOpenEditDialog = (row: ApidocCookie) => {
  editMode.value = true;
  editCookie.value = { ...row };
  expiresDate.value = dayjs(row.expires).toDate();
  dialogVisible.value = true;
  nextTick(() => formRef.value?.clearValidate());
};
const handleSaveCookie = () => {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) return;
    const expires = expiresDate.value ? formatCookieExpires(expiresDate.value) : '';
    if (editMode.value) {
      editCookie.value.expires = expires;
      // encode name/value
      editCookie.value.name = encodeURIComponent(editCookie.value.name!);
      editCookie.value.value = encodeURIComponent(editCookie.value.value!);
      cookiesStore.updateCookiesById(projectId, editCookie.value.id, editCookie.value);
      message.success(t('修改成功'));
    } else {
      const newCookie: ApidocCookie = {
        id: nanoid(),
        name: encodeURIComponent(editCookie.value.name!),
        value: encodeURIComponent(editCookie.value.value!),
        domain: editCookie.value.domain || '',
        path: editCookie.value.path || '/',
        expires,
        httpOnly: !!editCookie.value.httpOnly,
        secure: !!editCookie.value.secure,
        sameSite: editCookie.value.sameSite || '',
      };
      cookiesStore.addCookie(projectId, newCookie);
      message.success(t('新增成功'));
    }
    dialogVisible.value = false;
  });
};
const handleSelectionChange = (selection: ApidocCookie[]) => {
  selectedCookies.value = selection;
};
const handleRemoveCookie = (id: string) => {
  ClConfirm({
    content: t('确定要删除这个 Cookie 吗？'),
    title: t('删除确认'),
    confirmButtonText: t('确定/CookiesDelete'),
    cancelButtonText: t('取消'),
    type: 'warning',
  }).then(() => {
    cookiesStore.deleteCookiesById(projectId, id);
    message.success(t('删除成功'));
  }).catch(() => {
    // 用户取消删除
  });
};
const handleBatchDelete = () => {
  if (!selectedCookies.value.length) return;
  
  ClConfirm({
    content: t(`确定要删除选中的 ${selectedCookies.value.length} 个 Cookie 吗？`),
    title: t('批量删除确认'),
    confirmButtonText: t('确定/CookiesDelete'),
    cancelButtonText: t('取消'),
    type: 'warning',
  }).then(() => {
    selectedCookies.value.forEach(cookie => {
      cookiesStore.deleteCookiesById(projectId, cookie.id);
    });
    message.success(t('批量删除成功'));
  }).catch(() => {
    // 用户取消删除
  });
};
const getExpiresCountdown = (expires: string) => {
  if (!expires) return '';
  let expireDate: Date;
  try {
    expireDate = new Date(expires);
    if (isNaN(expireDate.getTime())) return t('无效时间');
  } catch {
    return t('无效时间');
  }
  const diff = expireDate.getTime() - now.value.getTime();
  if (diff <= 0) return t('已过期，发送请求不会生效，刷新页面后消失');
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
const getCookieSize = (cookie: ApidocCookie) => {
  // 计算 name=value;domain=...;path=...;expires=...;httpOnly;secure;sameSite=... 的字节长度
  let str = `${cookie.name}=${cookie.value}`;
  if (cookie.domain) str += `;domain=${cookie.domain}`;
  if (cookie.path) str += `;path=${cookie.path}`;
  if (cookie.expires) str += `;expires=${cookie.expires}`;
  if (cookie.httpOnly) str += `;HttpOnly`;
  if (cookie.secure) str += `;Secure`;
  if (cookie.sameSite) str += `;SameSite=${cookie.sameSite}`;
  // 按 utf-8 字节长度
  return new TextEncoder().encode(str).length;
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
  padding: 16px 0;
  font-size: 22px;
  .expire-tip {
    border-bottom: 1px dashed var(--gray-500);
    cursor: pointer;
  }
  .title {
    font-size: fz(22);
    font-weight: bold;
  }
}
</style>


