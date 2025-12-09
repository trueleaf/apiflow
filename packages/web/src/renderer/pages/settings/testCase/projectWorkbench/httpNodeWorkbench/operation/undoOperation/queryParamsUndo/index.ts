import { type ModelNode } from '../../../../../types'
import child0 from './urlQueryLinkUndo'
import child1 from './queryDragUndo'
import child2 from './queryKeyUndo'
import child3 from './queryValueUndo'
import child4 from './queryDescriptionUndo'
import child5 from './queryRequiredCheckboxUndo'
import child6 from './querySendCheckboxUndo'

const node: ModelNode = {
  modelName: "queryParamsUndo",
  description: "query参数撤销",
  children: [child0, child1, child2, child3, child4, child5, child6],
}

export default node
