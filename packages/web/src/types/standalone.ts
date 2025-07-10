import { ApidocProjectRules } from "./apidoc/base-info.ts";
import type { ApidocProjectInfo, ApidocDetail, ApidocProperty } from "./global";

export type Standalone = {
  /**
   * 项目列表
   */
  projectList: ApidocProjectInfo[];
  /**
   * 文档列表
   */
  docsList: ApidocDetail[];
  /**
   * 全局公共请求头列表
   */
  commonHeaders: ApidocProperty<'string'>[];
  /**
   * 项目规则
   */
  projectRules: ApidocProjectRules
};