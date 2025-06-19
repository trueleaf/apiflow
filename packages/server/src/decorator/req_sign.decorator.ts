import { createCustomMethodDecorator } from '@midwayjs/core';

export const REQ_SIGN_KEY = 'decorator:req_sign_key';
export function ReqSign(): MethodDecorator {
  return createCustomMethodDecorator(REQ_SIGN_KEY, {});
}
