import { Rule, RuleType } from '@midwayjs/validate';

export class FileUploadDTO {
  @Rule(RuleType.string().required())
  projectId: string;

  @Rule(RuleType.string().required().max(100))
  fileName: string;

}