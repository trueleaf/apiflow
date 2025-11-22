<template>
  <div class="test-case">
    <div class="test-case-header">
      <h2>{{ $t('测试案例') }}</h2>
      <el-input
        v-model="searchText"
        :placeholder="$t('搜索测试案例')"
        clearable
        class="search-input"
      >
        <template #prefix>
          <Search :size="16" />
        </template>
      </el-input>
    </div>

    <div class="test-case-content">
      <div class="tree-panel">
        <el-tree
          ref="treeRef"
          :data="treeData"
          :props="treeProps"
          :filter-node-method="filterNode"
          node-key="id"
          highlight-current
          default-expand-all
          @node-click="handleNodeClick"
        >
          <template #default="{ data }">
            <div class="tree-node">
              <component :is="getNodeIcon(data)" :size="14" class="node-icon" />
              <span class="node-label">{{ data.description || data.modelName }}</span>
              <span v-if="data.atomicFunc?.length" class="case-count">
                {{ data.atomicFunc.length }}
              </span>
            </div>
          </template>
        </el-tree>
      </div>

      <div class="detail-panel">
        <template v-if="selectedNode">
          <div class="detail-header">
            <h3>{{ selectedNode.description || selectedNode.modelName }}</h3>
            <span class="model-name">{{ selectedNode.modelName }}</span>
          </div>

          <template v-if="selectedNode.atomicFunc?.length">
            <div class="atomic-func-list">
              <div
                v-for="(func, index) in selectedNode.atomicFunc"
                :key="index"
                class="atomic-func-item"
              >
                <div class="func-header">
                  <span class="func-index">{{ index + 1 }}</span>
                  <span class="func-purpose">{{ func.purpose }}</span>
                </div>

                <div v-if="func.precondition.length" class="func-section">
                  <span class="section-label">{{ $t('前置条件') }}:</span>
                  <ul>
                    <li v-for="item in func.precondition" :key="item.id">{{ item.name }}</li>
                  </ul>
                </div>

                <div v-if="func.operationSteps.length" class="func-section">
                  <span class="section-label">{{ $t('操作步骤') }}:</span>
                  <ol>
                    <li v-for="item in func.operationSteps" :key="item.id">{{ item.name }}</li>
                  </ol>
                </div>

                <div v-if="func.expectedResults.length" class="func-section">
                  <span class="section-label">{{ $t('预期结果') }}:</span>
                  <ul>
                    <li v-for="item in func.expectedResults" :key="item.id">{{ item.name }}</li>
                  </ul>
                </div>

                <div v-if="func.checkpoints.length" class="func-section">
                  <span class="section-label">{{ $t('检查点') }}:</span>
                  <ul>
                    <li v-for="item in func.checkpoints" :key="item.id">{{ item.name }}</li>
                  </ul>
                </div>

                <div v-if="func.notes.length" class="func-section">
                  <span class="section-label">{{ $t('备注') }}:</span>
                  <ul>
                    <li v-for="item in func.notes" :key="item.id">{{ item.name }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <el-empty :description="$t('该节点暂无测试用例')" />
          </template>
        </template>

        <template v-else>
          <el-empty :description="$t('请选择一个节点查看详情')" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search, Folder, FileCode, Globe, Plug, Server } from 'lucide-vue-next'
import { testCase, type ModelNode } from './testCaseData'

interface TreeNode extends ModelNode {
  id: string;
}

const treeRef = ref()
const searchText = ref('')
const selectedNode = ref<TreeNode | null>(null)

const treeProps = {
  children: 'children',
  label: 'description',
}

// 递归添加 id
const addIds = (nodes: ModelNode[], parentId = ''): TreeNode[] => {
  return nodes.map((node, index) => {
    const id = parentId ? `${parentId}-${index}` : `${index}`
    return {
      ...node,
      id,
      children: node.children ? addIds(node.children, id) : [],
    }
  })
}

const treeData = computed(() => addIds(testCase))

// 根据节点类型返回图标
const getNodeIcon = (data: TreeNode) => {
  if (data.children?.length) {
    return Folder
  }
  if (data.modelName.includes('http')) {
    return Globe
  }
  if (data.modelName.includes('websocket')) {
    return Plug
  }
  if (data.modelName.includes('mock')) {
    return Server
  }
  return FileCode
}

// 过滤节点
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const filterNode = (value: string, data: any): boolean => {
  if (!value) return true
  const searchLower = value.toLowerCase()
  const node = data as TreeNode
  return Boolean(
    node.modelName?.toLowerCase().includes(searchLower) ||
    node.description?.toLowerCase().includes(searchLower) ||
    node.atomicFunc?.some(func => func.purpose.toLowerCase().includes(searchLower))
  )
}

// 监听搜索文本变化
watch(searchText, (val) => {
  treeRef.value?.filter(val)
})

// 处理节点点击
const handleNodeClick = (data: TreeNode) => {
  selectedNode.value = data
}
</script>

<style lang="scss" scoped>
.test-case {
  height: 100%;
  display: flex;
  flex-direction: column;

  .test-case-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .search-input {
      width: 300px;
    }
  }

  .test-case-content {
    flex: 1;
    display: flex;
    gap: 16px;
    overflow: hidden;

    .tree-panel {
      width: 350px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 12px;
      overflow-y: auto;
      background-color: var(--bg-color);

      .tree-node {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 2px 0;

        .node-icon {
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .node-label {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .case-count {
          background-color: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
          padding: 0 6px;
          border-radius: 10px;
          font-size: 12px;
          flex-shrink: 0;
        }
      }
    }

    .detail-panel {
      flex: 1;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 16px;
      overflow-y: auto;
      background-color: var(--bg-color);

      .detail-header {
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--border-color);

        h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .model-name {
          font-size: 12px;
          color: var(--text-secondary);
          font-family: monospace;
        }
      }

      .atomic-func-list {
        display: flex;
        flex-direction: column;
        gap: 16px;

        .atomic-func-item {
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background-color: var(--bg-sidebar);

          .func-header {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            margin-bottom: 8px;

            .func-index {
              background-color: var(--el-color-primary);
              color: white;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              flex-shrink: 0;
            }

            .func-purpose {
              flex: 1;
              font-weight: 500;
              line-height: 1.4;
              color: var(--text-primary);
            }
          }

          .func-section {
            margin-top: 8px;
            padding-left: 28px;

            .section-label {
              font-size: 12px;
              color: var(--text-secondary);
              font-weight: 500;
            }

            ul, ol {
              margin: 4px 0 0 0;
              padding-left: 16px;

              li {
                font-size: 13px;
                color: var(--text-primary);
                line-height: 1.5;
              }
            }
          }
        }
      }
    }
  }
}
</style>
