import type { ApidocProjectInfo, ApidocDetail } from "./global";

export type Standalone = {
  /**
   * 项目列表
   */
  projectList: ApidocProjectInfo[];
  /**
   * 文档列表
   */
  docsList: ApidocDetail[];
};