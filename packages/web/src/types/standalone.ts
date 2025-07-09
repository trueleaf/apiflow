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
   * 公共请求头列表
   */
  commonHeaders: ApidocProperty<'string'>[];
};