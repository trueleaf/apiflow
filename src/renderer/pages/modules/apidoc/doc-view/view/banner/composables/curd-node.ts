/**
 * 删除节点
 */

import { Ref } from 'vue'
import 'element-plus/es/components/message-box/style/css';
import { ElMessageBox } from 'element-plus'
import type { ApidocBanner, Response } from '@src/types/global'
import { findNodeById, forEachForest, findParentById, flatTree, uniqueByKey, findPreviousSiblingById, findNextSiblingById } from '@/helper/index'
import { store } from '@/pages/modules/apidoc/doc-view/store/index'
import router from '@/pages/modules/apidoc/doc-view/router/index'
import { axios } from '@/pages/modules/apidoc/doc-view/api/api'
import { t } from 'i18next'

type MapId = {
  oldId: string, //历史id
  newId: string, //新id
  oldPid: string, //历史pid
  newPid: string, //新pid
};
/**
 * 删除某个(多个)节点
 */
export function deleteNode(selectNodes: ApidocBanner[], silent?: boolean): void {
  const { banner } = store.state['apidoc/banner'];
  const projectId = router.currentRoute.value.query.id;
  const deleteIds: string[] = [];
  selectNodes.forEach((node) => {
    deleteIds.push(node._id); //删除自己
    if (node.isFolder) { //如果是文件夹则删除所有子元素
      forEachForest(node.children, (item) => {
        if (!deleteIds.find((id) => id === item._id)) {
          deleteIds.push(item._id);
        }
      });
    }
  })
  const deleteTip = selectNodes.length > 1 ? t('确定批量删除个节点?', { msg: deleteIds.length.toString() }) : t('确定删除节点?', { msg: selectNodes[0].name })
  const deleteOperation = () => {
    const params = {
      data: {
        projectId,
        ids: deleteIds,
      },
    };
    request.delete('/api/project/doc', params).then(() => {
      selectNodes.forEach((node) => {
        const deletePid = node.pid;
        if (!deletePid) { //不存在pid代表在根元素删除
          const delIndex = banner.findIndex((val) => val._id === node._id);
          store.commit('apidoc/banner/splice', {
            start: delIndex,
            deleteCount: 1,
          })
        } else {
          const parentNode = findNodeById(banner, node.pid, {
            idKey: '_id',
          });
          const delIndex = parentNode?.children.findIndex((val) => val._id === node._id);
          store.commit('apidoc/banner/splice', {
            start: delIndex,
            deleteCount: 1,
            opData: parentNode?.children,
          })
        }
      })
      //删除所有nav节点
      const delNodeIds: string[] = [];
      forEachForest(selectNodes, (node) => {
        if (!node.isFolder) {
          delNodeIds.push(node._id);
        }
      })
      store.dispatch('apidoc/tabs/deleteTabByIds', {
        projectId,
        ids: delNodeIds
      });
    }).catch((err) => {
      console.error(err);
    });
  }
  if (silent) { //不提示用户删除，静默删除
    deleteOperation();
    return;
  }
  ElMessageBox.confirm(deleteTip, t('提示'), {
    confirmButtonText: t('确定'),
    cancelButtonText: t('取消'),
    type: 'warning',
  }).then(() => {
    deleteOperation();
  }).catch((err) => {
    if (err === 'cancel' || err === 'close') {
      return;
    }
    console.error(err);
  });
}
/**
 * 新增文件和文件夹回调
 */
export function addFileAndFolderCb(currentOperationalNode: Ref<ApidocBanner | null>, data: ApidocBanner): void {
  const { banner } = store.state['apidoc/banner'];
  if (currentOperationalNode.value) { //插入到某个节点下面
    if (data.type === 'folder') {
      const lastFolderIndex = currentOperationalNode.value.children.findIndex((node) => !node.isFolder)
      if (lastFolderIndex === -1) {
        store.commit('apidoc/banner/splice', {
          start: currentOperationalNode.value.children.length,
          deleteCount: 0,
          item: data,
          opData: currentOperationalNode.value.children,
        })
      } else {
        store.commit('apidoc/banner/splice', {
          start: lastFolderIndex,
          deleteCount: 0,
          item: data,
          opData: currentOperationalNode.value.children,
        })
      }
    } else { //如果是文本
      store.commit('apidoc/banner/splice', {
        start: currentOperationalNode.value.children.length,
        deleteCount: 0,
        item: data,
        opData: currentOperationalNode.value.children,
      });
    }
  } else { //插入到根节点
    // eslint-disable-next-line no-lonely-if
    if (data.type === 'folder') {
      const lastFolderIndex = banner.findIndex((node) => !node.isFolder);
      if (lastFolderIndex === -1) {
        store.commit('apidoc/banner/splice', {
          start: banner.length,
          deleteCount: 0,
          item: data,
        })
      } else {
        store.commit('apidoc/banner/splice', {
          start: lastFolderIndex,
          deleteCount: 0,
          item: data,
        })
      }
    } else { //如果是文本
      store.commit('apidoc/banner/splice', {
        start: banner.length,
        deleteCount: 0,
        item: data,
      })
    }
  }
  if (!data.isFolder) {
    const projectId = router.currentRoute.value.query.id;
    store.commit('apidoc/tabs/addTab', {
      _id: data._id,
      projectId,
      tabType: 'doc',
      label: data.name,
      saved: true,
      fixed: true,
      selected: true,
      head: {
        icon: data.method,
      },
    })
  }
}
/**
 * 粘贴某个节点
 * 转换逻辑如下
 * 1. 将所有嵌套数据取出变为扁平一维数组
 * 2. 根据_id去重所有节点
 * 3. 从去重数据中寻找无父元素的节点(pid在数组中无_id对应)
 * 4. 将这些
 */
export function pasteNodes(currentOperationalNode: Ref<ApidocBanner | null>, pastedNodes: ApidocBanner[]): Promise<ApidocBanner[]> {
  const copyPasteNodes: ApidocBanner[] = JSON.parse(JSON.stringify(pastedNodes));
  return new Promise((resolve, reject) => {
    const flatNodes: ApidocBanner[] = [];
    copyPasteNodes.forEach((pasteNode) => {
      flatNodes.push(...flatTree(pasteNode))
    })
    const uniqueFlatNodes = uniqueByKey(flatNodes, '_id');
    const params = {
      projectId: router.currentRoute.value.query.id,
      mountedId: currentOperationalNode.value?._id,
      docs: uniqueFlatNodes.map((v) => ({
        _id: v._id,
        pid: v.pid,
      })),
    };
    request.post<Response<MapId[]>, Response<MapId[]>>('/api/project/paste_docs', params).then((res) => {
      const mapIds = res.data;
      forEachForest(copyPasteNodes, (node) => {
        const matchedIdInfo = mapIds.find((v) => v.oldId === node._id)
        if (matchedIdInfo) {
          node._id = matchedIdInfo.newId;
          node.pid = matchedIdInfo.newPid;
        }
      });
      copyPasteNodes.forEach((pasteNode) => {
        pasteNode.pid = currentOperationalNode.value?._id || '';
        addFileAndFolderCb(currentOperationalNode, pasteNode);
      })
      resolve(copyPasteNodes);
    }).catch((err) => {
      console.error(err);
      reject(err);
    });
  })
}

/**
 * 生成文件副本
 */
export function forkNode(currentOperationalNode: ApidocBanner): void {
  const { banner } = store.state['apidoc/banner'];
  const projectId = router.currentRoute.value.query.id;
  const params = {
    _id: currentOperationalNode._id,
    projectId,
  };
  request.post<Response<ApidocBanner>, Response<ApidocBanner>>('/api/project/copy_doc', params).then((res) => {
    const pData = findParentById(banner, currentOperationalNode._id, { idKey: '_id' });
    if (!pData) {
      store.commit('apidoc/banner/splice', {
        start: banner.length,
        deleteCount: 0,
        item: res.data,
      })
    } else {
      store.commit('apidoc/banner/splice', {
        start: pData.children.length,
        deleteCount: 0,
        item: res.data,
        opData: pData.children
      })
    }
  }).catch((err) => {
    console.error(err);
  });
}

/**
 * 拖拽节点
 */
export function dragNode(dragData: ApidocBanner, dropData: ApidocBanner, type: 'before' | 'after' | 'inner'): void {
  const { banner } = store.state['apidoc/banner'];
  const params = {
    _id: dragData._id, //当前节点id
    pid: '', //父元素
    sort: 0, //当前节点排序效果
    projectId: router.currentRoute.value.query.id,
  };
  const pData = findParentById(banner, dragData._id, { idKey: '_id' });
  params.pid = pData ? pData._id : '';
  if (type === 'inner') {
    params.sort = Date.now();
  } else {
    const nextSibling = findNextSiblingById<ApidocBanner>(banner, dragData._id, { idKey: '_id' });
    const previousSibling = findPreviousSiblingById<ApidocBanner>(banner, dragData._id, { idKey: '_id' });
    const previousSiblingSort = previousSibling ? previousSibling.sort : 0;
    const nextSiblingSort = nextSibling ? nextSibling.sort : Date.now();
    params.sort = (nextSiblingSort + previousSiblingSort) / 2;
    dragData.sort = (nextSiblingSort + previousSiblingSort) / 2;
  }
  request.put('/api/project/change_doc_pos', params).catch((err) => {
    console.error(err);
  });
}

let isRename = false;
/**
 * 重命名节点
 */
export function renameNode(e: FocusEvent | KeyboardEvent, data: ApidocBanner): void {
  if (isRename) {
    return;
  }
  const projectId = router.currentRoute.value.query.id;
  const iptValue = (e.target as HTMLInputElement).value;
  const originValue = data.name;
  (e.target as HTMLInputElement).classList.remove('error');
  if (iptValue.trim() === '') {
    return;
  }
  isRename = true;
  //改变banner中当前节点名称
  store.commit('apidoc/banner/changeBannerInfoById', {
    id: data._id,
    field: 'name',
    value: iptValue,
  });
  //改变tabs名称
  store.commit('apidoc/tabs/changeTabInfoById', {
    id: data._id,
    field: 'label',
    value: iptValue,
  });
  //改变apidoc名称
  store.commit('apidoc/apidoc/changeApidocName', iptValue);
  //=========================================================================//
  const params = {
    _id: data._id,
    projectId,
    name: iptValue,
  };
  request.put('/api/project/change_doc_info', params).catch((err) => {
    console.error(err);
    store.commit('apidoc/banner/changeBannerInfoById', {
      id: data._id,
      field: 'name',
      value: originValue,
    });
    store.commit('apidoc/apidoc/changeApidocName', originValue);
  }).finally(() => {
    isRename = false;
  });
}
