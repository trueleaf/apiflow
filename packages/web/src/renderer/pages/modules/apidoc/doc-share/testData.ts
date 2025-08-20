import { LocalShareData } from "@src/types/types.ts";

// LocalShareData 测试数据
export const localShareDataTest: LocalShareData = {
  "projectInfo": {
      "projectName": "飞书文档",
      "projectId": "68061e273bba346cff2cc878"
  },
  "nodes": [
      {
          "_id": "6808c3a32c85f911e89f6c40",
          "pid": "6808c3a32c85f911e89f6c3f",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1739182921312,
          "info": {
              "name": "请求方法",
              "version": "1.0",
              "type": "folder",
              "creator": "apiflow"
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c3e",
          "pid": "",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1735365393252,
          "info": {
              "name": "目录一",
              "version": "1.0",
              "type": "folder",
              "creator": "apiflow"
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c3f",
          "pid": "",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1739181956429,
          "info": {
              "name": "接口调用测试",
              "version": "1.0",
              "type": "folder",
              "creator": "apiflow"
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c41",
          "pid": "6808c3a32c85f911e89f6c40",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1739182933591,
          "info": {
              "name": "GET请求",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "apiflow",
              "spendTime": 0
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": "{{ testUrl }}/api/test/request_method"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "alNUPolNscHyXBoChTeZ7",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "2EkSi7KWKfx8z8HCuGYoL",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "r01ja4KYCXaK3uiioVCM2",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "IRhSWYTZOgEMJEFhJeqGd",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c42",
          "pid": "6808c3a32c85f911e89f6c40",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1739182938900,
          "info": {
              "name": "POST请求",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "apiflow",
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ testUrl }}/api/test/request_method"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "hG_uD10gKliBP60s7WxRe",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "uyKS_q7K2fBLEpMnFRpxg",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "88iFng3xRyf4gHqmUUcet",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "H_AMWFGqrqDrEwKocIrfn",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c43",
          "pid": "6808c3a32c85f911e89f6c40",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1739182943881,
          "info": {
              "name": "PUT请求",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "apiflow",
              "spendTime": 0
          },
          "item": {
              "method": "PUT",
              "url": {
                  "host": "",
                  "path": "{{ testUrl }}/api/test/request_method"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "Xan6Bdk7obrCKs_3P6haF",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "vm3BWi4g3_Vqw3bWxtlfH",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "KTYAhU7uUiixscSQ4qx84",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "Aut2MQCT_h3fxOpfjJ_7a",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c46",
          "pid": "6808c3a32c85f911e89f6c40",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1739183043122,
          "info": {
              "name": "OPTIONS请求",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "apiflow",
              "spendTime": 0
          },
          "item": {
              "method": "OPTIONS",
              "url": {
                  "host": "",
                  "path": "{{ testUrl }}/api/test/request_method"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "vBBzunTrKzBW6aAXDy4HF",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "CuAhi-bs2WKn_QBlCvFLD",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "9u_SfrbaT2nPvcb09456H",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "gHOe1yKf210kh-tRB0Icr",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c47",
          "pid": "6808c3a32c85f911e89f6c40",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1739183051089,
          "info": {
              "name": "HEAD请求",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "apiflow",
              "spendTime": 0
          },
          "item": {
              "method": "HEAD",
              "url": {
                  "host": "",
                  "path": "{{ testUrl }}/api/test/request_method"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "cjgDcVSfO3w5dibNFcniI",
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
                  "rawJson": "{\"x\" : 1}",
                  "formdata": [
                      {
                          "_id": "mhuzSVOZrxsV1ZEflyA8t",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "N4petLhUrJlR1lzsVb1Ux",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "G-FB1Sq0G53ntN3kqZ1IV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c48",
          "pid": "6808c3a32c85f911e89f6c40",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1739591591744,
          "info": {
              "name": "自定义Test请求",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "deletePerson": "apiflow",
              "spendTime": 0,
              "description": ""
          },
          "item": {
              "method": "TEST",
              "url": {
                  "host": "",
                  "path": "{{ testUrl }}/api/test/request_method"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "WyVM80thPMn3LF6CYWk1g",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "9ICi_HLgibw0E5YQf4vVl",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "2XsPny1gkibdjNKmguXKW",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "z4Z2G2DO4ao5Mk2IdFwRn",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c49",
          "pid": "6808c3a32c85f911e89f6c3f",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1739598667673,
          "info": {
              "name": "请求信息&变量验证",
              "version": "1.0",
              "type": "folder",
              "creator": "apiflow"
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c50",
          "pid": "68217f9754879786458cd66e",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747025820340,
          "info": {
              "name": "默认请求�?,
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/request_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "HTIyKc6nDwCFRNWBFZ0mS",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "onve2543VqOyTjcILkNc0",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "znMfqp0X9NiGgEDFGjzB4",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "CsZMaov_BExHFjiTyP1Qr",
                      "key": "host",
                      "type": "string",
                      "description": "用户代理期望的MIME 类型列表",
                      "value": "host",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "m5FtGJwBAwUvXriMLGRbk",
                      "key": "Host",
                      "type": "string",
                      "description": "用户代理期望的MIME 类型列表",
                      "value": "Host",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "Zwva2wbAsDHS9Mrg75vpT",
                      "key": "HOST",
                      "type": "string",
                      "description": "",
                      "value": "HOST",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "yuiGyFLCxNXBbTkxNSoGT",
                      "key": "Connection",
                      "type": "string",
                      "description": "",
                      "value": "Connection",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "jpOvg-GQKlzqIqe_Mewih",
                      "key": "connection",
                      "type": "string",
                      "description": "",
                      "value": "connection",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "2bLrCfd4Nt_RKf3jfi_PC",
                      "key": "CONNECTION",
                      "type": "string",
                      "description": "",
                      "value": "CONNECTION",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "-H-5-y8TqFkpIUhrVaQ7E",
                      "key": "user-agent",
                      "type": "string",
                      "description": "",
                      "value": "user-agent",
                      "required": true,
                      "select": false
                  },
                  {
                      "_id": "tY9ZXiFjio-7l_mTBhIa2",
                      "key": "User-Agent",
                      "type": "string",
                      "description": "",
                      "value": "User-Agent",
                      "required": true,
                      "select": false
                  },
                  {
                      "_id": "9lC399XHceQXtZ1CWbmJB",
                      "key": "USER-AGENT",
                      "type": "string",
                      "description": "",
                      "value": "USER-AGENT",
                      "required": true,
                      "select": false
                  },
                  {
                      "_id": "22TJYHUWr6UqMG8aBVSR3",
                      "key": "Content-Length",
                      "type": "string",
                      "description": "",
                      "value": "1",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "yMVVBHNu6MPt50cr5Sumu",
                      "key": "content-length",
                      "type": "string",
                      "description": "",
                      "value": "2",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "qXvZQB8I1CQoklC_iWKPE",
                      "key": "CONTENT-LENGTH",
                      "type": "string",
                      "description": "",
                      "value": "3",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "L9F76LlDU6I9E8i2zvZi_",
                      "key": "accept",
                      "type": "string",
                      "description": "用户代理期望的MIME 类型列表",
                      "value": "accept",
                      "required": true,
                      "select": false
                  },
                  {
                      "_id": "rjRSyY8JXFdi29zxVgJ1t",
                      "key": "Accept",
                      "type": "string",
                      "description": "用户代理期望的MIME 类型列表",
                      "value": "Accept",
                      "required": true,
                      "select": false
                  },
                  {
                      "_id": "LAlsPdmwyczUvERXr-anQ",
                      "key": "Accept-Encoding",
                      "type": "string",
                      "description": "列出用户代理支持的压缩方�?,
                      "value": "Accept-Encoding",
                      "required": true,
                      "select": false
                  },
                  {
                      "_id": "bdK-iKiTvZP9Cc5bKVOXe",
                      "key": "accept-encoding",
                      "type": "string",
                      "description": "列出用户代理支持的压缩方�?,
                      "value": "accept-encoding",
                      "required": true,
                      "select": false
                  },
                  {
                      "_id": "1BmkqR2gS7iOkDA1a5evP",
                      "key": "auth",
                      "type": "string",
                      "description": "",
                      "value": "test",
                      "required": true,
                      "select": false
                  },
                  {
                      "_id": "v3i-4EmQMPk6kf6mXau0V",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c53",
          "pid": "6808c3a32c85f911e89f6c55",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1740921282453,
          "info": {
              "name": "附件上传",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "apiflow",
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ baseUrl }}/api/attachment/upload"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "unKEgKdfWNtVv5nxhUBxT",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "requestBody": {
                  "mode": "formdata",
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "MwQopZjolEq05IIeiVewj",
                          "key": "projectId",
                          "type": "string",
                          "description": "",
                          "value": "{{ projectId }}",
                          "required": true,
                          "select": true
                      },
                      {
                          "_id": "YX7GMwqfnBm1HvdZ4NMIR",
                          "key": "fileName",
                          "type": "string",
                          "description": "",
                          "value": "a.png",
                          "required": true,
                          "select": true
                      },
                      {
                          "_id": "A6bNa1eAYciwX-ebF_mjK",
                          "key": "file",
                          "type": "file",
                          "description": "",
                          "value": "{{ fileValue2 }}",
                          "required": true,
                          "select": true,
                          "fileValueType": "var"
                      },
                      {
                          "_id": "Flok-6fJXkvpc5C41k_pJ",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "44Svq09Nl8aTZSxLqIlkQ",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "var",
                      "varValue": "{{ fileValue }}",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "dGxosmYP_PWSqPVTNfk2M",
                      "key": "Authorization",
                      "type": "string",
                      "description": "服务器用于验证用户代理身份的凭证",
                      "value": "{{ token }}",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "5xedoWZX4ph1nWfBeSumC",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "multipart/form-data",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c55",
          "pid": "",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1740921278869,
          "info": {
              "name": "测试接口",
              "version": "1.0",
              "type": "folder",
              "creator": "apiflow"
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c56",
          "pid": "6808c3a32c85f911e89f6c57",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1740925263361,
          "info": {
              "name": "创建团队",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "apiflow",
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ baseUrl }}/api/group/create"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "lxCfyIHa5bVKR1RjpkfhY",
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
                  "rawJson": "{\r\n    \"groupName\": \"测试团队2\",\r\n    \"description\": \"这是一个测试团队\"\r\n}",
                  "formdata": [
                      {
                          "_id": "vi4NWMt8St4jyFHlE8SX1",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "JUGkB28uUhJ9CW4pl48kk",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "HhKuErpsmszkYe2wQTy-w",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c57",
          "pid": "6808c3a32c85f911e89f6c55",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1740925259935,
          "info": {
              "name": "团队相关",
              "version": "1.0",
              "type": "folder",
              "creator": "apiflow"
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c58",
          "pid": "6808c3a32c85f911e89f6c57",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1740925318752,
          "info": {
              "name": "更新团队",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "apiflow",
              "spendTime": 0
          },
          "item": {
              "method": "PUT",
              "url": {
                  "host": "",
                  "path": "{{ baseUrl }}/api/group/update"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "C6_BU7kWeWp-PlPBOD3Uq",
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
                  "rawJson": "{\r\n    \"id\": \"67c4681c7390dd60d58bffe4\",\r\n    \"groupName\": \"测试团队2\",\r\n    \"description\": \"新的描述\",\r\n}",
                  "formdata": [
                      {
                          "_id": "YkVhD-0jiIvajt66lDusd",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "qJ1weiqjw3zJ2yqYx5b2A",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "k3nIu3Kf4YvvviWutIBM1",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c59",
          "pid": "6808c3a32c85f911e89f6c57",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1741148451403,
          "info": {
              "name": "获取团队详情",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "apiflow",
              "spendTime": 0
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": "{{ baseUrl }}/api/group/detail"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "7Rwr4SpM3F55wKMwSjHN7",
                      "key": "id",
                      "type": "string",
                      "description": "",
                      "value": "67c4681c7390dd60d58bffe4",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "Fla_OvvFNGEWo2haUpyQY",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "HlIKwKk1xu_xAkDnHNu_d",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "on0mxyecrXdP6poM-sgHW",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "waoad4ezm3s4mVyxBybv4",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c5a",
          "pid": "6808c3a32c85f911e89f6c57",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1741169998985,
          "info": {
              "name": "列表形式获取团队",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "apiflow",
              "spendTime": 0
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": "{{ baseUrl }}/api/group/list"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "BjXuuuSJ9U5DXBlajalXk",
                      "key": "pageSize",
                      "type": "string",
                      "description": "",
                      "value": "10",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "9CCDqjpbWLCQdvb4QixV5",
                      "key": "pageNum",
                      "type": "string",
                      "description": "",
                      "value": "1",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "aJi75s-BGKKdfPQKEO0Jd",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "mhiRKWTvApOU4wB0iSVNc",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "QPFFP9cHG3C8WGEN2HcP1",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "-__NW6f1dg7xJd4aRTR6o",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c5b",
          "pid": "6808c3a32c85f911e89f6c57",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1741172166820,
          "info": {
              "name": "添加成员",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "apiflow",
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ baseUrl }}/api/group/member/add"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "uvP6CGUuzIjU-zKSmQFJM",
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
                  "rawJson": "{\r\n    \"groupId\": \"67c47014fc7268e5e1a40577\",\r\n    \"userId\": \"6718804d95e79adc14aabf25\",\r\n    \"userName\": \"用户10\",\r\n    \"permission\": \"readAndWrite\"\r\n}",
                  "formdata": [
                      {
                          "_id": "wzSUrX9DWINkPyo3HXXD0",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "gmyyIhug2X3mWFUMj_Hbi",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "qRJL5m6NVUH30XKQ4tizJ",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c5c",
          "pid": "6808c3a32c85f911e89f6c57",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1741173005989,
          "info": {
              "name": "修改成员权限",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "apiflow",
              "spendTime": 0
          },
          "item": {
              "method": "PUT",
              "url": {
                  "host": "",
                  "path": "{{ baseUrl }}/api/group/member/permission"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "iDEzBR1ZPnc-WiNvO-NNT",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "RCseyKxa_Imc4AMeyQGtG",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "rgpxvK59WiNPHRZOzuEs9",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "GmxWbbBNZ_Mcm3xO0K3kS",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c5d",
          "pid": "6808c3a32c85f911e89f6c3e",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1741182086672,
          "info": {
              "name": "3",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow"
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c5e",
          "pid": "6808c3a32c85f911e89f6c3e",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1741182144760,
          "info": {
              "name": "1",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow"
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c44",
          "pid": "6808c3a32c85f911e89f6c40",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1739183022281,
          "info": {
              "name": "DELETE请求",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "apiflow",
              "spendTime": 0
          },
          "item": {
              "method": "DELETE",
              "url": {
                  "host": "",
                  "path": "{{ testUrl }}/api/test/request_method"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "67jbnp6S3Dl5VQvMa7E-b",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "sMqB6kU0Kr3YzEg62p0Dx",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "KN-iQcRX0Kl5zSG42R2ou",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "dtOAGmTYb1ZxJrA2Z6mr4",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c45",
          "pid": "6808c3a32c85f911e89f6c40",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1739183029521,
          "info": {
              "name": "PATCH请求",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "apiflow",
              "spendTime": 0
          },
          "item": {
              "method": "PATCH",
              "url": {
                  "host": "",
                  "path": "{{ testUrl }}/api/test/request_method"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "QCPDMdkmI-EOA_HwwLupM",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "cJ1J89Vq36UTgO_wc4ok5",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "FqZu4gB1BiAtyfLjB1cIH",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "J_QXA5tox4udKggmFYHoL",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c61",
          "pid": "6808c3a32c85f911e89f6c60",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1741336355657,
          "info": {
              "name": "修改全局公共请求�?,
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "apiflow",
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ baseUrl }}/api/project/replace_global_common_headers"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "GhcJyH0Vc7GmM678dtas9",
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
                  "rawJson": "{\r\n    \"projectId\": \"{{ projectId }}\",\r\n    \"commonHeaders\": [{\r\n        \"_id\": \"67ce77f69defc44e7ef7d81d\",\r\n        \"key\": \"Authorization\",\r\n        \"description\": \"服务器用于验证用户代理身份的凭证\",\r\n        \"value\": \"{{ token }}\",\r\n        \"select\": true\r\n    }]\r\n}",
                  "formdata": [
                      {
                          "_id": "YWK0KS1hEmVZ4Y4zOJfNy",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "HGz9lNgnC6izgeLTW0w_V",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "_IMRvoIxYLoGbHa2tDMCa",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c62",
          "pid": "6808c3a32c85f911e89f6c60",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1741582738023,
          "info": {
              "name": "获取全局公共请求�?,
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": "{{ baseUrl }}/api/project/global_common_headers"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "7dYEFToxNotaGDcSIvu4K",
                      "key": "projectId",
                      "type": "string",
                      "description": "",
                      "value": "671ed7e4209a23bea3ef9255",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "lV1cHa-Z8SYf2Zid2EpM1",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "jpr4diV1AknzXaeQutbdm",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "9sIUtGanw_wHZ2uKIfHr8",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "lijvyKztc86fVSl1mHK9B",
                      "key": "Authorization",
                      "type": "string",
                      "description": "服务器用于验证用户代理身份的凭证",
                      "value": "{{ token }}",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "A-BmrneLiMqApGzs5ezo1",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "{\r\n    \"code\": 0,\r\n    \"msg\": \"操作成功\",\r\n    \"data\": [\r\n        {\r\n            \"_id\": \"67ce99f143494ec20337e66a\",\r\n            \"projectId\": \"671ed7e4209a23bea3ef9255\",\r\n            \"commonHeaders\": [\r\n                {\r\n                    \"key\": \"Authorization\",\r\n                    \"value\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NDQ0Y2EwMTM0ODQ1ZTc3YTAzZjU1MyIsInJvbGVJZHMiOlsiNWVkZTBiYTA2Zjc2MTg1MjA0NTg0NzAwIl0sImxvZ2luTmFtZSI6ImFwaWZsb3ciLCJyZWFsTmFtZSI6ImFwaWZsb3ciLCJwaG9uZSI6IiIsInRva2VuIjoiIiwiaWF0IjoxNzQxMzM2MzAyLCJleHAiOjE3NDE5NDExMDJ9.YxmcMESC6-3lAB3EDLxAGBz-2aQ0KS7D5naDL007Pcs\",\r\n                    \"type\": \"string\",\r\n                    \"description\": \"服务器用于验证用户代理身份的凭证2\",\r\n                    \"select\": true,\r\n                    \"_id\": \"67ce77f69defc44e7ef7d81d\"\r\n                }\r\n            ]\r\n        }\r\n    ]\r\n}\r\n",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c64",
          "pid": "6808c3a32c85f911e89f6c55",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1742379410534,
          "info": {
              "name": "认证相关",
              "version": "1.0",
              "type": "folder",
              "creator": "apiflow"
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c65",
          "pid": "6808c3a32c85f911e89f6c64",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1742379419642,
          "info": {
              "name": "图形验证码获�?,
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "apiflow",
              "spendTime": 0
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": "http://127.0.0.1:7001/api/security/captcha"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "_wWV9WLJPFfb5mZpKoKCU",
                      "key": "height",
                      "type": "string",
                      "description": "",
                      "value": "35",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "mTxqb_KI5Ydny39BTpqaU",
                      "key": "width",
                      "type": "string",
                      "description": "",
                      "value": "100",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "E0CxmAlHr2mdE6LlBS0Ln",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "YiOsdX5dfLlmIEEXXgxX-",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "8RJoZog2d_Uuf2nhjE5yJ",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "DYO5dPeXhouvoEMsj3pxG",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c5f",
          "pid": "6808c3a32c85f911e89f6c3e",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1741182276242,
          "info": {
              "name": "33",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow"
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6808c3a32c85f911e89f6c60",
          "pid": "6808c3a32c85f911e89f6c55",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1741336332603,
          "info": {
              "name": "公共请求头相�?,
              "version": "1.0",
              "type": "folder",
              "creator": "apiflow"
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68217f9754879786458cd66e",
          "pid": "6808c3a32c85f911e89f6c49",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747025815327,
          "info": {
              "name": "请求�?,
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "rEVmSxzr1MpKUvM_i8VE-",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68231edc7343812b7d2722dd",
          "pid": "68217f9754879786458cd66e",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747132124536,
          "info": {
              "name": "公共请求�?,
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/request_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "pMv8_kptSNGNGfxfE3ISE",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "NgoFqA0shOIHGdFL3qRfV",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "3X2oDYqn-HwP5bWfvSMf_",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "iXFnG9uVrCrgzfrwweZEX",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6825c36f5d747c2d07745361",
          "pid": "6808c3a32c85f911e89f6c49",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747305327397,
          "info": {
              "name": "返回参数录入",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "_e5o19qIKiYUedxchCiDg",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6825c3775d747c2d07745369",
          "pid": "6808c3a32c85f911e89f6c49",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747305335098,
          "info": {
              "name": "请求参数",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "_e5o19qIKiYUedxchCiDg",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6825c3855d747c2d07745372",
          "pid": "6825c3775d747c2d07745369",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747305349635,
          "info": {
              "name": "请求url",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue }}/api/test/request_info/{{ booleanValue }}/{{ numberValue }}/{{ nullValue }}/{{ anyValue }}/{{ fileValue }}"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "qkoUSHgOZfSv1iwNCtDG8",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "C005iWnFEcTptQaS8Qe0V",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "nI6WVXoRR61ApAB_-OCCu",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "aUZBrHA2iG_Z2eIfXxRq3",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6825c3855d747c2d07745373",
          "pid": "6825c3775d747c2d07745369",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747305349635,
          "info": {
              "name": "query参数",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue }}/api/test/request_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "8jtng-S4eNp34IXHs8RcU",
                      "key": "string",
                      "type": "string",
                      "description": "",
                      "value": "{{ stringValue }}",
                      "required": true,
                      "select": false
                  },
                  {
                      "_id": "DNrSsKqZPciYAxIWdlMSs",
                      "key": "number",
                      "type": "string",
                      "description": "",
                      "value": "{{ numberValue }}",
                      "required": true,
                      "select": false
                  },
                  {
                      "_id": "-dpmYbGmcMIOB2uZyyU_8",
                      "key": "boolean",
                      "type": "string",
                      "description": "",
                      "value": "{{ booleanValue }}",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "cSdt-Yq-oIKYHUvh1_7f-",
                      "key": "null",
                      "type": "string",
                      "description": "",
                      "value": "{{ nullValue }}",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "qbhJN1g0HlDetZOWhTsVT",
                      "key": "any",
                      "type": "string",
                      "description": "",
                      "value": "{{ anyValue }}",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "V2rBiOBLBmGs5dgJQwUhN",
                      "key": "file",
                      "type": "string",
                      "description": "",
                      "value": "{{ fileValue }}",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "-KWrWjSEEUcdQotBzLWX1",
                      "key": "mix",
                      "type": "string",
                      "description": "",
                      "value": "a=={{stringValue}}==b",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "6aBo0Tv54vJwxp4QiYZtB",
                      "key": "mock",
                      "type": "string",
                      "description": "",
                      "value": "{{ @boolean }}",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "5yruKeehmJjrSMV_Yi_qL",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "O1rSGRhwqzA70BTLEcviX",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "XGFik6bjX-TNCKj4-HF6i",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "-5AzqzSuYhwIP_VqslGSJ",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6825c3855d747c2d07745374",
          "pid": "6825c3775d747c2d07745369",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747305349635,
          "info": {
              "name": "json参数",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue }}/api/test/var/json"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "eY91q6-VXmTy6kdsunmxA",
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
                  "rawJson": "{\r\n    \"stringValue\": \"{{ stringValue }}\",\r\n    \"numberValue\": \"{{ numberValue }}\",\r\n    \"booleanValue\": \"{{ booleanValue }}\",\r\n    \"fileValue\": \"{{ fileValue }}\",\r\n    \"anyValue\": \"{{ anyValue }}\",\r\n    \"str_mix\": \"{{ stringValue }}_mix\",\r\n    \"str_mix2\": \"{{ stringValue }}_mix2\",\r\n    \"str_mix3\": \"{{ stringValue }}_mix3\",\r\n    \"str_mix4\": \"{{ stringValue }}_mix4\",\r\n    \"str_mix5\": \"{{ stringValue }}_mix5\",\r\n    \"num_mix\": \"{{ numberValue }}_mix\",\r\n    \"num_mix2\": \"{{ numberValue }}_mix2\",\r\n    \"num_mix3\": \"{{ numberValue }}_mix3\",\r\n    \"num_mix4\": \"{{ numberValue }}_mix4\",\r\n    \"num_mix5\": \"{{ numberValue }}_mix5\",\r\n    \"boolean_mix\": \"{{ booleanValue }}_mix\",\r\n    \"boolean_mix2\": \"{{ booleanValue }}_mix2\",\r\n    \"boolean_mix3\": \"{{ booleanValue }}_mix3\",\r\n    \"boolean_mix4\": \"{{ booleanValue }}_mix4\",\r\n    \"boolean_mix5\": \"{{ booleanValue }}_mix5\",\r\n    \"file_mix\": \"{{ fileValue }}_mix\",\r\n    \"file_mix2\": \"{{ fileValue }}_mix2\",\r\n    \"file_mix3\": \"{{ fileValue }}_mix3\",\r\n    \"file_mix4\": \"{{ fileValue }}_mix4\",\r\n    \"file_mix5\": \"{{ fileValue }}_mix5\",\r\n    \"any_mix\": \"{{ anyValue }}_mix\",\r\n    \"any_mix2\": \"{{ anyValue }}_mix2\",\r\n    \"any_mix3\": \"{{ anyValue }}_mix3\",\r\n    \"any_mix4\": \"{{ anyValue }}_mix4\",\r\n    \"any_mix5\": \"{{ anyValue }}_mix5\",\r\n    \"multi\": \"{{ numberValue }}##{{ stringValue }}##{{ booleanValue }}##{{ fileValue }}##{{ anyValue }}##{{ stringValue? }}\",\r\n    \"escape\": \"\\\\{{ numberValue }}\",\r\n    \"mock\": \"{{ @int }}\"\r\n}",
                  "formdata": [
                      {
                          "_id": "AymI2uTYmNVmAqGzgR-fG",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "muqWx3M2qIsafs20DFPYX",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "7FOF1zjlxT8vNvD8GpyVU",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6825c3855d747c2d07745375",
          "pid": "6825c3775d747c2d07745369",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747305349635,
          "info": {
              "name": "formData参数",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/request_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "rVdHmT9T0RBsw3DHO5tNT",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "requestBody": {
                  "mode": "formdata",
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "-hcVXy_6higkjRq1wY95B",
                          "key": "stringValue",
                          "type": "string",
                          "description": "",
                          "value": "{{ stringValue }}",
                          "required": true,
                          "select": false
                      },
                      {
                          "_id": "YMMYpuQ8EStRDRBOgEFg6",
                          "key": "numberValue",
                          "type": "string",
                          "description": "",
                          "value": "{{ numberValue }}",
                          "required": true,
                          "select": false
                      },
                      {
                          "_id": "eCMhj1prh7YfuHLV37zbA",
                          "key": "booleanValue",
                          "type": "string",
                          "description": "",
                          "value": "{{ booleanValue }}",
                          "required": true,
                          "select": true
                      },
                      {
                          "_id": "gYsA4OFPCEwbkuarrOgHT",
                          "key": "anyValue",
                          "type": "string",
                          "description": "",
                          "value": "{{ anyValue }}",
                          "required": true,
                          "select": true
                      },
                      {
                          "_id": "28X-8JK1arST5NvCBULXH",
                          "key": "nullValue",
                          "type": "string",
                          "description": "",
                          "value": "{{ nullValue }}",
                          "required": true,
                          "select": true
                      },
                      {
                          "_id": "oEPf4qbKo3GG8aG2_Vvc2",
                          "key": "mixValue",
                          "type": "string",
                          "description": "",
                          "value": "{{ stringValue }}{{ numberValue }}{{ booleanValue }}",
                          "required": true,
                          "select": true
                      },
                      {
                          "_id": "_Ht9wKxHmiIuaVk3hmPBQ",
                          "key": "fileValue",
                          "type": "file",
                          "description": "",
                          "value": "C:\\Users\\MI\\Pictures\\DefDefDefDefDefDefDefDefDefDefDefDefDefDefDefDefDefDefDefDefDefDefault.jpg",
                          "required": true,
                          "select": false,
                          "fileValueType": "file"
                      },
                      {
                          "_id": "v2vOczbCKYDXPv5v-BxTk",
                          "key": "",
                          "type": "file",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true,
                          "fileValueType": "var"
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "4Iz2IKHEbdAS5wooqwhuZ",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "pNwM4RYrV-BEr5QjwbMto",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "multipart/form-data",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6825c3855d747c2d07745376",
          "pid": "6825c3775d747c2d07745369",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747305349635,
          "info": {
              "name": "urlencoded参数",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/request_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "rQk0qHxlwoqMzYvsHx_YG",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "requestBody": {
                  "mode": "urlencoded",
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "4j0ZDzvd1dw3nZYbo1LPY",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "a0ydY8gWaAZ9f5zEogwYf",
                          "key": "stringValue",
                          "type": "string",
                          "description": "",
                          "value": "{{ stringValue }}",
                          "required": true,
                          "select": false
                      },
                      {
                          "_id": "MO0EjOT9BZzpTHAQ3T1ex",
                          "key": "numberValue",
                          "type": "string",
                          "description": "",
                          "value": "{{ numberValue }}",
                          "required": true,
                          "select": true
                      },
                      {
                          "_id": "R_abbdry4pTAqM-PcGZ76",
                          "key": "nullValue",
                          "type": "string",
                          "description": "",
                          "value": "{{ nullValue }}",
                          "required": true,
                          "select": true
                      },
                      {
                          "_id": "XL9Yy7IKqT68l7tGltKeY",
                          "key": "booleanValue",
                          "type": "string",
                          "description": "",
                          "value": "{{ booleanValue }}",
                          "required": true,
                          "select": true
                      },
                      {
                          "_id": "Hy6EZ1uaxgTZPnnvw9Xpj",
                          "key": "fileValue",
                          "type": "string",
                          "description": "",
                          "value": "{{ fileValue }}",
                          "required": true,
                          "select": true
                      },
                      {
                          "_id": "WtNJgGBn5j90DOCLsgTw1",
                          "key": "anyValue",
                          "type": "string",
                          "description": "",
                          "value": "{{ anyValue }}",
                          "required": true,
                          "select": true
                      },
                      {
                          "_id": "TsnIsH-FL7rk-LnaQ0Pbg",
                          "key": "mix",
                          "type": "string",
                          "description": "",
                          "value": "{{ stringValue }}#{{ numberValue }}",
                          "required": true,
                          "select": true
                      },
                      {
                          "_id": "F8XvpZnr0egStCVkqhy02",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "CIp4_kJeXWPwwa3d33kM7",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/x-www-form-urlencoded",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6825c3855d747c2d07745377",
          "pid": "6825c3775d747c2d07745369",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747305349635,
          "info": {
              "name": "raw类型-text",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/raw_body"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "u8V-7ju9TWMs3AXK1EolJ",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "requestBody": {
                  "mode": "raw",
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "1xQmhlMYBareKeHdMQQn5",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "b528MuN_wg6mcCU9wnIrq",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "这是测试文本",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "_k2Ugc8ArKU26NMBrndlQ",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "text/plain",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6825c3855d747c2d07745378",
          "pid": "6825c3775d747c2d07745369",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747305349635,
          "info": {
              "name": "path参数",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue }}/api/test/var/{id}"
              },
              "paths": [
                  {
                      "_id": "vSVe1P5b5LzosqZvnFKD0",
                      "key": "id",
                      "type": "string",
                      "description": "",
                      "value": "{{ numberValue }}",
                      "required": true,
                      "select": true
                  }
              ],
              "queryParams": [
                  {
                      "_id": "BJArnYY4MrWiXLenySIkE",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "4VnS0J2U7EyGrQ-BFDzwY",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "tutneEhEYcaj98aMXEOCt",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "mNSAjaIw689jumVGchKaa",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6825c3855d747c2d07745379",
          "pid": "6825c3775d747c2d07745369",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747305349635,
          "info": {
              "name": "binary参数类型",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/binary"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "d4jkiDWt2faMYFE_1M9GX",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "requestBody": {
                  "mode": "binary",
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "-cn_u0VPeqD19qi37zewa",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "IsfwHYDe1o2IyQ8YJk5Uy",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "{{ fileValue }}",
                      "binaryValue": {
                          "path": "C:\\Users\\MI\\Pictures\\a.txt"
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "wE7P8RtBOE_NQNEdQpllz",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "text/plain",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6825c3855d747c2d0774537a",
          "pid": "6825c3775d747c2d07745369",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747305349635,
          "info": {
              "name": "raw类型-html",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/raw_body"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "u8V-7ju9TWMs3AXK1EolJ",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "requestBody": {
                  "mode": "raw",
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "1xQmhlMYBareKeHdMQQn5",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "b528MuN_wg6mcCU9wnIrq",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "<!doctype html>\r\n<html lang=\"zh-CN\">\r\n  <head>\r\n    <meta charset=\"UTF-8\" />\r\n    <link rel=\"icon\" type=\"image/svg+xml\" href=\"/icon.ico\" />\r\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\r\n    <script src=\"font/iconfont.js\"></script>\r\n    <script src=\"js/beauty.min.js\"></script>\r\n    <link rel=\"stylesheet\" href=\"font/iconfont.css\">\r\n    <title>apiflow</title>\r\n  </head>\r\n  <body>\r\n    <div id=\"app\"></div>\r\n    <script type=\"module\" src=\"/src/renderer/main.ts\"></script>\r\n  </body>\r\n</html>\r\n",
                      "dataType": "text/html"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "_k2Ugc8ArKU26NMBrndlQ",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "text/html",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6825c3855d747c2d0774537b",
          "pid": "6825c3775d747c2d07745369",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747305349635,
          "info": {
              "name": "raw类型-xml",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/raw_body"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "u8V-7ju9TWMs3AXK1EolJ",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "requestBody": {
                  "mode": "raw",
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "1xQmhlMYBareKeHdMQQn5",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "b528MuN_wg6mcCU9wnIrq",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "<meta charset=\"UTF-8\" />",
                      "dataType": "application/xml"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "_k2Ugc8ArKU26NMBrndlQ",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/xml",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6825c3855d747c2d0774537c",
          "pid": "6825c3775d747c2d07745369",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747305349635,
          "info": {
              "name": "raw类型-javascript",
              "version": "1.0",
              "type": "api",
              "creator": "apiflow",
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/raw_body"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "u8V-7ju9TWMs3AXK1EolJ",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "requestBody": {
                  "mode": "raw",
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "1xQmhlMYBareKeHdMQQn5",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "b528MuN_wg6mcCU9wnIrq",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "const a = 'xxx'",
                      "dataType": "text/javascript"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "_k2Ugc8ArKU26NMBrndlQ",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "text/javascript",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6825c39a5d747c2d0774539e",
          "pid": "6825c36f5d747c2d07745361",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747305370997,
          "info": {
              "name": "返回参数",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0,
              "description": ""
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "3xDoiMvLKL8q0arn3qwZ2",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "IXKjjTzLxFhIl4aMA7Obd",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "NJmXWFDwDmCX82fduEa2_",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "BdzrPTtZB7pFYRraeL_-E",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 101,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6825c4e95d747c2d077453c0",
          "pid": "6808c3a32c85f911e89f6c3f",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747305705631,
          "info": {
              "name": "前置脚本",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "_e5o19qIKiYUedxchCiDg",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6825c4f05d747c2d077453c8",
          "pid": "6808c3a32c85f911e89f6c3f",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747305712624,
          "info": {
              "name": "后置脚本",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "_e5o19qIKiYUedxchCiDg",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6825c5905d747c2d077453d0",
          "pid": "6825c4e95d747c2d077453c0",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747305872867,
          "info": {
              "name": "前置脚本",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/request_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "eEuWj8-AGLRCj08IMmTYC",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "ndgfXnRN-pp0uT_Tpkgd-",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "f3hak5zdN9Hrqb9fFvxJf",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "BIfUiCCPtGf9fPnGHMbsn",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6827f3184c8d8514be544256",
          "pid": "6825c4f05d747c2d077453c8",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747448639177,
          "info": {
              "name": "后置脚本",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "RxUvmLUQb6T4kEPcDt26Y",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6827fce3a1aedad4e6da43e9",
          "pid": "68217f9754879786458cd66e",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747451107042,
          "info": {
              "name": "ContentType",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "-sGoCUI_fz9rYYTb6sOoH",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6827fcf0a1aedad4e6da43f1",
          "pid": "682c05860f7ebcead74fbc46",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747715474307,
          "info": {
              "name": "无contentType-json",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/request_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "ZX1OUaxKqjf7EAgWJ8HVP",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "ChCCYIE1IryCDpnUg8zWv",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "aR0X1IEhwTF6Y8RhJRObg",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "Ii5yAPD8lIahzhXONbzT6",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682803e13a2049a73fd7130d",
          "pid": "682c058e0f7ebcead74fbc4e",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747715486418,
          "info": {
              "name": "json",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/request_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "YlsQMhwSqJ0ceWc1TiiE6",
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
                  "rawJson": "{\r\n    \"name\": \"lee\"\r\n}",
                  "formdata": [
                      {
                          "_id": "qU0TUx0er35USQqAwnyBr",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "sbIsK6uOUhk6zJmT3Lcjf",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "dD6Dn2I9U0xJtwBma3N_d",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682c04b90f7ebcead74fbb3d",
          "pid": "682c05860f7ebcead74fbc46",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747583298291,
          "info": {
              "name": "无contentType-form",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/request_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "ZX1OUaxKqjf7EAgWJ8HVP",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "requestBody": {
                  "mode": "formdata",
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "ChCCYIE1IryCDpnUg8zWv",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "aR0X1IEhwTF6Y8RhJRObg",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "Ii5yAPD8lIahzhXONbzT6",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682c04bb0f7ebcead74fbb46",
          "pid": "682c05860f7ebcead74fbc46",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747649388288,
          "info": {
              "name": "无contentType-encoded",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/request_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "ZX1OUaxKqjf7EAgWJ8HVP",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "requestBody": {
                  "mode": "urlencoded",
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "ChCCYIE1IryCDpnUg8zWv",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "aR0X1IEhwTF6Y8RhJRObg",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "Ii5yAPD8lIahzhXONbzT6",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682c04bd0f7ebcead74fbb4f",
          "pid": "682c05860f7ebcead74fbc46",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747682434149.5,
          "info": {
              "name": "无contentType-raw",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/request_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "ZX1OUaxKqjf7EAgWJ8HVP",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "requestBody": {
                  "mode": "raw",
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "ChCCYIE1IryCDpnUg8zWv",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "aR0X1IEhwTF6Y8RhJRObg",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "Ii5yAPD8lIahzhXONbzT6",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682c052c0f7ebcead74fbbe8",
          "pid": "682c05860f7ebcead74fbc46",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747698958433.25,
          "info": {
              "name": "无contentType-binary",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/request_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "ZX1OUaxKqjf7EAgWJ8HVP",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "requestBody": {
                  "mode": "binary",
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "ChCCYIE1IryCDpnUg8zWv",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "aR0X1IEhwTF6Y8RhJRObg",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "Ii5yAPD8lIahzhXONbzT6",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682c05310f7ebcead74fbbf1",
          "pid": "682c05860f7ebcead74fbc46",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747707221474.625,
          "info": {
              "name": "无contentType-none",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/request_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "ZX1OUaxKqjf7EAgWJ8HVP",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "requestBody": {
                  "mode": "none",
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "ChCCYIE1IryCDpnUg8zWv",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "aR0X1IEhwTF6Y8RhJRObg",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "Ii5yAPD8lIahzhXONbzT6",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682c05860f7ebcead74fbc46",
          "pid": "6827fce3a1aedad4e6da43e9",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747715462233,
          "info": {
              "name": "无ContentType",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "O3Ul1b8ypR9kQ1hfrz78s",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682c058e0f7ebcead74fbc4e",
          "pid": "6827fce3a1aedad4e6da43e9",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747715470122,
          "info": {
              "name": "有ContentType",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "O3Ul1b8ypR9kQ1hfrz78s",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682c05aa0f7ebcead74fbc80",
          "pid": "682c058e0f7ebcead74fbc4e",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747715498189,
          "info": {
              "name": "formdata",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/request_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "y6JVaCNgJAB2E403qrbRy",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "requestBody": {
                  "mode": "formdata",
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "g6cAnAL9xItSqbfIN6bXu",
                          "key": "name",
                          "type": "string",
                          "description": "",
                          "value": "lee",
                          "required": true,
                          "select": true
                      },
                      {
                          "_id": "ngMb4kLho9pU8sS2vnUSw",
                          "key": "file",
                          "type": "file",
                          "description": "",
                          "value": "C:\\Users\\MI\\Pictures\\demo.jpg",
                          "required": true,
                          "select": true,
                          "fileValueType": "file"
                      },
                      {
                          "_id": "aurvWRou2O00DD_u0ZpIO",
                          "key": "varFile",
                          "type": "file",
                          "description": "",
                          "value": "{{ fileValue }}",
                          "required": true,
                          "select": true,
                          "fileValueType": "var"
                      },
                      {
                          "_id": "ORq1Xa9JwsDF4Sj3ViEO-",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "D_gWVPY16FQ4CAi6XF2f_",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "_K4_9Mr-oKIvmMpDh4YBd",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "multipart/form-data",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682c56efaafe9a5b722d6b78",
          "pid": "682c058e0f7ebcead74fbc4e",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747715498190,
          "info": {
              "name": "urlencoded",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/request_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "y6JVaCNgJAB2E403qrbRy",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "requestBody": {
                  "mode": "urlencoded",
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "ORq1Xa9JwsDF4Sj3ViEO-",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "D_gWVPY16FQ4CAi6XF2f_",
                          "key": "name",
                          "type": "string",
                          "description": "",
                          "value": "lee",
                          "required": true,
                          "select": true
                      },
                      {
                          "_id": "4gGhbMX_d1M9XAcJPAsDL",
                          "key": "age",
                          "type": "string",
                          "description": "",
                          "value": "22",
                          "required": true,
                          "select": true
                      },
                      {
                          "_id": "H26Fw1m3co0I3C87ZPEfe",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "_K4_9Mr-oKIvmMpDh4YBd",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/x-www-form-urlencoded",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682c56f1aafe9a5b722d6b81",
          "pid": "682c058e0f7ebcead74fbc4e",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747715498190,
          "info": {
              "name": "raw-html",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/request_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "y6JVaCNgJAB2E403qrbRy",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "requestBody": {
                  "mode": "raw",
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "ORq1Xa9JwsDF4Sj3ViEO-",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "D_gWVPY16FQ4CAi6XF2f_",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "<!doctype html>\r\n<html lang=\"zh-CN\">\r\n  <head>\r\n    <meta charset=\"UTF-8\" />\r\n    <link rel=\"icon\" type=\"image/svg+xml\" href=\"/icon.ico\" />\r\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\r\n    <script src=\"font/iconfont.js\"></script>\r\n    <script src=\"js/beauty.min.js\"></script>\r\n    <link rel=\"stylesheet\" href=\"font/iconfont.css\">\r\n    <title>apiflow</title>\r\n  </head>\r\n  <body>\r\n    <div id=\"app\"></div>\r\n    <script type=\"module\" src=\"/src/renderer/main.ts\"></script>\r\n  </body>\r\n</html>\r\n",
                      "dataType": "text/html"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "_K4_9Mr-oKIvmMpDh4YBd",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "text/html",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682c5753aafe9a5b722d6bb7",
          "pid": "682c058e0f7ebcead74fbc4e",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747715498190,
          "info": {
              "name": "raw-text",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/request_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "y6JVaCNgJAB2E403qrbRy",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "requestBody": {
                  "mode": "raw",
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "ORq1Xa9JwsDF4Sj3ViEO-",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "D_gWVPY16FQ4CAi6XF2f_",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "this is a pen!",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "_K4_9Mr-oKIvmMpDh4YBd",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "text/plain",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682c5755aafe9a5b722d6bc0",
          "pid": "682c058e0f7ebcead74fbc4e",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747715498191,
          "info": {
              "name": "raw-xml",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/request_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "y6JVaCNgJAB2E403qrbRy",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "requestBody": {
                  "mode": "raw",
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "ORq1Xa9JwsDF4Sj3ViEO-",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "D_gWVPY16FQ4CAi6XF2f_",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n<root>\r\n    <person id=\"1\">\r\n        <name>张三</name>\r\n        <age>30</age>\r\n        <email>zhangsan@example.com</email>\r\n        <address>\r\n            <street>人民�?23�?/street>\r\n            <city>北京</city>\r\n            <country>中国</country>\r\n        </address>\r\n    </person>\r\n    <person id=\"2\">\r\n        <name>李四</name>\r\n        <age>28</age>\r\n        <email>lisi@example.com</email>\r\n        <address>\r\n            <street>中山�?56�?/street>\r\n            <city>上海</city>\r\n            <country>中国</country>\r\n        </address>\r\n    </person>\r\n    <department name=\"技术部\">\r\n        <member>1</member>\r\n        <member>2</member>\r\n    </department>\r\n</root>",
                      "dataType": "application/xml"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "_K4_9Mr-oKIvmMpDh4YBd",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/xml",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682c5757aafe9a5b722d6bc9",
          "pid": "682c058e0f7ebcead74fbc4e",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747715498191,
          "info": {
              "name": "raw-javascript",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/request_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "y6JVaCNgJAB2E403qrbRy",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "requestBody": {
                  "mode": "raw",
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "ORq1Xa9JwsDF4Sj3ViEO-",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "D_gWVPY16FQ4CAi6XF2f_",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "const name = \"lee\";\r\n",
                      "dataType": "text/javascript"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "_K4_9Mr-oKIvmMpDh4YBd",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "text/javascript",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682c5943aafe9a5b722d6ce2",
          "pid": "682c058e0f7ebcead74fbc4e",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747736899024,
          "info": {
              "name": "binary",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/request_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "u3vbRga8bGINoerkt46-h",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "requestBody": {
                  "mode": "binary",
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "-V_qqjJt7kwjITKO89nbS",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "rE0B0BcWDnBkPi8tyaTCU",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "var",
                      "varValue": "{{ fileValue }}",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "uTh1SPjwTrcF-SuqLCcSO",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "text/plain",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682d58a0aafe9a5b722d6ece",
          "pid": "6808c3a32c85f911e89f6c3f",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747587526458.5,
          "info": {
              "name": "返回结果",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "LNx9XTmy4kLe2xN3J12b9",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682d58abaafe9a5b722d6ed6",
          "pid": "682db079141f84ed03d4e05a",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747824765689,
          "info": {
              "name": "json返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "744o_1oDdIyPDbVpdl_o1",
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
                  "rawJson": "{\r\n    \"type\": \"json\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "D-voVsS75t5_alLVtasBZ",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "ZN1JS8olAdVIHg7Qq2DNn",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "PLcrIwo3cap5LySFO3_Df",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682d5a9f4953d9e3e7f5549e",
          "pid": "682db079141f84ed03d4e05a",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747862864409.5,
          "info": {
              "name": "海量json返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": "https://apiflow.oss-cn-hangzhou.aliyuncs.com/response_test/text/res_large.json"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "BufcoDgZFsWSyLQX76YbS",
                      "key": "Signature",
                      "type": "string",
                      "description": "",
                      "value": "HHaE%2B27ptkpSCttyjcEvWlUWUP4%3D",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "CyIPuVr9-nCwto6-biRSk",
                      "key": "OSSAccessKeyId",
                      "type": "string",
                      "description": "",
                      "value": "TMP.3KsqUHCFgCh81G1vVgecpheBRQ3MDd6EqHqKym6wL9vnRgNzGjx4AkzPLWCyWQE7KinZkkVu5S6NVR5vbugpTmee78j9eb",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "0liuyEwZSMaiKsssnJGN7",
                      "key": "Expires",
                      "type": "string",
                      "description": "",
                      "value": "1747982769",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "1aV_Um82DZz8MXVm0nvZm",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "edbGMeJHyllNIv6pbDTn5",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "dXvgews3VfKk6ki-lnSjn",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "GQcS6jMItZ645Kt_3fOnp",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682daf764953d9e3e7f55874",
          "pid": "682d58a0aafe9a5b722d6ece",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747824502336,
          "info": {
              "name": "文本类型",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "Is3_3eV-uzpvYE4ssWBP-",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682db075141f84ed03d4e052",
          "pid": "682daf764953d9e3e7f55874",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747824757721,
          "info": {
              "name": "css",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "K9wybo_3vdVmcOMd9Qg_X",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682db079141f84ed03d4e05a",
          "pid": "682daf764953d9e3e7f55874",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747824761747,
          "info": {
              "name": "json",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "K9wybo_3vdVmcOMd9Qg_X",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682db094141f84ed03d4e07a",
          "pid": "682db075141f84ed03d4e052",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747824788859,
          "info": {
              "name": "css返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"css\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682db51b141f84ed03d4e0e8",
          "pid": "682daf764953d9e3e7f55874",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747825947083,
          "info": {
              "name": "html",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "K9wybo_3vdVmcOMd9Qg_X",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682db525141f84ed03d4e0f0",
          "pid": "682daf764953d9e3e7f55874",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747825957582,
          "info": {
              "name": "js",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "K9wybo_3vdVmcOMd9Qg_X",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682db52b141f84ed03d4e0f8",
          "pid": "682daf764953d9e3e7f55874",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747825963326,
          "info": {
              "name": "txt",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "K9wybo_3vdVmcOMd9Qg_X",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682db530141f84ed03d4e100",
          "pid": "682daf764953d9e3e7f55874",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747825968744,
          "info": {
              "name": "xml",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "K9wybo_3vdVmcOMd9Qg_X",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682db546141f84ed03d4e10e",
          "pid": "682db51b141f84ed03d4e0e8",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747825990748,
          "info": {
              "name": "html返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"html\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682db547141f84ed03d4e11c",
          "pid": "682db51b141f84ed03d4e0e8",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747825991884,
          "info": {
              "name": "海量html返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"html\",\r\n    \"size\": \"large\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682db549141f84ed03d4e12a",
          "pid": "682db525141f84ed03d4e0f0",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747825993716,
          "info": {
              "name": "js返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"js\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682db54a141f84ed03d4e138",
          "pid": "682db525141f84ed03d4e0f0",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747825994455,
          "info": {
              "name": "海量js返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"js\",\r\n    \"size\": \"large\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682db54b141f84ed03d4e146",
          "pid": "682db52b141f84ed03d4e0f8",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747825995892,
          "info": {
              "name": "txt返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"txt\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682db54c141f84ed03d4e154",
          "pid": "682db52b141f84ed03d4e0f8",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747825996150,
          "info": {
              "name": "海量txt返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"txt\",\r\n    \"size\": \"large\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682db54d141f84ed03d4e162",
          "pid": "682db530141f84ed03d4e100",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747825997701,
          "info": {
              "name": "xml返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"xml\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682db54d141f84ed03d4e170",
          "pid": "682db530141f84ed03d4e100",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747825997873,
          "info": {
              "name": "海量xml返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"xml\",\r\n    \"size\": \"large\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682ee934db437dc3d7b2aa11",
          "pid": "682db075141f84ed03d4e052",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747904820396,
          "info": {
              "name": "海量css返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": "https://apiflow.oss-cn-hangzhou.aliyuncs.com/response_test/text/res_large.css"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "ucrRKTQquuTQMo29xhbxj",
                      "key": "Signature",
                      "type": "string",
                      "description": "",
                      "value": "IEmgmi8PaVJMosloVmWUz5qyoCQ%3D",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "ZhKD7u4mBqRjyNu852lwO",
                      "key": "OSSAccessKeyId",
                      "type": "string",
                      "description": "",
                      "value": "TMP.3KsqUHCFgCh81G1vVgecpheBRQ3MDd6EqHqKym6wL9vnRgNzGjx4AkzPLWCyWQE7KinZkkVu5S6NVR5vbugpTmee78j9eb",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "bgzJ4BHUH1rtISNq5kR2T",
                      "key": "Expires",
                      "type": "string",
                      "description": "",
                      "value": "1747951894",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "Lp6bvGHYcaX09KQpY2v-k",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "71LkZzkkcUbrGr6Yckxde",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "narJaIQlmADU2u0rJYCDw",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "tFJmSE_d4OREWxli1_9rI",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa671ebf4577a8860feee",
          "pid": "682fa671ebf4577a8860fef2",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953265620,
          "info": {
              "name": "docx返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "744o_1oDdIyPDbVpdl_o1",
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
                  "rawJson": "{\r\n    \"type\": \"docx\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "D-voVsS75t5_alLVtasBZ",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "ZN1JS8olAdVIHg7Qq2DNn",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "PLcrIwo3cap5LySFO3_Df",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa671ebf4577a8860fef0",
          "pid": "682d58a0aafe9a5b722d6ece",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953265620,
          "info": {
              "name": "office类型",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa671ebf4577a8860fef1",
          "pid": "682fa671ebf4577a8860fef0",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953265620,
          "info": {
              "name": "pdf",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa671ebf4577a8860fef2",
          "pid": "682fa671ebf4577a8860fef0",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953265620,
          "info": {
              "name": "docx",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa671ebf4577a8860fef3",
          "pid": "682fa671ebf4577a8860fef1",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953265620,
          "info": {
              "name": "pdf返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"pdf\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa671ebf4577a8860fef4",
          "pid": "682fa671ebf4577a8860fef0",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953265620,
          "info": {
              "name": "xls",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa671ebf4577a8860fef5",
          "pid": "682fa671ebf4577a8860fef0",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953265620,
          "info": {
              "name": "xlsx",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa671ebf4577a8860fef6",
          "pid": "682fa671ebf4577a8860fef0",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953265620,
          "info": {
              "name": "ppt",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa671ebf4577a8860fef7",
          "pid": "682fa671ebf4577a8860fef0",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953265620,
          "info": {
              "name": "doc",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa671ebf4577a8860fef8",
          "pid": "682fa671ebf4577a8860fef4",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953265620,
          "info": {
              "name": "xls返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"xls\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa671ebf4577a8860fefa",
          "pid": "682fa671ebf4577a8860fef5",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953265620,
          "info": {
              "name": "xlsx返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"xlsx\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa671ebf4577a8860fefc",
          "pid": "682fa671ebf4577a8860fef6",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953265620,
          "info": {
              "name": "ppt返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"ppt\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa671ebf4577a8860fefe",
          "pid": "682fa671ebf4577a8860fef7",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953265620,
          "info": {
              "name": "doc返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"doc\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa677ebf4577a8860ff1b",
          "pid": "682fa677ebf4577a8860ff1f",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953271064,
          "info": {
              "name": "png返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "744o_1oDdIyPDbVpdl_o1",
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
                  "rawJson": "{\r\n    \"type\": \"png\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "D-voVsS75t5_alLVtasBZ",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "ZN1JS8olAdVIHg7Qq2DNn",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "PLcrIwo3cap5LySFO3_Df",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa677ebf4577a8860ff1d",
          "pid": "682d58a0aafe9a5b722d6ece",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953271064,
          "info": {
              "name": "图片类型",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa677ebf4577a8860ff1e",
          "pid": "682fa677ebf4577a8860ff1d",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953271064,
          "info": {
              "name": "jpg/jpeg",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa677ebf4577a8860ff1f",
          "pid": "682fa677ebf4577a8860ff1d",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953271064,
          "info": {
              "name": "png",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa677ebf4577a8860ff20",
          "pid": "682fa677ebf4577a8860ff1e",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953271064,
          "info": {
              "name": "jpg返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"jpg\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa677ebf4577a8860ff21",
          "pid": "682fa677ebf4577a8860ff1d",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953271064,
          "info": {
              "name": "gif",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa677ebf4577a8860ff22",
          "pid": "682fa677ebf4577a8860ff1d",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953271064,
          "info": {
              "name": "webp",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa677ebf4577a8860ff23",
          "pid": "682fa677ebf4577a8860ff1d",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953271064,
          "info": {
              "name": "bmp",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa677ebf4577a8860ff24",
          "pid": "682fa677ebf4577a8860ff1d",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953271064,
          "info": {
              "name": "svg",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa677ebf4577a8860ff25",
          "pid": "682fa677ebf4577a8860ff21",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953271064,
          "info": {
              "name": "gif返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"gif\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa677ebf4577a8860ff27",
          "pid": "682fa677ebf4577a8860ff22",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953271064,
          "info": {
              "name": "webp返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"webp\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa677ebf4577a8860ff29",
          "pid": "682fa677ebf4577a8860ff23",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953271064,
          "info": {
              "name": "bmp返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"bmp\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa677ebf4577a8860ff2b",
          "pid": "682fa677ebf4577a8860ff24",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953271064,
          "info": {
              "name": "svg返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"svg\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "682fa6e10dd863d0940df9af",
          "pid": "682daf764953d9e3e7f55874",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1747953377712,
          "info": {
              "name": "csv",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "Ll56YO3l4LwI0nyhePnUW",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68312f0c0dd863d0940df9dd",
          "pid": "682daf764953d9e3e7f55874",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748053772759,
          "info": {
              "name": "markdown",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "Ll56YO3l4LwI0nyhePnUW",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68313af80dd863d0940dfd12",
          "pid": "682fa6e10dd863d0940df9af",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748056824590,
          "info": {
              "name": "csv返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "CYqfFlW9D49UVGOq1A0UY",
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
                  "rawJson": "{\r\n    \"type\": \"csv\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "6u9pfyvHJ_QvtomoOJa7W",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "y8mZGdyzabgz-WggxPUmw",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "HPE6CkqbcXWOwi2gJVIeb",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68313c0ab151dc615b9b8b58",
          "pid": "682fa6e10dd863d0940df9af",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748056824591,
          "info": {
              "name": "海量csv返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "CYqfFlW9D49UVGOq1A0UY",
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
                  "rawJson": "{\r\n    \"type\": \"csv\",\r\n    \"size\": \"large\"\r\n}",
                  "formdata": [
                      {
                          "_id": "6u9pfyvHJ_QvtomoOJa7W",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "y8mZGdyzabgz-WggxPUmw",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "HPE6CkqbcXWOwi2gJVIeb",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68317d18e110485431669503",
          "pid": "682fa671ebf4577a8860fef0",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748073752487,
          "info": {
              "name": "pptx",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68317d18e110485431669504",
          "pid": "68317d18e110485431669503",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748073752487,
          "info": {
              "name": "pptx返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"pptx\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6831804ed07798a1ea1fc009",
          "pid": "682fa671ebf4577a8860fef7",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748074574941,
          "info": {
              "name": "doc大文件返�?,
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": "https://online.jobtool.cn/test/res_large.doc"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "iHCYqg1komkoVdyumi2CV",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "JZ6F8yWRMffJaXthKcnhQ",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "c9p2G04fHtkzoeRxf7q77",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "6lX6BEtvwFa-NDUn_ZlWi",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68344225fcd57834c656cbff",
          "pid": "682fa677ebf4577a8860ff1d",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748255269039,
          "info": {
              "name": "ico",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "EB3trNlBQDdY_-ToGtfDJ",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68344609fcd57834c656cd69",
          "pid": "68344225fcd57834c656cbff",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748256265867,
          "info": {
              "name": "ico返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "7G1Ls53ePvKNEh476XcWZ",
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
                  "rawJson": "{\r\n    \"type\": \"ico\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "kqSw3liCbsrgkhbZP4RGR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "6crJKG5_7viKXk5easb5x",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "YszvtvF_g7I5w4A4oEC5Y",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68344697fcd57834c656cdce",
          "pid": "682d58a0aafe9a5b722d6ece",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748256407095,
          "info": {
              "name": "音频",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "EB3trNlBQDdY_-ToGtfDJ",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "683446c4fcd57834c656cddf",
          "pid": "683446c4fcd57834c656cde1",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748256452766,
          "info": {
              "name": "wav返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "744o_1oDdIyPDbVpdl_o1",
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
                  "rawJson": "{\r\n    \"type\": \"wav\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "D-voVsS75t5_alLVtasBZ",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "ZN1JS8olAdVIHg7Qq2DNn",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "PLcrIwo3cap5LySFO3_Df",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "683446c4fcd57834c656cde1",
          "pid": "68344697fcd57834c656cdce",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748256452766,
          "info": {
              "name": "wav",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "683446c4fcd57834c656cde3",
          "pid": "68344697fcd57834c656cdce",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748256452766,
          "info": {
              "name": "mp3",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "683446c4fcd57834c656cde4",
          "pid": "68344697fcd57834c656cdce",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748256452766,
          "info": {
              "name": "flac",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "683446c4fcd57834c656cde5",
          "pid": "68344697fcd57834c656cdce",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748256452766,
          "info": {
              "name": "ogg",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "683446c4fcd57834c656cde7",
          "pid": "683446c4fcd57834c656cde3",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748256452766,
          "info": {
              "name": "mp3返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"mp3\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "683446c4fcd57834c656cde8",
          "pid": "683446c4fcd57834c656cde4",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748256452766,
          "info": {
              "name": "flac返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"flac\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "683446c4fcd57834c656cde9",
          "pid": "683446c4fcd57834c656cde5",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748256452766,
          "info": {
              "name": "ogg返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"ogg\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6834744bec4e3b9ceae5569e",
          "pid": "682d58a0aafe9a5b722d6ece",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748268107752,
          "info": {
              "name": "视频",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "mz8TAmM6A3-J_lZ0du8IK",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68347453ec4e3b9ceae556a7",
          "pid": "68347453ec4e3b9ceae556a9",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748268115966,
          "info": {
              "name": "avi返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "744o_1oDdIyPDbVpdl_o1",
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
                  "rawJson": "{\r\n    \"type\": \"avi\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "D-voVsS75t5_alLVtasBZ",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "ZN1JS8olAdVIHg7Qq2DNn",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "PLcrIwo3cap5LySFO3_Df",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68347453ec4e3b9ceae556a8",
          "pid": "6834744bec4e3b9ceae5569e",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748268115966,
          "info": {
              "name": "mp4",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68347453ec4e3b9ceae556a9",
          "pid": "6834744bec4e3b9ceae5569e",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748268115966,
          "info": {
              "name": "avi",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68347453ec4e3b9ceae556aa",
          "pid": "68347453ec4e3b9ceae556a8",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748268115966,
          "info": {
              "name": "mp4返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"mp4\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68347453ec4e3b9ceae556ab",
          "pid": "6834744bec4e3b9ceae5569e",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748268115966,
          "info": {
              "name": "mkv",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68347453ec4e3b9ceae556ac",
          "pid": "6834744bec4e3b9ceae5569e",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748268115966,
          "info": {
              "name": "mov",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68347453ec4e3b9ceae556ad",
          "pid": "6834744bec4e3b9ceae5569e",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748268115966,
          "info": {
              "name": "webm",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
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
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68347453ec4e3b9ceae556ae",
          "pid": "68347453ec4e3b9ceae556ab",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748268115966,
          "info": {
              "name": "mkv返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"mkv\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68347453ec4e3b9ceae556af",
          "pid": "68347453ec4e3b9ceae556ac",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748268115966,
          "info": {
              "name": "mov返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"mov\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68347453ec4e3b9ceae556b0",
          "pid": "68347453ec4e3b9ceae556ad",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748268115966,
          "info": {
              "name": "webm返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "KmSR8QaoaHMIrUSOlzYld",
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
                  "rawJson": "{\r\n    \"type\": \"webm\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "xNUQ0ZpotMJvjKpZoRb00",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "kGKtfmFsEIcVcmzKOvlqR",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v2OS6hO6gJjrZ_Xyq3sIV",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68354479ec4e3b9ceae55e27",
          "pid": "682d58a0aafe9a5b722d6ece",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748321401495,
          "info": {
              "name": "压缩�?,
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "mz8TAmM6A3-J_lZ0du8IK",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6835447dec4e3b9ceae55e2f",
          "pid": "68354479ec4e3b9ceae55e27",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748321405677,
          "info": {
              "name": "zip",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "mz8TAmM6A3-J_lZ0du8IK",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68354485ec4e3b9ceae55e37",
          "pid": "68354479ec4e3b9ceae55e27",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748321413719,
          "info": {
              "name": "rar",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "mz8TAmM6A3-J_lZ0du8IK",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6835448aec4e3b9ceae55e3f",
          "pid": "68354479ec4e3b9ceae55e27",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748321418288,
          "info": {
              "name": "7z",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "mz8TAmM6A3-J_lZ0du8IK",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6835448eec4e3b9ceae55e47",
          "pid": "68354479ec4e3b9ceae55e27",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748321422607,
          "info": {
              "name": "tar",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "mz8TAmM6A3-J_lZ0du8IK",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68354496ec4e3b9ceae55e4f",
          "pid": "6835447dec4e3b9ceae55e2f",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748321430424,
          "info": {
              "name": "zip返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "OIZhjS0AWtucbIMm7lY1L",
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
                  "rawJson": "{\r\n    \"type\": \"zip\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "1yE-ou0y3jM9cnEzcr3Xq",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "8Tor57w4Ww5cnbSq7TrSF",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "fMeCQnAqRpEFw7maHbdka",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "68354903ec4e3b9ceae55fa3",
          "pid": "68354485ec4e3b9ceae55e37",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748322563145,
          "info": {
              "name": "rar返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "IvtPOTfWXaGdc7GMlCpUE",
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
                  "rawJson": "{\r\n    \"type\": \"rar\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "mDTymtaE8nSIr0p8PRsQc",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "WjszXwkudd21RoXpK4ham",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "DaXGz0nzVg0MF0a9gTifn",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6835494dec4e3b9ceae55fdf",
          "pid": "6835448aec4e3b9ceae55e3f",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748322637398,
          "info": {
              "name": "7z返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "IvtPOTfWXaGdc7GMlCpUE",
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
                  "rawJson": "{\r\n    \"type\": \"7z\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "mDTymtaE8nSIr0p8PRsQc",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "WjszXwkudd21RoXpK4ham",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "DaXGz0nzVg0MF0a9gTifn",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6835494eec4e3b9ceae55fed",
          "pid": "6835448eec4e3b9ceae55e47",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748322638466,
          "info": {
              "name": "tar返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "IvtPOTfWXaGdc7GMlCpUE",
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
                  "rawJson": "{\r\n    \"type\": \"tar\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "mDTymtaE8nSIr0p8PRsQc",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "WjszXwkudd21RoXpK4ham",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "DaXGz0nzVg0MF0a9gTifn",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6835957534a557767c7b1e08",
          "pid": "682d58a0aafe9a5b722d6ece",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748342133503,
          "info": {
              "name": "其他",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "ylj5lnRL81395KFdw9e4V",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6835958b34a557767c7b1e29",
          "pid": "6835957534a557767c7b1e08",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748342155240,
          "info": {
              "name": "exe返回",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "ylj5lnRL81395KFdw9e4V",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6835959e34a557767c7b1e31",
          "pid": "6835957534a557767c7b1e08",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748342174478,
          "info": {
              "name": "epub返回",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "ylj5lnRL81395KFdw9e4V",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "683595aa34a557767c7b1e4d",
          "pid": "6835958b34a557767c7b1e29",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748342186155,
          "info": {
              "name": "exe返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "OIZhjS0AWtucbIMm7lY1L",
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
                  "rawJson": "{\r\n    \"type\": \"exe\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "1yE-ou0y3jM9cnEzcr3Xq",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "8Tor57w4Ww5cnbSq7TrSF",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "fMeCQnAqRpEFw7maHbdka",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6837e492691b26af040b896a",
          "pid": "6835959e34a557767c7b1e31",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748493458131,
          "info": {
              "name": "epub返回",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/response"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "Eh-7CvkwmmXwBZur_7sWK",
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
                  "rawJson": "{\r\n    \"type\": \"epub\",\r\n    \"size\": \"normal\"\r\n}",
                  "formdata": [
                      {
                          "_id": "HZQ-TQw4LKG6m4aMrDVpj",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "NS2IFdCWVxk0au7K_ut_9",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "p6QBD3uUmi5GTJrQKtnhl",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "683931a2691b26af040b8be4",
          "pid": "6808c3a32c85f911e89f6c3f",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748578722323,
          "info": {
              "name": "重定�?,
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "3UHwW1H_02e1DEvIVIOB1",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "683931ae691b26af040b8bec",
          "pid": "683931a2691b26af040b8be4",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1748578734799,
          "info": {
              "name": "重定�?,
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/redirect"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "YPnrDcXfViiPABxgmNG8O",
                      "key": "url",
                      "type": "string",
                      "description": "",
                      "value": "https://www.baidu.com",
                      "required": true,
                      "select": false
                  },
                  {
                      "_id": "XVZtOo3SkS_QSFMJzw3su",
                      "key": "url",
                      "type": "string",
                      "description": "",
                      "value": "http://127.0.0.1:7001/api/test/redirect2",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "Np5eHfsJZ2Fj-fMn9sEUI",
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
                  "rawJson": "{\r\n    \"name\": \"lee\"\r\n}",
                  "formdata": [
                      {
                          "_id": "1PoBQVgo4gpqTJdv0dMF5",
                          "key": "name",
                          "type": "string",
                          "description": "",
                          "value": "aaa",
                          "required": true,
                          "select": false
                      },
                      {
                          "_id": "QLiozXo3efNNI6A7_rzzH",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "xVZA6_mhUYWb5K8DEaVBQ",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "3Vp1b_pjLJw5coFYxUajd",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "684661813a6e8ad6458d6d30",
          "pid": "6808c3a32c85f911e89f6c3f",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1749442945816,
          "info": {
              "name": "Cookies",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "g77oeq9puCcCz5mSyIk6o",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6846618a3a6e8ad6458d6d38",
          "pid": "684661813a6e8ad6458d6d30",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1749442954341,
          "info": {
              "name": "获取cookie",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/cookies"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "39qUVxrbGq-ZJDa4KXinu",
                      "key": "id",
                      "type": "string",
                      "description": "",
                      "value": "{{ stringValue }}",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "pPbG15yTZtprSBjabavcT",
                      "key": "name",
                      "type": "string",
                      "description": "",
                      "value": "2",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "ofQBCUEnSMBVK5IIafCZa",
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
                  "rawJson": "{\r\n    \"x\": 1\r\n}",
                  "formdata": [
                      {
                          "_id": "s9dxN29m51I5GJKsVQUrF",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "YZjwX_HGJFb9QsY-sU1R-",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "P7Hhsp7uLBlajxKZfgv1N",
                      "key": "Authorization",
                      "type": "string",
                      "description": "服务器用于验证用户代理身份的凭证",
                      "value": "Bearer xxx",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "zEW1oUoGSnx3h-rhGxTZ9",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "684a588b3d558e19fc3b6584",
          "pid": "684661813a6e8ad6458d6d30",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1749976065050,
          "info": {
              "name": "域名不同",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "spendTime": 0,
              "description": "",
              "maintainer": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": "https://online.jobtool.cn"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "nTxYd_oXZ8JaGaiPAcfkv",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "PUk-0DzmxoXanxpc-nw9t",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "C_p2xa9WXqoCtV8GHvSox",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "Y9fxpXpbbv5OWZXy15-zH",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6852af6650205699aae6c663",
          "pid": "6808c3a32c85f911e89f6c3f",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1750249318842,
          "info": {
              "name": "前置脚本验证",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "wiQs52QdBydgbmf29Xc6x",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6852af6f50205699aae6c66b",
          "pid": "6852af6650205699aae6c663",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1750249327794,
          "info": {
              "name": "前置脚本验证-formdata",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/request_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "egrlECfjegJxVN_MMBdum",
                      "key": "id",
                      "type": "string",
                      "description": "",
                      "value": "xxx",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "D7-VfAxQxtS_45HmS6zdf",
                      "key": "name",
                      "type": "string",
                      "description": "",
                      "value": "leee",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "XBW7RJYG3phnlYw8IkfXg",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "requestBody": {
                  "mode": "formdata",
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "2JGS1HpgGIXnxTuuNkzDS",
                          "key": "job",
                          "type": "string",
                          "description": "",
                          "value": "it",
                          "required": true,
                          "select": true
                      },
                      {
                          "_id": "JLeL4z8kM8bPL7J76dynM",
                          "key": "file",
                          "type": "file",
                          "description": "",
                          "value": "{{ fileValue }}",
                          "required": true,
                          "select": true,
                          "fileValueType": "var"
                      },
                      {
                          "_id": "c0NkaQDeBfcIgwtvfb-qG",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "HX739DqOuHeS1q4ph5yuC",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v6_cFU0EQk1S8jcsoFRVc",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "multipart/form-data",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6852b7c050205699aae6ca83",
          "pid": "6852af6650205699aae6c663",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1750249327795,
          "info": {
              "name": "前置脚本验证-json",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/request_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "egrlECfjegJxVN_MMBdum",
                      "key": "id",
                      "type": "string",
                      "description": "",
                      "value": "xxx",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "D7-VfAxQxtS_45HmS6zdf",
                      "key": "name",
                      "type": "string",
                      "description": "",
                      "value": "leee",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "XBW7RJYG3phnlYw8IkfXg",
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
                  "rawJson": "{\r\n   \"stringValue\": \"这是一个字符串\",\r\n  \"numberValue\": 42,\r\n  \"bigNumber\": 922337203685477580712, //sadsad\r\n}",
                  "formdata": [
                      {
                          "_id": "2JGS1HpgGIXnxTuuNkzDS",
                          "key": "job",
                          "type": "string",
                          "description": "",
                          "value": "it",
                          "required": true,
                          "select": true
                      },
                      {
                          "_id": "JLeL4z8kM8bPL7J76dynM",
                          "key": "file",
                          "type": "file",
                          "description": "",
                          "value": "{{ fileValue }}",
                          "required": true,
                          "select": true,
                          "fileValueType": "var"
                      },
                      {
                          "_id": "c0NkaQDeBfcIgwtvfb-qG",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "HX739DqOuHeS1q4ph5yuC",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v6_cFU0EQk1S8jcsoFRVc",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6857d7220135b2699a296a94",
          "pid": "684661813a6e8ad6458d6d30",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1749709509695.5,
          "info": {
              "name": "域名和path相同",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/cookies"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "UVeo6N98qP841L_nnGZxG",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "RjJKzOAwuC0NUdMQLVhva",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "-ydILcd33VtIicb2DAvg5",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "AkUzUKz6Qo6ZemFzmO1Tp",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6857d7510135b2699a296ab7",
          "pid": "684661813a6e8ad6458d6d30",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1749842787372.75,
          "info": {
              "name": "域名相同子path",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/cookies/child_path"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "1AADnO6hocUwFKMv4qYd2",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "1XnYsNM5dpInvFosqw_dk",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "o3Je1bFcQElQ0OiRPCaTm",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "b7k6Svcl78WmlhZI0TJVC",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6857d863d6b8935cbbb51e4f",
          "pid": "684661813a6e8ad6458d6d30",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1749909426211.375,
          "info": {
              "name": "域名相同path不同",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/cookies2"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "1AADnO6hocUwFKMv4qYd2",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "1XnYsNM5dpInvFosqw_dk",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "o3Je1bFcQElQ0OiRPCaTm",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "b7k6Svcl78WmlhZI0TJVC",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6858042a68f9fe96e45b61d1",
          "pid": "68217f9754879786458cd66e",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1750598698955,
          "info": {
              "name": "请求头验�?,
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ stringValue}}/api/test/request_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "dPX1g1hAo9dg6ee8zPJ9m",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "WRQma624aXq3s8gGCVdxw",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "OJgVAfBKvwqPp0TNprv2T",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "y9Wh3K0FflsD1bwCwLdCq",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "685a7e5d9414fc1a509ba552",
          "pid": "6808c3a32c85f911e89f6c55",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1750761053029,
          "info": {
              "name": "回收�?,
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "A87ejU_8EsomuQCDPZkem",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "685a7e789414fc1a509ba55a",
          "pid": "685a7e5d9414fc1a509ba552",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1750761080045,
          "info": {
              "name": "文档操作人员列表",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?,
              "spendTime": 0
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": "{{ testUrl }}/api/docs/docs_history_operator_enum"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "ahk_8q72aQ3PfVuU3w10S",
                      "key": "projectId",
                      "type": "string",
                      "description": "",
                      "value": "68061e273bba346cff2cc878",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "2Pfw_SxFTzLnT3UZhS-BQ",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "GmQmHlKo2OGG2_CjvzKP5",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "EuBPrhOUvy2Ui-mP5TYGQ",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "yIDRV75TZEWfWT6E_4rmC",
                      "key": "Authorization",
                      "type": "string",
                      "description": "服务器用于验证用户代理身份的凭证",
                      "value": "{{ token }}",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "gK3cSbsfeloLdTlYxZ7mt",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "685bdab81368eb9da6cf34dc",
          "pid": "6808c3a32c85f911e89f6c55",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1750850232033,
          "info": {
              "name": "项目相关",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "Rk7XcSefe7RW-4gUFvmaC",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "685bdac41368eb9da6cf34e4",
          "pid": "685bdab81368eb9da6cf34dc",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1750850244534,
          "info": {
              "name": "获取文档详情",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": "{{ testUrl }}/api/project/project_full_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "AQ-n1c62ezfhfVOON3tKB",
                      "key": "_id",
                      "type": "string",
                      "description": "",
                      "value": "68061e273bba346cff2cc878",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "u_vyI4YvJZhxBDaKJEzGm",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "jAFAPlLM414xK-GS-JUu6",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "-wgn_7cTozoKWYCoDKZHf",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "IhK74st9FCi2CdEmoamxL",
                      "key": "Authorization",
                      "type": "string",
                      "description": "服务器用于验证用户代理身份的凭证",
                      "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDQ4OWEzMDAxZjA3NDYwY2EzMTFhZiIsInJvbGVJZHMiOlsiNWVkZjcxZjIxOTNjN2Q1ZmEwZWM5Yjk4IiwiNWVkZTBiYTA2Zjc2MTg1MjA0NTg0NzAwIl0sImxvZ2luTmFtZSI6ImFkbWluIiwicmVhbE5hbWUiOiLnrqHnkIblkZgiLCJwaG9uZSI6IiIsInRva2VuIjoiIiwiaWF0IjoxNzUwODUwMDQ0LCJleHAiOjE3NTE0NTQ4NDR9.EB92cjTxAgyt9F1hQu9-qGu4brU640555eC8NmmSTDg",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "-PRgqaKspi_0_tAgvzhZv",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6860d768467e0e777e126573",
          "pid": "6808c3a32c85f911e89f6c55",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1751177064587,
          "info": {
              "name": "接口分享",
              "version": "1.0",
              "type": "folder",
              "creator": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": ""
              },
              "requestBody": {
                  "mode": "json",
                  "rawJson": "",
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  },
                  "formdata": [],
                  "urlencoded": []
              },
              "contentType": "",
              "paths": [],
              "queryParams": [],
              "headers": [],
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "_id": "JjqrMRbyIKc4TkKc6WTUI",
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          },
                          "text": ""
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6860d773467e0e777e12657b",
          "pid": "6860d768467e0e777e126573",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1751177075766,
          "info": {
              "name": "获取分享详情",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": "{{ baseUrl }}/api/project/share_info"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "chDwL_txCkfycNkUMwhwT",
                      "key": "shareId",
                      "type": "string",
                      "description": "",
                      "value": "MfgMp8hoRH_SgxetMBBHv",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "sJQ6ovdd7_caXBh6oHfbr",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "3MTOlxE-4EkxPWicMD_Sn",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "d_-oZfMRVluadrJgY_4zC",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "fALxBS7Q804yysjqj3c09",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "6861077f80eeca023a023ad9",
          "pid": "6860d768467e0e777e126573",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1751189375254,
          "info": {
              "name": "获取分享的banner信息",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?
          },
          "item": {
              "method": "GET",
              "url": {
                  "host": "",
                  "path": "{{ baseUrl }}/project/export/share_banner"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "hZDyWY-FWNkRy0cSEvQuJ",
                      "key": "shareId",
                      "type": "string",
                      "description": "",
                      "value": "MfgMp8hoRH_SgxetMBBHv",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "MVvGi5VA2arO5rtx1syjH",
                      "key": "password",
                      "type": "string",
                      "description": "",
                      "value": "111111",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "gUChuA58raIxPzprFR-YO",
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
                  "rawJson": "",
                  "formdata": [
                      {
                          "_id": "KL_HK1yvFKuEmf5e0tdBr",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "7EeWQCxggT0CdGPnOSYJg",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "v0ow7aVbo4JDHGjy33Np6",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "686217470d447efb4efc7497",
          "pid": "",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1751258951199,
          "info": {
              "name": "请求展示",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{ baseUrl }}/api/demo/test/{id}"
              },
              "paths": [
                  {
                      "_id": "UNCpPkU98uz43-srBJQ3S",
                      "key": "id",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "queryParams": [
                  {
                      "_id": "id04R-nSgvz8JU1NH5vEp",
                      "key": "name",
                      "type": "string",
                      "description": "人名",
                      "value": "lee",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "Msz9LGBdird3f_EJxaaVc",
                      "key": "age",
                      "type": "string",
                      "description": "年龄",
                      "value": "22",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "W8AL0-imisis1Fn25xlyo",
                      "key": "job",
                      "type": "string",
                      "description": "职业信息",
                      "value": "it",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "Mch9FcX_tBEQx88kAl7-2",
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
                  "rawJson": "{\r\n  \"mindParams\": [],\r\n  \"projectName\": \"飞书文档\",\r\n  \"_id\": \"68061e273bba346cff2cc878\", //用户id\r\n  \"hosts\": [],\r\n  \"variables\": [\r\n    {\r\n      \"_id\": \"68146faa5c85e196ebd7ecdf\",\r\n      \"name\": \"testUrl\",\r\n      \"type\": \"string\",\r\n      \"value\": \"http://127.0.0.1:7001\",\r\n      \"fileValue\": {\r\n        \"name\": \"\",\r\n        \"fileType\": \"\",\r\n        \"path\": \"\",\r\n        \"_id\": \"681ae1ec3bfc0bdc74d353c3\"\r\n      }\r\n    },\r\n    {\r\n      \"_id\": \"681ae553369b97411a1883f4\",\r\n      \"name\": \"stringValue\",\r\n      \"type\": \"string\",\r\n      \"value\": \"http://127.0.0.1:7001\",\r\n      \"fileValue\": {\r\n        \"name\": \"\",\r\n        \"fileType\": \"\",\r\n        \"path\": \"\",\r\n        \"_id\": \"681ae5ce369b97411a188470\"\r\n      }\r\n    },\r\n    {\r\n      \"_id\": \"681ae562369b97411a188407\",\r\n      \"name\": \"numberValue\",\r\n      \"type\": \"number\",\r\n      \"value\": \"-27.3\",\r\n      \"fileValue\": {\r\n        \"name\": \"\",\r\n        \"fileType\": \"\",\r\n        \"path\": \"\",\r\n        \"_id\": \"681ae562369b97411a188408\"\r\n      }\r\n    },\r\n    {\r\n      \"_id\": \"681ae56a369b97411a18841a\",\r\n      \"name\": \"booleanValue\",\r\n      \"type\": \"boolean\",\r\n      \"value\": \"true\",\r\n      \"fileValue\": {\r\n        \"name\": \"\",\r\n        \"fileType\": \"\",\r\n        \"path\": \"\",\r\n        \"_id\": \"681ae56a369b97411a18841b\"\r\n      }\r\n    },\r\n    {\r\n      \"_id\": \"681ae573369b97411a18842d\",\r\n      \"name\": \"nullValue\",\r\n      \"type\": \"null\",\r\n      \"value\": \"null\",\r\n      \"fileValue\": {\r\n        \"name\": \"\",\r\n        \"fileType\": \"\",\r\n        \"path\": \"\",\r\n        \"_id\": \"681ae573369b97411a18842e\"\r\n      }\r\n    },\r\n    {\r\n      \"_id\": \"681ae598369b97411a188440\",\r\n      \"name\": \"fileValue\",\r\n      \"type\": \"file\",\r\n      \"value\": \"\",\r\n      \"fileValue\": {\r\n        \"name\": \"a.png\",\r\n        \"fileType\": \"image/png\",\r\n        \"path\": \"C:\\\\Users\\\\MI\\\\Pictures\\\\a.png\",\r\n        \"_id\": \"682c5ae5aafe9a5b722d6d3e\"\r\n      }\r\n    },\r\n    {\r\n      \"_id\": \"681ae5ad369b97411a188453\",\r\n      \"name\": \"anyValue\",\r\n      \"type\": \"any\",\r\n      \"value\": \"new Date().toLocaleString()\",\r\n      \"fileValue\": {\r\n        \"name\": \"\",\r\n        \"fileType\": \"\",\r\n        \"path\": \"\",\r\n        \"_id\": \"681ae5ad369b97411a188454\"\r\n      }\r\n    },\r\n    {\r\n      \"_id\": \"685a7ebc9414fc1a509ba57d\",\r\n      \"name\": \"token\",\r\n      \"type\": \"string\",\r\n      \"value\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDQ4OWEzMDAxZjA3NDYwY2EzMTFiMCIsInJvbGVJZHMiOlsiNWVkZTBiYTA2Zjc2MTg1MjA0NTg0NzAwIl0sImxvZ2luTmFtZSI6ImFwaWZsb3ciLCJyZWFsTmFtZSI6IuWIneWni-aZrumAmueUqOaItyIsInBob25lIjoiIiwidG9rZW4iOiIiLCJpYXQiOjE3NTA3NjAwNjIsImV4cCI6MTc1MTM2NDg2Mn0.Ld9E_yoPx95UBPENRdtZdq9FKUGqbj2Q09Qodf_WWUU\",\r\n      \"fileValue\": {\r\n        \"name\": \"\",\r\n        \"fileType\": \"\",\r\n        \"path\": \"\",\r\n        \"_id\": \"685a7ebc9414fc1a509ba57e\"\r\n      }\r\n    },\r\n    {\r\n      \"_id\": \"685a827b25db291d8777609a\",\r\n      \"name\": \"baseUrl\",\r\n      \"type\": \"string\",\r\n      \"value\": \"http://127.0.0.1:7001\",\r\n      \"fileValue\": {\r\n        \"name\": \"\",\r\n        \"fileType\": \"\",\r\n        \"path\": \"\",\r\n        \"_id\": \"685a827b25db291d8777609b\"\r\n      }\r\n    }\r\n  ],\r\n  \"rules\": {\r\n    \"fileInFolderLimit\": 255,\r\n    \"requestMethods\": [\r\n      {\r\n        \"name\": \"GET\",\r\n        \"value\": \"GET\",\r\n        \"isEnabled\": true,\r\n        \"iconColor\": \"#28a745\",\r\n        \"enabledContenTypes\": [\r\n          \"path\",\r\n          \"params\"\r\n        ]\r\n      },\r\n      {\r\n        \"name\": \"POST\",\r\n        \"value\": \"POST\",\r\n        \"isEnabled\": true,\r\n        \"iconColor\": \"#ffc107\",\r\n        \"enabledContenTypes\": [\r\n          \"params\",\r\n          \"json\",\r\n          \"formData\"\r\n        ]\r\n      },\r\n      {\r\n        \"name\": \"PUT\",\r\n        \"value\": \"PUT\",\r\n        \"isEnabled\": true,\r\n        \"iconColor\": \"#409EFF\",\r\n        \"enabledContenTypes\": [\r\n          \"params\",\r\n          \"json\"\r\n        ]\r\n      },\r\n      {\r\n        \"name\": \"DEL\",\r\n        \"value\": \"DELETE\",\r\n        \"isEnabled\": true,\r\n        \"iconColor\": \"#f56c6c\",\r\n        \"enabledContenTypes\": [\r\n          \"params\"\r\n        ]\r\n      },\r\n      {\r\n        \"name\": \"PATCH\",\r\n        \"value\": \"PATCH\",\r\n        \"isEnabled\": true,\r\n        \"iconColor\": \"#17a2b8\",\r\n        \"enabledContenTypes\": [\r\n          \"params\",\r\n          \"json\"\r\n        ]\r\n      },\r\n      {\r\n        \"name\": \"HEAD\",\r\n        \"value\": \"HEAD\",\r\n        \"isEnabled\": true,\r\n        \"iconColor\": \"#17a2b8\",\r\n        \"enabledContenTypes\": [\r\n          \"params\",\r\n          \"json\"\r\n        ]\r\n      },\r\n      {\r\n        \"name\": \"OPTIONS\",\r\n        \"value\": \"OPTIONS\",\r\n        \"isEnabled\": true,\r\n        \"iconColor\": \"#17a2b8\",\r\n        \"enabledContenTypes\": [\r\n          \"params\",\r\n          \"json\"\r\n        ]\r\n      },\r\n      {\r\n        \"name\": \"Test\",\r\n        \"value\": \"Test\",\r\n        \"isEnabled\": true,\r\n        \"iconColor\": \"#17a2b8\",\r\n        \"enabledContenTypes\": [\r\n          \"params\",\r\n          \"json\"\r\n        ]\r\n      }\r\n    ]\r\n  }\r\n}",
                  "formdata": [
                      {
                          "_id": "u16JVlpDk8cr2wT0TSbVh",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "1M1edJcgcatT0YeaWp7wK",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "UeNtmRPsLaZ0Xlj3ui7-M",
                      "key": "Authorization",
                      "type": "string",
                      "description": "服务器用于验证用户代理身份的凭证",
                      "value": "{{ token }}",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "8M7r5uGdcmo7GP4l_IGJI",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "{\r\n  \"mindParams\": [],\r\n  \"projectName\": \"飞书文档\",\r\n  \"_id\": \"68061e273bba346cff2cc878\",\r\n  \"hosts\": [],\r\n  \"variables\": [\r\n    {\r\n      \"_id\": \"68146faa5c85e196ebd7ecdf\",\r\n      \"name\": \"testUrl\",\r\n      \"type\": \"string\",\r\n      \"value\": \"http://127.0.0.1:7001\",\r\n      \"fileValue\": {\r\n        \"name\": \"\",\r\n        \"fileType\": \"\",\r\n        \"path\": \"\",\r\n        \"_id\": \"681ae1ec3bfc0bdc74d353c3\"\r\n      }\r\n    },\r\n    {\r\n      \"_id\": \"681ae553369b97411a1883f4\",\r\n      \"name\": \"stringValue\",\r\n      \"type\": \"string\",\r\n      \"value\": \"http://127.0.0.1:7001\",\r\n      \"fileValue\": {\r\n        \"name\": \"\",\r\n        \"fileType\": \"\",\r\n        \"path\": \"\",\r\n        \"_id\": \"681ae5ce369b97411a188470\"\r\n      }\r\n    },\r\n    {\r\n      \"_id\": \"681ae562369b97411a188407\",\r\n      \"name\": \"numberValue\",\r\n      \"type\": \"number\",\r\n      \"value\": \"-27.3\",\r\n      \"fileValue\": {\r\n        \"name\": \"\",\r\n        \"fileType\": \"\",\r\n        \"path\": \"\",\r\n        \"_id\": \"681ae562369b97411a188408\"\r\n      }\r\n    },\r\n    {\r\n      \"_id\": \"681ae56a369b97411a18841a\",\r\n      \"name\": \"booleanValue\",\r\n      \"type\": \"boolean\",\r\n      \"value\": \"true\",\r\n      \"fileValue\": {\r\n        \"name\": \"\",\r\n        \"fileType\": \"\",\r\n        \"path\": \"\",\r\n        \"_id\": \"681ae56a369b97411a18841b\"\r\n      }\r\n    },\r\n    {\r\n      \"_id\": \"681ae573369b97411a18842d\",\r\n      \"name\": \"nullValue\",\r\n      \"type\": \"null\",\r\n      \"value\": \"null\",\r\n      \"fileValue\": {\r\n        \"name\": \"\",\r\n        \"fileType\": \"\",\r\n        \"path\": \"\",\r\n        \"_id\": \"681ae573369b97411a18842e\"\r\n      }\r\n    },\r\n    {\r\n      \"_id\": \"681ae598369b97411a188440\",\r\n      \"name\": \"fileValue\",\r\n      \"type\": \"file\",\r\n      \"value\": \"\",\r\n      \"fileValue\": {\r\n        \"name\": \"a.png\",\r\n        \"fileType\": \"image/png\",\r\n        \"path\": \"C:\\\\Users\\\\MI\\\\Pictures\\\\a.png\",\r\n        \"_id\": \"682c5ae5aafe9a5b722d6d3e\"\r\n      }\r\n    },\r\n    {\r\n      \"_id\": \"681ae5ad369b97411a188453\",\r\n      \"name\": \"anyValue\",\r\n      \"type\": \"any\",\r\n      \"value\": \"new Date().toLocaleString()\",\r\n      \"fileValue\": {\r\n        \"name\": \"\",\r\n        \"fileType\": \"\",\r\n        \"path\": \"\",\r\n        \"_id\": \"681ae5ad369b97411a188454\"\r\n      }\r\n    },\r\n    {\r\n      \"_id\": \"685a7ebc9414fc1a509ba57d\",\r\n      \"name\": \"token\",\r\n      \"type\": \"string\",\r\n      \"value\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDQ4OWEzMDAxZjA3NDYwY2EzMTFiMCIsInJvbGVJZHMiOlsiNWVkZTBiYTA2Zjc2MTg1MjA0NTg0NzAwIl0sImxvZ2luTmFtZSI6ImFwaWZsb3ciLCJyZWFsTmFtZSI6IuWIneWni-aZrumAmueUqOaItyIsInBob25lIjoiIiwidG9rZW4iOiIiLCJpYXQiOjE3NTA3NjAwNjIsImV4cCI6MTc1MTM2NDg2Mn0.Ld9E_yoPx95UBPENRdtZdq9FKUGqbj2Q09Qodf_WWUU\",\r\n      \"fileValue\": {\r\n        \"name\": \"\",\r\n        \"fileType\": \"\",\r\n        \"path\": \"\",\r\n        \"_id\": \"685a7ebc9414fc1a509ba57e\"\r\n      }\r\n    },\r\n    {\r\n      \"_id\": \"685a827b25db291d8777609a\",\r\n      \"name\": \"baseUrl\",\r\n      \"type\": \"string\",\r\n      \"value\": \"http://127.0.0.1:7001\",\r\n      \"fileValue\": {\r\n        \"name\": \"\",\r\n        \"fileType\": \"\",\r\n        \"path\": \"\",\r\n        \"_id\": \"685a827b25db291d8777609b\"\r\n      }\r\n    }\r\n  ],\r\n  \"rules\": {\r\n    \"fileInFolderLimit\": 255,\r\n    \"requestMethods\": [\r\n      {\r\n        \"name\": \"GET\",\r\n        \"value\": \"GET\",\r\n        \"isEnabled\": true,\r\n        \"iconColor\": \"#28a745\",\r\n        \"enabledContenTypes\": [\r\n          \"path\",\r\n          \"params\"\r\n        ]\r\n      },\r\n      {\r\n        \"name\": \"POST\",\r\n        \"value\": \"POST\",\r\n        \"isEnabled\": true,\r\n        \"iconColor\": \"#ffc107\",\r\n        \"enabledContenTypes\": [\r\n          \"params\",\r\n          \"json\",\r\n          \"formData\"\r\n        ]\r\n      },\r\n      {\r\n        \"name\": \"PUT\",\r\n        \"value\": \"PUT\",\r\n        \"isEnabled\": true,\r\n        \"iconColor\": \"#409EFF\",\r\n        \"enabledContenTypes\": [\r\n          \"params\",\r\n          \"json\"\r\n        ]\r\n      },\r\n      {\r\n        \"name\": \"DEL\",\r\n        \"value\": \"DELETE\",\r\n        \"isEnabled\": true,\r\n        \"iconColor\": \"#f56c6c\",\r\n        \"enabledContenTypes\": [\r\n          \"params\"\r\n        ]\r\n      },\r\n      {\r\n        \"name\": \"PATCH\",\r\n        \"value\": \"PATCH\",\r\n        \"isEnabled\": true,\r\n        \"iconColor\": \"#17a2b8\",\r\n        \"enabledContenTypes\": [\r\n          \"params\",\r\n          \"json\"\r\n        ]\r\n      },\r\n      {\r\n        \"name\": \"HEAD\",\r\n        \"value\": \"HEAD\",\r\n        \"isEnabled\": true,\r\n        \"iconColor\": \"#17a2b8\",\r\n        \"enabledContenTypes\": [\r\n          \"params\",\r\n          \"json\"\r\n        ]\r\n      },\r\n      {\r\n        \"name\": \"OPTIONS\",\r\n        \"value\": \"OPTIONS\",\r\n        \"isEnabled\": true,\r\n        \"iconColor\": \"#17a2b8\",\r\n        \"enabledContenTypes\": [\r\n          \"params\",\r\n          \"json\"\r\n        ]\r\n      },\r\n      {\r\n        \"name\": \"Test\",\r\n        \"value\": \"Test\",\r\n        \"isEnabled\": true,\r\n        \"iconColor\": \"#17a2b8\",\r\n        \"enabledContenTypes\": [\r\n          \"params\",\r\n          \"json\"\r\n        ]\r\n      }\r\n    ]\r\n  }\r\n}",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  },
                  {
                      "title": "失败返回",
                      "statusCode": 401,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "{\r\n    \"code\": \"error\"\r\n}",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      },
      {
          "_id": "686937f24e0f546e4f44f3fe",
          "pid": "",
          "projectId": "68061e273bba346cff2cc878",

          "sort": 1751726066772,
          "info": {
              "name": "导出为html",
              "version": "1.0",
              "type": "api",
              "creator": "初始普通用�?,
              "maintainer": "初始普通用�?
          },
          "item": {
              "method": "POST",
              "url": {
                  "host": "",
                  "path": "{{baseUrl}}/api/project/export/html"
              },
              "paths": [],
              "queryParams": [
                  {
                      "_id": "hPQ09NoTYYQMe8ZWXAmuL",
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
                  "rawJson": "{\r\n    \"projectId\": \"68061e273bba346cff2cc878\"\r\n}",
                  "formdata": [
                      {
                          "_id": "d8_WaHrjea0z7kFaJRz0f",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "urlencoded": [
                      {
                          "_id": "gl7nIXHPaK8ZVUEg0wZAG",
                          "key": "",
                          "type": "string",
                          "description": "",
                          "value": "",
                          "required": true,
                          "select": true
                      }
                  ],
                  "raw": {
                      "data": "",
                      "dataType": "text/plain"
                  },
                  "binary": {
                      "mode": "file",
                      "varValue": "",
                      "binaryValue": {
                          "id": "",
                          "path": "",
                          "raw": ""
                      }
                  }
              },
              "headers": [
                  {
                      "_id": "ZkNeq6lyifmz_rNGRc4ld",
                      "key": "Authorization",
                      "type": "string",
                      "description": "服务器用于验证用户代理身份的凭证",
                      "value": "{{ token }}",
                      "required": true,
                      "select": true
                  },
                  {
                      "_id": "JkdStZZkw27Rk-hNFXLSq",
                      "key": "",
                      "type": "string",
                      "description": "",
                      "value": "",
                      "required": true,
                      "select": true
                  }
              ],
              "contentType": "application/json",
              "responseParams": [
                  {
                      "title": "成功返回",
                      "statusCode": 200,
                      "value": {
                          "dataType": "application/json",
                          "strJson": "",
                          "text": "",
                          "file": {
                              "url": "",
                              "raw": ""
                          }
                      }
                  }
              ]
          },
          "isEnabled": true
      }
  ],
  "variables": [
      {
          "_id": "68146faa5c85e196ebd7ecdf",
          "name": "testUrl",
          "type": "string",
          "value": "http://127.0.0.1:7001",
          "fileValue": {
              "name": "",
              "fileType": "",
              "path": "",
              "_id": "681ae1ec3bfc0bdc74d353c3"
          }
      },
      {
          "_id": "681ae553369b97411a1883f4",
          "name": "stringValue",
          "type": "string",
          "value": "http://127.0.0.1:7001",
          "fileValue": {
              "name": "",
              "fileType": "",
              "path": "",
              "_id": "681ae5ce369b97411a188470"
          }
      },
      {
          "_id": "681ae562369b97411a188407",
          "name": "numberValue",
          "type": "number",
          "value": "-27.3",
          "fileValue": {
              "name": "",
              "fileType": "",
              "path": "",
              "_id": "681ae562369b97411a188408"
          }
      },
      {
          "_id": "681ae56a369b97411a18841a",
          "name": "booleanValue",
          "type": "boolean",
          "value": "true",
          "fileValue": {
              "name": "",
              "fileType": "",
              "path": "",
              "_id": "681ae56a369b97411a18841b"
          }
      },
      {
          "_id": "681ae573369b97411a18842d",
          "name": "nullValue",
          "type": "null",
          "value": "null",
          "fileValue": {
              "name": "",
              "fileType": "",
              "path": "",
              "_id": "681ae573369b97411a18842e"
          }
      },
      {
          "_id": "681ae598369b97411a188440",
          "name": "fileValue",
          "type": "file",
          "value": "",
          "fileValue": {
              "name": "a.png",
              "fileType": "image/png",
              "path": "C:\\Users\\MI\\Pictures\\a.png",
              "_id": "682c5ae5aafe9a5b722d6d3e"
          }
      },
      {
          "_id": "681ae5ad369b97411a188453",
          "name": "anyValue",
          "type": "any",
          "value": "new Date().toLocaleString()",
          "fileValue": {
              "name": "",
              "fileType": "",
              "path": "",
              "_id": "681ae5ad369b97411a188454"
          }
      },
      {
          "_id": "685a7ebc9414fc1a509ba57d",
          "name": "token",
          "type": "string",
          "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDQ4OWEzMDAxZjA3NDYwY2EzMTFiMCIsInJvbGVJZHMiOlsiNWVkZTBiYTA2Zjc2MTg1MjA0NTg0NzAwIl0sImxvZ2luTmFtZSI6ImFwaWZsb3ciLCJyZWFsTmFtZSI6IuWIneWni-aZrumAmueUqOaItyIsInBob25lIjoiIiwidG9rZW4iOiIiLCJpYXQiOjE3NTE3MjIzNDcsImV4cCI6MTc1MjMyNzE0N30.Ei4yVmo_AgMCOkpHVandURkC9mqJ2SIsN0UzOIwG0DU",
          "fileValue": {
              "name": "",
              "fileType": "",
              "path": "",
              "_id": "686938584e0f546e4f44f44d"
          }
      },
      {
          "_id": "685a827b25db291d8777609a",
          "name": "baseUrl",
          "type": "string",
          "value": "http://127.0.0.1:7001",
          "fileValue": {
              "name": "",
              "fileType": "",
              "path": "",
              "_id": "685a827b25db291d8777609b"
          }
      }
  ]
}

// 导出测试数据
export default localShareDataTest; 
