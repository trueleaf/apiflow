import { type ModelNode } from '../../../types'
import child0 from './query'
import child1 from './body'
import child2 from './header'
import child3 from './responseParams'
import child4 from './preScript'
import child5 from './afterScript'
import child6 from './remark'
import child7 from './httpNodeSettings'

const node: ModelNode = {
  modelName: "inputArea",
  description: "录入区域",
  children: [child0, child1, child2, child3, child4, child5, child6, child7],
}

export default node
