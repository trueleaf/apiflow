import { type ModelNode } from '../../../../../types'
import child0 from './moveHttpNode'
import child1 from './moveWebsocketNode'
import child2 from './moveHttpMockNode'
import child3 from './moveWebsocketMockNode'
import child4 from './moveFolder'
import child5 from './moveSpecialCases'

const node: ModelNode = {
  modelName: "moveNode",
  description: "移动节点",
  children: [child0, child1, child2, child3, child4, child5],
}

export default node
