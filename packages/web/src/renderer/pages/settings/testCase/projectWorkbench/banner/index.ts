import { type ModelNode } from '../../types'
import child0 from './search'
import child1 from './projectToggle'
import child2 from './tools'
import child3 from './bannerDetails'
import child4 from './bannerOtherFeatures'

const node: ModelNode = {
  modelName: "banner",
  description: "项目工作区banner导航",
  children: [child0, child1, child2, child3, child4],
}

export default node
