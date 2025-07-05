import { LocalShareData } from "@src/types/types.ts";

// LocalShareData 测试数据
export const localShareDataTest: LocalShareData = {
  projectInfo: {
    projectName: "用户管理系统",
    projectId: "proj_123456789"
  },
  nodes: [
    {
      _id: "node_001",
      pid: "0",
      projectId: "proj_123456789",
      isFolder: true,
      sort: 1,
      info: {
        name: "用户管理",
        description: "用户相关的API接口",
        version: "1.0.0",
        type: "folder",
        creator: "admin",
        maintainer: "admin"
      },
      item: {
        method: "GET",
        url: {
          host: "https://api.example.com",
          path: "/api/v1"
        },
        paths: [],
        queryParams: [],
        requestBody: {
          mode: "none",
          rawJson: "",
          formdata: [],
          urlencoded: [],
          raw: {
            data: "",
            dataType: "application/json"
          },
          binary: {
            mode: "var",
            varValue: "",
            binaryValue: {
              path: "",
              raw: "",
              id: ""
            }
          }
        },
        responseParams: [],
        headers: [],
        contentType: ""
      },
      preRequest: {
        raw: ""
      },
      afterRequest: {
        raw: ""
      },
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
      mockInfo: {
        path: "/mock/user",
        httpStatusCode: 200,
        responseDelay: 0,
        responseType: "json",
        responseHeaders: [],
        json: "",
        image: {
          type: "png",
          width: 200,
          height: 200,
          size: 1024,
          fontSize: 16,
          color: "#000000",
          backgroundColor: "#ffffff"
        },
        file: {
          type: "pdf",
          filePath: ""
        },
        text: "",
        customResponseScript: ""
      }
    },
    {
      _id: "node_002",
      pid: "node_001",
      projectId: "proj_123456789",
      isFolder: false,
      sort: 1,
      info: {
        name: "获取用户列表",
        description: "分页获取用户列表信息",
        version: "1.0.0",
        type: "api",
        creator: "admin",
        maintainer: "admin"
      },
      item: {
        method: "GET",
        url: {
          host: "https://api.example.com",
          path: "/api/v1/users"
        },
        paths: [],
        queryParams: [
          {
            _id: "qp_001",
            key: "page",
            value: "1",
            type: "string",
            required: false,
            description: "页码，从1开始",
            select: true
          },
          {
            _id: "qp_002",
            key: "size",
            value: "10",
            type: "string",
            required: false,
            description: "每页数量，默认10",
            select: true
          },
          {
            _id: "qp_003",
            key: "keyword",
            value: "",
            type: "string",
            required: false,
            description: "搜索关键词",
            select: false
          }
        ],
        requestBody: {
          mode: "none",
          rawJson: "",
          formdata: [],
          urlencoded: [],
          raw: {
            data: "",
            dataType: "application/json"
          },
          binary: {
            mode: "var",
            varValue: "",
            binaryValue: {
              path: "",
              raw: "",
              id: ""
            }
          }
        },
        responseParams: [
          {
            _id: "rp_001",
            title: "成功响应",
            statusCode: 200,
            value: {
              dataType: "application/json",
              strJson: `{
                "code": 200,
                "message": "success",
                "data": {
                  "list": [
                    {
                      "id": 1,
                      "username": "admin",
                      "email": "admin@example.com",
                      "status": "active",
                      "createdAt": "2024-01-01T00:00:00Z"
                    }
                  ],
                  "total": 100,
                  "page": 1,
                  "size": 10
                }
              }`,
              text: "",
              file: {
                url: "",
                raw: ""
              }
            },
            isMock: true
          },
          {
            _id: "rp_002",
            title: "错误响应",
            statusCode: 400,
            value: {
              dataType: "application/json",
              strJson: `{
                "code": 400,
                "message": "参数错误",
                "data": null
              }`,
              text: "",
              file: {
                url: "",
                raw: ""
              }
            },
            isMock: false
          }
        ],
        headers: [
          {
            _id: "h_001",
            key: "Authorization",
            value: "Bearer {{token}}",
            type: "string",
            required: true,
            description: "认证令牌",
            select: true
          },
          {
            _id: "h_002",
            key: "Content-Type",
            value: "application/json",
            type: "string",
            required: true,
            description: "内容类型",
            select: true
          }
        ],
        contentType: "application/json"
      },
      preRequest: {
        raw: `// 前置脚本
console.log('开始请求用户列表');
pm.environment.set('requestTime', new Date().toISOString());`
      },
      afterRequest: {
        raw: `// 后置脚本
console.log('请求完成');
const response = pm.response.json();
if (response.code === 200) {
  pm.environment.set('lastUserId', response.data.list[0]?.id || '');
}`
      },
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
      mockInfo: {
        path: "/mock/users",
        httpStatusCode: 200,
        responseDelay: 100,
        responseType: "json",
        responseHeaders: [
          {
            _id: "mh_001",
            key: "X-Mock-Header",
            value: "mock-value",
            type: "string",
            required: false,
            description: "Mock响应头",
            select: true
          }
        ],
        json: `{
          "code": 200,
          "message": "success",
          "data": {
            "list": [
              {
                "id": 1,
                "username": "admin",
                "email": "admin@example.com",
                "status": "active",
                "createdAt": "2024-01-01T00:00:00Z"
              },
              {
                "id": 2,
                "username": "user1",
                "email": "user1@example.com",
                "status": "active",
                "createdAt": "2024-01-02T00:00:00Z"
              }
            ],
            "total": 2,
            "page": 1,
            "size": 10
          }
        }`,
        image: {
          type: "png",
          width: 200,
          height: 200,
          size: 1024,
          fontSize: 16,
          color: "#000000",
          backgroundColor: "#ffffff"
        },
        file: {
          type: "pdf",
          filePath: ""
        },
        text: "",
        customResponseScript: ""
      }
    },
    {
      _id: "node_003",
      pid: "node_001",
      projectId: "proj_123456789",
      isFolder: false,
      sort: 2,
      info: {
        name: "创建用户",
        description: "创建新用户",
        version: "1.0.0",
        type: "api",
        creator: "admin",
        maintainer: "admin"
      },
      item: {
        method: "POST",
        url: {
          host: "https://api.example.com",
          path: "/api/v1/users"
        },
        paths: [],
        queryParams: [],
        requestBody: {
          mode: "json",
          rawJson: `{
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "password123",
            "status": "active"
          }`,
          formdata: [],
          urlencoded: [],
          raw: {
            data: "",
            dataType: "application/json"
          },
          binary: {
            mode: "var",
            varValue: "",
            binaryValue: {
              path: "",
              raw: "",
              id: ""
            }
          }
        },
        responseParams: [
          {
            _id: "rp_003",
            title: "成功响应",
            statusCode: 201,
            value: {
              dataType: "application/json",
              strJson: `{
                "code": 201,
                "message": "用户创建成功",
                "data": {
                  "id": 3,
                  "username": "newuser",
                  "email": "newuser@example.com",
                  "status": "active",
                  "createdAt": "2024-01-15T10:30:00Z"
                }
              }`,
              text: "",
              file: {
                url: "",
                raw: ""
              }
            },
            isMock: true
          }
        ],
        headers: [
          {
            _id: "h_003",
            key: "Authorization",
            value: "Bearer {{token}}",
            type: "string",
            required: true,
            description: "认证令牌",
            select: true
          },
          {
            _id: "h_004",
            key: "Content-Type",
            value: "application/json",
            type: "string",
            required: true,
            description: "内容类型",
            select: true
          }
        ],
        contentType: "application/json"
      },
      preRequest: {
        raw: `// 前置脚本
console.log('开始创建用户');
const requestBody = pm.request.body.raw;
const bodyData = JSON.parse(requestBody);
pm.environment.set('createUsername', bodyData.username);`
      },
      afterRequest: {
        raw: `// 后置脚本
console.log('用户创建完成');
const response = pm.response.json();
if (response.code === 201) {
  pm.environment.set('newUserId', response.data.id);
}`
      },
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
      mockInfo: {
        path: "/mock/users/create",
        httpStatusCode: 201,
        responseDelay: 200,
        responseType: "json",
        responseHeaders: [],
        json: `{
          "code": 201,
          "message": "用户创建成功",
          "data": {
            "id": 3,
            "username": "newuser",
            "email": "newuser@example.com",
            "status": "active",
            "createdAt": "2024-01-15T10:30:00Z"
          }
        }`,
        image: {
          type: "png",
          width: 200,
          height: 200,
          size: 1024,
          fontSize: 16,
          color: "#000000",
          backgroundColor: "#ffffff"
        },
        file: {
          type: "pdf",
          filePath: ""
        },
        text: "",
        customResponseScript: ""
      }
    },
    {
      _id: "node_004",
      pid: "node_001",
      projectId: "proj_123456789",
      isFolder: false,
      sort: 3,
      info: {
        name: "获取用户详情",
        description: "根据用户ID获取用户详细信息",
        version: "1.0.0",
        type: "api",
        creator: "admin",
        maintainer: "admin"
      },
      item: {
        method: "GET",
        url: {
          host: "https://api.example.com",
          path: "/api/v1/users/{userId}"
        },
        paths: [
          {
            _id: "p_001",
            key: "userId",
            value: "1",
            type: "string",
            required: true,
            description: "用户ID",
            select: true
          }
        ],
        queryParams: [],
        requestBody: {
          mode: "none",
          rawJson: "",
          formdata: [],
          urlencoded: [],
          raw: {
            data: "",
            dataType: "application/json"
          },
          binary: {
            mode: "var",
            varValue: "",
            binaryValue: {
              path: "",
              raw: "",
              id: ""
            }
          }
        },
        responseParams: [
          {
            _id: "rp_004",
            title: "成功响应",
            statusCode: 200,
            value: {
              dataType: "application/json",
              strJson: `{
                "code": 200,
                "message": "success",
                "data": {
                  "id": 1,
                  "username": "admin",
                  "email": "admin@example.com",
                  "status": "active",
                  "createdAt": "2024-01-01T00:00:00Z",
                  "updatedAt": "2024-01-15T10:30:00Z"
                }
              }`,
              text: "",
              file: {
                url: "",
                raw: ""
              }
            },
            isMock: true
          },
          {
            _id: "rp_005",
            title: "用户不存在",
            statusCode: 404,
            value: {
              dataType: "application/json",
              strJson: `{
                "code": 404,
                "message": "用户不存在",
                "data": null
              }`,
              text: "",
              file: {
                url: "",
                raw: ""
              }
            },
            isMock: false
          }
        ],
        headers: [
          {
            _id: "h_005",
            key: "Authorization",
            value: "Bearer {{token}}",
            type: "string",
            required: true,
            description: "认证令牌",
            select: true
          }
        ],
        contentType: "application/json"
      },
      preRequest: {
        raw: `// 前置脚本
console.log('开始获取用户详情');
const userId = pm.request.url.path[0];
pm.environment.set('currentUserId', userId);`
      },
      afterRequest: {
        raw: `// 后置脚本
console.log('用户详情获取完成');
const response = pm.response.json();
if (response.code === 200) {
  pm.environment.set('userEmail', response.data.email);
}`
      },
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
      mockInfo: {
        path: "/mock/users/{userId}",
        httpStatusCode: 200,
        responseDelay: 150,
        responseType: "json",
        responseHeaders: [],
        json: `{
          "code": 200,
          "message": "success",
          "data": {
            "id": 1,
            "username": "admin",
            "email": "admin@example.com",
            "status": "active",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-15T10:30:00Z"
          }
        }`,
        image: {
          type: "png",
          width: 200,
          height: 200,
          size: 1024,
          fontSize: 16,
          color: "#000000",
          backgroundColor: "#ffffff"
        },
        file: {
          type: "pdf",
          filePath: ""
        },
        text: "",
        customResponseScript: ""
      }
    }
  ],
  variables: [
    {
      _id: "var_001",
      projectId: "proj_123456789",
      name: "baseUrl",
      value: "https://api.example.com",
      type: "string",
      fileValue: {
        name: "",
        path: "",
        fileType: ""
      }
    },
    {
      _id: "var_002",
      projectId: "proj_123456789",
      name: "token",
      value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcwNTI5NjAwMCwiZXhwIjoxNzA1MzgwMDAwfQ.example",
      type: "string",
      fileValue: {
        name: "",
        path: "",
        fileType: ""
      }
    },
    {
      _id: "var_003",
      projectId: "proj_123456789",
      name: "pageSize",
      value: "10",
      type: "number",
      fileValue: {
        name: "",
        path: "",
        fileType: ""
      }
    },
    {
      _id: "var_004",
      projectId: "proj_123456789",
      name: "enableDebug",
      value: "true",
      type: "boolean",
      fileValue: {
        name: "",
        path: "",
        fileType: ""
      }
    },
    {
      _id: "var_005",
      projectId: "proj_123456789",
      name: "uploadFile",
      value: "",
      type: "file",
      fileValue: {
        name: "test.pdf",
        path: "/path/to/test.pdf",
        fileType: "application/pdf"
      }
    }
  ]
};

// 导出测试数据
export default localShareDataTest; 