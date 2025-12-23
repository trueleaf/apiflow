export type ExecCodeResult = { code: number; data: any; msg: string };

const buildSandbox = (variables: Record<string, any>) => ({
  ...variables,
  Math: Math,
  Date: Date,
  JSON: JSON,
  String: String,
  Number: Number,
  Boolean: Boolean,
  Array: Array,
  Object: Object,
});

export const execCode = async (
  code: string,
  variables: Record<string, any>
): Promise<ExecCodeResult> => {
  try {
    const codeArgName = '__apiflow_exec_code__';
    const sandbox = buildSandbox(variables);
    if (Object.prototype.hasOwnProperty.call(sandbox, codeArgName)) {
      delete (sandbox as Record<string, any>)[codeArgName];
    }
    const fn = new Function(
      'sandbox',
      codeArgName,
      'with (sandbox) { return eval(' + codeArgName + '); }'
    );
    const result = fn(sandbox, code);
    return { code: 0, data: result, msg: 'success' };
  } catch (error) {
    return { code: 1, data: null, msg: `Code execution error: ${(error as Error).message}` };
  }
};
