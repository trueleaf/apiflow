import { type ModelNode } from '../../../../../../types'
import child0 from './copySingleFolder'
import child1 from './copyMultipleFolder'

const node: ModelNode = {
  modelName: "copyFolder",
  description: "复制folder节点",
  children: [child0, child1],
}

export default node
