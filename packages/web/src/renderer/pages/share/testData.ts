import { ApiNode, LocalShareData } from "@src/types/index.ts";

// @ts-nocheck
export const localShareDataTest: LocalShareData = {
  "projectInfo": {
      "projectName": "飞书文档",
      "projectId": "68061e273bba346cff2cc878"
  },
  "nodes": [
    {
      "_id": "9gZU44Su5bM2JIzOSqWaR",
      "pid": "",
      "projectId": "FhtdUsEpBF9VmfYpx4egV",
      "sort": 1768726082156,
      "info": {
        "name": "用户管理API",
        "description": "模拟用户管理接口，支持增删改查操作",
        "version": "1.0.0",
        "type": "httpMock",
        "creator": "",
        "maintainer": "",
        "deletePerson": ""
      },
      "requestCondition": {
        "method": [
          "GET",
          "POST",
          "PUT",
          "DELETE"
        ],
        "url": "/api/mock/users",
        "port": 3001
      },
      "config": {
        "delay": 500
      },
      "response": [
        {
          "name": "默认返回",
          "isDefault": true,
          "conditions": {
            "name": "",
            "scriptCode": "",
            "enabled": false
          },
          "statusCode": 200,
          "headers": {
            "enabled": false,
            "defaultHeaders": [
              {
                "_id": "ylZTq-4K_pfpH7ivbM8HO",
                "key": "Content-Type",
                "type": "string",
                "description": "响应内容类型",
                "value": "application/json; charset=utf-8",
                "required": true,
                "select": true
              },
              {
                "_id": "nlzUxBjEjiGAlg80RPc4I",
                "key": "Cache-Control",
                "type": "string",
                "description": "禁用缓存",
                "value": "no-cache, no-store, must-revalidate",
                "required": true,
                "select": false
              },
              {
                "_id": "ewnVLnb8Oojt-hYsiwl_R",
                "key": "Access-Control-Allow-Origin",
                "type": "string",
                "description": "允许所有域名跨域访问",
                "value": "*",
                "required": true,
                "select": false
              },
              {
                "_id": "VMe0USDunvD2SKlAMFHag",
                "key": "Access-Control-Allow-Methods",
                "type": "string",
                "description": "允许的HTTP方法",
                "value": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "required": true,
                "select": false
              },
              {
                "_id": "DMMjys1dphaLRSiZFvcl3",
                "key": "Access-Control-Allow-Headers",
                "type": "string",
                "description": "允许的请求头字段",
                "value": "Content-Type, Authorization, X-Requested-With",
                "required": true,
                "select": false
              },
              {
                "_id": "iJcHlc03Kl_lnSdbZ_0EZ",
                "key": "X-Content-Type-Options",
                "type": "string",
                "description": "防止浏览器MIME类型嗅探",
                "value": "nosniff",
                "required": true,
                "select": false
              },
              {
                "_id": "ya9WcvabGiG0DPpZr8ZH2",
                "key": "X-Frame-Options",
                "type": "string",
                "description": "禁止在iframe中加载",
                "value": "DENY",
                "required": true,
                "select": false
              }
            ],
            "customHeaders": [
              {
                "_id": "E39Ok1WT3FKIyerDNWXi8",
                "key": "",
                "type": "string",
                "description": "",
                "value": "",
                "required": true,
                "select": true
              }
            ]
          },
          "dataType": "json",
          "sseConfig": {
            "event": {
              "id": {
                "enable": false,
                "valueMode": "increment"
              },
              "event": {
                "enable": true,
                "value": "message"
              },
              "data": {
                "mode": "json",
                "value": ""
              },
              "retry": {
                "enable": false,
                "value": 3000
              }
            },
            "interval": 100,
            "maxNum": 10
          },
          "jsonConfig": {
            "mode": "fixed",
            "fixedData": "",
            "randomSize": 0,
            "prompt": ""
          },
          "textConfig": {
            "mode": "fixed",
            "textType": "text/plain",
            "fixedData": "",
            "randomSize": 0,
            "prompt": ""
          },
          "imageConfig": {
            "mode": "fixed",
            "imageConfig": "png",
            "randomSize": 10,
            "randomWidth": 100,
            "randomHeight": 100,
            "fixedFilePath": ""
          },
          "fileConfig": {
            "fileType": "doc"
          },
          "binaryConfig": {
            "filePath": ""
          },
          "redirectConfig": {
            "statusCode": 302,
            "location": ""
          }
        }
      ],
      "createdAt": "2026-01-18T08:48:02.156Z",
      "updatedAt": "2026-01-18T08:48:02.156Z",
      "isDeleted": false
    },
    {
      "_id": "HIyKQP5yr7mdHebIk3-61",
      "pid": "PKEiBy0XzF4NDmyek-MA5",
      "projectId": "FhtdUsEpBF9VmfYpx4egV",
      "sort": 1768726036998,
      "info": {
        "name": "HEAD检查资源",
        "description": "检查用户资源状态的接口",
        "version": "1.0.0",
        "type": "http",
        "creator": "",
        "maintainer": "",
        "deletePerson": ""
      },
      "item": {
        "method": "HEAD",
        "url": {
          "prefix": "",
          "path": "/api/users"
        },
        "paths": [],
        "queryParams": [],
        "requestBody": {
          "mode": "json",
          "rawJson": "",
          "formdata": [],
          "urlencoded": [],
          "raw": {
            "data": "",
            "dataType": "text/plain"
          },
          "binary": {
            "mode": "var",
            "varValue": "",
            "binaryValue": {
              "path": "",
              "raw": "",
              "id": ""
            }
          }
        },
        "responseParams": [],
        "headers": [],
        "contentType": ""
      },
      "preRequest": {
        "raw": ""
      },
      "afterRequest": {
        "raw": ""
      },
      "isDeleted": false,
      "createdAt": "2026-01-18T08:47:16.998Z",
      "updatedAt": "2026-01-18T08:47:16.998Z"
    },
    {
      "_id": "N72Mh4i5ib76uVnu2v1FE",
      "pid": "PKEiBy0XzF4NDmyek-MA5",
      "projectId": "FhtdUsEpBF9VmfYpx4egV",
      "sort": 1768726062995,
      "info": {
        "name": "完整配置测试接口",
        "description": "包含所有可能字段配置的测试接口",
        "version": "v1.0.0",
        "type": "http",
        "creator": "测试用户",
        "maintainer": "维护人员",
        "deletePerson": ""
      },
      "item": {
        "method": "POST",
        "url": {
          "prefix": "",
          "path": "/api/test/comprehensive"
        },
        "paths": [
          {
            "_id": "p1",
            "key": "id",
            "value": "123",
            "type": "string",
            "required": true,
            "description": "资源ID",
            "select": true
          },
          {
            "_id": "yGb3wM4i4xyn80ADWLcwj",
            "key": "",
            "type": "string",
            "description": "",
            "value": "",
            "required": true,
            "select": true
          }
        ],
        "queryParams": [
          {
            "_id": "q1",
            "key": "page",
            "value": "1",
            "type": "string",
            "required": false,
            "description": "页码",
            "select": true
          },
          {
            "_id": "q2",
            "key": "limit",
            "value": "10",
            "type": "string",
            "required": true,
            "description": "每页数量",
            "select": true
          },
          {
            "_id": "IABNHlwmFZBIAjrwxyYEr",
            "key": "",
            "type": "string",
            "description": "",
            "value": "",
            "required": true,
            "select": true
          }
        ],
        "requestBody": {
          "mode": "json",
          "rawJson": "{\"test\": \"这是一个完整的JSON请求体示例\", \"data\": {\"id\": 1, \"name\": \"测试数据\"}}",
          "formdata": [],
          "urlencoded": [],
          "raw": {
            "data": "",
            "dataType": "text/plain"
          },
          "binary": {
            "mode": "var",
            "varValue": "",
            "binaryValue": {
              "path": "",
              "raw": "",
              "id": ""
            }
          }
        },
        "responseParams": [
          {
            "_id": "r1",
            "title": "成功响应",
            "statusCode": 200,
            "value": {
              "dataType": "application/json",
              "strJson": "{\"code\": 0, \"message\": \"success\", \"data\": {\"id\": 1, \"name\": \"测试数据\"}}"
            }
          },
          {
            "_id": "r2",
            "title": "错误响应",
            "statusCode": 400,
            "value": {
              "dataType": "application/json",
              "strJson": "{\"code\": 400, \"message\": \"参数错误\"}"
            }
          }
        ],
        "headers": [
          {
            "_id": "h1",
            "key": "Authorization",
            "value": "Bearer token123",
            "type": "string",
            "required": true,
            "description": "认证令牌",
            "select": true
          },
          {
            "_id": "h2",
            "key": "Content-Type",
            "value": "application/json",
            "type": "string",
            "required": true,
            "description": "内容类型",
            "select": true
          },
          {
            "_id": "3dHe9UMCeBb_Nv3-dcxMT",
            "key": "",
            "type": "string",
            "description": "",
            "value": "",
            "required": true,
            "select": true
          }
        ],
        "contentType": "application/json"
      },
      "preRequest": {
        "raw": "console.log('开始请求：', new Date().toISOString());"
      },
      "afterRequest": {
        "raw": "console.log('请求完成，状态码：', response.status);"
      },
      "isDeleted": false,
      "createdAt": "2026-01-18T08:47:42.995Z",
      "updatedAt": "2026-01-18T08:47:42.995Z"
    },
    {
      "_id": "P9gZqwV4pDwXns275Gg2j",
      "pid": "PKEiBy0XzF4NDmyek-MA5",
      "projectId": "FhtdUsEpBF9VmfYpx4egV",
      "sort": 1768726036659,
      "info": {
        "name": "PUT更新用户",
        "description": "更新用户信息的接口",
        "version": "1.0.0",
        "type": "http",
        "creator": "",
        "maintainer": "",
        "deletePerson": ""
      },
      "item": {
        "method": "PUT",
        "url": {
          "prefix": "",
          "path": "/api/users/{id}"
        },
        "paths": [],
        "queryParams": [],
        "requestBody": {
          "mode": "json",
          "rawJson": "",
          "formdata": [],
          "urlencoded": [],
          "raw": {
            "data": "",
            "dataType": "text/plain"
          },
          "binary": {
            "mode": "var",
            "varValue": "",
            "binaryValue": {
              "path": "",
              "raw": "",
              "id": ""
            }
          }
        },
        "responseParams": [],
        "headers": [],
        "contentType": ""
      },
      "preRequest": {
        "raw": ""
      },
      "afterRequest": {
        "raw": ""
      },
      "isDeleted": false,
      "createdAt": "2026-01-18T08:47:16.659Z",
      "updatedAt": "2026-01-18T08:47:16.659Z"
    },
    {
      "_id": "PKEiBy0XzF4NDmyek-MA5",
      "pid": "",
      "projectId": "FhtdUsEpBF9VmfYpx4egV",
      "sort": 1768726021111,
      "info": {
        "name": "HTTP测试接口",
        "type": "folder",
        "description": "",
        "version": "",
        "creator": "",
        "deletePerson": "",
        "maintainer": ""
      },
      "commonHeaders": [],
      "createdAt": "2026-01-18T08:47:01.111Z",
      "updatedAt": "2026-01-18T08:47:01.111Z",
      "isDeleted": false
    },
    {
      "_id": "SttQVWbQLfVsjOqXv4FzC",
      "pid": "",
      "projectId": "FhtdUsEpBF9VmfYpx4egV",
      "sort": 1768726094191,
      "info": {
        "name": "其他类型节点",
        "type": "folder",
        "description": "",
        "version": "",
        "creator": "",
        "deletePerson": "",
        "maintainer": ""
      },
      "commonHeaders": [],
      "createdAt": "2026-01-18T08:48:14.191Z",
      "updatedAt": "2026-01-18T08:48:14.191Z",
      "isDeleted": false
    },
    {
      "_id": "TIwItsfK9L0XkdWLB0X4d",
      "pid": "PKEiBy0XzF4NDmyek-MA5",
      "projectId": "FhtdUsEpBF9VmfYpx4egV",
      "sort": 1768726036240,
      "info": {
        "name": "GET用户列表",
        "description": "获取所有用户列表的接口",
        "version": "1.0.0",
        "type": "http",
        "creator": "",
        "maintainer": "",
        "deletePerson": ""
      },
      "item": {
        "method": "GET",
        "url": {
          "prefix": "",
          "path": "/api/users"
        },
        "paths": [],
        "queryParams": [],
        "requestBody": {
          "mode": "json",
          "rawJson": "",
          "formdata": [],
          "urlencoded": [],
          "raw": {
            "data": "",
            "dataType": "text/plain"
          },
          "binary": {
            "mode": "var",
            "varValue": "",
            "binaryValue": {
              "path": "",
              "raw": "",
              "id": ""
            }
          }
        },
        "responseParams": [],
        "headers": [],
        "contentType": ""
      },
      "preRequest": {
        "raw": ""
      },
      "afterRequest": {
        "raw": ""
      },
      "isDeleted": false,
      "createdAt": "2026-01-18T08:47:16.240Z",
      "updatedAt": "2026-01-18T08:47:16.240Z"
    },
    {
      "_id": "f3dH6PIagnni6Dq5WMoOU",
      "pid": "PKEiBy0XzF4NDmyek-MA5",
      "projectId": "FhtdUsEpBF9VmfYpx4egV",
      "sort": 1768726036515,
      "info": {
        "name": "POST创建用户",
        "description": "创建新用户的接口",
        "version": "1.0.0",
        "type": "http",
        "creator": "",
        "maintainer": "",
        "deletePerson": ""
      },
      "item": {
        "method": "POST",
        "url": {
          "prefix": "",
          "path": "/api/users"
        },
        "paths": [],
        "queryParams": [],
        "requestBody": {
          "mode": "json",
          "rawJson": "",
          "formdata": [],
          "urlencoded": [],
          "raw": {
            "data": "",
            "dataType": "text/plain"
          },
          "binary": {
            "mode": "var",
            "varValue": "",
            "binaryValue": {
              "path": "",
              "raw": "",
              "id": ""
            }
          }
        },
        "responseParams": [],
        "headers": [],
        "contentType": ""
      },
      "preRequest": {
        "raw": ""
      },
      "afterRequest": {
        "raw": ""
      },
      "isDeleted": false,
      "createdAt": "2026-01-18T08:47:16.515Z",
      "updatedAt": "2026-01-18T08:47:16.515Z"
    },
    {
      "_id": "sn-7YaJSeNLOgUfyfkI8E",
      "pid": "",
      "projectId": "FhtdUsEpBF9VmfYpx4egV",
      "sort": 1768726073007,
      "info": {
        "name": "实时聊天WebSocket",
        "description": "用于实时聊天功能的WebSocket连接",
        "version": "1.0.0",
        "type": "websocket",
        "creator": "",
        "maintainer": "",
        "deletePerson": ""
      },
      "item": {
        "protocol": "wss",
        "url": {
          "path": "/ws/chat",
          "prefix": ""
        },
        "queryParams": [
          {
            "_id": "9zSwLp0uE0alRvYhn9zNJ",
            "key": "token",
            "value": "",
            "type": "string",
            "required": true,
            "description": "认证令牌",
            "select": true
          },
          {
            "_id": "UcKTbWjqQioq2UG0SL5La",
            "key": "",
            "type": "string",
            "description": "",
            "value": "",
            "required": true,
            "select": true
          }
        ],
        "headers": [
          {
            "_id": "wNEqAEeoGQ1isnpoeGEan",
            "key": "Authorization",
            "value": "",
            "type": "string",
            "required": false,
            "description": "认证头",
            "select": true
          },
          {
            "_id": "Kv-ilQttq1exPxSSHUKV1",
            "key": "",
            "type": "string",
            "description": "",
            "value": "",
            "required": true,
            "select": true
          }
        ],
        "messageBlocks": [
          {
            "id": "ZR0i3CdAQublSObA9IT-V",
            "name": "",
            "content": "",
            "messageType": "json",
            "order": 0
          }
        ]
      },
      "config": {
        "autoSend": false,
        "autoSendInterval": 30000,
        "autoSendContent": "ping",
        "autoSendMessageType": "json",
        "autoReconnect": false
      },
      "preRequest": {
        "raw": ""
      },
      "afterRequest": {
        "raw": ""
      },
      "createdAt": "2026-01-18T08:47:53.007Z",
      "updatedAt": "2026-01-18T08:47:53.007Z",
      "isDeleted": false
    },
    {
      "_id": "uUITHOhxPlDt7zeHabALJ",
      "pid": "PKEiBy0XzF4NDmyek-MA5",
      "projectId": "FhtdUsEpBF9VmfYpx4egV",
      "sort": 1768726037083,
      "info": {
        "name": "OPTIONS预检请求",
        "description": "CORS预检请求接口",
        "version": "1.0.0",
        "type": "http",
        "creator": "",
        "maintainer": "",
        "deletePerson": ""
      },
      "item": {
        "method": "OPTIONS",
        "url": {
          "prefix": "",
          "path": "/api/users"
        },
        "paths": [],
        "queryParams": [],
        "requestBody": {
          "mode": "json",
          "rawJson": "",
          "formdata": [],
          "urlencoded": [],
          "raw": {
            "data": "",
            "dataType": "text/plain"
          },
          "binary": {
            "mode": "var",
            "varValue": "",
            "binaryValue": {
              "path": "",
              "raw": "",
              "id": ""
            }
          }
        },
        "responseParams": [],
        "headers": [],
        "contentType": ""
      },
      "preRequest": {
        "raw": ""
      },
      "afterRequest": {
        "raw": ""
      },
      "isDeleted": false,
      "createdAt": "2026-01-18T08:47:17.083Z",
      "updatedAt": "2026-01-18T08:47:17.083Z"
    },
    {
      "_id": "vDqClL0gWapcGwbBrA-Xi",
      "pid": "",
      "projectId": "FhtdUsEpBF9VmfYpx4egV",
      "sort": 1768726090944,
      "info": {
        "name": "聊天室Mock服务",
        "description": "模拟聊天室的WebSocket服务，启用回显模式并添加延迟",
        "version": "1.0.0",
        "type": "websocketMock",
        "creator": "",
        "maintainer": "",
        "deletePerson": ""
      },
      "requestCondition": {
        "port": 3002,
        "path": "/ws/mock/chat"
      },
      "config": {
        "delay": 200,
        "echoMode": true
      },
      "response": {
        "content": ""
      },
      "createdAt": "2026-01-18T08:48:10.944Z",
      "updatedAt": "2026-01-18T08:48:10.944Z",
      "isDeleted": false
    },
    {
      "_id": "vanpzrIPcHwIPLDoEuRXU",
      "pid": "PKEiBy0XzF4NDmyek-MA5",
      "projectId": "FhtdUsEpBF9VmfYpx4egV",
      "sort": 1768726036764,
      "info": {
        "name": "DELETE删除用户",
        "description": "删除用户的接口",
        "version": "1.0.0",
        "type": "http",
        "creator": "",
        "maintainer": "",
        "deletePerson": ""
      },
      "item": {
        "method": "DELETE",
        "url": {
          "prefix": "",
          "path": "/api/users/{id}"
        },
        "paths": [],
        "queryParams": [],
        "requestBody": {
          "mode": "json",
          "rawJson": "",
          "formdata": [],
          "urlencoded": [],
          "raw": {
            "data": "",
            "dataType": "text/plain"
          },
          "binary": {
            "mode": "var",
            "varValue": "",
            "binaryValue": {
              "path": "",
              "raw": "",
              "id": ""
            }
          }
        },
        "responseParams": [],
        "headers": [],
        "contentType": ""
      },
      "preRequest": {
        "raw": ""
      },
      "afterRequest": {
        "raw": ""
      },
      "isDeleted": false,
      "createdAt": "2026-01-18T08:47:16.764Z",
      "updatedAt": "2026-01-18T08:47:16.764Z"
    },
    {
      "_id": "zOPJetD7JE6USff4AZC16",
      "pid": "PKEiBy0XzF4NDmyek-MA5",
      "projectId": "FhtdUsEpBF9VmfYpx4egV",
      "sort": 1768726036901,
      "info": {
        "name": "PATCH部分更新",
        "description": "部分更新用户信息的接口",
        "version": "1.0.0",
        "type": "http",
        "creator": "",
        "maintainer": "",
        "deletePerson": ""
      },
      "item": {
        "method": "PATCH",
        "url": {
          "prefix": "",
          "path": "/api/users/{id}"
        },
        "paths": [],
        "queryParams": [],
        "requestBody": {
          "mode": "json",
          "rawJson": "",
          "formdata": [],
          "urlencoded": [],
          "raw": {
            "data": "",
            "dataType": "text/plain"
          },
          "binary": {
            "mode": "var",
            "varValue": "",
            "binaryValue": {
              "path": "",
              "raw": "",
              "id": ""
            }
          }
        },
        "responseParams": [],
        "headers": [],
        "contentType": ""
      },
      "preRequest": {
        "raw": ""
      },
      "afterRequest": {
        "raw": ""
      },
      "isDeleted": false,
      "createdAt": "2026-01-18T08:47:16.901Z",
      "updatedAt": "2026-01-18T08:47:16.901Z"
    }
  ] as ApiNode[],
  "variables": []
}

// 导出测试数据
export default localShareDataTest; 
