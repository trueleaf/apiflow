import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "rawBodyValidation",
  description: "raw类型body验证",
  children: [],
  atomicFunc: [
  {
    "purpose": "调用echo接口验证text格式参数是否正常返回,content-type是否设置正确",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "Echo服务可用"
    ],
    "operationSteps": [
      "1. 选择POST方法",
      "2. 在Body区域选择Raw类型",
      "3. 选择Text格式",
      "4. 输入纯文本内容",
      "5. 发送请求",
      "6. 检查Content-Type和响应"
    ],
    "expectedResults": [
      "纯文本正确发送",
      "Content-Type正确设置为text/plain",
      "Echo返回原始文本内容",
      "状态码为200"
    ],
    "checkpoints": [
      "验证Text格式发送",
      "验证Content-Type正确",
      "验证文本内容完整"
    ],
    "notes": [
      "此测试验证Raw Text类型"
    ]
  },
  {
    "purpose": "调用echo接口验证html格式参数是否正常返回,content-type是否设置正确",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "Echo服务可用"
    ],
    "operationSteps": [
      "1. 选择POST方法",
      "2. 在Body区域选择Raw类型",
      "3. 选择HTML格式",
      "4. 输入HTML内容:<html><body><h1>Test</h1></body></html>",
      "5. 发送请求",
      "6. 检查Content-Type和响应"
    ],
    "expectedResults": [
      "HTML正确发送",
      "Content-Type正确设置为text/html",
      "Echo返回HTML内容",
      "状态码为200"
    ],
    "checkpoints": [
      "验证HTML格式发送",
      "验证Content-Type正确",
      "验证HTML标签完整"
    ],
    "notes": [
      "此测试验证Raw HTML类型"
    ]
  },
  {
    "purpose": "调用echo接口验证xml格式参数是否正常返回,content-type是否设置正确",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "Echo服务可用"
    ],
    "operationSteps": [
      "1. 选择POST方法",
      "2. 在Body区域选择Raw类型",
      "3. 选择XML格式",
      "4. 输入XML内容:<?xml version=\"1.0\"?><root><name>test</name></root>",
      "5. 发送请求",
      "6. 检查Content-Type和响应"
    ],
    "expectedResults": [
      "XML正确发送",
      "Content-Type正确设置为application/xml",
      "Echo返回XML内容",
      "XML格式保留",
      "状态码为200"
    ],
    "checkpoints": [
      "验证XML格式发送",
      "验证Content-Type正确",
      "验证XML结构完整"
    ],
    "notes": [
      "此测试验证Raw XML类型"
    ]
  },
  {
    "purpose": "调用echo接口验证javascript格式参数是否正常返回,content-type是否设置正确",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "Echo服务可用"
    ],
    "operationSteps": [
      "1. 选择POST方法",
      "2. 在Body区域选择Raw类型",
      "3. 选择JavaScript格式",
      "4. 输入JavaScript代码",
      "5. 发送请求",
      "6. 检查Content-Type和响应"
    ],
    "expectedResults": [
      "JavaScript代码正确发送",
      "Content-Type正确设置为application/javascript",
      "Echo返回代码内容",
      "状态码为200"
    ],
    "checkpoints": [
      "验证JavaScript格式发送",
      "验证Content-Type正确",
      "验证代码内容完整"
    ],
    "notes": [
      "此测试验证Raw JavaScript类型"
    ]
  }
],
}

export default node
