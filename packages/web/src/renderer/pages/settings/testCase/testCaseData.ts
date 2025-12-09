import type { TestCase } from './types'
import appWorkbench from './appWorkbench'
import projectManager from './projectManager'
import projectAddon from './projectAddon'
import projectWorkbench from './projectWorkbench'
export { type AtomicFunc, type ModelNode, type TestCase } from './types'

export const testCase: TestCase = [
  appWorkbench,
  projectManager,
  projectAddon,
  projectWorkbench,
]
