export type OpenAPIResponse = {
  description: string;
  content?: Record<string, {
    schema: unknown;
    examples?: Record<string, { summary: string; value: unknown }>;
  }>;
};
