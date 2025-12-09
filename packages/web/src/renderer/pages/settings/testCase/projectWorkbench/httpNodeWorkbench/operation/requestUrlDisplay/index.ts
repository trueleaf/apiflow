import { type ModelNode } from '../../../../types'

const node: ModelNode = {
  modelName: "requestUrlDisplay",
  description: "请求url展示区域",
  children: [],
  atomicFunc: [
  {
    "purpose": "url地址展示encode后的结果",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在url输入框输入包含中文或特殊字符的url(如http://example.com/测试)"
      },
      {
        "id": "2",
        "name": "观察url展示区域显示的内容"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "url展示区域显示encode后的结果(如http://example.com/%E6%B5%8B%E8%AF%95)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "url展示区域使用encodeURI或encodeURIComponent处理url"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "url编码确保特殊字符正确传输"
      }
    ]
  },
  {
    "purpose": "如果url地址存在异常(非https?://,双//,包含空格,存在未定义的变量等),需要提示tooltip",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "输入异常url(如ftp://example.com或http://example.com//path或http://example.com/{{undefinedVar}})"
      },
      {
        "id": "2",
        "name": "鼠标悬停在url展示区域"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "显示tooltip提示url异常原因"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "url验证逻辑检测协议,双斜杠,空格,未定义变量"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "tooltip帮助用户快速定位url问题"
      }
    ]
  },
  {
    "purpose": "url如果没有http://或者https://开头,自动添加http://或者https://,注意:http.baidu.com这个地址也需要自动添加http://",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "输入不带协议的url(如example.com或http.baidu.com)"
      },
      {
        "id": "2",
        "name": "点击发送请求按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "系统自动添加http://前缀(如http://example.com或http://http.baidu.com)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "发送请求前检查url是否以http://或https://开头,否则自动添加"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "自动添加协议提升用户体验,避免请求失败"
      }
    ]
  }
],
}

export default node
