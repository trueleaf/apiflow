import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "pathDragUndo",
  description: "path参数拖拽撤销",
  children: [],
  atomicFunc: [
  {
    "purpose": "已存在三个path项ABC,将A拖拽到BC中间,再将A拖拽到C下方,点击撤销按钮,顺序变为BAC,再次点击撤销按钮,顺序变为ABC,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,path参数表格存在三个参数A,B,C(顺序为ABC)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "拖拽参数A到B,C中间,顺序变为BAC"
      },
      {
        "id": "2",
        "name": "拖拽参数A到C下方,顺序变为BCA"
      },
      {
        "id": "3",
        "name": "点击撤销按钮"
      },
      {
        "id": "4",
        "name": "再次点击撤销按钮"
      },
      {
        "id": "5",
        "name": "尝试继续按ctrl+z"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "第一次撤销后顺序恢复为BAC"
      },
      {
        "id": "2",
        "name": "第二次撤销后顺序恢复为ABC"
      },
      {
        "id": "3",
        "name": "撤销按钮置灰不可点击,ctrl+z无反应"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "每次拖拽操作记录到操作历史栈"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "拖拽调整顺序操作可以撤销"
      }
    ]
  },
  {
    "purpose": "已存在三个path项ABC,将A拖拽到BC中间,再将A拖拽到C下方,按ctrl+z,顺序变为BAC,再次按ctrl+z,顺序变为ABC,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,path参数表格存在三个参数A,B,C(顺序为ABC)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "拖拽参数A到B,C中间,顺序变为BAC"
      },
      {
        "id": "2",
        "name": "拖拽参数A到C下方,顺序变为BCA"
      },
      {
        "id": "3",
        "name": "按ctrl+z快捷键"
      },
      {
        "id": "4",
        "name": "再次按ctrl+z快捷键"
      },
      {
        "id": "5",
        "name": "尝试继续按ctrl+z"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "第一次按快捷键后顺序恢复为BAC"
      },
      {
        "id": "2",
        "name": "第二次按快捷键后顺序恢复为ABC"
      },
      {
        "id": "3",
        "name": "撤销按钮置灰不可点击,继续按ctrl+z无反应"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "快捷键撤销拖拽操作"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "快捷键与撤销按钮行为一致"
      }
    ]
  }
],
}

export default node
