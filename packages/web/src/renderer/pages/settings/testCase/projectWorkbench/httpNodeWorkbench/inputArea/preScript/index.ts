import { type ModelNode } from '../../../../types'
import child0 from './editorFeatures'
import child1 from './af.request-API'
import child2 from './af.http-API'
import child3 from './envVariableAccess'
import child4 from './scriptExecution'

const node: ModelNode = {
  modelName: "preScript",
  description: "前置脚本",
  children: [child0, child1, child2, child3, child4],
}

export default node
