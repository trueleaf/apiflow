import { type ModelNode } from '../../../../types'
import child0 from './sendButton'
import child1 from './saveButton'
import child2 from './refreshButton'

const node: ModelNode = {
  modelName: "requestOperation",
  description: "请求操作区域",
  children: [child0, child1, child2],
}

export default node
