import { type ModelNode } from '../../../../types'

const node: ModelNode = {
  modelName: "requestBasicInfo",
  description: "请求基本信息",
  children: [],
  atomicFunc: [
  {
    "purpose": "发送请求后,基本信息区域内容展示,需要展示key和value的值,请求地址,请求方式,维护人员,创建人员,创建时间,维护时间",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "已配置请求信息"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "发送请求"
      },
      {
        "id": "2",
        "name": "在响应区域查看基本信息面板"
      },
      {
        "id": "3",
        "name": "验证所有字段内容的正确性"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "请求地址正确显示"
      },
      {
        "id": "2",
        "name": "请求方式正确显示"
      },
      {
        "id": "3",
        "name": "维护人员,创建人员信息显示"
      },
      {
        "id": "4",
        "name": "创建时间,维护时间显示"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "基本信息面板所有字段完整"
      },
      {
        "id": "2",
        "name": "信息准确对应请求配置"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "基本信息用于快速了解请求概况"
      }
    ]
  },
  {
    "purpose": "发送请求后,验证请求方法颜色,验证所有请求方法颜色",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "已配置不同HTTP方法的请求"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "分别发送GET,POST,PUT,DELETE,PATCH等请求"
      },
      {
        "id": "2",
        "name": "观察基本信息面板中请求方法的颜色"
      },
      {
        "id": "3",
        "name": "验证每种方法颜色是否一致且易区分"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "GET方法显示对应颜色(通常为绿色)"
      },
      {
        "id": "2",
        "name": "POST方法显示对应颜色(通常为蓝色)"
      },
      {
        "id": "3",
        "name": "PUT方法显示对应颜色(通常为黄色)"
      },
      {
        "id": "4",
        "name": "DELETE方法显示对应颜色(通常为红色)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "所有HTTP方法颜色定义正确"
      },
      {
        "id": "2",
        "name": "颜色易于区分"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "颜色编码帮助快速识别请求方法"
      }
    ]
  }
],
}

export default node
