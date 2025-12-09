import { type ModelNode } from '../../../../../../types'
import child0 from './copySingleWebsocketMockNode'
import child1 from './copyMultipleWebsocketMockNode'

const node: ModelNode = {
  modelName: "copyWebsocketMockNode",
  description: "复制websocketMockNode节点",
  children: [child0, child1],
}

export default node
