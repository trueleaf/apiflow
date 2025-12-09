import { type ModelNode } from '../../../../../../types'
import child0 from './copySingleWebsocketNode'
import child1 from './copyMultipleWebsocketNode'

const node: ModelNode = {
  modelName: "copyWebsocketNode",
  description: "复制websocketNode节点",
  children: [child0, child1],
}

export default node
