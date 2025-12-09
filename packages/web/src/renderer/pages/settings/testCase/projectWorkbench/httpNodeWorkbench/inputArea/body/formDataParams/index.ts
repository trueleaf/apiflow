import { type ModelNode } from '../../../../../types'
import child0 from './stringOnlyFormdata'
import child1 from './fileOnlyFormdata'
import child2 from './mixedFormdata'

const node: ModelNode = {
  modelName: "formDataParams",
  description: "formData参数",
  children: [child0, child1, child2],
}

export default node
