import { type ModelNode } from '../../../../../types'
import child0 from './cutHttpNode'
import child1 from './cutWebsocketNode'
import child2 from './cutHttpMockNode'
import child3 from './cutWebsocketMockNode'
import child4 from './cutFolder'
import child5 from './cutMixedNodes'
import child6 from './cutSpecialCases'

const node: ModelNode = {
  modelName: "cutNode",
  description: "剪切节点",
  children: [child0, child1, child2, child3, child4, child5, child6],
}

export default node
