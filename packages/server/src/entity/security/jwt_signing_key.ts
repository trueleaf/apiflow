import { modelOptions, prop } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { collection: 'security_jwt_signing_key' } })
export class JwtSigningKey {
  @prop({ required: true })
  public secret: string;
}
