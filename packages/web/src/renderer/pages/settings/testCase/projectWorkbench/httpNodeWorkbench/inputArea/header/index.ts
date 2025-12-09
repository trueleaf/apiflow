import { type ModelNode } from '../../../../types'
import child0 from './defaultHeaders'
import child1 from './customHeaders'
import child2 from './headerPriority'

const node: ModelNode = {
  modelName: "header",
  description: "请求头",
  children: [child0, child1, child2],
}

export default node
