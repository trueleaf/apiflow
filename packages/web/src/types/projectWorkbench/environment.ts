export type EnvironmentVisibilityMode = 'shared' | 'private'
export type EnvironmentVariableValueType = 'text' | 'secret'
export type EnvironmentVariableScope = 'local' | 'shared'
export type EnvironmentHostMapping = {
  hostname: string
  ip: string
}

export type EnvironmentEntity = {
  id: string
  projectId: string
  name: string
  baseUrl: string
  description: string
  hostMappings: EnvironmentHostMapping[]
  order: number
  isActive: boolean
  visibilityMode: EnvironmentVisibilityMode
  createdAt: number
  updatedAt: number
}
export type EnvironmentVariableEntity = {
  id: string
  projectId: string
  environmentId: string
  key: string
  localValue: string
  sharedValue: string
  valueType: EnvironmentVariableValueType
  enabled: boolean
  order: number
  createdAt: number
  updatedAt: number
}
