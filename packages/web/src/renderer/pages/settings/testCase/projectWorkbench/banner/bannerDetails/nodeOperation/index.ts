import { type ModelNode } from '../../../../types'
import child0 from './addNode'
import child1 from './deleteNode'
import child2 from './renameNode'
import child3 from './copyNode'
import child4 from './cutNode'
import child5 from './moveNode'
import child6 from './contextMenu'
import child7 from './otherCases'

const node: ModelNode = {
  modelName: "nodeOperation",
  description: "节点操作区域",
  children: [child0, child1, child2, child3, child4, child5, child6, child7],
}

export default node
