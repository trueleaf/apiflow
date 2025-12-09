import { type ModelNode } from '../../../../../../types'
import child0 from './cutSingleHttpMockNode'
import child1 from './cutMultipleHttpMockNode'

const node: ModelNode = {
  modelName: "cutHttpMockNode",
  description: "剪切httpMockNode节点",
  children: [child0, child1],
}

export default node
