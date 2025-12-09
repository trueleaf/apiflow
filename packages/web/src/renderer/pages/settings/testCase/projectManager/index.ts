import { type ModelNode } from '../types'
import child0 from './projectList'
import child1 from './createProject'
import child2 from './searchProject'

const node: ModelNode = {
  modelName: "projectManager",
  description: "项目管理器",
  children: [child0, child1, child2],
}

export default node
