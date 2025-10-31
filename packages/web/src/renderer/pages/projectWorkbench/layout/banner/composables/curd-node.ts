import { Ref } from 'vue'
import 'element-plus/es/components/message-box/style/css';
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ApidocBanner, CommonResponse, HttpNode, FolderNode } from '@src/types'
import { WebSocketNode } from '@src/types/websocketNode'
import { uniqueByKey } from '@/helper/common'
import { findNodeById, findParentById, findSiblingById, flatTree, forEachForest } from '@/helper/tree'
import { router } from '@/router/index'
import { request } from '@/api/api'
import { i18n } from '@/i18n'
import { useApidocBanner } from '@/store/share/bannerStore';
import { useApidocTas } from '@/store/share/tabsStore';
import { useApidoc } from '@/store/share/apidocStore';
import { useApidocBaseInfo } from '@/store/share/baseInfoStore.ts';
import { apiNodesCache } from '@/cache/index';
import { nanoid } from 'nanoid';
import { useRuntime } from '@/store/runtime/runtimeStore';

type MapId = {
  oldId: string, //历史id
  newId: string, //新id
  oldPid: string, //历史pid
  newPid: string, //新pid
};
//带projectId的banner数据
type ApidocBannerWithProjectId = ApidocBanner & { projectId: string }
const isOffline = () => useRuntime().networkMode === 'offline';
/**
 * 删除某个(多个)节点
 */
export const deleteNode = (selectNodes: ApidocBannerWithProjectId[], silent?: boolean): void => {
  const apidocBannerStore = useApidocBanner();
  const apidocTabsStore = useApidocTas()
  const currentProjectId = router.currentRoute.value.query.id;
  const nodeProjectId = selectNodes[0]?.projectId;
  const deleteIds: string[] = [];
  selectNodes.forEach((node) => {
    deleteIds.push(node._id); //删除自己
    if (node.type === 'folder') { //如果是文件夹则删除所有子元素
      forEachForest(node.children, (item) => {
        if (!deleteIds.find((id) => id === item._id)) {
          deleteIds.push(item._id);
        }
      });
    }
  })
  const deleteTip = selectNodes.length > 1 ? `${i18n.global.t('确定批量删除')} ${deleteIds.length} ${i18n.global.t('个节点?')}` : `${i18n.global.t('确定删除')} ${selectNodes[0].name} ${i18n.global.t('节点')}`
  const deleteOperation = async () => {
    if(isOffline()){
      await apiNodesCache.deleteNodes(deleteIds);
      await apidocBannerStore.getDocBanner({ projectId: nodeProjectId });
      //删除所有nav节点
      const delNodeIds: string[] = [];
      forEachForest(selectNodes, (node) => {
        if (node.type !== 'folder') {
          delNodeIds.push(node._id);
        }
      })
      apidocTabsStore.deleteTabByIds({
        projectId: nodeProjectId,
        ids: delNodeIds,
        force: true,
      })
      event.emit('apidoc/deleteDocs')
      return
    }
    const params = {
      data: {
        projectId: nodeProjectId,
        ids: deleteIds,
      },
    };
    request.delete('/api/project/doc', params).then(() => {
      if (currentProjectId === nodeProjectId) { //非跨项目删除
        selectNodes.forEach((node) => {
          const deletePid = node.pid;
          if (!deletePid) { //不存在pid代表在根元素删除
            const delIndex = apidocBannerStore.banner.findIndex((val) => val._id === node._id);
            apidocBannerStore.splice({
              start: delIndex,
              deleteCount: 1,
            })
          } else {
            const parentNode = findNodeById(apidocBannerStore.banner, node.pid, {
              idKey: '_id',
            });
            const delIndex = parentNode?.children.findIndex((val) => val._id === node._id);
            if (delIndex != null) {
              apidocBannerStore.splice({
                start: delIndex,
                deleteCount: 1,
                opData: parentNode?.children,
              })
            }
          }
        })
      }
      //删除所有nav节点
      const delNodeIds: string[] = [];
      forEachForest(selectNodes, (node) => {
        if (node.type !== 'folder') {
          delNodeIds.push(node._id);
        }
      })
      apidocTabsStore.deleteTabByIds({
        projectId: nodeProjectId,
        ids: delNodeIds,
        force: true,
      })
      event.emit('apidoc/deleteDocs')
    }).catch((err) => {
      console.error(err);
    });
  }
  if (silent) { //不提示用户删除，静默删除
    deleteOperation();
    return;
  }
  ElMessageBox.confirm(deleteTip, i18n.global.t('提示'), {
    confirmButtonText: i18n.global.t('确定'),
    cancelButtonText: i18n.global.t('取消'),
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
export const addFileAndFolderCb = (currentOperationalNode: Ref<ApidocBanner | null>, data: ApidocBanner): void => {
  const apidocBannerStore = useApidocBanner();
  const apidocBaseInfoStore = useApidocBaseInfo();
  const apidocTabsStore = useApidocTas()
  if (currentOperationalNode.value) { //插入到某个节点下面
    if (data.type === 'folder') {
      const lastFolderIndex = currentOperationalNode.value.children.findIndex((node) => node.type !== 'folder')
      if (lastFolderIndex === -1) {
        apidocBannerStore.splice({
          start: currentOperationalNode.value.children.length,
          deleteCount: 0,
          item: data,
          opData: currentOperationalNode.value.children,
        })
      } else {
        apidocBannerStore.splice({
          start: lastFolderIndex,
          deleteCount: 0,
          item: data,
          opData: currentOperationalNode.value.children,
        })
      }
    } else if (data) { //如果是http接口或者websocket接口
      apidocBannerStore.splice({
        start: currentOperationalNode.value.children.length,
        deleteCount: 0,
        item: data,
        opData: currentOperationalNode.value.children,
      })
    }
  } else { //插入到根节点
    if (data.type === 'folder') {
      const lastFolderIndex = apidocBannerStore.banner.findIndex((node) => node.type !== 'folder');
      if (lastFolderIndex === -1) {
        apidocBannerStore.splice({
          start: apidocBannerStore.banner.length,
          deleteCount: 0,
          item: data,
        })
      } else {
        apidocBannerStore.splice({
          start: lastFolderIndex,
          deleteCount: 0,
          item: data,
        })
      }
    } else { //如果是api
      apidocBannerStore.splice({
        start: apidocBannerStore.banner.length,
        deleteCount: 0,
        item: data,
      })
    }
  }
  if (data.pid) { //查找
    // 变量找出父节点
    const parentNode = findNodeById(apidocBaseInfoStore.commonHeaders, data.pid, {
      idKey: '_id',
    });
    parentNode?.children.push({
      _id: data._id,
      pid: data.pid,
      type: data.type as 'folder',
      commonHeaders: [],
      children: [],
    });
  } else {
    apidocBaseInfoStore.commonHeaders.push({
      _id: data._id,
      pid: '',
      type: data.type as 'folder',
      commonHeaders: [],
      children: [],
    });
  }
  if (data.type === 'http') {
    const projectId = router.currentRoute.value.query.id as string;
    apidocTabsStore.addTab({
      _id: data._id,
      projectId,
      tabType: 'http',
      label: data.name,
      saved: true,
      fixed: true,
      selected: true,
      head: {
        icon: data.method,
        color: ''
      }
    })
  } else if (data.type === 'websocket') {
    const projectId = router.currentRoute.value.query.id as string;
    apidocTabsStore.addTab({
      _id: data._id,
      projectId,
      tabType: 'websocket',
      label: data.name,
      saved: true,
      fixed: true,
      selected: true,
      head: {
        icon: data.protocol || 'ws',
        color: ''
      }
    })
  } else if (data.type === 'httpMock') {
    const projectId = router.currentRoute.value.query.id as string;
    apidocTabsStore.addTab({
      _id: data._id,
      projectId,
      tabType: 'httpMock',
      label: data.name,
      saved: true,
      fixed: true,
      selected: true,
      head: {
        icon: 'mock',
        color: ''
      }
    })
  } 
  // const banner = await standaloneCache.getDocTree(currentOperationalNode.value);
  // apidocBannerStore.changeAllDocBanner(banner);
}
/**
 * 粘贴某个节点
 * 转换逻辑如下
 * 1. 将所有嵌套数据取出变为扁平一维数组
 * 2. 根据_id去重所有节点
 * 3. 从去重数据中寻找无父元素的节点(pid在数组中无_id对应)
 * 4. 将这些
 */
export const pasteNodes = (currentOperationalNode: Ref<ApidocBanner | null>, pastedNodes: ApidocBannerWithProjectId[]): Promise<ApidocBanner[]> => {
  const copyPasteNodes: ApidocBanner[] = JSON.parse(JSON.stringify(pastedNodes));
  return new Promise(async (resolve, reject) => {
    try {
      if (isOffline()) {
        // Standalone 模式下的优化粘贴逻辑
        const currentProjectId = router.currentRoute.value.query.id as string;
        const fromProjectId = pastedNodes[0].projectId;

        // 1. 获取要粘贴的所有节点（扁平化）
        const flatNodes: ApidocBanner[] = [];
        copyPasteNodes.forEach((pasteNode) => {
          flatNodes.push(...flatTree(pasteNode))
        })
        const uniqueFlatNodes = uniqueByKey(flatNodes, '_id');

        // 2. 如果是跨项目粘贴，需要获取完整的文档数据
        let docsToProcess: any[] = [];
        if (fromProjectId !== currentProjectId) {
          // 跨项目粘贴：使用优化的缓存查询获取完整文档数据
          const sourceProjectDocs = await apiNodesCache.getNodesByProjectId(fromProjectId);
          const sourceDocsMap = new Map(sourceProjectDocs.map(doc => [doc._id, doc]));

          docsToProcess = uniqueFlatNodes.map(node => {
            const fullDoc = sourceDocsMap.get(node._id);
            if (!fullDoc) {
              ElMessage.error(`粘贴的文档 ${node.name} 在原项目中未找到`);
            }
            return fullDoc;
          });
        } else {
          // 同项目内粘贴：直接使用当前项目的数据
          const currentProjectDocs = await apiNodesCache.getNodesByProjectId(currentProjectId);
          const currentDocsMap = new Map(currentProjectDocs.map(doc => [doc._id, doc]));

          docsToProcess = uniqueFlatNodes.map(node => {
            const fullDoc = currentDocsMap.get(node._id);
            if (!fullDoc) {
              ElMessage.error(`粘贴的文档 ${node.name} 在当前项目中未找到`);
            }
            return fullDoc;
          });
        }

        // 3. 生成ID映射并更新文档关系
        const idMapping = new Map<string, string>();
        const processedDocs: any[] = [];

        // 第一步：为所有文档生成新的ID
        for (const doc of docsToProcess) {
          const oldId = doc._id;
          const newId = nanoid();
          idMapping.set(oldId, newId);

          const processedDoc = {
            ...doc,
            _id: newId,
            projectId: currentProjectId,
            updatedAt: new Date().toISOString(),
            // 暂时保留原始pid，稍后会更新
          };

          processedDocs.push(processedDoc);
        }

        // 第二步：更新所有文档的pid关系
        for (const doc of processedDocs) {
          if (doc.pid && idMapping.has(doc.pid)) {
            // 如果父节点也在粘贴的节点中，更新为新的父节点ID
            doc.pid = idMapping.get(doc.pid);
          } else if (doc.pid && !idMapping.has(doc.pid)) {
            // 如果父节点不在粘贴的节点中，说明这是根节点
            doc.pid = currentOperationalNode.value?._id || '';
          } else {
            // 原本就是根节点
            doc.pid = currentOperationalNode.value?._id || '';
          }
        }

        // 4. 批量保存到数据库
        for (const doc of processedDocs) {
          await apiNodesCache.addNode(doc);
        }

        // 5. 更新前端显示的节点ID和关系
        forEachForest(copyPasteNodes, (node) => {
          const newId = idMapping.get(node._id);
          if (newId) {
            node._id = newId;
            // 更新pid关系
            if (node.pid && idMapping.has(node.pid)) {
              node.pid = idMapping.get(node.pid)!;
            } else {
              node.pid = currentOperationalNode.value?._id || '';
            }
          }
        });

        // 6. 更新前端界面
        copyPasteNodes.forEach((pasteNode) => {
          pasteNode.pid = currentOperationalNode.value?._id || '';
          addFileAndFolderCb(currentOperationalNode, pasteNode);
        });

        resolve(copyPasteNodes);
        return;
      }

      // 在线模式的原有逻辑保持不变
      const flatNodes: ApidocBanner[] = [];
      copyPasteNodes.forEach((pasteNode) => {
        flatNodes.push(...flatTree(pasteNode))
      })
      const uniqueFlatNodes = uniqueByKey(flatNodes, '_id');
      const params = {
        projectId: router.currentRoute.value.query.id,
        fromProjectId: pastedNodes[0].projectId,
        mountedId: currentOperationalNode.value?._id,
        docs: uniqueFlatNodes.map((v) => ({
          _id: v._id,
          // pid: v.pid,
        })),
      };
      request.post<CommonResponse<MapId[]>, CommonResponse<MapId[]>>('/api/project/paste_docs', params).then((res) => {
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
    } catch (error) {
      console.error('Paste nodes failed:', error);
      reject(error);
    }
  })
}

/**
 * 生成文件副本
 */
export const forkNode = async (currentOperationalNode: ApidocBanner): Promise<void> => {
  const apidocBannerStore = useApidocBanner();
  const projectId = router.currentRoute.value.query.id as string;

  if (isOffline()) {
    try {
      // Standalone 模式下的文件副本生成逻辑

      // 1. 获取原始文档的完整数据
      const originalDoc = await apiNodesCache.getNodeById(currentOperationalNode._id);
      if (!originalDoc) {
        console.error('原始文档不存在');
        return;
      }

      // 2. 生成副本文档
      const newId = nanoid();
      const copyDoc = {
        ...originalDoc,
        _id: newId,
        updatedAt: new Date().toISOString(),
        info: {
          ...originalDoc.info,
          name: `${originalDoc.info.name}_副本`, // 添加副本后缀
        }
      };

      // 3. 保存副本到数据库
      await apiNodesCache.addNode(copyDoc);

      // 4. 创建用于前端显示的 banner 数据
      let bannerData: ApidocBanner;
      if (copyDoc.info.type === 'http') {
        bannerData = {
          _id: newId,
          updatedAt: copyDoc.updatedAt,
          type: 'http',
          sort: Date.now(), // 使用当前时间戳作为排序
          pid: copyDoc.pid,
          name: copyDoc.info.name,
          maintainer: copyDoc.info.maintainer,
          method: (copyDoc as HttpNode).item.method,
          url: (copyDoc as HttpNode).item.url.path,
          readonly: false,
          children: [],
        };
      } else if (copyDoc.info.type === 'websocket') {
        bannerData = {
          _id: newId,
          updatedAt: copyDoc.updatedAt,
          type: 'websocket',
          sort: Date.now(),
          pid: copyDoc.pid,
          name: copyDoc.info.name,
          maintainer: copyDoc.info.maintainer,
          protocol: (copyDoc as WebSocketNode).item.protocol,
          url: (copyDoc as WebSocketNode).item.url,
          readonly: false,
          children: [],
        };
      } else {
        bannerData = {
          _id: newId,
          updatedAt: copyDoc.updatedAt,
          type: 'folder',
          sort: Date.now(),
          pid: copyDoc.pid,
          name: copyDoc.info.name,
          maintainer: copyDoc.info.maintainer,
          commonHeaders: (copyDoc as FolderNode).commonHeaders || [],
          readonly: false,
          children: [],
        };
      }

      // 5. 更新前端界面
      const pData = findParentById(apidocBannerStore.banner, currentOperationalNode._id, { idKey: '_id' });
      if (!pData) {
        // 插入到根级别
        apidocBannerStore.splice({
          start: apidocBannerStore.banner.length,
          deleteCount: 0,
          item: bannerData,
        });
      } else {
        // 插入到父节点的子级
        apidocBannerStore.splice({
          start: pData.children.length,
          deleteCount: 0,
          item: bannerData,
          opData: pData.children
        });
      }

      return;
    } catch (error) {
      console.error('生成文件副本失败:', error);
      return;
    }
  }

  // 在线模式的原有逻辑保持不变
  const params = {
    _id: currentOperationalNode._id,
    projectId,
  };
  request.post<CommonResponse<ApidocBanner>, CommonResponse<ApidocBanner>>('/api/project/copy_doc', params).then((res) => {
    const pData = findParentById(apidocBannerStore.banner, currentOperationalNode._id, { idKey: '_id' });
    if (!pData) {
      apidocBannerStore.splice({
        start: apidocBannerStore.banner.length,
        deleteCount: 0,
        item: res.data,
      })
    } else {
      apidocBannerStore.splice({
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
export const dragNode = async (dragData: ApidocBanner, dropData: ApidocBanner, type: 'before' | 'after' | 'inner'): Promise<void> => {
  const apidocBannerStore = useApidocBanner();
  const projectId = router.currentRoute.value.query.id as string;

  if (isOffline()) {
    try {
      // Standalone 模式下的拖拽节点逻辑

      // 1. 获取被拖拽文档的完整数据
      const dragDoc = await apiNodesCache.getNodeById(dragData._id);
      if (!dragDoc) {
        ElMessage.error(`拖拽的文档 ${dragData.name} 未找到`);
        return;
      }

      // 2. 计算新的父节点ID和排序值
      let newPid = '';
      let newSort = 0;

      if (type === 'inner') {
        // 拖拽到目标节点内部
        newPid = dropData._id;
        newSort = Date.now();
        dragData.pid = dropData._id;
      } else {
        // 拖拽到目标节点前面或后面
        const pData = findParentById(apidocBannerStore.banner, dropData._id, { idKey: '_id' });
        newPid = pData ? pData._id : '';

        // 计算排序值
        const nextSibling = findSiblingById<ApidocBanner>(apidocBannerStore.banner, dropData._id, 'next', { idKey: '_id' });
        const previousSibling = findSiblingById<ApidocBanner>(apidocBannerStore.banner, dropData._id, 'previous', { idKey: '_id' });

        if (type === 'before') {
          // 拖拽到目标节点前面
          const previousSiblingSort = previousSibling ? previousSibling.sort : 0;
          const dropDataSort = dropData.sort;
          newSort = (previousSiblingSort + dropDataSort) / 2;
        } else {
          // 拖拽到目标节点后面
          const dropDataSort = dropData.sort;
          const nextSiblingSort = nextSibling ? nextSibling.sort : Date.now();
          newSort = (dropDataSort + nextSiblingSort) / 2;
        }

        dragData.sort = newSort;
      }

      // 3. 更新文档数据
      const updatedDoc = {
        ...dragDoc,
        pid: newPid,
        sort: newSort,
        updatedAt: new Date().toISOString(),
      };

      // 4. 保存到数据库
      await apiNodesCache.updateNode(updatedDoc);

      // 5. 更新前端显示的数据
      dragData.pid = newPid;
      dragData.sort = newSort;

      return;
    } catch (error) {
      console.error('拖拽节点失败:', error);
      ElMessage.error('拖拽操作失败，请重试');
      return;
    }
  }

  // 在线模式的原有逻辑保持不变
  const params = {
    _id: dragData._id, //当前节点id
    pid: '', //父元素
    sort: 0, //当前节点排序效果
    projectId,
  };
  const pData = findParentById(apidocBannerStore.banner, dragData._id, { idKey: '_id' });
  params.pid = pData ? pData._id : '';
  if (type === 'inner') {
    params.sort = Date.now();
    dragData.pid = dropData._id;
  } else {
    const nextSibling = findSiblingById<ApidocBanner>(apidocBannerStore.banner, dragData._id, 'next', { idKey: '_id' });
    const previousSibling = findSiblingById<ApidocBanner>(apidocBannerStore.banner, dragData._id, 'previous', { idKey: '_id' });
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
export const renameNode = async (e: FocusEvent | KeyboardEvent, data: ApidocBanner): Promise<void> => {
  const apidocBannerStore = useApidocBanner();
  const apidocTabsStore = useApidocTas()
  const apidocStore = useApidoc()
  const { getCommonHeaders } = useApidocBaseInfo()
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
  apidocBannerStore.changeBannerInfoById({
    id: data._id,
    field: 'name',
    value: iptValue,
  })
  //改变tabs名称
  apidocTabsStore.changeTabInfoById({
    id: data._id,
    field: 'label',
    value: iptValue,
  })
  //改变apidoc名称
  apidocStore.changeApidocName(iptValue);
  //=========================================================================//
  if (isOffline()) {
    try {
      // Standalone 模式下的重命名逻辑
      await apiNodesCache.updateNodeName(data._id, iptValue);

      // 如果是文件夹，需要重新拉取一次公共请求头
      if (data.type === 'folder') {
        getCommonHeaders();
      }

    } catch (error) {
      console.error('重命名失败:', error);

      // 重命名失败时回滚前端状态
      apidocBannerStore.changeBannerInfoById({
        id: data._id,
        field: 'name',
        value: originValue,
      });
      apidocTabsStore.changeTabInfoById({
        id: data._id,
        field: 'label',
        value: originValue,
      });
      apidocStore.changeApidocName(originValue);
    } finally {
      isRename = false;
    }
    return;
  }
  const params = {
    _id: data._id,
    projectId,
    name: iptValue,
  };
  request.put('/api/project/change_doc_info', params).then(() => {
    if (data.type === 'folder') { //如果是文件夹，需要重新拉取一次公共请求头
      getCommonHeaders()
    }
  }).catch((err) => {
    console.error(err);
    apidocBannerStore.changeBannerInfoById({
      id: data._id,
      field: 'name',
      value: originValue,
    });
    apidocStore.changeApidocName(originValue);
  }).finally(() => {
    isRename = false;
  });
}
