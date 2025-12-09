import { type ModelNode } from '../types'
import child0 from './banner'
import child1 from './nav'
import child2 from './httpNodeWorkbench'

const node: ModelNode = {
  modelName: "projectWorkbench",
  description: "项目工作区",
  children: [child0, child1, child2],
}

export default node
