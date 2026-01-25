import type { HttpNode, HttpNodeBodyParams, HttpNodeResponseParams } from '@src/types';

type OpenAPISpec = {
  openapi: string;
  info: {
    title: string;
    description: string;
    version: string;
    contact: {
      name: string;
    };
  };
  servers: {
    url: string;
    description: string;
  }[];
  paths: Record<string, Record<string, OpenAPIOperation>>;
  components: {
    schemas: Record<string, unknown>;
    securitySchemes: Record<string, unknown>;
  };
};

type OpenAPIOperation = {
  summary: string;
  description: string;
  tags: string[];
  parameters: OpenAPIParameter[];
  requestBody?: OpenAPIRequestBody;
  responses: Record<string, OpenAPIResponse>;
};

type OpenAPIParameter = {
  name: string;
  in: 'path' | 'query' | 'header';
  required: boolean;
  description: string;
  schema: {
    type: string;
  };
};

type OpenAPIRequestBody = {
  required: boolean;
  content: Record<string, {
    schema: unknown;
  }>;
};

type OpenAPIResponse = {
  description: string;
  content?: Record<string, {
    schema: unknown;
  }>;
};

export class OpenAPIConverter {
  convertToOpenAPI(
    projectName: string,
    nodes: HttpNode[]
  ): OpenAPISpec {
    const apiDocs = nodes.filter(doc => doc.info.type === 'http');
    const openApiSpec: OpenAPISpec = {
      openapi: '3.0.3',
      info: {
        title: projectName,
        description: '',
        version: '1.0.0',
        contact: {
          name: ''
        }
      },
      servers: [],
      paths: {},
      components: {
        schemas: {},
        securitySchemes: {}
      }
    };
    apiDocs.forEach(doc => {
      try {
        let path = doc.item.url.path;
        if (path.startsWith('http://') || path.startsWith('https://')) {
          path = path.replace(/^https?:\/\/[^/]+/, '');
        }
        path = path.split('?')[0].split('#')[0];
        if (!path.startsWith('/')) {
          path = '/' + path;
        }
        const method = doc.item.method.toLowerCase();
        if (!openApiSpec.paths[path]) {
          openApiSpec.paths[path] = {};
        }
        const operation: OpenAPIOperation = {
          summary: doc.info.name,
          description: doc.info.description || '',
          tags: [doc.info.type || 'api'],
          parameters: [],
          responses: {}
        };
        if (doc.item.paths && doc.item.paths.length > 0) {
          doc.item.paths.forEach(param => {
            if (param.key) {
              operation.parameters.push({
                name: param.key,
                in: 'path',
                required: param.required,
                description: param.description || '',
                schema: {
                  type: param.type || 'string'
                }
              });
            }
          });
        }
        if (doc.item.queryParams && doc.item.queryParams.length > 0) {
          doc.item.queryParams.forEach(param => {
            if (param.key) {
              operation.parameters.push({
                name: param.key,
                in: 'query',
                required: param.required,
                description: param.description || '',
                schema: {
                  type: param.type || 'string'
                }
              });
            }
          });
        }
        if (doc.item.headers && doc.item.headers.length > 0) {
          doc.item.headers.forEach(header => {
            if (header.key) {
              operation.parameters.push({
                name: header.key,
                in: 'header',
                required: header.required,
                description: header.description || '',
                schema: {
                  type: header.type || 'string'
                }
              });
            }
          });
        }
        if (doc.item.requestBody && doc.item.requestBody.mode !== 'none') {
          const requestBody = this.convertRequestBody(doc.item.requestBody);
          if (requestBody) {
            operation.requestBody = requestBody;
          }
        }
        if (doc.item.responseParams && doc.item.responseParams.length > 0) {
          doc.item.responseParams.forEach(response => {
            const responseObj = this.convertResponse(response);
            if (responseObj) {
              operation.responses[response.statusCode] = responseObj;
            }
          });
        }
        if (Object.keys(operation.responses).length === 0) {
          operation.responses['200'] = {
            description: '成功响应'
          };
        }
        openApiSpec.paths[path][method] = operation;
      } catch (error) {
        console.warn(`转换API失败: ${doc.info.name}`, error);
      }
    });
    return openApiSpec;
  }
  private convertRequestBody(requestBody: HttpNodeBodyParams): OpenAPIRequestBody | null {
    const result: OpenAPIRequestBody = {
      required: true,
      content: {}
    };
    switch (requestBody.mode) {
      case 'json':
        if (requestBody.rawJson) {
          try {
            const jsonSchema = this.parseJsonToSchema(requestBody.rawJson);
            result.content['application/json'] = {
              schema: jsonSchema
            };
          } catch (error) {
            result.content['application/json'] = {
              schema: {
                type: 'object',
                description: 'JSON请求体'
              }
            };
          }
        }
        break;
      case 'formdata':
        if (requestBody.formdata && requestBody.formdata.length > 0) {
          const formDataSchema: {
            type: string;
            properties: Record<string, { type: string; description: string }>;
            required: string[];
          } = {
            type: 'object',
            properties: {},
            required: []
          };
          requestBody.formdata.forEach(field => {
            if (field.key) {
              formDataSchema.properties[field.key] = {
                type: field.type || 'string',
                description: field.description || ''
              };
              if (field.required) {
                formDataSchema.required.push(field.key);
              }
            }
          });
          result.content['multipart/form-data'] = {
            schema: formDataSchema
          };
        }
        break;
      case 'urlencoded':
        if (requestBody.urlencoded && requestBody.urlencoded.length > 0) {
          const urlencodedSchema: {
            type: string;
            properties: Record<string, { type: string; description: string }>;
            required: string[];
          } = {
            type: 'object',
            properties: {},
            required: []
          };
          requestBody.urlencoded.forEach(field => {
            if (field.key) {
              urlencodedSchema.properties[field.key] = {
                type: field.type || 'string',
                description: field.description || ''
              };
              if (field.required) {
                urlencodedSchema.required.push(field.key);
              }
            }
          });
          result.content['application/x-www-form-urlencoded'] = {
            schema: urlencodedSchema
          };
        }
        break;
      case 'raw':
        if (requestBody.raw && requestBody.raw.data) {
          result.content[requestBody.raw.dataType || 'text/plain'] = {
            schema: {
              type: 'string',
              description: '原始数据'
            }
          };
        }
        break;
    }
    if (Object.keys(result.content).length > 0) {
      return result;
    }
    return null;
  }
  private convertResponse(response: HttpNodeResponseParams): OpenAPIResponse | null {
    const responseObj: OpenAPIResponse = {
      description: response.title,
      content: {}
    };
    if (response.value.dataType === 'application/json' && response.value.strJson) {
      try {
        const jsonSchema = this.parseJsonToSchema(response.value.strJson);
        responseObj.content!['application/json'] = {
          schema: jsonSchema
        };
      } catch (error) {
        responseObj.content!['application/json'] = {
          schema: {
            type: 'object',
            description: 'JSON响应'
          }
        };
      }
    } else if (response.value.text) {
      responseObj.content!['text/plain'] = {
        schema: {
          type: 'string',
          description: '文本响应'
        }
      };
    }
    return responseObj;
  }
  private parseJsonToSchema(jsonString: string): unknown {
    try {
      const jsonObj = JSON.parse(jsonString);
      return this.convertJsonToSchema(jsonObj);
    } catch (error) {
      return {
        type: 'object',
        description: 'Invalid JSON'
      };
    }
  }
  private convertJsonToSchema(obj: unknown): unknown {
    if (obj === null) {
      return { type: 'null' };
    }
    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        return {
          type: 'array',
          items: {}
        };
      }
      return {
        type: 'array',
        items: this.convertJsonToSchema(obj[0])
      };
    }
    if (typeof obj === 'object') {
      const properties: Record<string, unknown> = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          properties[key] = this.convertJsonToSchema((obj as Record<string, unknown>)[key]);
        }
      }
      return {
        type: 'object',
        properties
      };
    }
    if (typeof obj === 'string') {
      return { type: 'string' };
    }
    if (typeof obj === 'number') {
      return { type: 'number' };
    }
    if (typeof obj === 'boolean') {
      return { type: 'boolean' };
    }
    return { type: 'string' };
  }
}
