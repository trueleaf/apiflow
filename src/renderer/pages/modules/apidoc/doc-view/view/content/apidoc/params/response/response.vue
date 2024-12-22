/*
    创建者：shuxiaokai
    创建时间：2021-08-30 21:39
    模块名称：返回参数
    备注：
*/
<template>
  <div class="response-params">
    <s-collapse-card v-for="(item, index) in responseData" :key="index" :fold="index !== 0">
      <template #head>
        <div class="info-wrap">
          <div class="label">
            <div class="d-flex a-center">
              <span class="flex0">{{ t("名称") }}：</span>
              <span v-if="!currentEditNode" class="edit-title">{{ item.title }}</span>
              <input
                v-if="currentEditNode && currentEditNode.index === index"
                :ref="bindRef"
                v-model="currentEditNode._title"
                class="edit-input"
                :class="{error: currentEditNode._title.length === 0}"
                type="text"
                :placeholder="t('不能为空')"
                @click.stop="() => {}"
                @keydown.enter="handleConfirmTitle(item, index)"
              >
              <span v-if="currentEditNode && currentEditNode.title === item.title" class="ml-1 cursor-pointer theme-color" @click.stop="handleConfirmTitle(item, index)">{{ t("确定") }}</span>
              <span v-if="currentEditNode && currentEditNode.title === item.title" class="ml-1 cursor-pointer theme-color" @click.stop="handleCancelEdit">{{ t("取消") }}</span>
              <el-icon v-if="!currentEditNode" :title="t('修改名称')" class="edit-icon" :size="16" @click.stop="handleChangeEditNode(item, index)">
                <Edit />
              </el-icon>
            </div>
          </div>
          <el-divider direction="vertical"></el-divider>
          <div class="status-code">
            <div class="d-flex a-center j-center">
              <span class="flex0">{{ t("状态码") }}：</span>
              <el-dropdown trigger="click">
                <span class="d-flex a-center cursor-pointer">
                  <span>{{ item.statusCode }}</span>
                  <el-icon class="ml-1">
                    <arrow-down />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="(code) in statusCode" :key="code" @click="handleSelectStatusCode(code, index)">{{ code }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          <el-divider direction="vertical"></el-divider>
          <div class="content-type">
            <div class="d-flex a-center j-center">
              <span class="flex0">{{ t("返回格式") }}：</span>
              <el-dropdown trigger="click">
                <span class="cursor-pointer">
                  <span>{{ item.value.dataType }}</span>
                  <el-icon class="ml-1">
                    <arrow-down />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="(type) in contentType" :key="type" @click="handleSelectContentType(type, index)">{{ type }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
      </template>
      <template #tail>
        <div class="d-flex">
          <div v-if="index === 0" class="green cursor-pointer mr-2" @click="handleAddResponse">{{ t("新增") }}</div>
          <div v-if="responseData.length > 1" class="red cursor-pointer" @click="handleDeleteResponse(index)">{{ t("删除") }}</div>
        </div>
      </template>
      <s-params-tree v-if="item.value.dataType === 'application/json'" nest :data="item.value.json"></s-params-tree>
      <div
        v-show="item.value.dataType === 'text/plain' || item.value.dataType === 'text/html' || item.value.dataType === 'application/xml'"
        class="editor-wrap"
        :class="{ vertical: layout === 'vertical' }"
      >
        <s-raw-editor
          :model-value="item.value.text"
          :type="item.value.dataType"
          class="editor"
          @update:modelValue="handleChangeTextValeu($event, index)"
        >
        </s-raw-editor>
      </div>
    </s-collapse-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, Ref } from 'vue'
import { ArrowDown, Edit } from '@element-plus/icons-vue'
import type { ApidocResponseParams } from '@src/types/global'
import { store } from '@/pages/modules/apidoc/doc-view/store/index'

/*
|--------------------------------------------------------------------------
| 编辑操作
|--------------------------------------------------------------------------
|
*/
//当前编辑的节点
const currentEditNode: Ref<null | { title: string, _title: string, index: number }> = ref(null);
//所有输入框
const inputRefs: unknown[] = [];
//常用状态码
const statusCode = ref([200, 201, 202, 204, 400, 401, 403, 404, 410, 422, 500, 502, 503, 504]);
//常用contentType值
const contentType = ref(['application/json', 'application/xml', 'text/plain', 'text/html'])

//ref绑定
const bindRef = (el: unknown) => {
  if (el) {
    inputRefs.push(el);
  }
}
//确定修改title
const handleConfirmTitle = (item: ApidocResponseParams, index: number) => {
  if (currentEditNode.value && currentEditNode.value._title) {
    store.commit('apidoc/apidoc/changeResponseParamsTitleByIndex', {
      index,
      title: currentEditNode.value._title,
    });
    currentEditNode.value = null;
  }
}
//取消编辑
const handleCancelEdit = () => {
  currentEditNode.value = null;
}
//改变当前编辑的节点
const handleChangeEditNode = (item: ApidocResponseParams, index: number) => {
  const value = {
    index,
    title: item.title,
    _title: item.title,
  };
  currentEditNode.value = value;
  setTimeout(() => {
    if (inputRefs[index]) {
      (inputRefs[index] as HTMLInputElement).focus();
    }
  })
}
//改变正在编辑的文本值
const handleChangeTextValeu = (value: string, index: number) => {
  store.commit('apidoc/apidoc/changeResponseParamsTextValueByIndex', {
    index,
    value,
  });
}
/*
|--------------------------------------------------------------------------
| 状态修改、contentType修改、新增response、删除response
|--------------------------------------------------------------------------
|
*/

//选择一个statusCode
const handleSelectStatusCode = (code: number, index: number) => {
  store.commit('apidoc/apidoc/changeResponseParamsCodeByIndex', {
    index,
    code,
  });
}
//选择一个contentType
const handleSelectContentType = (type: string, index: number) => {
  store.commit('apidoc/apidoc/changeResponseParamsDataTypeByIndex', {
    index,
    type,
  });
}
//新增一个response
const handleAddResponse = () => {
  store.commit('apidoc/apidoc/addResponseParam');
}
//删除一个response
const handleDeleteResponse = (index: number) => {
  store.commit('apidoc/apidoc/deleteResponseByIndex', index);
}
//response参数值
const responseData = computed(() => store.state['apidoc/apidoc'].apidoc.item.responseParams)
//布局
const layout = computed(() => store.state['apidoc/baseInfo'].layout)
</script>

<style  scoped>
.response-params {
    .info-wrap {
        display: flex;
        height: 100%;
        align-items: center;
        .label {
            width: size(230);
        }
        .status-code {
            width: size(140);
        }
        .content-type {
            flex: 1;
        }
        .edit-title {
            border: 1px solid transparent;
        }
        .edit-input {
            border: 1px solid $gray-600;
            font-size: fz(14);
            height: size(20);
            line-height: size(20);
            width: size(120);
            &.error {
                border: 1px solid $red;
            }
        }
    }
    .edit-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        cursor: pointer;
        width: size(40);
        margin-top: size(2);
        &:hover {
            color: $theme-color;
        }
    }
    .editor-wrap {
        height: size(350);
        &.vertical {
            height: size(250);
        }
        .editor {
            height: size(350);
        }
    }

}
</style>
