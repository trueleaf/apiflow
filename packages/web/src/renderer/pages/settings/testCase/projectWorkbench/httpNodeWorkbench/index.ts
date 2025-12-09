import { type ModelNode } from '../../types'
import child0 from './operation'
import child1 from './inputArea'
import child2 from './responseArea'
import child3 from './httpNodeValidation'

const node: ModelNode = {
  modelName: "httpNodeWorkbench",
  description: "httpNode工作区",
  children: [child0, child1, child2, child3],
}

export default node
