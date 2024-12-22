/*
    创建者：shuxiaokai
    创建时间：2021-08-20 22:42
    模块名称：body参数
    备注：
*/
<template>
  <div class="body-params">
    <div class="body-type d-flex a-center mb-1">
      <!-- body类型选择 -->
      <el-radio-group v-model="bodyType" @change="changeBodyType">
        <el-radio value="json">json</el-radio>
        <el-radio value="formdata">form-data</el-radio>
        <el-radio value="urlencoded">x-www-form-urlencoded</el-radio>
        <el-radio value="raw">raw</el-radio>
        <el-radio value="none">none</el-radio>
      </el-radio-group>
      <div v-show="bodyType === 'json'" class="operation">
        <div class="p-relative no-select">
          <span class="cursor-pointer" @click.stop="showTemplate = !showTemplate">{{ t("应用模板") }}</span>
          <div v-if="showTemplate" class="template-wrap">
            <div class="header">
              <el-input v-model="templateFilterString" :size="config.renderConfig.layout.size" :placeholder="t('过滤模板')" class="w-100" :prefix-icon="Search" maxlength="100" clearable></el-input>
              <div class="flex0 theme-color cursor-pointer" @click="handleOpenTempateTab">{{ t("维护") }}</div>
            </div>
            <template v-if="bodyTemplateList.length > 0">
              <div
                v-for="(item, index) in bodyTemplateList"
                :key="index"
                class="select-item"
              >
                <span class="head">
                  <s-emphasize :value="item.name" :keyword="templateFilterString"></s-emphasize>
                </span>
                <span class="tail">{{ item.creatorName }}</span>
              </div>
            </template>
            <div v-else class="select-item d-flex j-center gray-500">{{ t("暂无数据") }}</div>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="cursor-pointer" @click="handleOpenTemplateDialog">{{ t("保存为模板") }}</div>
        <!-- <el-divider direction="vertical"></el-divider>
                <div class="cursor-pointer">预览参数 </div> -->
      </div>
    </div>
    <div class="params-wrap">
      <!-- <s-params-tree v-if="bodyType === 'json'" :mind-params="mindBodyData" nest show-checkbox :data="jsonBodyData" @change="checkContentType"></s-params-tree> -->
      <s-json-editor v-if="bodyType === 'json'" v-model="rawJsonData"></s-json-editor>
      <s-params-tree v-if="bodyType === 'formdata'" enable-file show-checkbox :data="formData" @change="checkContentType"></s-params-tree>
      <s-params-tree v-if="bodyType === 'urlencoded'" show-checkbox :data="urlencodedData" @change="checkContentType"></s-params-tree>
    </div>
    <div v-show="bodyType === 'raw'" class="raw">
      <s-raw-editor v-model="rawValue" :type="rawType" @change="handleChangeRawData"></s-raw-editor>
      <div class="raw-type">
        <el-select v-model="rawType" class="w-100" :size="config.renderConfig.layout.size" @change="handleChangeRawType">
          <el-option label="text" value="text/plain"></el-option>
          <el-option label="html" value="text/html"></el-option>
          <el-option label="xml" value="application/xml"></el-option>
          <el-option label="javascript" value="text/javascript"></el-option>
        </el-select>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { Search } from '@element-plus/icons-vue'
import type { ApidocBodyMode, ApidocBodyRawType } from '@src/types/global'
import { router } from '@/router/index'
import { store } from '@/pages/modules/apidoc/doc-view/store/index'
import { t } from 'i18next'

/*
|--------------------------------------------------------------------------
| 操作区域，导入参数、应用模板、保存为模板、预览参数
|--------------------------------------------------------------------------
|
*/
const paramsTemplatedialogVisible = ref(false);
//打开保存参数模板弹窗
const handleOpenTemplateDialog = () => {
  paramsTemplatedialogVisible.value = true;
}

//=====================================模板相关操作====================================//
//是否显示模板
const showTemplate = ref(false);
//模板过滤参数
const templateFilterString = ref('');
//模板列表
const bodyTemplateList = computed(() => {
  const templates = store.state['apidoc/baseInfo'].paramsTemplate;
  const result = templates.filter(template => template.presetParamsType === 'bodyParams').filter(template => {
    if (!templateFilterString.value) {
      return true;
    }
    return template.name.includes(templateFilterString.value);
  })
  return result;
})
//打开模板维护tab页面
const projectId = router.currentRoute.value.query.id as string;
const handleOpenTempateTab = () => {
  store.commit('apidoc/tabs/addTab', {
    _id: 'paramsTemplate',
    projectId,
    tabType: 'paramsTemplate',
    label: t('模板维护'),
    head: {
      icon: 'iconvariable',
      color: ''
    },
    saved: true,
    fixed: true,
    selected: true,
  });
}
//处理模板点击空白区域关闭
const bindClick = () => {
  showTemplate.value = false;
}
onMounted(() => {
  document.documentElement.addEventListener('click', bindClick)
})
onBeforeUnmount(() => {
  document.documentElement.removeEventListener('click', bindClick)
})

//=========================================================================//

//根据参数内容校验对应的contentType值
const checkContentType = () => {
  const type = store.state['apidoc/apidoc'].apidoc.item.requestBody.mode
  const { rawJson, formdata, urlencoded, raw } = store.state['apidoc/apidoc'].apidoc.item.requestBody;
  const hasJsonData = rawJson.length > 0
  const hasFormData = formdata.filter(p => p.select).some((data) => data.key);
  const hasUrlencodedData = urlencoded.filter(p => p.select).some((data) => data.key);
  const hasRawData = raw.data;
  if (type === 'raw' && hasRawData) {
    store.commit('apidoc/apidoc/changeContentType', raw.dataType || 'text/plain');
  } else if (type === 'raw' && !hasRawData) {
    store.commit('apidoc/apidoc/changeContentType', '');
  } else if (type === 'none') {
    store.commit('apidoc/apidoc/changeContentType', '');
  } else if (type === 'urlencoded' && hasUrlencodedData) {
    store.commit('apidoc/apidoc/changeContentType', 'application/x-www-form-urlencoded');
  } else if (type === 'urlencoded' && !hasUrlencodedData) {
    store.commit('apidoc/apidoc/changeContentType', '');
  } else if (type === 'json' && hasJsonData) {
    store.commit('apidoc/apidoc/changeContentType', 'application/json');
  } else if (type === 'json' && !hasJsonData) {
    store.commit('apidoc/apidoc/changeContentType', '');
  } else if (type === 'formdata' && hasFormData) {
    store.commit('apidoc/apidoc/changeContentType', 'multipart/form-data');
  } else if (type === 'formdata' && !hasFormData) {
    store.commit('apidoc/apidoc/changeContentType', '');
  }
}
//改变bodytype类型
const changeBodyType = () => {
  checkContentType();
}

//body类型
const bodyType = computed<ApidocBodyMode>({
  get() {
    return store.state['apidoc/apidoc'].apidoc.item.requestBody.mode;
  },
  set(val) {
    store.commit('apidoc/apidoc/changeBodyMode', val);
  },
});
/*
|--------------------------------------------------------------------------
| json类型操作
|--------------------------------------------------------------------------
*/
//json格式body参数
// const jsonBodyData = computed(() => store.state["apidoc/apidoc"].apidoc.item.requestBody.json)
//json格式body参数
const rawJsonData = computed({
  get() {
    const { rawJson } = store.state['apidoc/apidoc'].apidoc.item.requestBody;
    return rawJson;
  },
  set(val) {
    store.commit('apidoc/apidoc/changeRawJson', val);
  }
})
/*
|--------------------------------------------------------------------------
| x-www-form-urlencoded类型操作
|--------------------------------------------------------------------------
*/
const urlencodedData = computed(() => store.state['apidoc/apidoc'].apidoc.item.requestBody.urlencoded)
/*
|--------------------------------------------------------------------------
| raw类型数据处理
|--------------------------------------------------------------------------
*/
//raw类型
const rawType = computed<ApidocBodyRawType>({
  get() {
    return store.state['apidoc/apidoc'].apidoc.item.requestBody.raw.dataType;
  },
  set(val) {
    store.commit('apidoc/apidoc/changeBodyRawType', val);
  },
})
//raw类型数据值
const rawValue = computed({
  get() {
    return store.state['apidoc/apidoc'].apidoc.item.requestBody.raw.data;
  },
  set(value: string) {
    store.commit('apidoc/apidoc/changeBodyRawValue', value);
  },
})
//改变raw数据值
const handleChangeRawData = () => {
  checkContentType();
}
//切换raw参数类型
const handleChangeRawType = () => {
  const { raw } = store.state['apidoc/apidoc'].apidoc.item.requestBody;
  if (!raw.data) {
    store.commit('apidoc/apidoc/changeContentType', '');
    return
  }
  if (rawType.value === 'text/plain') {
    store.commit('apidoc/apidoc/changeContentType', 'text/plain');
  } else if (rawType.value === 'text/html') {
    store.commit('apidoc/apidoc/changeContentType', 'text/html');
  } else if (rawType.value === 'application/xml') {
    store.commit('apidoc/apidoc/changeContentType', 'application/xml');
  } else if (rawType.value === 'text/javascript') {
    store.commit('apidoc/apidoc/changeContentType', 'text/javascript');
  } else if (rawType.value === 'application/json') {
    store.commit('apidoc/apidoc/changeContentType', 'application/json');
  } else {
    console.warn(t('未知请求类型'));
  }
}

/*
|--------------------------------------------------------------------------
| formdata数据处理
|--------------------------------------------------------------------------
*/
//formData格式body参数
const formData = computed(() => store.state['apidoc/apidoc'].apidoc.item.requestBody.formdata)

</script>

<style lang='scss' scoped>
.body-params {
    .body-type {
        margin-top: size(-10);
    }
    .operation {
        margin-top: size(-3);
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        position: relative;
    }
    .raw {
        height: size(300);
        position: relative;
        .raw-type {
            position: absolute;
            right: size(0);
            bottom: size(1);
            width: size(100);
        }
        .tip {
            width: calc(100% - #{size(140)});
            height: size(20);
            display: flex;
            align-items: center;
            position: absolute;
            bottom: size(1);
            left: size(40);
            background: lighten($orange, 10%);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: $white;
            z-index: $zIndex-contextmenu;
        }
    }
    .params-wrap {
        border-top: 1px dashed $gray-400;
    }
    .template-wrap {
        top: size(30);
        left: size(-200);
        background: $white;
        z-index: $zIndex-contextmenu;
        position: absolute;
        min-width: size(250);
        border: 1px solid $gray-200;
        box-shadow: rgb(0 0 0 / 10%) 0px 2px 8px 0px; //墨刀弹窗样式
        max-height: size(220);
        overflow-y: auto;
        &::-webkit-scrollbar {
            width: size(5);
        }
        &::-webkit-scrollbar-thumb {
            background: $gray-400;
        }
        .header {
            border-bottom: 1px solid $gray-300;
            display: flex;
            align-items: center;
            padding: size(3) size(20) size(3) size(5);
            .el-input__inner {
                border: none;
            }
        }
        .select-item {
            line-height: 1.8em;
            padding: size(5) size(25);
            cursor: pointer;
            display: flex;
            &:hover {
                background: $theme-color;
                color: $white;
            }
            &.active {
                background: $theme-color;
                color: $white;
            }
            .head {
                margin-right: size(10);
            }
            .tail {
                margin-left: auto;
                // color: $gray-500;
            }
        }
    }
}
</style>
