import { Config, Provide } from '@midwayjs/core';
import { GlobalConfig } from '../../types/types.js';
import * as $Dm20151123 from '@alicloud/dm20151123';
import * as $OpenApi from '@alicloud/openapi-client';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Dm20151123Client = require('@alicloud/dm20151123').default;

@Provide()
export class EmailService {
  @Config('emailConfig')
    emailConfig: GlobalConfig['emailConfig'];
  private client;
  //初始化阿里云邮件推送客户端
  private getClient() {
    if (!this.client) {
      const config = new $OpenApi.Config({
        accessKeyId: this.emailConfig.accessKeyId,
        accessKeySecret: this.emailConfig.accessKeySecret,
      });
      config.endpoint = `dm.${this.emailConfig.region}.aliyuncs.com`;
      this.client = new Dm20151123Client(config);
    }
    return this.client;
  }
  //发送验证码邮件
  public async sendVerifyCodeEmail(email: string, code: string, type: 'register' | 'login' | 'bind' | 'reset'): Promise<void> {
    const typeTextMap = {
      register: '注册',
      login: '登录',
      bind: '绑定邮箱',
      reset: '重置密码',
    };
    const typeText = typeTextMap[type];
    const subject = `【ApiFlow】${typeText}验证码`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">【ApiFlow】${typeText}验证码</h2>
        <p style="color: #666; font-size: 14px;">您正在进行${typeText}操作，验证码为：</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; color: #409eff; letter-spacing: 5px;">${code}</span>
        </div>
        <p style="color: #999; font-size: 12px;">验证码5分钟内有效，请勿泄露给他人。</p>
        <p style="color: #999; font-size: 12px;">如非本人操作，请忽略此邮件。</p>
      </div>
    `;
    const singleSendMailRequest = new $Dm20151123.SingleSendMailRequest({
      accountName: this.emailConfig.accountName,
      addressType: 1,
      replyToAddress: false,
      toAddress: email,
      subject: subject,
      htmlBody: htmlBody,
      fromAlias: this.emailConfig.fromAlias,
    });
    try {
      const client = this.getClient();
      await client.singleSendMail(singleSendMailRequest);
    } catch (error) {
      throw new Error(`邮件发送失败: ${error.message}`);
    }
  }
}
