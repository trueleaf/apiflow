/*
|--------------------------------------------------------------------------
| 转换swagger，openapi格式数据
|--------------------------------------------------------------------------
| jsonSchema     https://json-schema.org/
| openapi        https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md
| swaggerEditor  https://editor.swagger.io/
|
*/

import jsontoxml from 'jsontoxml'
import type { OpenAPIV3 } from 'openapi-types';
import type { ApidocProperty, ApidocDetail, ApidocPropertyType, ApidocHttpRequestMethod, ApidocBodyRawType, ApidocResponseContentType } from '@src/types/global'
import { uuid, apidocGenerateProperty, apidocGenerateApidoc } from '@/helper/index'
import { t } from 'i18next'

//=====================================项目信息====================================//
type ProjectInfo = {
  projectName: string,
  version: string,
};
//=====================================接口前缀信息====================================//
type ServerInfo = {
  name: string,
  url: string,
  remark: string
}
//=====================================请求方法====================================//
type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'options' | 'head' | 'patch' | 'trace'
//=====================================解析parameter返回格式====================================//
type ConvertParams = {
  paths: ApidocProperty<'string'>[],
  query: ApidocProperty<'string'>[],
  headers: ApidocProperty<'string'>[],
  cookies: ApidocProperty<'string'>[],
  body: ApidocProperty[],
}
//=====================================解析requestBody返回值====================================//
type ConvertRequestBody = {
  /**
     * json类型参数
    */
  json: ApidocProperty[],
  /**
     * formData类型参数
     */
  formdata: ApidocProperty[],
  /**
     * urlencoded类型参数
     */
  urlencoded: ApidocProperty[],
  /**
     * raw类型参数
     */
  raw: {
    data: string,
    dataType: ApidocBodyRawType
  },
}
//=====================================解析response返回值====================================//
type ConvertResponse = {
  _id: string,
  title: string,
  statusCode: number,
  value: {
    file: {
      url: string,
      raw: string
    },
    strJson: string,
    json: ApidocProperty[],
    dataType: ApidocResponseContentType,
    text: string
  }
}
//=========================================================================//
const HTTP_METHOD = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']
// const VALID_CONTENT_TYPE: ApidocContentType[] = ["application/json", "application/x-www-form-urlencoded", "text/javascript", "multipart/form-data", "text/plain", "application/xml", "text/html"]

class OpenApiTranslator {
  public projectId: string;

  public openApiData: OpenAPIV3.Document;

  constructor(projectId: string, data: OpenAPIV3.Document) {
    this.projectId = projectId; //项目id
    this.openApiData = data; //openapi数据
  }

  /**
     * 获取openapi版本信息
     */
  getVersion(): string {
    if (!this.openApiData.openapi) {
      console.warn(t('缺少Version信息'));
      return '';
    }
    return this.openApiData.openapi
  }

  /**
     * 获取项目信息 https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#infoObject
     */
  getProjectInfo(): ProjectInfo {
    const openApiInfo = this.openApiData.info;
    if (!openApiInfo) {
      console.warn(t('缺少Info字段'))
    }
    return {
      projectName: openApiInfo?.title || '',
      version: openApiInfo?.version || '',
    };
  }

  /**
     * 获取服务器信息 https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#serverObject
     */
  getServersInfo(): ServerInfo[] {
    const openApiServers = this.openApiData.servers;
    const result: ServerInfo[] = [];
    if (!openApiServers) {
      console.warn(t('缺少servers字段'));
      return result;
    }
    if (!Array.isArray(openApiServers)) {
      console.warn(t('servers字段必须为数组'));
      return result;
    }
    openApiServers.forEach((server, index) => {
      const variables = server.variables || {};
      const keys = Object.keys(variables);
      const varValue = keys.map((key) => {
        if (variables[key].enum) {
          console.warn(t('server对象中存在多个变量枚举值，但接口工具仅解析默认值'));
        }
        return {
          key,
          value: variables[key].default,
        }
      })
      const url = server.url.replace(/{([^{}]+)}/g, ($1, $2) => {
        const matched = varValue.find((val) => val.key === $2);
        return matched?.value || $1
      })
      result.push({
        name: `${t('服务器')}${index + 1}`,
        url,
        remark: server.description || '',
      });
    })
    return result;
  }

  /**
     * 获取文档信息 https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#pathItemObject
     */
  getDocsInfo(folderNamedType: 'tag' | 'url' | 'none' = 'none'): ApidocDetail[] {
    const serversInfo = this.getServersInfo();
    const openApiDocInfo = this.openApiData.paths;
    const docsResult: ApidocDetail[] = [];
    const allTags: Set<string> = new Set();
    if (!openApiDocInfo) {
      console.warn(t('缺少paths字段'));
      return docsResult;
    }
    Object.keys(openApiDocInfo).forEach((reqUrl) => {
      const pathObjectInfo = openApiDocInfo[reqUrl];
      let pid = '';
      if (folderNamedType === 'url') {
        pid = uuid();
        const folderDoc = apidocGenerateApidoc();
        folderDoc.projectId = this.projectId;
        folderDoc._id = pid; //目录id
        folderDoc.isFolder = true; //是目录
        folderDoc.sort = Date.now(); //排序
        folderDoc.info.type = 'folder';
        folderDoc.info.name = reqUrl;
        folderDoc.info.name = reqUrl;
        folderDoc.item = {} as ApidocDetail['item']; //folder的item属性为空
        docsResult.push(folderDoc);
      }
      if (pathObjectInfo == null) {
        console.warn(`路径${reqUrl}相关属性为空`);
        return
      }
      Object.keys(pathObjectInfo).forEach((pathKey) => {
        const moyuDoc = apidocGenerateApidoc();
        moyuDoc._id = uuid();
        moyuDoc.projectId = this.projectId;
        const matchedMethodKey = HTTP_METHOD.find(v => v === pathKey); //属性是否为http请求方法
        if (matchedMethodKey) {
          const pathItemObject = pathObjectInfo[matchedMethodKey as HttpMethod];
          if (!pathItemObject) {
            console.warn(`paths参数中存在方法${matchedMethodKey}但是所匹配数据为空`);
            return
          }
          const tags = pathItemObject?.tags;
          if (tags && tags.length > 0) {
            allTags.add(tags[0]);
          }
          moyuDoc.pid = pid;
          moyuDoc.sort = Date.now(); //排序
          moyuDoc.info.name = pathItemObject.summary || '未命名'; //文档名称
          moyuDoc.info.description = pathItemObject.description || ''; //文档备注
          moyuDoc.info.type = 'api';
          moyuDoc.item.method = matchedMethodKey.toUpperCase() as ApidocHttpRequestMethod;
          moyuDoc.item.url.host = serversInfo[0] ? serversInfo[0].url : '';
          moyuDoc.item.url.path = reqUrl;
          const parameters = this.convertParameters(pathItemObject.parameters);
          const requestBody = this.convertRequestBody(pathItemObject.requestBody);
          const allResponse = this.convertResponse(pathItemObject.responses);
          moyuDoc.item.paths = parameters.paths;
          moyuDoc.item.headers = parameters.headers;
          moyuDoc.item.queryParams = parameters.query;
          // moyuDoc.item.requestBody.rawJson = requestBody;
          moyuDoc.item.requestBody.formdata = requestBody.formdata as ApidocProperty<'string'>[];
          moyuDoc.item.requestBody.urlencoded = requestBody.urlencoded as ApidocProperty<'string'>[];
          moyuDoc.item.requestBody.raw.data = requestBody.raw.data;
          moyuDoc.item.requestBody.raw.dataType = requestBody.raw.dataType;
          if (allResponse.length > 0) {
            moyuDoc.item.responseParams = [];
            allResponse.forEach(response => {
              moyuDoc.item.responseParams.push(response);
            })
          }
          docsResult.push(moyuDoc);
        } else {
          console.warn(`
                        paths参数中应该存在"get" | "post" | "put" | "delete" | "options" | "head" | "patch" | "trace"
                        $ref： ${pathObjectInfo.$ref}
                        summary： ${pathObjectInfo.summary};
                        description： ${pathObjectInfo.description};
                        servers： ${pathObjectInfo.servers}
                        parameters： ${pathObjectInfo.parameters}
                    `)
        }
      });
    })
    //默认为按照tag为文件名
    if (!folderNamedType || folderNamedType === 'tag') {
      const tags = Array.from(allTags);
      tags.sort().forEach((tag) => {
        const pid = uuid();
        const folderDoc = apidocGenerateApidoc();
        folderDoc.projectId = this.projectId;
        folderDoc._id = pid; //目录id
        folderDoc.isFolder = true; //是目录
        folderDoc.sort = Date.now(); //排序
        folderDoc.item = {} as ApidocDetail['item']; //目录item数据为空
        folderDoc.info.type = 'folder';
        folderDoc.info.name = tag;

        docsResult.push(folderDoc);
      })
    } else if (folderNamedType === 'none') {
      return docsResult;
    }
    return docsResult;
  }

  /**
     * 解析parameter参数
     */
  convertParameters(parameters: OpenAPIV3.PathItemObject['parameters']): ConvertParams {
    const result = {
      paths: [],
      query: [],
      cookies: [],
      headers: [],
      body: []
    } as ConvertParams
    if (!parameters) {
      return result;
    }
    for (let i = 0; i < parameters.length; i += 1) {
      const apidocProperty = apidocGenerateProperty();
      const parameter = parameters[i];
      const paramsPosition = (parameter as OpenAPIV3.ParameterObject).in;
      const { name, description, required } = (parameter as OpenAPIV3.ParameterObject);
      apidocProperty.key = name;
      apidocProperty.description = description || '';
      apidocProperty.required = required || true;
      //=========================================================================//
      if (paramsPosition === 'query') {
        result.query.push(apidocProperty);
      } else if (paramsPosition === 'path') {
        result.paths.push(apidocProperty);
      } else if (paramsPosition === 'header') {
        result.headers.push(apidocProperty);
      } else if (paramsPosition === 'cookies') {
        result.cookies.push(apidocProperty);
      } else if (paramsPosition === 'body') {
        if ((parameter as OpenAPIV3.ParameterObject).schema) {
          result.body = [this.convertSchemaObjectToParams((parameter as OpenAPIV3.ParameterObject).schema as (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject))]
        } else {
          result.body.push(apidocProperty);
        }
      } else {
        console.warn(`无法解析的参数位置in${paramsPosition}, Parameter的in字段仅允许query、path、header、cookie、body`);
      }
    }
    return result;
  }

  /**
     * 解析requestBody
     */
  convertRequestBody(requestBody: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject | undefined): ConvertRequestBody {
    const result = {
      json: [],
      formdata: [],
      urlencoded: [],
      raw: {
        data: '',
        dataType: 'text/plain'
      },
    } as ConvertRequestBody;
    if (!requestBody) {
      return result;
    }
    const apidocProperty = apidocGenerateProperty<ApidocPropertyType>();
    const { description, required, content } = (requestBody as OpenAPIV3.RequestBodyObject);
    apidocProperty.description = description || '';
    apidocProperty.required = required || true;
    Object.keys(content).forEach(contentType => {
      const bodyData = content[contentType]
      if (!bodyData.schema) {
        console.warn(`${contentType}下无数据`)
        return;
      }
      if (contentType.toLocaleLowerCase().startsWith('application/json')) {
        result.json = [this.convertSchemaObjectToParams(bodyData.schema)];
      }
      if (contentType.toLocaleLowerCase().startsWith('application/x-www-form-urlencoded')) {
        // result.urlencoded = this.convertSchemaObjectToParams(bodyData.schema).children
      }
      if (contentType.toLocaleLowerCase().startsWith('multipart/form-data')) {
        // result.formdata = this.convertSchemaObjectToParams(bodyData.schema).children
      }
      if (contentType.toLocaleLowerCase().startsWith('*/*')) { //这种情况按照json格式解析
        console.warn('*/*按照json格式解析');
        result.json = [this.convertSchemaObjectToParams(bodyData.schema)];
      }
      if (contentType.toLocaleLowerCase().startsWith('application/xml')) { //xml解析
        result.raw.dataType = 'application/xml';
        result.raw.data = jsontoxml(this.convertSchemaObjectToParams(bodyData.schema));
      }
      if (contentType.toLocaleLowerCase().startsWith('text/*')) { //出文本解析
        result.raw.dataType = 'text/plain';
        result.raw.data = '';
      }
      if (contentType.toLocaleLowerCase().startsWith('text/plain')) { //出文本解析
        result.raw.dataType = 'text/plain';
        result.raw.data = '';
      }
    });
    return result;
  }

  /**
     * 解析response
     */
  convertResponse(response: OpenAPIV3.ResponsesObject): ConvertResponse[] {
    const convertedResponse: ConvertResponse[] = [];
    Object.keys(response).forEach(code => {
      const resItem = response[code] as OpenAPIV3.ResponseObject;
      const result = {
        _id: uuid(),
        title: '',
        statusCode: 200,
        value: {
          file: {
            url: '',
            raw: '',
          },
          strJson: '',
          json: [],
          dataType: '',
          text: '',
        }
      } as ConvertResponse;
      result.statusCode = Number(code);
      result.title = resItem.description;
      if ((response[code] as OpenAPIV3.ReferenceObject).$ref) { //引用类型
        console.warn(`无法解析引用类型的返回值${JSON.stringify(resItem)}`);
        return;
      }
      // // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // if ((response[code] as any).schema as OpenAPIV3.ReferenceObject) { //兼容老旧规则
      //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
      //     result.value.json = [this.convertSchemaObjectToParams((response[code] as any).schema)]
      //     // console.log(this.convertSchemaObjectToParams((response[code] as any).schema))
      //     // result.value.json = [this.convertSchemaObjectToParams((response[code] as any).schema)];
      // }
      const resContent = resItem.content;
      if (resContent) {
        Object.keys(resContent).forEach(contentType => {
          const bodyData = resContent[contentType]
          if (!bodyData.schema) {
            console.warn(`${contentType}下无数据`)
            return;
          }
          if (contentType.toLocaleLowerCase().startsWith('application/json')) {
            result.value.dataType = 'application/json'
            result.value.json = [this.convertSchemaObjectToParams(bodyData.schema)];
          }
          if (contentType.toLocaleLowerCase().startsWith('*/*')) { //这种情况按照json格式解析
            console.warn('*/*按照json格式解析');
            result.value.dataType = 'application/json'
            result.value.json = [this.convertSchemaObjectToParams(bodyData.schema)];
          }
        });
      }
      convertedResponse.push(result);
    })
    return convertedResponse;
  }

  /**
     * 解析schemaObject
     */
  convertSchemaObjectToParams(schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject, key?: string, deep = 1): ApidocProperty {
    const apidocProperty = apidocGenerateProperty<ApidocPropertyType>();
    apidocProperty.key = key || '';
    if (deep === 5) { //防止无线死循环
      return apidocProperty;
    }
    if ((schema as OpenAPIV3.ReferenceObject).$ref) { //引用
      const schemaObject = this.getRefSchema((schema as OpenAPIV3.ReferenceObject).$ref);
      if (schemaObject) {
        return this.convertSchemaObjectToParams(schemaObject, undefined, deep + 1);
      }
    } else if ((schema as OpenAPIV3.SchemaObject).type === 'array') { //数组类型
      const schemaInfo = (schema as OpenAPIV3.ArraySchemaObject);
      apidocProperty.type = 'array';
      apidocProperty.description = schemaInfo.description || '';
    } else if ((schema as OpenAPIV3.SchemaObject).type === 'boolean') { //布尔类型
      const schemaInfo = (schema as OpenAPIV3.SchemaObject);
      apidocProperty.type = 'boolean';
      apidocProperty.value = schemaInfo.default ? schemaInfo.default.toString() : '';
      apidocProperty.description = schemaInfo.description || '';
    } else if ((schema as OpenAPIV3.SchemaObject).type === 'number') { //数字类型
      const schemaInfo = (schema as OpenAPIV3.SchemaObject);
      apidocProperty.type = 'number';
      apidocProperty.value = schemaInfo.default ? schemaInfo.default.toString() : '';
      apidocProperty.description = schemaInfo.description || '';
    } else if ((schema as OpenAPIV3.SchemaObject).type === 'integer') { //数字类型
      const schemaInfo = (schema as OpenAPIV3.SchemaObject);
      apidocProperty.type = 'number';
      apidocProperty.value = schemaInfo.default ? schemaInfo.default.toString() : '';
      apidocProperty.description = schemaInfo.description || '';
    } else if ((schema as OpenAPIV3.SchemaObject).type === 'object') { //对象类型
      const schemaInfo = (schema as OpenAPIV3.SchemaObject);
      apidocProperty.type = 'object';
      apidocProperty.description = schemaInfo.description || '';
    } else if ((schema as OpenAPIV3.SchemaObject).type === 'string') { //字符串类型
      const schemaInfo = (schema as OpenAPIV3.SchemaObject);
      if (schemaInfo.format === 'byte' || schemaInfo.format === 'binary') { //二进制
        apidocProperty.type = 'file'
      } else {
        apidocProperty.type = 'string';
      }
      apidocProperty.value = schemaInfo.default ? schemaInfo.default.toString() : '';
      apidocProperty.description = schemaInfo.description || '';
    } else if ((schema as OpenAPIV3.SchemaObject).type == null && (schema as OpenAPIV3.SchemaObject).properties) { //不存在type但是存在property
      const schemaInfo = (schema as OpenAPIV3.SchemaObject);
      apidocProperty.type = 'object';
      apidocProperty.description = schemaInfo.description || '';
    }
    return apidocProperty;
  }

  /**
     * 获取ref对应的Schema
     */
  getRefSchema(ref: string): OpenAPIV3.SchemaObject | null {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let copiedOpenApiData: any = JSON.parse(JSON.stringify(this.openApiData));
    if (!ref.startsWith('#')) {
      console.warn(`当前ref路径为${ref}, 路径应该以#开头`);
      return null;
    }
    const refPath = ref.replace('#/', '').split('/');
    let schemaResult: OpenAPIV3.SchemaObject | null = null;
    for (let i = 0; i < refPath.length; i += 1) {
      if (!copiedOpenApiData[refPath[i]]) {
        console.warn(`无法找到${ref}对应的schema`)
        return null;
      }
      copiedOpenApiData = copiedOpenApiData[refPath[i]]
    }
    schemaResult = copiedOpenApiData;
    return schemaResult;
  }
}

export default OpenApiTranslator;
