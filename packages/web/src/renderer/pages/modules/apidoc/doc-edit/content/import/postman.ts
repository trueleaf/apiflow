/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/*
|--------------------------------------------------------------------------
| 转换postman格式数据
|--------------------------------------------------------------------------
*/
import { uuid, apidocGenerateApidoc, apidocGenerateProperty } from '@/helper/index'

class PostmanTranslator {
  public projectId: string;

  public variables: { key: string, value: string }[];

  public postmanData: any;

  constructor(projectId: string, data: any) {
    this.projectId = projectId; //项目id
    this.variables = [];
    this.postmanData = data; //openapi数据
  }

  getDocsInfo() {
    const moyuDoc = {
      info: {
        projectName: this.postmanData?.info?.name,
      },
      type: 'postman',
      rules: {},
      docs: [] as any,
      hosts: [],
    };
    const foo = (items: any, pid = '') => {
      for (let i = 0; i < items.length; i += 1) {
        const doc = apidocGenerateApidoc();
        const id = uuid();
        doc._id = id;
        doc.pid = pid;
        const item = items[i];
        const isFolder = !items[i].request;
        doc.info.name = item.name;
        moyuDoc.docs.push(doc);
        if (isFolder) { //文件夹
          doc.info.type = 'folder';
          doc.isFolder = true;
          foo(item.item, id);
        } else {
          doc.info.type = 'api';
          doc.item.method = item.request.method.toUpperCase();
          if (typeof item.request.url === 'string') {
            doc.item.url.path = item.request.url;
          } else {
            doc.item.url.path = item.request.url?.path?.join('/');
          }
          if (item.request.url?.host?.length > 0) {
            doc.item.url.host = `${item.request.url?.protocol ? `${item.request.url?.protocol}://` : ''}${item.request.url?.host?.join('/')}`;
          }
          doc.item.queryParams = item.request.url.query?.map((v: any) => ({
            ...apidocGenerateProperty(),
            key: v.key,
            value: this.convertVariable(v.value),
          })) || [];
          doc.item.headers = item.request.header.filter((v: any) => v.value)?.map((v: any) => ({
            ...apidocGenerateProperty(),
            key: v.key,
            value: this.convertVariable(v.value),
          })) || [];
          if (item.request?.body?.mode === 'formdata') { //formdata数据
            doc.item.contentType = 'multipart/form-data'
            doc.item.requestBody.formdata = item.request?.body?.formdata.map((v: any) => ({
              ...apidocGenerateProperty(),
              key: v.key,
              value: this.convertVariable(v.value),
            })) || [];
          }
          if (item.request?.body?.mode === 'urlencoded') { //urlencoded数据
            doc.item.contentType = 'application/x-www-form-urlencoded'
            doc.item.requestBody.urlencoded = item.request?.body?.urlencoded.map((v: any) => ({
              ...apidocGenerateProperty(),
              key: v.key,
              value: this.convertVariable(v.value),
            })) || [];
          }
          if (item.request?.body?.mode === 'raw') { //json数据
            doc.item.contentType = 'application/json'
            doc.item.requestBody.mode = 'json';
            doc.item.requestBody.rawJson = item.request?.body?.raw || ''
          } else if (item.request?.body?.mode === 'raw' && item.request?.body?.options.rawOptions.language !== 'json') {
            doc.item.requestBody.mode = 'raw';
            doc.item.requestBody.raw.data = item.request?.body?.raw || ''
            doc.item.requestBody.raw.dataType = 'text/plain'
          }
          const preScriptList = item.event?.find((v: any) => v.listen === 'pre-request');
          const afterScriptList = item.event?.find((v: any) => v.listen === 'test');
          doc.preRequest.raw = preScriptList?.script?.exec.join('') || '';
          doc.afterRequest.raw = afterScriptList?.script?.exec.join('') || '';

          doc.item.headers = item.request.header.filter((v: any) => v.value)?.map((v: any) => ({
            ...apidocGenerateProperty(),
            key: v.key,
            value: this.convertVariable(v.value),
          })) || [];
        }
      }
    }
    foo(this.postmanData.item);
    return moyuDoc;
  }

  //转换变量
  convertVariable(val: string): string {
    if (val == null) {
      return '';
    }
    const matchedData = val.toString().match(/{{\s*(\w+)\s*}}/);
    if (val && matchedData) {
      const varInfo = this.variables.find((v) => v.key === matchedData[1]);
      if (varInfo) {
        return val.replace(/{{\s*(\w+)\s*}}/, varInfo.value);
      }
      return val;
    }
    return val;
  }
}

export default PostmanTranslator;
