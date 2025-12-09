import { type ModelNode } from '../../../../types'
import child0 from './requestMethodUndo'
import child1 from './requestUrlUndo'
import child2 from './queryParamsUndo'
import child3 from './pathParamsUndo'

const node: ModelNode = {
  modelName: "undoOperation",
  description: "撤销操作",
  children: [child0, child1, child2, child3],
}

export default node
