import { type ModelNode } from '../../../../types'
import child0 from './jsonBodyValidation'
import child1 from './formdataBodyValidation'
import child2 from './formdataFileUploadValidation'
import child3 from './urlencodedBodyValidation'
import child4 from './rawBodyValidation'
import child5 from './binaryBodyValidation'
import child6 from './noneBodyValidation'

const node: ModelNode = {
  modelName: "bodyParams",
  description: "body参数",
  children: [child0, child1, child2, child3, child4, child5, child6],
}

export default node
