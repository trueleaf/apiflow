import { type ModelNode } from '../../types'

const node: ModelNode = {
  modelName: "createProject",
  description: "新建项目",
  children: [],
  atomicFunc: [
  {
    "purpose": "新建项目弹窗,验证项目名称必填,打开项目弹窗需要默认focus",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动,处于/home首页"
      },
      {
        "id": "2",
        "name": "AddProject.vue组件已注册并可用"
      },
      {
        "id": "3",
        "name": "项目列表页面已加载完成"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击首页顶部的\"新建项目\"按钮(data-testid=\"home-add-project-btn\")"
      },
      {
        "id": "2",
        "name": "观察新建项目弹窗是否弹出"
      },
      {
        "id": "3",
        "name": "检查项目名称输入框是否自动获得焦点"
      },
      {
        "id": "4",
        "name": "不输入任何内容,直接点击\"确定\"按钮"
      },
      {
        "id": "5",
        "name": "观察表单验证提示信息"
      },
      {
        "id": "6",
        "name": "在输入框中输入纯空格字符\"   \""
      },
      {
        "id": "7",
        "name": "点击输入框外部区域触发blur事件"
      },
      {
        "id": "8",
        "name": "观察自定义validator的验证提示"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "新建项目弹窗(el-dialog)正确弹出显示"
      },
      {
        "id": "2",
        "name": "弹窗标题显示为\"新建项目\""
      },
      {
        "id": "3",
        "name": "项目名称输入框(data-testid=\"add-project-name-input\")自动获得焦点"
      },
      {
        "id": "4",
        "name": "输入框光标闪烁,用户可以直接输入"
      },
      {
        "id": "5",
        "name": "不输入任何内容点击确定后,显示错误提示:\"请填写项目名称\""
      },
      {
        "id": "6",
        "name": "确定按钮点击无效,弹窗不关闭"
      },
      {
        "id": "7",
        "name": "输入纯空格后失去焦点,显示错误提示:\"项目名称不能为空或仅包含空格\""
      },
      {
        "id": "8",
        "name": "输入框边框显示红色错误状态"
      },
      {
        "id": "9",
        "name": "只有输入有效的项目名称后,确定按钮才能成功提交"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "AddProject组件路径:pages/home/dialog/addProject/AddProject.vue(行1-208)"
      },
      {
        "id": "2",
        "name": "AddProject组件props包含:{ modelValue: boolean, isFocus: boolean }(默认isFocus为true)"
      },
      {
        "id": "3",
        "name": "el-dialog的@opened事件触发handleDialogOpened方法(行97-106)"
      },
      {
        "id": "4",
        "name": "nextTick后通过projectNameInput.value.$el.querySelector(\"input\")获取原生input元素"
      },
      {
        "id": "5",
        "name": "inputEl.focus()调用,输入框获得焦点"
      },
      {
        "id": "6",
        "name": "formInfo.value包含:{ projectName: \"\", remark: \"\" }(行92-95)"
      },
      {
        "id": "7",
        "name": "表单验证规则定义:rules.value.projectName数组(行107-121)"
      },
      {
        "id": "8",
        "name": "第一条规则:{ required: true, trigger: \"blur\", message: \"请填写项目名称\" }"
      },
      {
        "id": "9",
        "name": "第二条规则:自定义validator检查!value || !value.trim()"
      },
      {
        "id": "10",
        "name": "validator在值为空或纯空格时调用callback(new Error(\"项目名称不能为空或仅包含空格\"))"
      },
      {
        "id": "11",
        "name": "handleAddProject方法内调用formRef.value.validate()进行验证(行143-179)"
      },
      {
        "id": "12",
        "name": "验证失败时,validate()的Promise被reject,不执行后续逻辑"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "新建项目按钮位置:ProjectManager.vue顶部工具栏"
      },
      {
        "id": "2",
        "name": "自动聚焦实现依赖于el-dialog的@opened事件和nextTick"
      },
      {
        "id": "3",
        "name": "表单验证使用Element Plus的el-form组件和rules属性"
      },
      {
        "id": "4",
        "name": "自定义validator可以实现复杂的验证逻辑,如检查纯空格"
      },
      {
        "id": "5",
        "name": "isFocus prop为false时不自动聚焦,但默认为true"
      },
      {
        "id": "6",
        "name": "trigger: \"blur\"表示失去焦点时触发验证"
      }
    ]
  },
  {
    "purpose": "新建项目以后自动跳转项目详情,顶部tab新增一个tab并且高亮该tab,返回项目列表查看项目确实被添加了,并且新建的项目需要排在最前面",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动,处于/home首页"
      },
      {
        "id": "2",
        "name": "项目列表已加载,显示现有项目"
      },
      {
        "id": "3",
        "name": "新建项目弹窗已打开,输入框已获得焦点"
      },
      {
        "id": "4",
        "name": "Vue Router和Header.vue组件处于就绪状态"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在新建项目弹窗的项目名称输入框中输入:\"测试新项目\""
      },
      {
        "id": "2",
        "name": "点击\"确定\"按钮提交表单"
      },
      {
        "id": "3",
        "name": "等待项目创建完成和路由跳转"
      },
      {
        "id": "4",
        "name": "观察浏览器地址栏URL变化"
      },
      {
        "id": "5",
        "name": "检查项目工作区页面是否加载"
      },
      {
        "id": "6",
        "name": "检查顶部导航栏是否新增Tab"
      },
      {
        "id": "7",
        "name": "验证新Tab是否处于高亮激活状态"
      },
      {
        "id": "8",
        "name": "点击顶部导航栏的Logo图标返回首页"
      },
      {
        "id": "9",
        "name": "在项目列表中查找\"测试新项目\""
      },
      {
        "id": "10",
        "name": "验证新项目在列表中的位置"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击确定后,表单验证通过"
      },
      {
        "id": "2",
        "name": "弹窗关闭"
      },
      {
        "id": "3",
        "name": "路由自动跳转到/workbench"
      },
      {
        "id": "4",
        "name": "URL包含query参数:id=<新项目ID>&name=测试新项目&mode=edit"
      },
      {
        "id": "5",
        "name": "项目工作区页面正确渲染,显示空白的导航树和内容区"
      },
      {
        "id": "6",
        "name": "顶部导航栏新增一个Tab,显示文本为\"测试新项目\""
      },
      {
        "id": "7",
        "name": "新增的Tab处于激活状态,背景高亮显示"
      },
      {
        "id": "8",
        "name": "点击Logo返回/home首页后,项目列表刷新"
      },
      {
        "id": "9",
        "name": "\"测试新项目\"出现在\"全部项目\"区域的第一个位置(最前面)"
      },
      {
        "id": "10",
        "name": "新项目卡片显示正确的初始数据:接口总数为0,创建者为当前用户,更新日期为当前时间"
      },
      {
        "id": "11",
        "name": "新项目的收藏状态为未收藏(空心星星图标)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "AddProject.vue的handleAddProject方法被调用(行143-179)"
      },
      {
        "id": "2",
        "name": "formRef.value.validate()验证通过"
      },
      {
        "id": "3",
        "name": "projectManagerStore.addProject(projectName, members)被调用"
      },
      {
        "id": "4",
        "name": "离线模式:使用nanoid()生成项目ID"
      },
      {
        "id": "5",
        "name": "离线模式:generateEmptyProject(projectId)创建空项目对象"
      },
      {
        "id": "6",
        "name": "空项目初始数据:{ docNum: 0, owner: { id: \"\", name: \"me\" }, members: [], updatedAt: new Date().toISOString(), isStared: false }"
      },
      {
        "id": "7",
        "name": "离线模式:projectCache.addProject(project)写入IndexedDB"
      },
      {
        "id": "8",
        "name": "addProject方法返回:{ projectId, projectName }"
      },
      {
        "id": "9",
        "name": "emit(\"success\", { projectId, projectName })触发成功事件"
      },
      {
        "id": "10",
        "name": "ProjectManager.vue的handleAddSuccess方法被调用(行478-491)"
      },
      {
        "id": "11",
        "name": "离线模式:调用getProjectList()刷新项目列表"
      },
      {
        "id": "12",
        "name": "router.push跳转到项目工作区,传入id,name,mode参数"
      },
      {
        "id": "13",
        "name": "Header.vue监听路由变化,自动创建新Tab"
      },
      {
        "id": "14",
        "name": "新Tab的activeTabId.value设置为当前项目ID,处于激活状态"
      },
      {
        "id": "15",
        "name": "项目列表按updatedAt倒序排列,新项目的updatedAt最新,排在第一位"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "projectManagerStore.addProject方法路径:行33-56"
      },
      {
        "id": "2",
        "name": "generateEmptyProject函数路径:helper/index.ts(生成默认空项目对象)"
      },
      {
        "id": "3",
        "name": "nanoid用于生成唯一的项目ID"
      },
      {
        "id": "4",
        "name": "项目列表排序:服务器API默认按updatedAt倒序返回,离线模式在getProjectList后排序"
      },
      {
        "id": "5",
        "name": "Tab高亮逻辑:Header.vue通过watch监听$route.query.id,匹配时设置activeTabId"
      },
      {
        "id": "6",
        "name": "在线模式:调用/api/project/add_project API创建项目,需要传递members参数"
      },
      {
        "id": "7",
        "name": "handleAddSuccess的router.push触发路由守卫beforeEach,检查数据库初始化"
      }
    ]
  }
],
}

export default node
