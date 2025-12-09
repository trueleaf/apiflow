import { type ModelNode } from '../../../../../../types'
import child0 from './cutSingleWebsocketNode'
import child1 from './cutMultipleWebsocketNode'

const node: ModelNode = {
  modelName: "cutWebsocketNode",
  description: "剪切websocketNode节点",
  children: [child0, child1],
}

export default node
