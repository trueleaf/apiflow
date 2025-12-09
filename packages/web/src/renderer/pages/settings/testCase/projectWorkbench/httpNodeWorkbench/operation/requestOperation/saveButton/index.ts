import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "saveButton",
  description: "保存按钮",
  children: [],
  atomicFunc: [
  {
    "purpose": "无任何数据变更时候可以点击保存按钮",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,无任何修改"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "直接点击保存按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "保存成功,无错误提示"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "保存逻辑允许无变更时保存"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "允许无变更保存确保用户操作自由度"
      }
    ]
  },
  {
    "purpose": "存在数据变更点击保存按钮,未保存小圆点消失,刷新页面数据保持不变",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "修改任意字段(如url)"
      },
      {
        "id": "2",
        "name": "观察保存按钮出现未保存小圆点"
      },
      {
        "id": "3",
        "name": "点击保存按钮"
      },
      {
        "id": "4",
        "name": "刷新页面"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "保存后小圆点消失"
      },
      {
        "id": "2",
        "name": "刷新页面后数据保持修改后的值"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "未保存标识通过isDirty或hasChanges变量控制"
      },
      {
        "id": "2",
        "name": "保存后更新IndexedDB或调用服务器API"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "小圆点提示用户有未保存的修改"
      }
    ]
  },
  {
    "purpose": "验证每一个录入项(请求方法,请求url,query参数key,query参数value,query参数备注,query参数是否发送,query参数是否必有,query参数顺序,query参数个数,body参数mode,body参数值,请求头,返回参数,前置脚本,后置脚本,备注)变更后,保存按钮小圆点消失,刷新页面数据保持不变",
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
        "name": "每次修改后点击保存"
      },
      {
        "id": "3",
        "name": "刷新页面验证数据持久化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "所有录入项修改后保存成功,小圆点消失,刷新后数据不丢失"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "所有字段变更都触发isDirty标识"
      },
      {
        "id": "2",
        "name": "保存时完整序列化所有字段到存储层"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "全字段验证确保数据完整性"
      }
    ]
  }
],
}

export default node
