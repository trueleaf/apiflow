import vm from 'vm';

export type ExecCodeResult = { code: number; data: any; msg: string };

export const execCode = async (
  code: string,
  variables: Record<string, any>
): Promise<ExecCodeResult> => {
  try {
    const sandbox = {
      ...variables,
      Math: Math,
      Date: Date,
      JSON: JSON,
      String: String,
      Number: Number,
      Boolean: Boolean,
      Array: Array,
      Object: Object,
    };
    const context = vm.createContext(sandbox);
    const script = new vm.Script(code);
    const result = script.runInContext(context, { timeout: 1000 });
    return { code: 0, data: result, msg: 'success' };
  } catch (error) {
    return { code: 1, data: null, msg: `Code execution error: ${(error as Error).message}` };
  }
};
