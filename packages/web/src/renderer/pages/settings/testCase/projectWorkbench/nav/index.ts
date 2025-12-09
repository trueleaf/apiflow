import { type ModelNode } from '../../types'
import child0 from './navBasicStyle'
import child1 from './bannerNavInteraction'
import child2 from './tabOperation'
import child3 from './tabDrag'

const node: ModelNode = {
  modelName: "nav",
  description: "工作区导航",
  children: [child0, child1, child2, child3],
}

export default node
