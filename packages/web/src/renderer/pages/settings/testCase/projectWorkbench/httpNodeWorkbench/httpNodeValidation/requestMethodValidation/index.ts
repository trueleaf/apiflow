import { type ModelNode } from '../../../../types'

const node: ModelNode = {
  modelName: "requestMethodValidation",
  description: "请求方法验证",
  children: [],
  atomicFunc: [
  {
    "purpose": "更改所有的请求方法,调用echo接口,请求方法正确",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "已设置Echo API的URL(如:https://httpbin.org/anything)"
    ],
    "operationSteps": [
      "1. 在HTTP节点编辑器中打开请求方法下拉菜单",
      "2. 依次选择并测试所有HTTP方法:GET,POST,PUT,DELETE,PATCH,HEAD,OPTIONS",
      "3. 对每个方法发送请求到Echo API",
      "4. 检查响应中返回的请求方法是否与选择的方法一致",
      "5. 验证方法变更后的UI更新"
    ],
    "expectedResults": [
      "所有HTTP方法都可以正确选择和切换",
      "每个方法发送的请求的Method头与选择的方法一致",
      "Echo API返回的method字段与实际发送的方法匹配",
      "方法切换后,UI立即更新显示新的方法",
      "不同的HTTP方法能正确处理(例如HEAD方法不返回body)"
    ],
    "checkpoints": [
      "验证GET方法能正常发送",
      "验证POST方法能正常发送",
      "验证PUT方法能正常发送",
      "验证DELETE方法能正常发送",
      "验证PATCH方法能正常发送",
      "验证HEAD方法响应不包含body",
      "验证OPTIONS方法返回Allow头",
      "验证方法名称显示正确"
    ],
    "notes": [
      "此测试验证所有HTTP方法的基础功能",
      "Echo API应该是支持所有方法的测试端点",
      "需要验证方法选择器的UI状态和响应体的一致性"
    ]
  }
],
}

export default node
