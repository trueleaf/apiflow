<template>
  <div class="module-tree">
    <div class="tree-header">
      <h3>测试模块</h3>
    </div>
    <el-tree
      ref="treeRef"
      :data="treeData"
      :props="defaultProps"
      :highlight-current="true"
      :expand-on-click-node="false"
      default-expand-all
      node-key="id"
      @node-click="handleNodeClick"
    >
      <template #default="{ node, data }">
        <span class="custom-tree-node">
          <el-icon v-if="data.children" style="margin-right: 5px">
            <Folder />
          </el-icon>
          <el-icon v-else style="margin-right: 5px">
            <Document />
          </el-icon>
          <span>{{ node.label }}</span>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Folder, Document } from '@element-plus/icons-vue'
import type { ModuleTreeNode } from '../types'

// 定义 props
const props = defineProps<{
  treeData: ModuleTreeNode[]
  defaultSelectedKey?: string
}>()

// 定义 emits
const emit = defineEmits<{
  nodeClick: [node: ModuleTreeNode]
}>()

// Tree 组件引用
const treeRef = ref()

// Tree 组件配置
const defaultProps = {
  children: 'children',
  label: 'label'
}

// 查找第一个叶子节点（有 moduleId 的节点）
const findFirstLeafNode = (nodes: ModuleTreeNode[]): ModuleTreeNode | null => {
  for (const node of nodes) {
    if (node.moduleId) {
      return node
    }
    if (node.children && node.children.length > 0) {
      const found = findFirstLeafNode(node.children)
      if (found) return found
    }
  }
  return null
}

// 根据 moduleId 查找节点
const findNodeByModuleId = (nodes: ModuleTreeNode[], moduleId: string): ModuleTreeNode | null => {
  for (const node of nodes) {
    if (node.moduleId === moduleId) {
      return node
    }
    if (node.children && node.children.length > 0) {
      const found = findNodeByModuleId(node.children, moduleId)
      if (found) return found
    }
  }
  return null
}

// 设置当前选中节点
const setCurrentNode = (moduleId: string) => {
  if (!treeRef.value) return
  
  const node = findNodeByModuleId(props.treeData, moduleId)
  if (node) {
    nextTick(() => {
      treeRef.value?.setCurrentKey(node.id)
    })
  }
}

// 初始化选中状态
const initSelection = () => {
  if (!treeRef.value || !props.treeData || props.treeData.length === 0) return

  let targetNode: ModuleTreeNode | null = null

  // 如果有默认选中的 key，尝试恢复
  if (props.defaultSelectedKey) {
    targetNode = findNodeByModuleId(props.treeData, props.defaultSelectedKey)
  }

  // 如果没有找到，选中第一个叶子节点
  if (!targetNode) {
    targetNode = findFirstLeafNode(props.treeData)
  }

  if (targetNode) {
    nextTick(() => {
      treeRef.value?.setCurrentKey(targetNode!.id)
      emit('nodeClick', targetNode!)
    })
  }
}

// 节点点击处理
const handleNodeClick = (data: ModuleTreeNode) => {
  // 只有叶子节点才触发事件（即有 moduleId 的节点）
  if (data.moduleId) {
    emit('nodeClick', data)
  }
}

// 暴露方法给父组件
defineExpose({
  setCurrentNode,
  initSelection
})

// 组件挂载后初始化选中状态
onMounted(() => {
  nextTick(() => {
    initSelection()
  })
})
</script>

<style scoped>
.module-tree {
  height: 100%;
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tree-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.tree-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  font-size: 14px;
}

:deep(.el-tree-node__content) {
  height: 36px;
  border-radius: 4px;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #ecf5ff;
  color: #409eff;
}
</style>
