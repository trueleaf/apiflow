import { getSchema, Rule, RuleType } from '@midwayjs/validate'
class EnvironmentVariableItemDto {
  @Rule(RuleType.string().allow(''))
    _id?: string
  @Rule(RuleType.string().required().allow(''))
    key: string
  @Rule(RuleType.string().required().allow(''))
    localValue: string
  @Rule(RuleType.string().required().allow(''))
    sharedValue: string
  @Rule(RuleType.string().valid('text', 'secret').required())
    valueType: 'text' | 'secret'
  @Rule(RuleType.boolean().required())
    enabled: boolean
  @Rule(RuleType.number().required())
    order: number
}
export class AddProjectEnvironmentDto {
  @Rule(RuleType.string().required())
    projectId: string
  @Rule(RuleType.string().required().allow(''))
    name: string
  @Rule(RuleType.string().required().allow(''))
    baseUrl: string
  @Rule(RuleType.string().required().allow(''))
    description: string
  @Rule(RuleType.number().required())
    order: number
  @Rule(RuleType.string().valid('shared', 'private').required())
    visibilityMode: 'shared' | 'private'
}
export class EditProjectEnvironmentDto {
  @Rule(RuleType.string().required())
    _id: string
  @Rule(RuleType.string().required())
    projectId: string
  @Rule(RuleType.string().required().allow(''))
    name: string
  @Rule(RuleType.string().required().allow(''))
    baseUrl: string
  @Rule(RuleType.string().required().allow(''))
    description: string
  @Rule(RuleType.number().required())
    order: number
  @Rule(RuleType.string().valid('shared', 'private').required())
    visibilityMode: 'shared' | 'private'
}
export class DeleteProjectEnvironmentDto {
  @Rule(RuleType.string().required())
    projectId: string
  @Rule(RuleType.array().items(RuleType.string()).required())
    ids: string[]
}
export class GetProjectEnvironmentListDto {
  @Rule(RuleType.string().required())
    projectId: string
}
export class GetProjectEnvironmentVariableListDto {
  @Rule(RuleType.string().required())
    projectId: string
  @Rule(RuleType.string().required())
    environmentId: string
}
export class BatchUpdateProjectEnvironmentVariableDto {
  @Rule(RuleType.string().required())
    projectId: string
  @Rule(RuleType.string().required())
    environmentId: string
  @Rule(RuleType.array().items(getSchema(EnvironmentVariableItemDto)).required())
    variables: EnvironmentVariableItemDto[]
}
