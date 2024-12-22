/*
    创建者：shuxiaokai
    创建时间：2021-09-17 22:39
    模块名称：
    备注：
*/
<template>
  <div class="params-template">
    <s-resize-x v-if="0" :min="500" :max="900" :width="500" name="paramsTemplate" class="left">
      <el-tabs v-model="activeName">
        <!-- 新增模板 -->
        <el-tab-pane :label="t('新增模板')" name="s-add">
          <el-form ref="form" inline :model="addData" :rules="rules" label-width="120px">
            <el-form-item :label="`${t('参数名称')}：`" prop="name">
              <el-input v-model="addData.name" :size="config.renderConfig.layout.size" :placeholder="t('例如：默认返回值')" class="w-100" maxlength="8" clearable show-word-limit></el-input>
            </el-form-item>
            <el-form-item :label="`${t('参数类型')}：`" prop="presetParamsType">
              <el-select v-model="addData.presetParamsType" :size="config.renderConfig.layout.size" :placeholder="t('请选择参数类型')" class="w-100">
                <el-option :label="t('请求参数(Params)')" value="queryParams"></el-option>
                <el-option :label="t('请求参数(Body)')" value="requestBody"></el-option>
                <el-option :label="t('返回参数')" value="responseParams"></el-option>
              </el-select>
            </el-form-item>
            <div class="scroll-y-450">
              <s-params-tree nest :data="addData.items"></s-params-tree>
            </div>
            <div class="d-flex j-end">
              <el-button :loading="loading2" type="success" @click="handleAddTemplate">{{ t("确认新增") }}</el-button>
            </div>
          </el-form>
        </el-tab-pane>
        <!-- 修改模板 -->
        <el-tab-pane :label="t('修改模板')" name="s-edit">
          <SLoading :loading="loading">
            <el-form v-if="editData._id" ref="form" :model="editData" :rules="rules" label-width="120px">
              <el-form-item :label="`${t('参数名称')}：`" prop="name">
                <el-input v-model="editData.name" :size="config.renderConfig.layout.size" :placeholder="t('例如：默认返回值')" class="w-80" maxlength="8" clearable show-word-limit></el-input>
              </el-form-item>
              <el-form-item :label="`${t('参数类型')}：`" prop="type">
                <el-select v-model="editData.presetParamsType" :size="config.renderConfig.layout.size" :placeholder="t('请选择参数类型')">
                  <el-option :label="t('请求参数')" value="request"></el-option>
                  <el-option :label="t('返回参数')" value="response"></el-option>
                </el-select>
              </el-form-item>
              <div class="scroll-y-450">
                <s-collapse-card :title="t('参数模板')">
                  bbbb
                </s-collapse-card>
              </div>
              <div class="d-flex j-end">
              </div>
            </el-form>
          </SLoading>
        </el-tab-pane>
      </el-tabs>
    </s-resize-x>
    <STable
      ref="table"
      url="/api/project/doc_preset_params_list"
      :params="{projectId: $route.query.id}"
      delete-many
      delete-url="/api/project/doc_preset_params"
      delete-key="ids"
      class="w-100"
      @deleteMany="handleDeleteSuccess"
    >
      <el-table-column :label="t('模板名称')" align="center">
        <template #default="scope">
          <el-input v-if="scope.row.__active" v-model="scope.row.name" :size="config.renderConfig.layout.size" class="w-100" maxlength="8" clearable show-word-limit></el-input>
          <span v-else>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('创建者名称')" prop="creatorName" align="center"></el-table-column>
      <el-table-column label="模板类型" prop="presetParamsType" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.presetParamsType === 'bodyParams'">请求参数(Body)</el-tag>
          <el-tag v-if="scope.row.presetParamsType === 'responseParams'">返回参数</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('操作')" align="center">
        <template #default="scope">
          <!-- <el-button link type="primary" text @click="handleChangeOpToEdit(scope.row)">编辑</el-button> -->
          <el-button link type="primary" text @click="handleDelete(scope.row._id)">{{ t("删除") }}</el-button>
        </template>
      </el-table-column>
    </STable>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { ApidocProjectParamsTemplate, ApidocTab } from '@src/types/store'
import type { Response, ApidocProperty } from '@src/types/global'

type EditInfo = {
  _id: string,
  items: ApidocProperty[]
}

export default defineComponent({
  emits: ['success'],
  data() {
    return {
      //=================================表单与表格参数================================//
      addData: {
        name: '', //-----------------------------------模板名称
        presetParamsType: '', //------------模板类型
        items: [] as ApidocProperty[], //----------------------------------参数信息
      },
      editData: {
        _id: '', //------------------------------------模板id
        name: '', //-----------------------------------模板名称
        presetParamsType: '', //------------模板类型
        items: [] as ApidocProperty[], //----------------------------------参数信息
      },
      //===================================枚举参数====================================//
      rules: {
        name: [{ required: true, message: this.t('请输入模板名称'), trigger: 'blur' }],
        presetParamsType: [{ required: true, message: this.t('请选择模板类型'), trigger: 'change' }],
      },
      //===================================业务参数====================================//

      //===================================其他参数====================================//
      activeName: 's-add', //当前tab切换状态
      loading: false, //----------------------编辑加载效果
      loading2: false, //---------------------添加按钮加载效果
      loading3: false, //---------------------修改按钮加载效果
    };
  },
  computed: {
    currentSelectTab() {
      const projectId = this.$route.query.id as string;
      if (this.$store.state['apidoc/tabs'].tabs[projectId]) {
        return this.$store.state['apidoc/tabs'].tabs[projectId].find(v => v.selected)
      }
      return null;
    },
  },
  watch: {
    currentSelectTab: {
      handler(val: ApidocTab | null) {
        if (val && val.tabType === 'paramsTemplate') {
          console.log(val)
          table.value?.getData();
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    //初始化
    init() {
      this.addData.items.push(this.apidocGenerateProperty());
    },
    //新增模板
    handleAddTemplate() {
      this.form.value?.validate((valid) => {
        if (valid) {
          const params = {
            projectId: this.$route.query.id,
            ...this.addData,
          };
          this.loading2 = true;
          this.request.post('/api/project/doc_preset_params', params).then(() => {
            table.value?.getData();
            this.$store.commit('apidoc/addPresetParams', params);
            emits('success')
          }).catch((err) => {
            console.error(err);
          }).finally(() => {
            this.loading2 = false;
          });
        }
      });
    },
    //修改参数信息
    handleChangeOpToEdit(row: ApidocProjectParamsTemplate) {
      this.activeName = 's-edit';
      if (this.loading) {
        return;
      }
      this.loading = true;
      const params = {
        projectId: this.$route.query.id,
        _id: row._id,
      };
      this.request.get<Response<EditInfo>, Response<EditInfo>>('/api/project/doc_preset_params', { params }).then((res) => {
        this.editData.name = row.name;
        this.editData._id = res.data._id;
        this.editData.presetParamsType = row.presetParamsType;
        this.editData.items = [];
        const lastItem = res.data.items[res.data.items.length - 1];
        res.data.items.forEach((val) => {
          this.editData.items.push(val);
        })
        if (lastItem.key || lastItem.value) {
          this.editData.items.push(this.apidocGenerateProperty())
        }
      }).catch((err) => {
        console.error(err);
      }).finally(() => {
        this.loading = false;
      });
    },
    //删除模板
    handleDelete(id: string) {
      ElMessageBox.confirm(this.t('此操作将永久删除此条记录, 是否继续?'), '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        const params = {
          ids: [id],
          projectId: this.$route.query.id,
        };
        this.request.delete('/api/project/doc_preset_params', { data: params }).then(() => {
          table.value?.getData();
          const allTemplate = this.$store.state['apidoc/baseInfo'].paramsTemplate;
          const delIndex = allTemplate.findIndex(v => v._id === id);
          this.$store.commit('apidoc/baseInfo/deleteParamsTemplate', delIndex)
        }).catch((err) => {
          console.error(err);
        }).finally(() => {
          this.loading = false;
        });
      }).catch((err: Error | string) => {
        if (err === 'cancel' || err === 'close') {
          return;
        }
        console.error(err);
      });
    },
    //批量删除成功
    handleDeleteSuccess(ids: string[]) {
      table.value?.getData();
      ids.forEach(id => {
        const allTemplate = this.$store.state['apidoc/baseInfo'].paramsTemplate;
        const delIndex = allTemplate.findIndex(v => v._id === id);
        this.$store.commit('apidoc/baseInfo/deleteParamsTemplate', delIndex)
      })
    },
  },
})
</script>

<style  scoped>
.params-template {
    overflow: hidden;
    display: flex;
    padding: size(20);
    &>.left {
        flex: 0 0 auto;
        padding: size(10) size(20);
        border-right: 4px solid $gray-400;
    }
}
</style>
