import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "refreshButton",
  description: "刷新按钮",
  children: [],
  atomicFunc: [
  {
    "purpose": "刷新按钮点击后,清空修改的值",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,修改了部分字段但未保存"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "修改url等字段"
      },
      {
        "id": "2",
        "name": "点击刷新按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "所有修改的值恢复为上次保存的值"
      },
      {
        "id": "2",
        "name": "未保存小圆点消失"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "刷新按钮重新从IndexedDB或服务器加载数据"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "刷新功能用于撤销未保存的修改"
      }
    ]
  },
  {
    "purpose": "验证每一个录入项(请求方法,请求url,query参数key,query参数value,query参数备注,query参数是否发送,query参数是否必有,query参数顺序,query参数个数,body参数mode,body参数值,请求头,返回参数,前置脚本,后置脚本,备注)变更后,刷新页面数据恢复",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "逐一修改每个录入项"
      },
      {
        "id": "2",
        "name": "每次修改后点击刷新按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "所有录入项修改后点击刷新,数据全部恢复为原值"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "刷新按钮重新加载所有字段"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "全字段验证确保刷新功能完整性"
      }
    ]
  }
],
}

export default node
