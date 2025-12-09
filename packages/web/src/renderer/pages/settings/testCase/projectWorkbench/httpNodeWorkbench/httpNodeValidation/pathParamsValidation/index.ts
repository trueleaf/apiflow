import { type ModelNode } from '../../../../types'

const node: ModelNode = {
  modelName: "pathParamsValidation",
  description: "path参数验证",
  children: [],
  atomicFunc: [
  {
    "purpose": "调用echo接口验证path参数是否正常返回",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "Echo服务支持path参数(如/api/users/:id/posts/:postId)"
    ],
    "operationSteps": [
      "1. 设置URL包含path参数占位符(如http://api.example.com/users/:userId/posts/:postId)",
      "2. 在Path参数区域添加实际参数值:userId=123, postId=456",
      "3. 发送请求",
      "4. 查看实际请求的URL",
      "5. 验证响应中的参数值"
    ],
    "expectedResults": [
      "Path参数占位符被正确替换",
      "最终请求URL为/users/123/posts/456",
      "请求发送成功,响应为200",
      "Echo返回的path值与输入的参数一致",
      "多个path参数都能正确替换"
    ],
    "checkpoints": [
      "验证path参数占位符被正确识别",
      "验证参数值正确替换到URL中",
      "验证URL编码正确",
      "验证多个path参数的替换",
      "验证中文path参数的处理"
    ],
    "notes": [
      "此测试验证RESTful API的path参数支持",
      "Path参数通常用于RESTful API设计",
      "需要确保参数占位符的识别和替换"
    ]
  }
],
}

export default node
