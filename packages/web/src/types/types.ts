// ============================================================================
// 重新导出其他模块的类型，保持向后兼容性
// ============================================================================

// 从common模块导出基础类型
export type {
  Property,
  DeepPartial, 
  JsonData,
  Config,
  WindowState,
  ExportStatus,
  ImportStatus,
  IPCProjectData,
  SharedProjectInfo,
  LocalShareData,
  Language,
  SandboxEvalMessage,
  SandboxEvalSuccessMessage,
  SandboxErrorMessage,
  SandboxReceiveMessage,
  SandboxPostMessage
} from './common';

// 从request模块导出请求相关类型
export type {
  CustomRequestInfo,
  Outcoming,
  FlowNode,
  FlowInfo,
  RequestStackItem,
  SendRequestOptions,
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
  ApidocGroupUser,
  ApidocGroupItem,
  GlobalConfig,
} from './project';

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
  ApidocBanner,
  ApidocOperations,
  ApidocASTInfo,
  ApidocVariable,
  ApidocOperationDeleteInfo,
  ApidocOperationRecord,
  ApidocCodeInfo
} from './apidoc';

