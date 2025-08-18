import { ApidocProjectRules } from "./apidoc/base-info";
import type { ApidocDetail, ApidocProperty } from "./apidoc";
import type { ApidocProjectInfo } from "./project";

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
};export type StandaloneExportHtmlParams = {
  projectInfo: {
    projectName: string;
    projectId: string;
  };
  nodes: {
    _id: string;
    pid: string;
    projectId: string;
    isFolder: boolean;
    sort: number;
    info: ApidocDetail['info'];
    item: ApidocDetail['item'];
    isEnabled: boolean;
  }[];
  variables: {
    name: string;
    value: string;
    type: string;
    fileValue: {
      name: string;
      fileType: string;
      path: string;
    };
  }[];
}

