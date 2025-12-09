export type AtomicFunc = {
  purpose: string;
  precondition: { id: string; name: string }[];
  operationSteps: { id: string; name: string }[];
  expectedResults: { id: string; name: string }[];
  checkpoints: { id: string; name: string }[];
  notes: { id: string; name: string }[];
};

export type ModelNode = {
  modelName: string;
  description: string;
  children: ModelNode[];
  atomicFunc?: AtomicFunc[];
};

export type TestCase = ModelNode[];
