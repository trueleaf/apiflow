import { type ModelNode } from '../../../../types'
import child0 from './requestMethodRedo'
import child1 from './requestUrlRedo'
import child2 from './queryParamsRedo'
import child3 from './redoBoundary'

const node: ModelNode = {
  modelName: "redoOperation",
  description: "重做操作",
  children: [child0, child1, child2, child3],
}

export default node
