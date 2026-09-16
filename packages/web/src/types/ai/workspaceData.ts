import type { DBSchema } from 'idb'
import type { ApiNode, ApidocProjectInfo, ApidocProperty, ApidocVariable } from '..'

export type WorkspaceDataSchema = DBSchema & {
  projects: { key: string; value: ApidocProjectInfo };
  httpNodeList: { key: string; value: ApiNode; indexes: { projectId: string } };
  variables: { key: string; value: ApidocVariable; indexes: { projectId: string } };
  commonHeaders: { key: string; value: ApidocProperty<'string'> & { _sort?: number; isDeleted?: boolean } };
  agentReceipts: { key: string; value: { changeSetId: string; targetProjectId: string | null } };
  migrations: { key: string; value: boolean };
}
