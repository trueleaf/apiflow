import { type ModelNode } from '../../../../../../types'
import child0 from './cutSingleWebsocketMockNode'
import child1 from './cutMultipleWebsocketMockNode'

const node: ModelNode = {
  modelName: "cutWebsocketMockNode",
  description: "剪切websocketMockNode节点",
  children: [child0, child1],
}

export default node
