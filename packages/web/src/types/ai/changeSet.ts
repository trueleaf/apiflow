export type ChangeSetStatus = 'draft' | 'previewed' | 'approved' | 'applying' | 'applied' | 'discarded' | 'failed' | 'expired'
export type ChangeNodeType = 'folder' | 'http' | 'websocket' | 'httpMock' | 'websocketMock'
export type ChangeOperation =
  | { type: 'createProject'; name: string; description?: string }
  | { type: 'createNode'; projectId?: string; nodeType: ChangeNodeType; parentId?: string; name: string; data?: Record<string, unknown> }
  | { type: 'updateNode'; projectId: string; nodeId: string; patch: Record<string, unknown> }
  | { type: 'moveNode'; projectId: string; nodeId: string; parentId: string; sort?: number }
  | { type: 'deleteNode'; projectId: string; nodeId: string; includeChildren: boolean }
  | { type: 'restoreNode'; projectId: string; nodeId: string }
  | { type: 'updateVariables'; projectId: string; variables: Array<Record<string, unknown>> }
  | { type: 'updateCommonHeaders'; projectId: string; headers: Array<Record<string, unknown>> }
export type ChangeSet = {
  id: string;
  conversationId: string;
  runId: string;
  targetProjectId: string | null;
  title: string;
  description: string;
  operations: ChangeOperation[];
  status: ChangeSetStatus;
  baseRevision: string;
  createdAt: number;
  expiresAt: number;
  approvalId?: string;
  errorCode?: string;
  errorMessage?: string;
}
export type ChangeSetPreviewItem = {
  operation: ChangeOperation['type'];
  target: string;
  before?: unknown;
  after?: unknown;
  risk: 'low' | 'medium' | 'high';
}
export type ChangeSetPreview = {
  changeSet: ChangeSet;
  items: ChangeSetPreviewItem[];
  valid: boolean;
  errors: string[];
}
