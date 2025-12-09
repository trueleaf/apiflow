import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "formdataBodyValidation",
  description: "formdata类型body验证",
  children: [],
  atomicFunc: [
  {
    "purpose": "调用echo接口验证常规formdata是否正常返回,content-type是否设置正确",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "Echo服务可用"
    ],
    "operationSteps": [
      "1. 选择POST方法",
      "2. 在Body区域选择FormData类型",
      "3. 添加表单字段:name=test, email=test@example.com, age=25",
      "4. 发送请求",
      "5. 检查请求头中的Content-Type",
      "6. 查看Echo返回的body"
    ],
    "expectedResults": [
      "FormData数据正确发送",
      "Content-Type自动设置为multipart/form-data",
      "Echo返回的form数据与发送的数据一致",
      "状态码为200",
      "所有表单字段都正确传输"
    ],
    "checkpoints": [
      "验证FormData数据的完整性",
      "验证Content-Type和boundary设置正确",
      "验证所有字段都被正确发送"
    ],
    "notes": [
      "此测试验证FormData类型body的处理",
      "Content-Type应该自动设置为multipart/form-data"
    ]
  },
  {
    "purpose": "调用echo接口验证使用变量(所有类型变量都需要验证)的formdata是否正常返回,content-type是否设置正确",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "已创建项目变量:projectVar=project_value",
      "Echo服务可用"
    ],
    "operationSteps": [
      "1. 选择POST方法",
      "2. 在Body区域选择FormData类型",
      "3. 添加表单字段,其中包含变量:name={{projectVar}}, desc={{envVar}}",
      "4. 发送请求",
      "5. 查看变量是否被正确替换"
    ],
    "expectedResults": [
      "变量在FormData中被正确替换",
      "Content-Type正确设置",
      "Echo返回替换后的值",
      "状态码为200"
    ],
    "checkpoints": [
      "验证FormData中的变量替换",
      "验证Content-Type正确"
    ],
    "notes": [
      "此测试验证FormData中的变量替换"
    ]
  },
  {
    "purpose": "调用echo接口验证使用mock(验证所有mock字段)的formdata是否正常返回,content-type是否设置正确",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "Echo服务可用"
    ],
    "operationSteps": [
      "1. 选择POST方法",
      "2. 在Body区域选择FormData类型",
      "3. 添加包含mock的表单字段:id=@id, email=@email, name=@cname",
      "4. 发送请求",
      "5. 查看mock数据是否正确生成"
    ],
    "expectedResults": [
      "Mock数据在FormData中被正确生成",
      "Content-Type正确设置",
      "Echo返回生成的真实数据",
      "状态码为200"
    ],
    "checkpoints": [
      "验证FormData中的mock数据生成",
      "验证Content-Type正确"
    ],
    "notes": [
      "此测试验证FormData中的mock功能"
    ]
  },
  {
    "purpose": "调用echo接口验证文件上传是否正常返回,content-type是否设置正确",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "系统中存在可上传的文件",
      "Echo服务支持文件上传"
    ],
    "operationSteps": [
      "1. 选择POST方法",
      "2. 在Body区域选择FormData类型",
      "3. 添加普通字段和文件字段",
      "4. 点击文件输入,选择本地文件",
      "5. 发送请求",
      "6. 查看上传结果"
    ],
    "expectedResults": [
      "文件正确上传",
      "Content-Type设置为multipart/form-data",
      "Echo返回上传的文件信息",
      "文件内容被正确传输",
      "状态码为200"
    ],
    "checkpoints": [
      "验证文件选择功能",
      "验证文件上传功能",
      "验证Content-Type正确",
      "验证大文件上传"
    ],
    "notes": [
      "此测试验证文件上传功能",
      "应测试不同大小和类型的文件"
    ]
  }
],
}

export default node
