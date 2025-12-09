import { type ModelNode } from '../../../types'

const node: ModelNode = {
  modelName: "globalCommonHeaders",
  description: "全局公共请求头",
  children: [],
  atomicFunc: [
  {
    "purpose": "为folder节点设置公共请求头,该folder下所有接口自动继承这些请求头",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个folder节点"
      },
      {
        "id": "3",
        "name": "folder节点下存在至少一个HTTP请求节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目导航树中,右键点击或选中一个folder节点"
      },
      {
        "id": "2",
        "name": "点击节点的\"公共请求头\"按钮或菜单项,打开公共请求头配置页面"
      },
      {
        "id": "3",
        "name": "在公共请求头页面,查看说明信息(针对目录生效,子目录优先级高于父目录,接口本身请求头优先级最高)"
      },
      {
        "id": "4",
        "name": "在表格模式下,点击\"添加\"按钮新增一行"
      },
      {
        "id": "5",
        "name": "输入请求头:key=\"Authorization\",value=\"Bearer {{token}}\",勾选启用"
      },
      {
        "id": "6",
        "name": "再新增一行:key=\"Content-Type\",value=\"application/json\",勾选启用"
      },
      {
        "id": "7",
        "name": "点击\"确认修改\"按钮保存公共请求头"
      },
      {
        "id": "8",
        "name": "打开该folder下的一个HTTP请求节点"
      },
      {
        "id": "9",
        "name": "查看Headers tab,验证公共请求头是否自动添加"
      },
      {
        "id": "10",
        "name": "发送请求,验证请求中是否包含公共请求头"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "公共请求头配置页面正确打开,显示CommonHeader.vue组件"
      },
      {
        "id": "2",
        "name": "说明区域显示3条规则:目录内生效,子目录优先级高,接口本身优先级最高"
      },
      {
        "id": "3",
        "name": "表格模式下使用SParamsTree组件(edit-mode=\"table\"),支持添加,编辑,删除行"
      },
      {
        "id": "4",
        "name": "成功添加两个公共请求头,headerData数组包含两条记录"
      },
      {
        "id": "5",
        "name": "点击\"确认修改\"后,调用handleEditCommonHeader方法"
      },
      {
        "id": "6",
        "name": "离线模式:公共请求头保存到commonHeadersCache和commonHeaderStore"
      },
      {
        "id": "7",
        "name": "在线模式:调用API /api/project/edit_common_header保存到服务器"
      },
      {
        "id": "8",
        "name": "打开HTTP请求节点时,自动合并公共请求头到节点的headers中"
      },
      {
        "id": "9",
        "name": "公共请求头在Headers tab中显示,但标记为来自folder(可能显示不同的颜色或图标)"
      },
      {
        "id": "10",
        "name": "发送请求时,公共请求头被包含在实际的HTTP请求中"
      },
      {
        "id": "11",
        "name": "如果接口本身有同名请求头,接口的值覆盖公共请求头的值"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "CommonHeader.vue:公共请求头配置组件"
      },
      {
        "id": "2",
        "name": "CommonHeader.vue第3-7行:说明文字,包含3条优先级规则"
      },
      {
        "id": "3",
        "name": "CommonHeader.vue第26-32行:SParamsTree组件,edit-mode根据isMultiline切换table/multiline"
      },
      {
        "id": "4",
        "name": "CommonHeader.vue第64行:headerData = ref<ApidocProperty<\"string\" | \"file\">[]>([])"
      },
      {
        "id": "5",
        "name": "CommonHeader.vue第100-130行:getCommonHeaderInfo方法从缓存或API获取公共请求头"
      },
      {
        "id": "6",
        "name": "CommonHeader.vue第131-170行:handleEditCommonHeader方法保存公共请求头"
      },
      {
        "id": "7",
        "name": "commonHeaderStore.ts:Pinia store管理公共请求头状态"
      },
      {
        "id": "8",
        "name": "commonHeadersCache.ts:IndexedDB缓存层,存储folder的公共请求头"
      },
      {
        "id": "9",
        "name": "公共请求头与folder节点的_id关联,存储结构:{ _id: folderId, commonHeaders: ApidocProperty[] }"
      },
      {
        "id": "10",
        "name": "请求发送时,request.ts中的请求合并逻辑会自动合并公共请求头"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "公共请求头仅针对folder节点有效,HTTP/WebSocket节点不支持设置公共请求头"
      },
      {
        "id": "2",
        "name": "公共请求头支持变量替换,如{{token}}会在请求时被解析为实际变量值"
      },
      {
        "id": "3",
        "name": "优先级规则:接口本身 > 子目录 > 父目录,这样可以实现继承和覆盖机制"
      },
      {
        "id": "4",
        "name": "公共请求头的典型应用场景:统一设置Authorization,Content-Type等通用请求头"
      },
      {
        "id": "5",
        "name": "公共请求头支持文件类型(file),但通常用于string类型"
      }
    ]
  },
  {
    "purpose": "公共请求头支持表格模式和多行编辑模式切换,两种模式数据同步",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "已打开某个folder节点的公共请求头配置页面"
      },
      {
        "id": "3",
        "name": "当前处于表格模式(isMultiline = false)"
      },
      {
        "id": "4",
        "name": "已添加至少2个公共请求头"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在表格模式下,验证公共请求头以表格形式展示(checkbox,key,value,description列)"
      },
      {
        "id": "2",
        "name": "点击标题右侧的\"多行编辑\"切换按钮(Switch图标)"
      },
      {
        "id": "3",
        "name": "观察页面切换到多行编辑模式"
      },
      {
        "id": "4",
        "name": "在多行编辑器中编辑请求头文本,格式为:Authorization: Bearer token\\nContent-Type: application/json"
      },
      {
        "id": "5",
        "name": "点击多行编辑器的\"应用\"按钮"
      },
      {
        "id": "6",
        "name": "观察页面自动切换回表格模式"
      },
      {
        "id": "7",
        "name": "验证表格中的数据已更新为多行编辑器中的内容"
      },
      {
        "id": "8",
        "name": "再次点击切换按钮,切换到多行编辑模式,验证数据一致"
      },
      {
        "id": "9",
        "name": "点击多行编辑器的\"取消\"按钮"
      },
      {
        "id": "10",
        "name": "验证页面切换回表格模式,数据未被修改"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "表格模式下,SParamsTree组件的edit-mode prop为\"table\""
      },
      {
        "id": "2",
        "name": "点击切换按钮后,isMultiline.value切换为true"
      },
      {
        "id": "3",
        "name": "SParamsTree组件的edit-mode prop变为\"multiline\""
      },
      {
        "id": "4",
        "name": "多行编辑模式显示文本编辑器,支持手动输入key: value格式的请求头"
      },
      {
        "id": "5",
        "name": "多行编辑器支持换行符\\n分隔多个请求头"
      },
      {
        "id": "6",
        "name": "点击\"应用\"按钮后,触发handleMultilineApplied回调"
      },
      {
        "id": "7",
        "name": "handleMultilineApplied将isMultiline设置为false,自动切换回表格模式"
      },
      {
        "id": "8",
        "name": "表格模式中的数据已同步更新为多行编辑器解析后的数据"
      },
      {
        "id": "9",
        "name": "点击\"取消\"按钮后,触发handleMultilineCancelled回调"
      },
      {
        "id": "10",
        "name": "handleMultilineCancelled将isMultiline设置为false,数据不变"
      },
      {
        "id": "11",
        "name": "切换按钮图标为Switch(Element Plus图标库)"
      },
      {
        "id": "12",
        "name": "切换按钮在多行模式时显示.active类名"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "CommonHeader.vue第81行:isMultiline = ref(false)控制编辑模式"
      },
      {
        "id": "2",
        "name": "CommonHeader.vue第83-85行:toggleMode方法切换isMultiline值"
      },
      {
        "id": "3",
        "name": "CommonHeader.vue第31行:edit-mode prop根据isMultiline动态计算:\"table\"或\"multiline\""
      },
      {
        "id": "4",
        "name": "CommonHeader.vue第86-91行:handleMultilineApplied和handleMultilineCancelled回调"
      },
      {
        "id": "5",
        "name": "CommonHeader.vue第92-97行:watch监听paramsTreeRef,注册回调函数"
      },
      {
        "id": "6",
        "name": "CommonHeader.vue第12-24行:切换按钮,绑定@click=\"toggleMode\""
      },
      {
        "id": "7",
        "name": "CommonHeader.vue第17行::class=\"{ active: isMultiline }\"控制按钮高亮"
      },
      {
        "id": "8",
        "name": "CommonHeader.vue第16行:title属性根据isMultiline显示\"返回表格\"或\"多行编辑\""
      },
      {
        "id": "9",
        "name": "SParamsTree组件支持table和multiline两种编辑模式"
      },
      {
        "id": "10",
        "name": "多行编辑模式解析逻辑:按行分割,每行按冒号分割key和value"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "多行编辑模式适合批量复制粘贴请求头,提高效率"
      },
      {
        "id": "2",
        "name": "表格模式适合精细编辑单个请求头,支持checkbox,description等字段"
      },
      {
        "id": "3",
        "name": "两种模式的数据通过headerData ref保持同步"
      },
      {
        "id": "4",
        "name": "SParamsTree组件内部处理模式切换和数据转换逻辑"
      },
      {
        "id": "5",
        "name": "多行编辑模式的格式:每行一个请求头,格式为\"key: value\""
      },
      {
        "id": "6",
        "name": "切换按钮的tooltip提示当前操作:\"返回表格\"表示当前在多行模式,点击回到表格"
      }
    ]
  }
],
}

export default node
