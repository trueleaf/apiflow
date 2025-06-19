import { ResponseWrapper } from '../common/common.js';

/**
 * 验证码返回参数
 */
export type ResSMSCode = ResponseWrapper<{
  code: string;
}>;
