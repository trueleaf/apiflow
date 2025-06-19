import { createCustomMethodDecorator } from '@midwayjs/core';
import { ReqLimit } from '../types/types.js';

export const REQ_LIMIT_KEY = 'decorator:req_limit_key';
export function ReqLimit(config: ReqLimit): MethodDecorator {
  return createCustomMethodDecorator(REQ_LIMIT_KEY, config);
}
