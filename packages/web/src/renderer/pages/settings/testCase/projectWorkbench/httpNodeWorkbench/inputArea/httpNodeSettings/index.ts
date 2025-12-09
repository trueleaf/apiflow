import { type ModelNode } from '../../../../types'
import child0 from './requestConfig'
import child1 from './redirectConfig'
import child2 from './displayOrderConfig'
import child3 from './restoreDefault'

const node: ModelNode = {
  modelName: "httpNodeSettings",
  description: "设置",
  children: [child0, child1, child2, child3],
}

export default node
