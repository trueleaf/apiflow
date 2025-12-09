import { type ModelNode } from '../../../../types'
import child0 from './json'
import child1 from './formDataParams'
import child2 from './urlencodedParams'
import child3 from './rawParams'
import child4 from './binaryParams'
import child5 from './noneParams'

const node: ModelNode = {
  modelName: "body",
  description: "请求体",
  children: [child0, child1, child2, child3, child4, child5],
}

export default node
