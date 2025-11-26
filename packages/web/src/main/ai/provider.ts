import { BuiltInProvider, BuiltInProviderConfig } from "@src/types/ai/agent.type.ts";

export const BUILT_IN_PROVIDERS: Record<BuiltInProvider, BuiltInProviderConfig> = {
  deepseek: {
    baseURL: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-reasoner']
  },
};