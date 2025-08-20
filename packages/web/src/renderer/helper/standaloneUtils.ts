import type { ApidocProjectInfo, HttpNode } from '@src/types';
import { WebSocketNode } from '@src/types/websocket/websocket.ts';

export const generateEmptyProject = (_id: string): ApidocProjectInfo => {
  return {
    _id,
    docNum: 0,
    owner: {
      id: '',
      name: 'me'
    },
    members: [],
    projectName: '',
    remark: '',
    updatedAt: new Date().toISOString(),
    isStared: false
  }
}

export const generateEmptyHttpNode = (_id: string): HttpNode => {
  return {
    _id,
    pid: '',
    projectId: '',
    sort: 0,
    info: {
      name: '',
      description: '',
      version: '1.0.0',
      type: 'api',
      creator: '',
      maintainer: '',
      deletePerson: '',
    },
    item: {
      method: 'GET',
      url: {
        prefix: '',
        path: ''
      },
      paths: [],
      queryParams: [],
      requestBody: {
        mode: 'json',
        rawJson: '',
        formdata: [],
        urlencoded: [],
        raw: {
          data: '',
          dataType: 'application/json'
        },
        binary: {
          mode: 'var',
          varValue: '',
          binaryValue: {
            path: '',
            raw: '',
            id: ''
          }
        }
      },
      responseParams: [],
      headers: [],
      contentType: ''
    },
    preRequest: {
      raw: ''
    },
    afterRequest: {
      raw: ''
    },
    mockInfo: {
      path: '',
      httpStatusCode: 200,
      responseDelay: 0,
      responseType: 'json',
      responseHeaders: [],
      json: '',
      image: {
        type: 'png',
        width: 100,
        height: 100,
        size: 1024,
        fontSize: 14,
        color: '#000000',
        backgroundColor: '#ffffff'
      },
      file: {
        type: 'custom',
        filePath: ''
      },
      text: '',
      customResponseScript: ''
    }
  }
}
export const generateEmptyWebsocketNode = (_id: string): WebSocketNode => {
  return {
    _id,
    pid: '',
    projectId: '',
    sort: 0,
    info: {
      name: '',
      description: '',
      version: '1.0.0',
      type: 'websocket',
      creator: '',
      maintainer: '',
      deletePerson: '',
    },
    item: {
      protocol: 'ws',
      url: '',
      headers: [],
    },
    preRequest: {
      raw: ''
    },
    afterRequest: {
      raw: ''
    },
  }
}