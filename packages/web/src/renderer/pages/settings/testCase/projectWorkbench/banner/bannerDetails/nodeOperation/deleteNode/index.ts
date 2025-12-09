import { type ModelNode } from '../../../../../types'
import child0 from './deleteHttpNode'
import child1 from './deleteWebsocketNode'
import child2 from './deleteHttpMockNode'
import child3 from './deleteWebsocketMockNode'
import child4 from './deleteFolder'
import child5 from './deleteMixedNodes'

const node: ModelNode = {
  modelName: "deleteNode",
  description: "删除节点",
  children: [child0, child1, child2, child3, child4, child5],
}

export default node
