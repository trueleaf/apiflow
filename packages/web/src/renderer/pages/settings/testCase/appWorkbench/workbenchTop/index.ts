import { type ModelNode } from '../../types'
import child0 from './logo'
import child1 from './navigation'
import child2 from './navControl'
import child3 from './quickIcons'
import child4 from './windowControl'

const node: ModelNode = {
  modelName: "workbenchTop",
  description: "工作区顶部",
  children: [child0, child1, child2, child3, child4],
}

export default node
