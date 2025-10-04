import { MockLog } from '@src/types/mockNode';

export class MockLogger {
  private mockLogs: Map<string, MockLog[]> = new Map();

  public addLog(log: MockLog): void {
    const nodeId = log.nodeId;
    if (!this.mockLogs.has(nodeId)) {
      this.mockLogs.set(nodeId, []);
    }
    this.mockLogs.get(nodeId)!.push(log);
  }

  public getLogsByNodeId(nodeId: string): MockLog[] {
    return this.mockLogs.get(nodeId) || [];
  }
}