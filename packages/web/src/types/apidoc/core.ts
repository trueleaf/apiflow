// ============================================================================
// API文档核心类型 - 向后兼容层
// 大部分类型已迁移到 httpNode 和 workbench 模块，这里保留重新导出以保持兼容性
// ============================================================================

// 从 httpNode 重新导出已迁移的类型
export type {
  ApiNode,
  HttpNode,
  FolderNode,
  ApidocType,
  ApidocBaseInfo,
  ApidocProperty,
  HttpNodeRequestMethod,
  HttpNodePropertyType,
  HttpNodeContentType,
  HttpNodeResponseContentType,
  HttpNodeBodyMode,
  HttpNodeBodyRawType,
  HttpNodeRequestParamTypes,
  HttpNodeBodyParams,
  HttpNodeResponseParams,
  ApidocVariable,
  ApidocASTInfo,
  ApidocOperationDeleteInfo,
  ApidocOperationRecord,
  ApidocCodeInfo,
  ApidocOperations
} from '../httpNode';

// ============================================================================
// Banner 类型（从 workbench 模块重新导出）
// ============================================================================

export type {
  ApidocBanner,
  ApidocBannerOfHttpNode,
  ApidocBannerOfHttpMockNode,
  ApidocBannerOfWebsocketNode,
  ApidocBannerOfFolderNode,
  ApidocBannerOfFolderMarkdown
} from '../workbench';
