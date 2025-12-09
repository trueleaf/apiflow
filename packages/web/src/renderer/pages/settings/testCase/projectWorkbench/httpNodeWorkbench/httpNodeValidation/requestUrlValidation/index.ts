import { type ModelNode } from '../../../../types'

const node: ModelNode = {
  modelName: "requestUrlValidation",
  description: "请求url验证",
  children: [],
  atomicFunc: [
  {
    "purpose": "验证localhost格式的url,调用echo接口,能正确请求,并且显示正确的url地址",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "本地已部署Echo服务或Mock服务"
    ],
    "operationSteps": [
      "1. 在HTTP节点的URL字段中输入localhost格式的URL(如http://localhost:3000/api/echo)",
      "2. 发送请求",
      "3. 查看响应中的请求URL信息",
      "4. 验证显示的URL与输入的URL一致",
      "5. 检查响应中返回的host头是否正确"
    ],
    "expectedResults": [
      "localhost格式的URL能正确解析和请求",
      "请求能正常发送到本地服务",
      "响应中显示的URL为localhost格式,而不是其他格式",
      "响应正确返回,状态码200",
      "localhost端口号能正确传递"
    ],
    "checkpoints": [
      "验证localhost URL能正常发送请求",
      "验证请求信息中显示的URL正确",
      "验证localhost被正确解析为本地回环地址",
      "验证端口号正确",
      "验证协议(http/https)正确"
    ],
    "notes": [
      "此测试验证localhost格式URL的支持",
      "需要确保本地服务运行"
    ]
  },
  {
    "purpose": "验证127.0.0.1这样的ip url,调用echo接口,能正确请求,并且显示正确的url地址",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "本地已部署Echo服务或Mock服务"
    ],
    "operationSteps": [
      "1. 在HTTP节点的URL字段中输入IP格式的URL(如http://127.0.0.1:3000/api/echo)",
      "2. 发送请求",
      "3. 查看响应中的请求URL信息",
      "4. 验证显示的URL与输入的URL一致",
      "5. 检查响应中返回的host头是否正确"
    ],
    "expectedResults": [
      "127.0.0.1格式的URL能正确解析和请求",
      "请求能正常发送到本地IP地址",
      "响应中显示的URL为IP格式,而不是其他格式",
      "响应正确返回,状态码200",
      "IP和端口号能正确传递"
    ],
    "checkpoints": [
      "验证IP格式URL能正常发送请求",
      "验证请求信息中显示的URL正确",
      "验证127.0.0.1被正确解析",
      "验证端口号正确",
      "验证协议(http/https)正确"
    ],
    "notes": [
      "此测试验证IP格式URL的支持",
      "需要确保本地服务运行",
      "应该测试不同的IP地址格式(IPv4,IPv6)"
    ]
  }
],
}

export default node
