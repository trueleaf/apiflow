import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "binaryBodyValidation",
  description: "binary类型body验证",
  children: [],
  atomicFunc: [
  {
    "purpose": "调用echo接口验证binary变量模式请求是否正常返回,content-type是否设置正确",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "本地存在二进制文件",
      "Echo服务可用"
    ],
    "operationSteps": [
      "1. 选择POST方法",
      "2. 在Body区域选择Binary类型",
      "3. 创建或选择一个二进制文件",
      "4. 发送请求",
      "5. 检查二进制数据传输"
    ],
    "expectedResults": [
      "二进制文件正确上传",
      "文件内容被正确传输",
      "Content-Type设置正确",
      "Echo返回文件信息",
      "状态码为200"
    ],
    "checkpoints": [
      "验证二进制文件上传",
      "验证文件大小",
      "验证Content-Type"
    ],
    "notes": [
      "此测试验证Binary类型body"
    ]
  },
  {
    "purpose": "调用echo接口验证binary文件模式请求是否正常返回,content-type是否设置正确",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "本地存在文件",
      "Echo服务可用"
    ],
    "operationSteps": [
      "1. 选择POST方法",
      "2. 在Body区域选择Binary类型",
      "3. 使用文件模式选择文件",
      "4. 发送请求",
      "5. 检查文件传输"
    ],
    "expectedResults": [
      "文件正确发送",
      "文件内容被完整传输",
      "Content-Type正确",
      "状态码为200"
    ],
    "checkpoints": [
      "验证文件上传",
      "验证文件大小",
      "验证Content-Type"
    ],
    "notes": [
      "此测试验证Binary文件上传模式"
    ]
  }
],
}

export default node
