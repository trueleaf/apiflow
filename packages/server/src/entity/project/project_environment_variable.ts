import { modelOptions, prop } from '@typegoose/typegoose'
@modelOptions({
  schemaOptions: { timestamps: true, collection: 'project_environment_variable' },
})
export class ProjectEnvironmentVariable {
  @prop()
  public projectId: string
  @prop()
  public environmentId: string
  @prop()
  public key: string
  @prop()
  public localValue: string
  @prop()
  public sharedValue: string
  @prop({ enum: ['text', 'secret'], default: 'text' })
  public valueType: 'text' | 'secret'
  @prop({ default: true })
  public enabled: boolean
  @prop({ default: 0 })
  public order: number
  @prop()
  public creator: string
  @prop({ default: true })
  public isEnabled: boolean
}
