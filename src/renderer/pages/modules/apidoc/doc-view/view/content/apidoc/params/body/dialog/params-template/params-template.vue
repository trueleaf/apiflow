/*
    创建者：shuxiaokai
    创建时间：2021-08-29 10:49
    模块名称：保存参数为模板
    备注：
*/
<template>
  <SDialog :model-value="modelValue" width="30%" title="保存参数为模板" @close="handleClose">
    <SForm ref="form">
      <SFormItem label="模板名称" prop="name" one-line required></SFormItem>
    </SForm>
    <template #footer>
      <el-button :loading="loading" type="primary" @click="handleSave">保存</el-button>
      <el-button type="warning" @click="handleClose">取消</el-button>
    </template>
  </SDialog>
</template>

<script lang="ts">
import { ApidocProperty } from '@src/types/global';
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    items: {
      type: Array as PropType<ApidocProperty[]>,
      default: () => []
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      loading: false
    };
  },
  methods: {
    //保存
    handleSave() {
      this.form.value?.validate((valid) => {
        if (valid) {
          const { formInfo } = this.form.value as any;
          const bodyParams = this.$store.state['apidoc/apidoc'].apidoc.item.requestBody.rawJson
          const params = {
            name: formInfo.name,
            presetParamsType: 'bodyParams',
            projectId: this.$route.query.id,
            items: bodyParams,
          };
          this.loading = true;
          this.axios.post('/api/project/doc_preset_params', params).then((res) => {
            this.$store.commit('apidoc/baseInfo/addParamsTemplate', res.data);
            this.handleClose();
          }).catch((err) => {
            console.error(err);
          }).finally(() => {
            this.loading = false;
          });
        } else {
          this.nextTick(() => {
            const input = document.querySelector('.el-form-item.is-error input');
            if (input) {
              (input as HTMLElement).focus();
            }
          });
        }
      });
    },
    //关闭弹窗
    handleClose() {
      emits('update:modelValue', false);
    },
  },
})
</script>

<style lang="scss" scoped>

</style>
