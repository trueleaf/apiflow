export type TextItem = string | { id: string; name: string };
export type AtomicFunc = {
  purpose: string;
  precondition: TextItem[];
  operationSteps: TextItem[];
  expectedResults: TextItem[];
  checkpoints: TextItem[];
  notes: TextItem[];
};

export type ModelNode = {
  modelName: string;
  description: string;
  children: ModelNode[];
  atomicFunc?: AtomicFunc[];
};

export type TestCase = ModelNode[];
