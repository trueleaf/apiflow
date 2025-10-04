// ============================================================================
// 重新导出其他模块的类型，保持向后兼容性
// ============================================================================

// 从common模块导出基础类型
export type {
  Property,
  DeepPartial, 
  JsonData,
  Language,
  SandboxEvalMessage,
  SandboxEvalSuccessMessage,
  SandboxErrorMessage,
  SandboxReceiveMessage,
  SandboxPostMessage
} from './common';

// 从config模块导出配置类型
export type {
  Config,
  MainConfig
} from './config';

// 从importExport模块导出导入导出类型
export type {
  ExportStatus,
  ImportStatus,
  IPCProjectData
} from './importExport';

// 从main模块导出主进程相关类型
export type {
  WindowState,
  ElectronAPI
} from './main';

// 从share模块导出分享相关类型
export type {
  SharedProjectInfo,
  LocalShareData
} from './share';

// 从request模块导出请求相关类型（底层）
export type {
  SseData,
  ChunkWithTimestampe,
  ParsedSSeData,
  CanApiflowParseType,
  ResponseInfo,
  RendererFormDataBody,
  RedirectOptions,
  GotRequestJsonBody,
  GotRequestFormdataBody,
  GotRequestBinaryBody,
  GotRequestUrlencodedBody,
  GotRequestRawBody,
  GotRequestOptions
} from './request';

// 从httpNode模块导出业务请求类型
export type {
  CustomRequestInfo,
  Outcoming,
  FlowNode,
  FlowInfo,
  RequestStackItem,
  SendRequestOptions
} from './httpNode';

// 从project模块导出项目相关类型
export type {
  CommonResponse,
  ResponseTable,
  PermissionMenu,
  PermissionRoleEnum,
  PermissionUserInfo,
  PermissionUserBaseInfo,
  PermissionClientRoute,
  PermissionServerRoute,
  PermissionClientMenu,
  ApidocProjectEnum,
  ApidocProjectPermission,
  ApidocProjectMemberInfo,
  ApidocProjectInfo,
  ApidocProjectListInfo,
  ApidocProjectVariable,
  ApidocProjectHost,
  ApidocRequestMethodRule,
  ApidocProjectRules,
  ApidocCookieInfo,
  ApidocProjectCommonHeader,
  ApidocProjectBaseInfoState,
  ApidocGroupUser,
  ApidocGroupItem,
  GlobalConfig,
} from './project';

// 从workbench模块导出工作台UI类型
export type {
  ApidocBanner,
  ApidocBannerOfHttpNode,
  ApidocBannerOfHttpMockNode,
  ApidocBannerOfWebsocketNode,
  ApidocBannerOfFolderNode,
  ApidocBannerOfFolderMarkdown
} from './workbench';

// 从apidoc模块导出API文档相关类型
export type {
  HttpNodeRequestMethod,
  HttpNodePropertyType,
  ApidocProperty,
  ApidocType,
  ApidocBaseInfo,
  HttpNodeContentType,
  HttpNodeResponseContentType,
  HttpNodeBodyMode,
  HttpNodeBodyRawType,
  HttpNodeRequestParamTypes,
  HttpNodeBodyParams,
  HttpNodeResponseParams,
  HttpNode,
  ApidocOperations,
  ApidocASTInfo,
  ApidocVariable,
  ApidocOperationDeleteInfo,
  ApidocOperationRecord,
  ApidocCodeInfo
} from './apidoc';

