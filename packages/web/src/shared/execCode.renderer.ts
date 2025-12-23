import type { ExecCodeResult } from './execCode.web';
import { execCode as execCodeWeb } from './execCode.web';

export const execCode = async (
  code: string,
  variables: Record<string, any>
): Promise<ExecCodeResult> => {
  if (typeof window !== 'undefined' && (window as any).electronAPI?.execCode) {
    return (window as any).electronAPI.execCode(code, variables);
  }
  return execCodeWeb(code, variables);
};
