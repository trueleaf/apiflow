import { type ModelNode } from '../../../types'
import child0 from './requestBasicInfo'
import child1 from './responseBasicInfo'
import child2 from './responseDetails'

const node: ModelNode = {
  modelName: "responseArea",
  description: "响应区域",
  children: [child0, child1, child2],
}

export default node
