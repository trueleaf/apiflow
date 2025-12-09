import { type ModelNode } from '../../../../types'
import child0 from './variableDialog'
import child1 from './variableCrud'
import child2 from './variableUsage'

const node: ModelNode = {
  modelName: "variableOperation",
  description: "变量操作",
  children: [child0, child1, child2],
}

export default node
