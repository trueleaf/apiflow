import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "urlencodedBodyValidation",
  description: "urlencoded类型body验证",
  children: [],
  atomicFunc: [
  {
    "purpose": "调用echo接口验证urlencoded参数是否正常返回,content-type是否设置正确",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "Echo服务可用"
    ],
    "operationSteps": [
      "1. 选择POST方法",
      "2. 在Body区域选择URLEncoded类型",
      "3. 添加参数字段:username=test, password=123456, remember=true",
      "4. 发送请求",
      "5. 检查Content-Type和响应"
    ],
    "expectedResults": [
      "URLEncoded数据正确编码和发送",
      "Content-Type自动设置为application/x-www-form-urlencoded",
      "Echo返回解析后的参数",
      "参数值正确显示",
      "状态码为200"
    ],
    "checkpoints": [
      "验证URLEncoded格式",
      "验证Content-Type正确",
      "验证参数编码",
      "验证特殊字符处理"
    ],
    "notes": [
      "此测试验证URLEncoded body类型",
      "这是表单提交的常见格式"
    ]
  }
],
}

export default node
