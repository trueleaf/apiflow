import { modelOptions, prop } from '@typegoose/typegoose'

export type EnvironmentHostMapping = {
  hostname: string
  ip: string
}

@modelOptions({
  schemaOptions: { timestamps: true, collection: 'project_environment' },
})
export class ProjectEnvironment {
  @prop()
  public projectId: string
  @prop()
  public name: string
  @prop()
  public baseUrl: string
  @prop()
  public description: string
  @prop({ default: [] })
  public hostMappings: EnvironmentHostMapping[]
  @prop({ default: 0 })
  public order: number
  @prop({ enum: ['shared', 'private'], default: 'shared' })
  public visibilityMode: 'shared' | 'private'
  @prop()
  public creator: string
  @prop({ default: true })
  public isEnabled: boolean
}
