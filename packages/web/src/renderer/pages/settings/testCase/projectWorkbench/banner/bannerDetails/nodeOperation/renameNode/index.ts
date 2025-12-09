import { type ModelNode } from '../../../../../types'
import child0 from './renameHttpNode'
import child1 from './renameWebsocketNode'
import child2 from './renameHttpMockNode'
import child3 from './renameWebsocketMockNode'
import child4 from './renameFolder'

const node: ModelNode = {
  modelName: "renameNode",
  description: "重命名节点",
  children: [child0, child1, child2, child3, child4],
}

export default node
