import { prop, modelOptions } from '@typegoose/typegoose';

export class CommonHeaderItem {
  @prop()
    _id: string;

  @prop({ maxlength: 50 })
    key: string;

  @prop({ maxlength: 1024 * 1024 })
    value: string;

  @prop({ default: 'string' })
    type?: string;

  @prop({ maxlength: 1024 })
    description?: string;

  @prop({ default: true })
    select?: boolean;
}

@modelOptions({ schemaOptions: { collection: 'project_common_headers' } })
export class GlobalCommonHeader  {
  @prop({ required: true, unique: true })
    projectId: string;

  @prop({ type: () => [CommonHeaderItem], default: [] })
    commonHeaders: CommonHeaderItem[];
}
