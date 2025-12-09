import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "boundaryTest",
  description: "边界情况测试",
  children: [],
  atomicFunc: [
  {
    "purpose": "鼠标右键非folder节点不出现新建接口选项",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "节点树中存在非folder类型的节点(如HTTP,WebSocket等接口节点)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "鼠标右键点击一个HTTP接口节点"
      },
      {
        "id": "2",
        "name": "观察右键菜单内容"
      },
      {
        "id": "3",
        "name": "验证\"新建接口\"选项不显示"
      },
      {
        "id": "4",
        "name": "重复操作WebSocket,HTTP Mock,WebSocket Mock等非folder节点"
      },
      {
        "id": "5",
        "name": "验证所有非folder节点右键菜单都不显示\"新建接口\"选项"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "handleShowContextmenu方法被触发,currentOperationalNode.value为接口节点数据"
      },
      {
        "id": "2",
        "name": "currentOperationalNode.type不等于\"folder\""
      },
      {
        "id": "3",
        "name": "\"新建接口\"菜单项的v-show条件:!currentOperationalNode || currentOperationalNode?.type === 'folder'为false"
      },
      {
        "id": "4",
        "name": "\"新建接口\"选项不渲染(v-show为false)"
      },
      {
        "id": "5",
        "name": "右键菜单显示其他选项:剪切,复制,生成副本,重命名,删除等"
      },
      {
        "id": "6",
        "name": "\"新建文件夹\"选项同样不显示(使用相同的v-show条件)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "\"新建接口\"菜单项v-show条件在Banner.vue第223行"
      },
      {
        "id": "2",
        "name": "\"新建文件夹\"菜单项v-show条件在Banner.vue第225行"
      },
      {
        "id": "3",
        "name": "两个菜单项使用相同的显示条件:!currentOperationalNode || currentOperationalNode?.type === 'folder'"
      },
      {
        "id": "4",
        "name": "当currentOperationalNode存在且type不为folder时,v-show为false"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "非folder节点不能作为父节点添加子节点,因此不显示\"新建接口\"和\"新建文件夹\"选项"
      },
      {
        "id": "2",
        "name": "这是一个重要的边界情况测试,确保UI逻辑正确性"
      },
      {
        "id": "3",
        "name": "右键菜单会根据节点类型动态显示/隐藏选项"
      }
    ]
  },
  {
    "purpose": "非folder节点点击更多按钮不出现新建接口选项",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "节点树中存在非folder类型的节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "鼠标悬停在一个HTTP接口节点上"
      },
      {
        "id": "2",
        "name": "点击节点的\"更多操作\"按钮"
      },
      {
        "id": "3",
        "name": "观察弹出的菜单内容"
      },
      {
        "id": "4",
        "name": "验证\"新建接口\"和\"新建文件夹\"选项不显示"
      },
      {
        "id": "5",
        "name": "重复操作其他非folder类型节点,验证结果一致"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "\"更多操作\"按钮点击触发handleShowContextmenu方法"
      },
      {
        "id": "2",
        "name": "currentOperationalNode.value为接口节点数据,type不为\"folder\""
      },
      {
        "id": "3",
        "name": "右键菜单显示,但\"新建接口\"和\"新建文件夹\"选项不显示(v-show为false)"
      },
      {
        "id": "4",
        "name": "菜单显示其他可用选项:剪切,复制,生成副本,重命名,删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "\"更多操作\"按钮绑定:@click.stop=\"handleShowContextmenu($event, scope.data)\""
      },
      {
        "id": "2",
        "name": "handleShowContextmenu方法设置currentOperationalNode为当前节点数据"
      },
      {
        "id": "3",
        "name": "右键菜单使用相同的v-show条件判断选项显示"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "\"更多操作\"按钮和右键点击触发相同的方法,菜单显示逻辑完全一致"
      },
      {
        "id": "2",
        "name": "这个测试用例验证通过\"更多操作\"按钮触发的边界情况与右键触发的边界情况一致"
      }
    ]
  }
],
}

export default node
