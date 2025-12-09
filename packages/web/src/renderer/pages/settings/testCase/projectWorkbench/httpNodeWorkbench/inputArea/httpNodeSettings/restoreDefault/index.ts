import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "restoreDefault",
  description: "恢复默认",
  children: [],
  atomicFunc: [
  {
    "purpose": "点击恢复默认按钮,所有配置项恢复为默认值",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点的设置面板"
      },
      {
        "id": "2",
        "name": "已修改了多个配置项"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "修改设置面板中的多个配置项"
      },
      {
        "id": "2",
        "name": "找到\"恢复默认\"按钮"
      },
      {
        "id": "3",
        "name": "点击该按钮"
      },
      {
        "id": "4",
        "name": "观察所有配置项是否恢复为默认值"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "所有修改的配置项都被恢复"
      },
      {
        "id": "2",
        "name": "配置值恢复为系统默认值"
      },
      {
        "id": "3",
        "name": "可能显示确认提示"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "恢复默认功能正常工作"
      },
      {
        "id": "2",
        "name": "所有配置项都被重置"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "恢复默认可以快速重置所有自定义配置"
      }
    ]
  },
  {
    "purpose": "恢复默认后刷新页面,配置保持为默认值",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点的设置面板"
      },
      {
        "id": "2",
        "name": "已修改过配置项并恢复为默认值"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "修改多个配置项"
      },
      {
        "id": "2",
        "name": "点击恢复默认按钮"
      },
      {
        "id": "3",
        "name": "保存设置"
      },
      {
        "id": "4",
        "name": "刷新整个页面"
      },
      {
        "id": "5",
        "name": "重新打开设置面板"
      },
      {
        "id": "6",
        "name": "验证所有配置是否仍为默认值"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "配置成功恢复为默认值"
      },
      {
        "id": "2",
        "name": "保存后默认值被持久化"
      },
      {
        "id": "3",
        "name": "刷新后默认值保持不变"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "默认值配置持久化正确"
      },
      {
        "id": "2",
        "name": "刷新不会改变恢复后的配置"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "恢复默认的配置需要被正确保存"
      }
    ]
  }
],
}

export default node
