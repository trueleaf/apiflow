import { type ModelNode } from '../../../../../types'
import child0 from './copyHttpNode'
import child1 from './copyWebsocketNode'
import child2 from './copyHttpMockNode'
import child3 from './copyWebsocketMockNode'
import child4 from './copyFolder'
import child5 from './copyMixedNodes'

const node: ModelNode = {
  modelName: "copyNode",
  description: "复制节点",
  children: [child0, child1, child2, child3, child4, child5],
}

export default node
