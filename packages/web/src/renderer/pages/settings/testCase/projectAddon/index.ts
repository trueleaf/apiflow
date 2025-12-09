import { type ModelNode } from '../types'
import child0 from './import'
import child1 from './export'
import child2 from './variable'
import child3 from './commonHeader'
import child4 from './trash'
import child5 from './cookieManagement'

const node: ModelNode = {
  modelName: "projectAddon",
  description: "项目辅助功能",
  children: [child0, child1, child2, child3, child4, child5],
}

export default node
