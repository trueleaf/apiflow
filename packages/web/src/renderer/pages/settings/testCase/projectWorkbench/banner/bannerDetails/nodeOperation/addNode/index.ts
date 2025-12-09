import { type ModelNode } from '../../../../../types'
import child0 from './addHttpNode'
import child1 from './websocketNode'
import child2 from './httpMockNode'
import child3 from './websocketMockNode'
import child4 from './folderNode'
import child5 from './boundaryTest'

const node: ModelNode = {
  modelName: "addNode",
  description: "添加节点",
  children: [child0, child1, child2, child3, child4, child5],
}

export default node
