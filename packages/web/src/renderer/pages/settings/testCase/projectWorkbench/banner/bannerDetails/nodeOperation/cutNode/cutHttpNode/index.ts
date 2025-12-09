import { type ModelNode } from '../../../../../../types'
import child0 from './cutSingleHttpNode'
import child1 from './cutMultipleHttpNode'

const node: ModelNode = {
  modelName: "cutHttpNode",
  description: "剪切httpNode节点",
  children: [child0, child1],
}

export default node
