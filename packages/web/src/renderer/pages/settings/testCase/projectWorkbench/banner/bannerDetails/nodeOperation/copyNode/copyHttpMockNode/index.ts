import { type ModelNode } from '../../../../../../types'
import child0 from './copySingleHttpMockNode'
import child1 from './copyMultipleHttpMockNode'

const node: ModelNode = {
  modelName: "copyHttpMockNode",
  description: "复制httpMockNode节点",
  children: [child0, child1],
}

export default node
