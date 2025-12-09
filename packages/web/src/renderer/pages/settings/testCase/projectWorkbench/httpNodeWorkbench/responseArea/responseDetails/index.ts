import { type ModelNode } from '../../../../types'
import child0 from './responseValue'
import child1 from './requestInfo'
import child2 from './responseHeader'
import child3 from './responseCookie'
import child4 from './rawValue'

const node: ModelNode = {
  modelName: "responseDetails",
  description: "响应详情",
  children: [child0, child1, child2, child3, child4],
}

export default node
