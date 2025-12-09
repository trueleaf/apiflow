import { type ModelNode } from '../../../../../types'
import child0 from './contextMenuBlank'
import child1 from './contextMenuFolder'
import child2 from './contextMenuNonFolder'

const node: ModelNode = {
  modelName: "contextMenu",
  description: "鼠标右键",
  children: [child0, child1, child2],
}

export default node
