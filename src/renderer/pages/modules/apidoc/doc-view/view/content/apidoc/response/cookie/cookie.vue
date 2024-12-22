/*
    创建者：shuxiaokai
    创建时间：2021-09-03 20:45
    模块名称：返回cookie
    备注：
*/
<template>
  <div class="cookie-view" :class="{ vertical: layout === 'vertical' }">
    <el-table :data="cookies" stripe border height="100%">
      <el-table-column align="center" prop="name" label="Name"></el-table-column>
      <el-table-column align="center" prop="value" label="Value">
        <template #default="scope">
          <div class="value-wrap">{{ scope.row.value }}</div>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="domin" label="Domin"></el-table-column>
      <el-table-column align="center" prop="path" label="Path"></el-table-column>
      <el-table-column align="center" prop="expires" label="Expires"></el-table-column>
      <el-table-column align="center" prop="httpOnly" label="HttpOnly"></el-table-column>
      <el-table-column align="center" prop="secure" label="Secure"></el-table-column>
      <el-table-column align="center" prop="sameSite" label="SameSite"></el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
    };
  },
  computed: {
    cookies() {
      return this.$store.state['apidoc/response'].cookies
    },
    //布局
    layout() {
      return this.$store.state['apidoc/baseInfo'].layout;
    },
  },
  methods: {
  },
})
</script>

<style  scoped>
.cookie-view {
    width: 100%;
    height: calc(100vh - #{size(370)});
    .value-wrap {
        max-height: size(140);
        overflow-y: auto;
    }
    &.vertical {
        height: 100%;
    }
}
</style>
