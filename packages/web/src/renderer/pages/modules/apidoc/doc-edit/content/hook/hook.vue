注：
*/
<template>
  <div class="hook-wrap">
    <el-tabs v-model="activeName">
      <el-tab-pane label="新增代码" name="add"></el-tab-pane>
      <el-tab-pane label="修改代码" name="edit"></el-tab-pane>
      <el-tab-pane label="代码列表" name="list"> </el-tab-pane>
    </el-tabs>
    <component :is="add" v-if="activeName === 'add'"></component>
    <component :is="edit" v-if="activeName === 'edit'" :code-info="editCodeInfo"></component>
    <component :is="list" v-if="activeName === 'list'"></component>
  </div>
</template>

<script lang="ts" setup>
import { ref, onUnmounted, onMounted, Ref } from 'vue'
import { event } from '@/helper';
import type { ApidocCodeInfo } from '@src/types/global'
import add from './components/add/add.vue'
import edit from './components/edit/edit.vue'
import list from './components/list/list.vue'

const activeName = ref('add');
const editCodeInfo: Ref<ApidocCodeInfo | undefined> = ref(undefined)
//初始化
onMounted(() => {
  event.on('apidoc/hook/jumpToEdit', (payload) => {
    activeName.value = 'edit';
    editCodeInfo.value = payload as ApidocCodeInfo;
  })
})
//删除自定义事件
onUnmounted(() => {
  event.off('apidoc/hook/jumpToEdit')
})

</script>

<style lang='scss' scoped>
.hook-wrap {
    padding: 20px;
}
</style>
