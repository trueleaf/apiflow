import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "responseCookie",
  description: "返回cookie",
  children: [],
  atomicFunc: [
  {
    "purpose": "返回cookie正确展示,左右布局时候展示cookie管理按钮和详情按钮,上下布局不展示详情按钮,cookie值需要正确展示(测试请求需要设置cookie,并且在返回cookie中正确展示)",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "已在请求头中手动设置Cookie头",
      "已发送请求到支持Set-Cookie返回头的API端点"
    ],
    "operationSteps": [
      "1. 在HTTP节点编辑器中的请求头里设置Cookie头(如Cookie: test=value123)",
      "2. 发送请求到支持返回Set-Cookie的API",
      "3. 在响应区域查看\"返回Cookie\"标签页",
      "4. 在左右布局模式下查看Cookie管理和详情按钮",
      "5. 切换到上下布局模式,检查详情按钮是否隐藏",
      "6. 验证返回的Cookie值是否正确展示"
    ],
    "expectedResults": [
      "返回的Cookie值正确显示",
      "左右布局模式下显示Cookie管理按钮和详情按钮",
      "上下布局模式下隐藏详情按钮",
      "Cookie值包括名称,值,域,路径,过期时间等完整信息",
      "发送的Cookie和返回的Cookie能正确区分显示"
    ],
    "checkpoints": [
      "验证返回Cookie列表的完整性",
      "验证Cookie值的准确性",
      "验证Cookie管理按钮在左右布局显示",
      "验证Cookie详情按钮在左右布局显示,在上下布局隐藏",
      "验证Cookie属性(Domain, Path, Expires, HttpOnly等)的显示",
      "验证Cookie值可以手动添加到Cookie存储"
    ],
    "notes": [
      "此测试验证Cookie的完整展示和管理功能",
      "需要测试包含多个Cookie的响应",
      "应验证Cookie的持久化和跨请求使用",
      "应测试包含特殊字符和编码的Cookie值"
    ]
  }
],
}

export default node
