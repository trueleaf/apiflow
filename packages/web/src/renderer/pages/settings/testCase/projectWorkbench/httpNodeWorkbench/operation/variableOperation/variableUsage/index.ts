import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "variableUsage",
  description: "变量使用",
  children: [],
  atomicFunc: [
  {
    "purpose": "在url中使用{{ 变量名 }}语法,发送请求时变量被正确替换",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "已创建变量:baseUrl=https://api.example.com",
      "已创建变量:apiPath=/api/users"
    ],
    "operationSteps": [
      "1. 在URL字段中输入:{{baseUrl}}{{apiPath}}",
      "2. 点击发送请求",
      "3. 查看请求信息中的URL",
      "4. 验证变量是否被替换"
    ],
    "expectedResults": [
      "变量语法被正确识别",
      "发送请求时变量被替换为实际值",
      "最终URL为:https://api.example.com/api/users",
      "请求信息中显示完整的URL",
      "响应正确返回"
    ],
    "checkpoints": [
      "验证URL中的变量替换",
      "验证多个变量的替换",
      "验证URL编码正确"
    ],
    "notes": [
      "此测试验证URL中的变量替换功能"
    ]
  },
  {
    "purpose": "在query参数value中使用变量,发送请求时变量被正确替换",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "已创建变量:userId=12345",
      "已创建变量:pageSize=20"
    ],
    "operationSteps": [
      "1. 在Query参数区域添加:id={{userId}}, limit={{pageSize}}",
      "2. 点击发送请求",
      "3. 查看请求URL中的参数",
      "4. 验证变量是否被替换"
    ],
    "expectedResults": [
      "Query参数中的变量被识别",
      "发送时变量被替换为实际值",
      "URL显示为:?id=12345&limit=20",
      "服务器接收到正确的参数值",
      "响应正确返回"
    ],
    "checkpoints": [
      "验证Query参数中的变量替换",
      "验证参数值的正确性"
    ],
    "notes": [
      "此测试验证Query参数中的变量替换功能"
    ]
  },
  {
    "purpose": "在header参数value中使用变量,发送请求时变量被正确替换",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "已创建变量:authToken=Bearer xyz123",
      "已创建变量:apiKey=secret-key-value"
    ],
    "operationSteps": [
      "1. 在Header参数区域添加:Authorization={{authToken}}, X-API-Key={{apiKey}}",
      "2. 点击发送请求",
      "3. 查看请求头信息",
      "4. 验证Header值是否被替换"
    ],
    "expectedResults": [
      "Header值中的变量被识别",
      "发送时变量被替换为实际值",
      "Header显示为:Authorization: Bearer xyz123, X-API-Key: secret-key-value",
      "服务器接收到正确的头部值",
      "响应正确返回"
    ],
    "checkpoints": [
      "验证Header中的变量替换",
      "验证敏感信息(Token)正确传递",
      "验证多个Header变量"
    ],
    "notes": [
      "此测试验证Header参数中的变量替换功能"
    ]
  },
  {
    "purpose": "在body json中使用变量,发送请求时变量被正确替换",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "已创建变量:userName=John, userAge=30"
    ],
    "operationSteps": [
      "1. 选择POST方法",
      "2. 在Body选择JSON类型",
      "3. 输入JSON:{\"name\":\"{{userName}}\",\"age\":\"{{userAge}}\"}",
      "4. 点击发送请求",
      "5. 查看请求body"
    ],
    "expectedResults": [
      "JSON中的变量被识别",
      "发送时变量被替换为实际值",
      "Body中显示为:{\"name\":\"John\",\"age\":\"30\"}",
      "服务器接收到正确的JSON数据",
      "响应正确返回"
    ],
    "checkpoints": [
      "验证JSON Body中的变量替换",
      "验证JSON格式正确",
      "验证多个变量替换"
    ],
    "notes": [
      "此测试验证JSON Body中的变量替换功能"
    ]
  },
  {
    "purpose": "使用不存在的变量时,变量提示未定义",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点"
    ],
    "operationSteps": [
      "1. 在URL字段中输入:http://api.example.com/{{undefinedVar}}",
      "2. 观察是否有警告提示",
      "3. 尝试点击发送请求",
      "4. 查看是否显示变量未定义的错误"
    ],
    "expectedResults": [
      "输入不存在的变量时显示警告",
      "警告信息说明变量未定义",
      "发送前或发送时显示错误提示",
      "用户可以清楚地了解哪个变量未定义",
      "阻止发送带有未定义变量的请求"
    ],
    "checkpoints": [
      "验证未定义变量的检测",
      "验证错误提示的清晰性",
      "验证请求被阻止"
    ],
    "notes": [
      "此测试验证变量未定义时的错误处理"
    ]
  }
],
}

export default node
