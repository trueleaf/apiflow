import { type ModelNode } from '../../types'

const node: ModelNode = {
  modelName: "variable",
  description: "变量管理",
  children: [],
  atomicFunc: [
  {
    "purpose": "新增所有类型变量,变量名不允许重复,可以删除变量",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "打开变量管理弹窗"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击\"新增变量\"按钮"
      },
      {
        "id": "2",
        "name": "输入变量名\"testString\",选择类型\"string\",输入值\"hello world\",点击保存"
      },
      {
        "id": "3",
        "name": "再次点击\"新增变量\",输入变量名\"testNumber\",选择类型\"number\",输入值\"123\",点击保存"
      },
      {
        "id": "4",
        "name": "新增变量名\"testBoolean\",类型\"boolean\",值\"true\""
      },
      {
        "id": "5",
        "name": "新增变量名\"testFile\",类型\"file\",选择一个文件上传"
      },
      {
        "id": "6",
        "name": "新增变量名\"testAny\",类型\"any\",输入JavaScript表达式\"new Date().getTime()\""
      },
      {
        "id": "7",
        "name": "尝试新增重复变量名\"testString\",输入不同的值"
      },
      {
        "id": "8",
        "name": "选择某个已存在的变量,点击删除按钮"
      },
      {
        "id": "9",
        "name": "确认删除"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "成功新增string类型变量,variables数组中增加一条记录"
      },
      {
        "id": "2",
        "name": "成功新增number类型变量,值被转换为数字类型"
      },
      {
        "id": "3",
        "name": "成功新增boolean类型变量,值为true或false"
      },
      {
        "id": "4",
        "name": "成功新增file类型变量,值为文件对象或文件路径"
      },
      {
        "id": "5",
        "name": "成功新增any类型变量,值为JavaScript表达式的执行结果"
      },
      {
        "id": "6",
        "name": "新增重复变量名时,显示错误提示:\"变量名已存在\"或类似提示"
      },
      {
        "id": "7",
        "name": "重复变量不允许保存,变量列表不变"
      },
      {
        "id": "8",
        "name": "删除变量后,该变量从variables数组中移除"
      },
      {
        "id": "9",
        "name": "变量列表UI立即更新,不再显示被删除的变量"
      },
      {
        "id": "10",
        "name": "所有变量操作会调用syncVariablesToMainProcess同步到主进程"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "variablesStore.ts:variables = ref<ApidocVariable[]>([])存储所有变量"
      },
      {
        "id": "2",
        "name": "ApidocVariable接口包含字段:_id,name,type,value等"
      },
      {
        "id": "3",
        "name": "variablesStore.changeVariableById方法用于修改变量"
      },
      {
        "id": "4",
        "name": "variablesStore.replaceVariables方法用于替换所有变量"
      },
      {
        "id": "5",
        "name": "syncVariablesToMainProcess方法调用window.electronAPI!.mock.syncProjectVariables同步到主进程"
      },
      {
        "id": "6",
        "name": "getObjectVariable(variables.value)将变量数组转换为对象格式,方便在请求中使用"
      },
      {
        "id": "7",
        "name": "objectVariable.value存储转换后的对象格式:{ 变量名: 变量值 }"
      },
      {
        "id": "8",
        "name": "变量名重复验证逻辑:遍历variables数组检查name字段是否已存在"
      },
      {
        "id": "9",
        "name": "删除变量使用数组的splice方法,传入索引和删除数量"
      },
      {
        "id": "10",
        "name": "每次变量变更后都要调用getObjectVariable更新objectVariable.value"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "变量类型包含:string,number,boolean,file,any五种类型"
      },
      {
        "id": "2",
        "name": "any类型支持JavaScript表达式,可以编写动态计算逻辑"
      },
      {
        "id": "3",
        "name": "file类型用于上传文件,在multipart/form-data请求中使用"
      },
      {
        "id": "4",
        "name": "变量同步到主进程后,可以在pre-request和post-request脚本中使用"
      },
      {
        "id": "5",
        "name": "变量管理通常在独立弹窗或侧边栏中展示,方便集中管理"
      },
      {
        "id": "6",
        "name": "变量数据会持久化到IndexedDB(离线模式)或服务器(在线模式)"
      }
    ]
  },
  {
    "purpose": "模拟一个post发送body请求,调用echo接口,验证所有类型变量是否正确",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "已新增以下变量:testString(string:\"test\"),testNumber(number:100),testBool(boolean:true),testAny(any:计算表达式)"
      },
      {
        "id": "3",
        "name": "本地或远程有可访问的echo接口(返回请求参数的接口)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "新建一个HTTP POST请求节点"
      },
      {
        "id": "2",
        "name": "设置请求URL为:http://127.0.0.1:{端口}/echo"
      },
      {
        "id": "3",
        "name": "设置Content-Type为application/json"
      },
      {
        "id": "4",
        "name": "在Body的JSON编辑器中输入:{ \"str\": \"{{testString}}\", \"num\": {{testNumber}}, \"bool\": {{testBool}}, \"any\": {{testAny}} }"
      },
      {
        "id": "5",
        "name": "点击\"发送请求\"按钮"
      },
      {
        "id": "6",
        "name": "等待请求完成,查看响应结果"
      },
      {
        "id": "7",
        "name": "验证响应body中各字段的值是否为变量替换后的值"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "发送请求前,变量解析器识别{{variableName}}模式的变量引用"
      },
      {
        "id": "2",
        "name": "testString变量被替换为\"test\",在JSON中保持字符串格式(带引号)"
      },
      {
        "id": "3",
        "name": "testNumber变量被替换为100,在JSON中为数字类型(不带引号)"
      },
      {
        "id": "4",
        "name": "testBool变量被替换为true,在JSON中为布尔类型"
      },
      {
        "id": "5",
        "name": "testAny变量被执行表达式,替换为计算结果值"
      },
      {
        "id": "6",
        "name": "echo接口正确返回包含替换后值的响应,状态码200"
      },
      {
        "id": "7",
        "name": "响应body JSON结构:{ \"str\": \"test\", \"num\": 100, \"bool\": true, \"any\": <计算结果> }"
      },
      {
        "id": "8",
        "name": "变量替换过程在request.ts的变量解析模块中完成"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "变量解析使用正则表达式匹配{{variableName}}模式"
      },
      {
        "id": "2",
        "name": "objectVariable.value对象提供变量名到值的映射关系"
      },
      {
        "id": "3",
        "name": "variablesStore.variables数组包含所有定义的变量"
      },
      {
        "id": "4",
        "name": "getObjectVariable helper函数将变量数组转换为对象:{ name: value }"
      },
      {
        "id": "5",
        "name": "变量替换支持在URL,query参数,headers,body等所有请求部分使用"
      },
      {
        "id": "6",
        "name": "string类型变量替换时保留引号,number和boolean类型去除引号"
      },
      {
        "id": "7",
        "name": "any类型变量会执行JavaScript表达式,支持Date,Math等内置对象"
      },
      {
        "id": "8",
        "name": "echo接口应返回原样的请求参数,验证变量替换的准确性"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "echo接口通常由mock server提供,或使用第三方测试工具"
      },
      {
        "id": "2",
        "name": "变量替换在发送请求前执行,不影响原始配置数据"
      },
      {
        "id": "3",
        "name": "变量解析支持嵌套引用,如变量A的值包含{{变量B}}"
      },
      {
        "id": "4",
        "name": "any类型变量的表达式在Web Worker中执行,提供af对象访问变量,cookies等"
      },
      {
        "id": "5",
        "name": "变量替换错误(如变量不存在)会在控制台输出警告信息"
      },
      {
        "id": "6",
        "name": "测试所有类型变量可以覆盖变量系统的核心功能"
      }
    ]
  }
],
}

export default node
