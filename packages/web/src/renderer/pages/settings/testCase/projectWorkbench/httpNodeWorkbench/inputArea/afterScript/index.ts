import { type ModelNode } from '../../../../types'
import child0 from './editorFeatures'
import child1 from './af.response-API'
import child2 from './af.sessionStorage-API'
import child3 from './af.localStorage-API'
import child4 from './af.cookies-API'
import child5 from './af.variables-API'
import child6 from './scriptExecution'

const node: ModelNode = {
  modelName: "afterScript",
  description: "后置脚本",
  children: [child0, child1, child2, child3, child4, child5, child6],
}

export default node
