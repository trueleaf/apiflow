import { type ModelNode } from '../../../../../../types'
import child0 from './cutSingleFolder'
import child1 from './cutMultipleFolder'

const node: ModelNode = {
  modelName: "cutFolder",
  description: "剪切folder节点",
  children: [child0, child1],
}

export default node
