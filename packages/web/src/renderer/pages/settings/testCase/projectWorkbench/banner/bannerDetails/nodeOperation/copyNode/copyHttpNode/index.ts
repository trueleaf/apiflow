import { type ModelNode } from '../../../../../../types'
import child0 from './copySingleHttpNode'
import child1 from './copyMultipleHttpNode'

const node: ModelNode = {
  modelName: "copyHttpNode",
  description: "复制httpNode节点",
  children: [child0, child1],
}

export default node
