import { type ModelNode } from '../../types'
import child0 from './apiflowImport'
import child1 from './openapiImport'
import child2 from './postmanImport'
import child3 from './aiDataImport'
import child4 from './codeRepoImport'

const node: ModelNode = {
  modelName: "import",
  description: "导入项目",
  children: [child0, child1, child2, child3, child4],
}

export default node
