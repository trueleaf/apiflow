import { type ModelNode } from '../../../types'
import child0 from './requestMethodValidation'
import child1 from './requestUrlValidation'
import child2 from './queryParamsValidation'
import child3 from './pathParamsValidation'
import child4 from './bodyParams'

const node: ModelNode = {
  modelName: "httpNodeValidation",
  description: "httpNode功能验证",
  children: [child0, child1, child2, child3, child4],
}

export default node
