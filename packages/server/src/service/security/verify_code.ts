import { Config, Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { EmailVerifyCode } from '../../entity/security/email_verify_code.js';
import { GlobalConfig } from '../../types/types.js';
import { EmailService } from './email.js';
import { throwError } from '../../utils/utils.js';

@Provide()
export class VerifyCodeService {
  @Config('emailConfig')
    emailConfig: GlobalConfig['emailConfig'];
  @Inject()
    emailService: EmailService;
  @InjectEntityModel(EmailVerifyCode)
    emailVerifyCodeModel: ReturnModelType<typeof EmailVerifyCode>;
  //生成验证码
  private generateCode(): string {
    const length = this.emailConfig.verifyCodeLength;
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }
  //发送验证码
  public async sendVerifyCode(email: string, type: 'register' | 'login' | 'bind' | 'reset', ip?: string): Promise<void> {
    const code = this.generateCode();
    const expireAt = new Date(Date.now() + this.emailConfig.verifyCodeExpire);
    await this.emailVerifyCodeModel.create({
      email,
      code,
      type,
      expireAt,
      ip,
      isUsed: false,
    });
    await this.emailService.sendVerifyCodeEmail(email, code, type);
  }
  //验证验证码
  public async verifyCode(email: string, code: string, type: 'register' | 'login' | 'bind' | 'reset'): Promise<boolean> {
    const verifyCode = await this.emailVerifyCodeModel.findOne({
      email,
      code,
      type,
      isUsed: false,
      expireAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });
    if (!verifyCode) {
      throwError(1007, '验证码错误或已过期');
      return false;
    }
    verifyCode.isUsed = true;
    await verifyCode.save();
    return true;
  }
  //检查验证码发送频率
  public async checkSendFrequency(email: string, type: 'register' | 'login' | 'bind' | 'reset'): Promise<void> {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentCode = await this.emailVerifyCodeModel.findOne({
      email,
      type,
      createdAt: { $gt: oneMinuteAgo },
    });
    if (recentCode) {
      throwError(1008, '发送验证码过于频繁，请1分钟后再试');
    }
  }
}
