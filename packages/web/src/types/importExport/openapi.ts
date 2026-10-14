export type OpenAPISpec = {
  openapi: string;
  info: {
    title: string;
    description: string;
    version: string;
    contact: { name: string };
  };
  servers: { url: string; description: string }[];
  paths: Record<string, Record<string, OpenAPIOperation>>;
  components: {
    schemas: Record<string, unknown>;
    securitySchemes: Record<string, unknown>;
  };
};
export type OpenAPIOperation = {
  summary: string;
  description: string;
  tags: string[];
  parameters: {
    name: string;
    in: 'path' | 'query' | 'header';
    required: boolean;
    description: string;
    schema: { type: string };
  }[];
  requestBody?: OpenAPIRequestBody;
  responses: Record<string, OpenAPIResponse>;
};
export type OpenAPIRequestBody = {
  required: boolean;
  content: Record<string, { schema: unknown }>;
};
export type OpenAPIResponse = {
  description: string;
  content?: Record<string, {
    schema: unknown;
    examples?: Record<string, { summary: string; value: unknown }>;
  }>;
};
