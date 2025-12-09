import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "noneBodyValidation",
  description: "none类型body验证",
  children: [],
  atomicFunc: [
  {
    "purpose": "调用echo接口验证body为none请求是否正常返回,content-type是否正确",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "Echo服务可用"
    ],
    "operationSteps": [
      "1. 选择GET或DELETE方法",
      "2. 在Body区域选择None类型(不发送body)",
      "3. 发送请求",
      "4. 检查请求是否正确"
    ],
    "expectedResults": [
      "请求正确发送,不包含body",
      "Content-Type不被设置(或自动处理)",
      "Echo返回正确响应",
      "状态码为200"
    ],
    "checkpoints": [
      "验证不发送body",
      "验证Content-Type处理",
      "验证请求成功"
    ],
    "notes": [
      "此测试验证None类型body(无body请求)",
      "GET/DELETE请求通常不需要body"
    ]
  }
],
}

export default node
