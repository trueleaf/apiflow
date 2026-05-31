import { modelOptions, prop } from '@typegoose/typegoose'
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
  @prop({ default: 0 })
  public order: number
  @prop({ enum: ['shared', 'private'], default: 'shared' })
  public visibilityMode: 'shared' | 'private'
  @prop()
  public creator: string
  @prop({ default: true })
  public isEnabled: boolean
}
