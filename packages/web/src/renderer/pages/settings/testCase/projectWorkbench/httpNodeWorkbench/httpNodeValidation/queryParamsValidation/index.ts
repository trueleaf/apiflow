import { type ModelNode } from '../../../../types'

const node: ModelNode = {
  modelName: "queryParamsValidation",
  description: "query参数验证",
  children: [],
  atomicFunc: [
  {
    "purpose": "调用echo接口验证参数为空是否正常返回/echo?id=",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "Echo服务可用"
    ],
    "operationSteps": [
      "1. 在Query参数区域添加参数:id=(空值)",
      "2. 设置URL为echo接口",
      "3. 发送请求",
      "4. 查看请求URL和响应body"
    ],
    "expectedResults": [
      "空参数能正确添加到URL中",
      "请求发送成功,响应为200",
      "Echo返回的参数中包含id=",
      "URL显示为/echo?id="
    ],
    "checkpoints": [
      "验证空参数被正确包含在URL中",
      "验证Echo服务正确接收空参数",
      "验证响应中能看到id参数"
    ],
    "notes": [
      "此测试验证空参数值的处理",
      "需要确保URL编码正确"
    ]
  },
  {
    "purpose": "调用echo接口验证常规参数是否正常返回/echo?id=1",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "Echo服务可用"
    ],
    "operationSteps": [
      "1. 在Query参数区域添加参数:id=1",
      "2. 设置URL为echo接口",
      "3. 发送请求",
      "4. 查看请求URL和响应body"
    ],
    "expectedResults": [
      "参数正确添加到URL中",
      "请求发送成功,响应为200",
      "Echo返回的参数中id值为1",
      "URL正确显示为/echo?id=1"
    ],
    "checkpoints": [
      "验证参数被正确包含在URL中",
      "验证Echo服务正确接收参数",
      "验证参数值的准确性"
    ],
    "notes": [
      "此测试验证常规query参数的处理"
    ]
  },
  {
    "purpose": "调用echo接口验证同名参数是否正常返回/echo?id=1&id=3",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "Echo服务可用"
    ],
    "operationSteps": [
      "1. 在Query参数区域添加两条同名参数:id=1 和 id=3",
      "2. 设置URL为echo接口",
      "3. 发送请求",
      "4. 查看请求URL和响应body"
    ],
    "expectedResults": [
      "同名参数都能正确添加到URL中",
      "请求发送成功,响应为200",
      "URL中包含两个id参数:id=1&id=3",
      "Echo返回两个id参数值"
    ],
    "checkpoints": [
      "验证同名参数都被包含在URL中",
      "验证参数顺序保持不变",
      "验证Echo服务能处理多个同名参数"
    ],
    "notes": [
      "此测试验证多个同名参数的处理",
      "有些API框架将多个同名参数作为数组处理"
    ]
  },
  {
    "purpose": "调用echo接口验证中文参数是否正常返回/echo?name=张三&tag=a+b",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "Echo服务可用"
    ],
    "operationSteps": [
      "1. 在Query参数区域添加中文参数:name=张三",
      "2. 添加包含空格的参数:tag=a b",
      "3. 设置URL为echo接口",
      "4. 发送请求",
      "5. 查看请求URL和响应body"
    ],
    "expectedResults": [
      "中文参数能正确URL编码",
      "空格被正确编码为+或%20",
      "请求发送成功,响应为200",
      "Echo返回正确的参数值(自动解码)",
      "URL显示正确的编码格式"
    ],
    "checkpoints": [
      "验证中文参数的URL编码",
      "验证空格编码为+",
      "验证Echo服务能正确解码中文参数",
      "验证参数值正确显示"
    ],
    "notes": [
      "此测试验证特殊字符和多字节字符的处理",
      "需要确保UTF-8编码正确",
      "中文字符需要URL编码为%XX格式"
    ]
  }
],
}

export default node
