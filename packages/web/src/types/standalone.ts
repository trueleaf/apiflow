import type { ApidocProjectInfo } from "./project";
import type { HttpNode, FolderNode } from "./httpNode/httpNode";
import type { ApidocProperty } from "./httpNode/types";
import type { WebSocketNode } from "./websocketNode";
import type { HttpMockNode, WebSocketMockNode } from "./mockNode";

export type Standalone = {
  /**
   * 项目列表
   */
  projectList: ApidocProjectInfo[];
  /**
   * 文档列表
   */
  docsList: HttpNode[];
  /**
   * 全局公共请求头列表
   */
  commonHeaders: ApidocProperty<'string'>[];
};

type ExportNode = HttpNode | WebSocketNode | HttpMockNode | WebSocketMockNode | FolderNode;

export type StandaloneExportHtmlParams = {
  projectInfo: {
    projectName: string;
    projectId: string;
  };
  nodes: ExportNode[];
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

