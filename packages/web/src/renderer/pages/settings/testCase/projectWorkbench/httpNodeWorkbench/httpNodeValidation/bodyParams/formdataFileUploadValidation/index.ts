import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "formdataFileUploadValidation",
  description: "formData类型body验证(文件上传)",
  children: [],
  atomicFunc: [
  {
    "purpose": "调用echo接口验证包含字符串和file类型的formData是否正常返回,content-type是否设置正确",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "本地存在可上传的文件",
      "Echo服务可用"
    ],
    "operationSteps": [
      "1. 选择POST方法",
      "2. 在Body区域选择FormData类型",
      "3. 添加字符串字段:username=testuser, description=test file upload",
      "4. 添加文件字段并选择本地文件",
      "5. 发送请求",
      "6. 查看Echo返回的结果"
    ],
    "expectedResults": [
      "字符串和文件都正确上传",
      "Content-Type正确设置为multipart/form-data",
      "Echo返回所有字段信息",
      "文件内容正确传输",
      "状态码为200"
    ],
    "checkpoints": [
      "验证字符串字段上传",
      "验证文件字段上传",
      "验证Content-Type正确",
      "验证文件内容完整"
    ],
    "notes": [
      "此测试验证混合类型FormData上传"
    ]
  },
  {
    "purpose": "调用echo接口验证formData录入value如果是变量(验证所有变量类型)是否正常返回,content-type是否设置正确",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "已创建项目变量",
      "Echo服务可用"
    ],
    "operationSteps": [
      "1. 选择POST方法",
      "2. 在Body区域选择FormData类型",
      "3. 添加包含变量的字段:name={{globalVar}}, env={{envVar}}",
      "4. 发送请求",
      "5. 验证变量替换"
    ],
    "expectedResults": [
      "所有变量类型都被正确替换",
      "Content-Type正确设置",
      "Echo返回替换后的值",
      "状态码为200"
    ],
    "checkpoints": [
      "验证FormData变量替换",
      "验证Content-Type正确"
    ],
    "notes": [
      "此测试验证FormData中的变量功能"
    ]
  },
  {
    "purpose": "调用echo接口验证formData录入value如果是mock(验证所有的mock值)是否正常返回,content-type是否设置正确",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "Echo服务可用"
    ],
    "operationSteps": [
      "1. 选择POST方法",
      "2. 在Body区域选择FormData类型",
      "3. 添加包含mock的字段:id=@id, phone=@mobile, email=@email",
      "4. 发送请求",
      "5. 验证mock数据生成"
    ],
    "expectedResults": [
      "Mock数据正确生成",
      "Content-Type正确设置",
      "Echo返回生成的真实数据",
      "状态码为200"
    ],
    "checkpoints": [
      "验证FormData中的mock生成",
      "验证Content-Type正确"
    ],
    "notes": [
      "此测试验证FormData中的mock功能"
    ]
  },
  {
    "purpose": "调用echo接口验证formData中没有file字段时是否正常返回,content-type是否设置正确",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "Echo服务可用"
    ],
    "operationSteps": [
      "1. 选择POST方法",
      "2. 在Body区域选择FormData类型",
      "3. 添加多个纯字符串字段,不添加文件",
      "4. 发送请求",
      "5. 检查Content-Type和响应"
    ],
    "expectedResults": [
      "纯字符串FormData能正常发送",
      "Content-Type设置为multipart/form-data",
      "Echo返回所有字段",
      "状态码为200"
    ],
    "checkpoints": [
      "验证纯字符串FormData",
      "验证Content-Type正确"
    ],
    "notes": [
      "此测试验证无文件的FormData"
    ]
  }
],
}

export default node
