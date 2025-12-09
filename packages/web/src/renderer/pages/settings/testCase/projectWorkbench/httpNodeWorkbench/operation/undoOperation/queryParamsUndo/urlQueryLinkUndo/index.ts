import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "urlQueryLinkUndo",
  description: "url与query参数联动撤销",
  children: [],
  atomicFunc: [
  {
    "purpose": "请求url中粘贴http://demo.com/user?id=3,blur后,点击撤销按钮,删除query参数,再次点击撤销按钮,url值为空,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,url输入框为空"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在url输入框粘贴http://demo.com/user?id=3"
      },
      {
        "id": "2",
        "name": "失焦(blur)触发url解析,query参数自动提取到query参数表格"
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
        "name": "第一次撤销后query参数表格清空,url恢复为http://demo.com/user?id=3"
      },
      {
        "id": "2",
        "name": "第二次撤销后url值为空"
      },
      {
        "id": "3",
        "name": "撤销按钮置灰不可点击,ctrl+z无反应"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "url blur事件触发query参数解析并记录操作历史"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "url与query参数联动,blur时自动解析query参数"
      }
    ]
  },
  {
    "purpose": "请求url中粘贴http://demo.com/user?id=3,blur后,点击ctrl+z,删除query参数,再次按ctrl+z,url值为空,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,url输入框为空"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在url输入框粘贴http://demo.com/user?id=3"
      },
      {
        "id": "2",
        "name": "失焦(blur)触发url解析,query参数自动提取到query参数表格"
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
        "name": "第一次按快捷键后query参数表格清空,url恢复为http://demo.com/user?id=3"
      },
      {
        "id": "2",
        "name": "第二次按快捷键后url值为空"
      },
      {
        "id": "3",
        "name": "撤销按钮置灰不可点击,继续按ctrl+z无反应"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "快捷键撤销url解析操作"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "快捷键撤销与按钮行为一致"
      }
    ]
  }
],
}

export default node
