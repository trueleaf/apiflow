import { type ModelNode } from '../../../types'
import child0 from './requestMethodInput'
import child1 from './requestUrlInput'
import child2 from './requestUrlDisplay'
import child3 from './requestOperation'
import child4 from './undoOperation'
import child5 from './redoOperation'
import child6 from './nodeHistory'
import child7 from './layoutOperation'
import child8 from './variableOperation'

const node: ModelNode = {
  modelName: "operation",
  description: "操作区域",
  children: [child0, child1, child2, child3, child4, child5, child6, child7, child8],
}

export default node
