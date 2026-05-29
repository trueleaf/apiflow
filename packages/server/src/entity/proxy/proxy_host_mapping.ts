import { modelOptions, prop } from '@typegoose/typegoose';
import { Timestamps } from '../common/common.js';

@modelOptions({
  schemaOptions: { timestamps: true, collection: 'proxy_host_mappings' },
})
export class ProxyHostMapping extends Timestamps {
  @prop({ required: true, unique: true })
  public hostname: string;

  @prop({ required: true })
  public ip: string;

  @prop({ default: '' })
  public description: string;
}
