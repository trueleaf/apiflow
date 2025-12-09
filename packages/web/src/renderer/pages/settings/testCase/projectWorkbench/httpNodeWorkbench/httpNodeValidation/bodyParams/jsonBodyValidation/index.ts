import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "jsonBodyValidation",
  description: "json类型body验证",
  children: [],
  atomicFunc: [
  {
    "purpose": "调用echo接口验证常规json是否正常返回,content-type是否设置正确",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "Echo服务可用"
    ],
    "operationSteps": [
      "1. 选择POST方法",
      "2. 在Body区域选择JSON类型",
      "3. 输入常规JSON数据:{\"name\":\"test\",\"age\":20,\"active\":true}",
      "4. 发送请求",
      "5. 检查请求头中的Content-Type",
      "6. 查看Echo返回的body"
    ],
    "expectedResults": [
      "常规JSON数据正确发送",
      "Content-Type自动设置为application/json",
      "Echo返回的body与发送的JSON一致",
      "状态码为200",
      "JSON格式正确,能正确解析"
    ],
    "checkpoints": [
      "验证JSON数据的完整性",
      "验证Content-Type设置正确",
      "验证JSON嵌套结构正确发送",
      "验证特殊字符的处理"
    ],
    "notes": [
      "此测试验证常规JSON body的处理",
      "Content-Type应该自动设置"
    ]
  },
  {
    "purpose": "调用echo接口验证使用变量(所有类型变量都需要验证)的json是否正常返回,content-type是否设置正确",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "已创建项目级别变量:globalVar=global_value",
      "已创建环境变量:envVar=env_value",
      "Echo服务可用"
    ],
    "operationSteps": [
      "1. 选择POST方法",
      "2. 在Body区域选择JSON类型",
      "3. 输入包含变量的JSON:{\"global\":\"{{globalVar}}\",\"env\":\"{{envVar}}\",\"local\":\"{{localVar}}\"}",
      "4. 在Session Variables中临时设置localVar=local_value",
      "5. 发送请求",
      "6. 查看Echo返回的body和变量是否正确替换"
    ],
    "expectedResults": [
      "所有变量类型都被正确替换",
      "全局变量,环境变量,本地变量都能正常工作",
      "Content-Type自动设置为application/json",
      "Echo返回的body显示变量已被替换",
      "状态码为200"
    ],
    "checkpoints": [
      "验证全局变量替换",
      "验证环境变量替换",
      "验证Session变量替换",
      "验证变量不存在时的处理",
      "验证Content-Type正确"
    ],
    "notes": [
      "此测试验证JSON中的变量替换功能",
      "需要测试所有类型的变量"
    ]
  },
  {
    "purpose": "调用echo接口验证使用mock(验证所有mock字段)的json是否正常返回,content-type是否设置正确",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "Echo服务可用"
    ],
    "operationSteps": [
      "1. 选择POST方法",
      "2. 在Body区域选择JSON类型",
      "3. 输入包含mock数据的JSON:{\"id\":\"@id\",\"name\":\"@cname\",\"email\":\"@email\",\"mobile\":\"@mobile\"}",
      "4. 发送请求",
      "5. 查看Echo返回的body",
      "6. 验证mock数据已被生成"
    ],
    "expectedResults": [
      "Mock数据正确生成替换",
      "各种mock字段都能正常工作(id,name,email,phone等)",
      "Content-Type自动设置为application/json",
      "Echo返回真实的生成数据,而非@notation",
      "状态码为200"
    ],
    "checkpoints": [
      "验证各种mock字段的生成",
      "验证数据的随机性(多次请求数据不同)",
      "验证Content-Type正确",
      "验证数据格式符合mock类型"
    ],
    "notes": [
      "此测试验证mock数据生成功能",
      "需要测试所有支持的mock字段类型"
    ]
  },
  {
    "purpose": "调用echo接口验证使用基础类型的json(例如: null,1,true, \"string\")是否正常返回,content-type是否设置正确",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "Echo服务可用"
    ],
    "operationSteps": [
      "1. 选择POST方法",
      "2. 在Body区域选择JSON类型",
      "3. 分别测试不同基础类型:",
      "   - null",
      "   - 数字:123",
      "   - 布尔值:true",
      "   - 字符串:\"hello world\"",
      "   - 数组:[1,2,3]",
      "4. 每种类型都发送一次请求",
      "5. 查看Echo返回的body和类型"
    ],
    "expectedResults": [
      "所有基础JSON类型都能正确发送",
      "Content-Type自动设置为application/json",
      "Echo正确识别和返回数据类型",
      "状态码为200",
      "数据类型保留正确(数字不转为字符串等)"
    ],
    "checkpoints": [
      "验证null类型",
      "验证数字类型",
      "验证布尔值类型",
      "验证字符串类型",
      "验证数组类型",
      "验证Content-Type正确"
    ],
    "notes": [
      "此测试验证JSON基础类型的处理",
      "确保数据类型在发送和接收时保持一致"
    ]
  }
],
}

export default node
