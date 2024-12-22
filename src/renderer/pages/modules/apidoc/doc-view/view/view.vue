/*
    创建者：shuxiaokai
    创建时间：2021-07-21 21:58
    模块名称：文档编辑页面
    备注：
*/
<template>
  <div class="doc-view">
    <s-banner></s-banner>
    <div class="doc-wrap">
      <s-nav></s-nav>
      <s-content></s-content>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineComponent, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import banner from './banner/banner.vue';
import nav from './nav/nav.vue';
import content from './content/content.vue';
import { useStore } from '../store/index'

// const isBuildHtml = process.env.VUE_APP_BUILD_HTML;

export default defineComponent({
  components: {
    's-banner': banner,
    's-nav': nav,
    's-content': content,
  },
  setup() {
    const store = useStore();
    const route = useRoute()
    //=====================================基本数据获取====================================//
    //获取项目基本信息
    const getProjectInfo = () => {
      const shareId = route.query.share_id as string;
      const password = localStorage.getItem('share/password') || ''
      store.dispatch('apidoc/baseInfo/getSharedProjectBaseInfo', { shareId, password });
    }
    //初始化cookie
    const initCookies = () => {
      store.commit('apidoc/baseInfo/initCookies')
    }
    //初始化布局
    const initLayout = () => {
      store.commit('apidoc/baseInfo/initLayout')
    }
    onMounted(() => {
      // if (isBuildHtml) {
      //   const result = [];
      //   const mapedData = (window as any).SHARE_DATA.docs.map((val: { isFolder: any; _id: any; pid: any; sort: any; info: { name: any; type: any; maintainer: any; }; updatedAt: any; item: { method: any; url: { path: any; }; }; }) => {
      //     if (val.isFolder) {
      //       return {
      //         _id: val._id,
      //         pid: val.pid,
      //         sort: val.sort,
      //         name: val.info.name,
      //         type: val.info.type,
      //         maintainer: val.info.maintainer,
      //         updatedAt: val.updatedAt,
      //         isFolder: val.isFolder,
      //         children: [],
      //       };
      //     }
      //     return {
      //       _id: val._id,
      //       pid: val.pid,
      //       sort: val.sort,
      //       name: val.info.name,
      //       type: val.info.type,
      //       method: val.item.method,
      //       url: val.item.url ? val.item.url.path : '',
      //       maintainer: val.info.maintainer,
      //       updatedAt: val.updatedAt,
      //       isFolder: val.isFolder,
      //       children: [],
      //     };
      //   })
      //   for (let i = 0; i < mapedData.length; i += 1) {
      //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
      //     const docInfo: any = mapedData[i];
      //     if (!docInfo.pid) { //根元素
      //       docInfo.children = [];
      //       result.push(docInfo);
      //     }
      //     const id = docInfo._id.toString();
      //     for (let j = 0; j < mapedData.length; j += 1) {
      //       if (id === mapedData[j].pid) { //项目中新增的数据使用标准id
      //         if (docInfo.children == null) {
      //           docInfo.children = [];
      //         }
      //         docInfo.children.push(mapedData[j]);
      //       }
      //     }
      //   }
      //   store.commit('apidoc/baseInfo/changeProjectBaseInfo', (window as any).SHARE_DATA.projectInfo)
      //   store.commit('apidoc/banner/changeAllDocBanner', result)
      // } else {
      // }
      getProjectInfo();
      initCookies();
      initLayout();
    })
    store.commit('apidoc/baseInfo/changeMode', 'view');
  }
})
</script>

<style  scoped>
.doc-view {
    display: flex;
    overflow: hidden;
    height: 100%;
    .doc-wrap {
        flex: 1;
        overflow: hidden;
    }
}
</style>
