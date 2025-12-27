import { type ModelNode } from '../../types'

const node: ModelNode = {
  modelName: "projectList",
  description: "项目列表",
  children: [],
  atomicFunc: [
  {
    "purpose": "项目列表以卡片形式展示,卡片包含:项目名称,修改图标,删除图标,收藏图标,创建者,最新更新日期,接口总数,编辑按钮",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动并完成数据库初始化"
      },
      {
        "id": "2",
        "name": "用户已登录或处于离线模式"
      },
      {
        "id": "3",
        "name": "至少存在一个项目在IndexedDB中"
      },
      {
        "id": "4",
        "name": "projectManagerStore已初始化并加载项目列表"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "启动应用,导航到/home首页路由"
      },
      {
        "id": "2",
        "name": "等待ProjectManager.vue组件挂载和项目列表数据加载"
      },
      {
        "id": "3",
        "name": "观察\"全部项目\"区域的项目卡片展示"
      },
      {
        "id": "4",
        "name": "检查每张项目卡片的UI元素完整性"
      },
      {
        "id": "5",
        "name": "验证项目卡片的响应式布局(flex布局,每行最多4张卡片)"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "项目卡片使用el-card组件,带有hover阴影效果"
      },
      {
        "id": "2",
        "name": "项目名称显示在卡片顶部,使用.title.project-name.theme-color类,超长文本显示省略号"
      },
      {
        "id": "3",
        "name": "修改图标(EditIcon)显示在项目名称右侧,data-testid=\"home-project-edit-btn\""
      },
      {
        "id": "4",
        "name": "在线模式下显示成员管理图标(UserIcon),离线模式下隐藏"
      },
      {
        "id": "5",
        "name": "收藏图标(Star或StarFilled)显示,未收藏显示空心星星,已收藏显示实心星星"
      },
      {
        "id": "6",
        "name": "删除图标(DeleteIcon)显示在右上角,data-testid=\"home-project-delete-btn\""
      },
      {
        "id": "7",
        "name": "创建者信息显示格式:\"创建者: {{ item.owner.name }}\",离线模式默认显示\"me\""
      },
      {
        "id": "8",
        "name": "最新更新日期显示格式:\"最新更新: {{ formatDate(item.updatedAt) }}\",格式为\"YYYY-MM-DD HH:mm\""
      },
      {
        "id": "9",
        "name": "接口总数显示格式:\"接口总数: {{ item.docNum || 0 }}\""
      },
      {
        "id": "10",
        "name": "编辑按钮显示在卡片底部,文案为\"编辑\",data-testid=\"home-project-enter-btn\""
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "ProjectManager.vue组件正确渲染(行1-734)"
      },
      {
        "id": "2",
        "name": "projectList computed属性返回过滤后的项目列表(行287-298)"
      },
      {
        "id": "3",
        "name": "项目卡片循环渲染:v-for=\"(item, index) in projectList\"(行120)"
      },
      {
        "id": "4",
        "name": "项目卡片data-testid=\"home-project-card-{index}\"属性正确绑定"
      },
      {
        "id": "5",
        "name": "项目名称DOM元素:<div class=\"title project-name theme-color text-ellipsis\">(行121)"
      },
      {
        "id": "6",
        "name": "修改图标点击事件:@click=\"handleOpenEditDialog(item)\"(行129)"
      },
      {
        "id": "7",
        "name": "收藏图标条件渲染:v-if=\"!item.isStared\"显示Star,v-else显示StarFilled(行135-150)"
      },
      {
        "id": "8",
        "name": "删除图标点击事件:@click=\"deleteProject(item._id)\"(行155)"
      },
      {
        "id": "9",
        "name": "创建者信息:{{ item.owner.name }}(行158-161)"
      },
      {
        "id": "10",
        "name": "更新日期:formatDate(item.updatedAt)调用helper函数(行162-165)"
      },
      {
        "id": "11",
        "name": "接口总数:{{ item.docNum || 0 }}(行169)"
      },
      {
        "id": "12",
        "name": "编辑按钮点击事件:@click=\"handleJumpToProject(item)\"(行172)"
      },
      {
        "id": "13",
        "name": "ApidocProjectInfo类型包含所有必需字段:_id, projectName, owner, updatedAt, docNum, isStared"
      },
      {
        "id": "14",
        "name": "离线模式判断:isStandalone = computed(() => runtimeStore.networkMode === \"offline\")(行234)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "项目列表组件路径:packages/web/src/renderer/pages/home/projectManager/ProjectManager.vue"
      },
      {
        "id": "2",
        "name": "项目数据来源:projectManagerStore.getProjectList(),离线模式读取IndexedDB,在线模式调用API"
      },
      {
        "id": "3",
        "name": "接口数量计算逻辑:apiNodesCache.updateProjectNodeNum()统计非folder且未删除的节点"
      },
      {
        "id": "4",
        "name": "日期格式化函数:formatDate(date, \"YYYY-MM-DD HH:mm\")在helper/index.ts中实现"
      },
      {
        "id": "5",
        "name": "卡片布局:使用grid布局,每行最多4张卡片,卡片宽度自适应"
      },
      {
        "id": "6",
        "name": "图标库:所有图标来自lucide-vue-next库(EditIcon,UserIcon,Star,StarFilled,DeleteIcon)"
      }
    ]
  },
  {
    "purpose": "点击编辑按钮,跳转对应项目工作区",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动,处于/home首页"
      },
      {
        "id": "2",
        "name": "项目列表已加载,至少显示一个项目卡片"
      },
      {
        "id": "3",
        "name": "Vue Router已初始化"
      },
      {
        "id": "4",
        "name": "projectWorkbenchStore处于就绪状态"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "定位到任意一个项目卡片"
      },
      {
        "id": "2",
        "name": "点击项目卡片底部的\"编辑\"按钮(data-testid=\"home-project-enter-btn\")"
      },
      {
        "id": "3",
        "name": "等待路由跳转完成"
      },
      {
        "id": "4",
        "name": "观察浏览器地址栏URL变化"
      },
      {
        "id": "5",
        "name": "验证项目工作区页面已加载"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "路由立即跳转到/v1/apidoc/doc-edit路径"
      },
      {
        "id": "2",
        "name": "URL携带query参数:id=<项目ID>&name=<项目名称>&mode=edit"
      },
      {
        "id": "3",
        "name": "项目工作区页面(DocEdit组件)正确渲染"
      },
      {
        "id": "4",
        "name": "顶部导航栏显示项目名称并新增对应的Tab"
      },
      {
        "id": "5",
        "name": "新增的Tab处于高亮激活状态"
      },
      {
        "id": "6",
        "name": "左侧导航树加载该项目的API节点列表"
      },
      {
        "id": "7",
        "name": "中间内容区域显示项目工作台界面"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleJumpToProject方法被正确调用(ProjectManager.vue 行464-475)"
      },
      {
        "id": "2",
        "name": "projectManagerStore.recordVisited(item._id)记录项目访问(仅在线模式)"
      },
      {
        "id": "3",
        "name": "projectWorkbenchStore.changeProjectId(item._id)更新工作区项目ID"
      },
      {
        "id": "4",
        "name": "router.push方法调用,传入正确的路由配置对象"
      },
      {
        "id": "5",
        "name": "router.push参数:{ path: \"/v1/apidoc/doc-edit\", query: { id, name, mode: \"edit\" } }"
      },
      {
        "id": "6",
        "name": "Vue Router路由配置中存在name=\"DocEdit\"的路由记录"
      },
      {
        "id": "7",
        "name": "路由守卫beforeEach检查数据库初始化状态(router/index.ts 行144-162)"
      },
      {
        "id": "8",
        "name": "DocEdit组件挂载并从$route.query中读取id,name,mode参数"
      },
      {
        "id": "9",
        "name": "Header.vue组件监听路由变化,自动创建新Tab并高亮"
      },
      {
        "id": "10",
        "name": "localStorage[\"history/lastVisitePage\"]更新为当前路由完整路径"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "编辑按钮点击事件绑定:@click=\"handleJumpToProject(item)\"(ProjectManager.vue 行172)"
      },
      {
        "id": "2",
        "name": "handleJumpToProject方法实现路径:行464-475"
      },
      {
        "id": "3",
        "name": "recordVisited方法仅在在线模式调用,用于记录项目最后访问时间"
      },
      {
        "id": "4",
        "name": "Vue Router使用hash模式,兼容Electron的app://协议"
      },
      {
        "id": "5",
        "name": "项目工作区路由定义:{ path: \"/v1/apidoc/doc-edit\", name: \"DocEdit\", component: docEdit }"
      },
      {
        "id": "6",
        "name": "Tab高亮逻辑在Header.vue中通过watch监听$route实现"
      }
    ]
  },
  {
    "purpose": "点击修改按钮,弹出修改名称弹窗,并且输入框选中对应项目名称",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动,处于/home首页"
      },
      {
        "id": "2",
        "name": "项目列表已加载,至少显示一个项目卡片"
      },
      {
        "id": "3",
        "name": "EditProject.vue组件已注册并可用"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "定位到任意一个项目卡片"
      },
      {
        "id": "2",
        "name": "找到项目名称右侧的修改图标(EditIcon)"
      },
      {
        "id": "3",
        "name": "点击修改图标"
      },
      {
        "id": "4",
        "name": "观察编辑项目弹窗是否弹出"
      },
      {
        "id": "5",
        "name": "检查弹窗中输入框的内容和焦点状态"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "编辑项目弹窗(el-dialog)立即弹出显示"
      },
      {
        "id": "2",
        "name": "弹窗标题显示为\"编辑项目\"或\"修改项目名称\""
      },
      {
        "id": "3",
        "name": "输入框自动获得焦点(input.focus()被调用)"
      },
      {
        "id": "4",
        "name": "输入框中的项目名称文本全部被选中(input.select()被调用)"
      },
      {
        "id": "5",
        "name": "输入框显示的内容与点击的项目名称一致"
      },
      {
        "id": "6",
        "name": "弹窗底部显示\"取消\"和\"确定\"两个按钮"
      },
      {
        "id": "7",
        "name": "用户可以直接输入新名称覆盖选中的文本"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleOpenEditDialog方法被正确调用(ProjectManager.vue 行332-336)"
      },
      {
        "id": "2",
        "name": "currentEditProjectId.value设置为被点击项目的_id"
      },
      {
        "id": "3",
        "name": "currentEditProjectName.value设置为被点击项目的projectName"
      },
      {
        "id": "4",
        "name": "dialogVisible2.value设置为true,触发弹窗显示"
      },
      {
        "id": "5",
        "name": "EditProject组件接收props:{ modelValue: true, projectId, projectName, isFocus: true }"
      },
      {
        "id": "6",
        "name": "EditProject.vue的handleDialogOpened方法在弹窗打开后被触发(行51-61)"
      },
      {
        "id": "7",
        "name": "nextTick后通过$el.querySelector(\"input\")获取原生input元素"
      },
      {
        "id": "8",
        "name": "inputEl.focus()调用,输入框获得焦点"
      },
      {
        "id": "9",
        "name": "inputEl.select()调用,全选输入框文本"
      },
      {
        "id": "10",
        "name": "formInfo.value.projectName初始值等于传入的projectName prop"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "修改图标点击事件:@click=\"handleOpenEditDialog(item)\"(ProjectManager.vue 行129)"
      },
      {
        "id": "2",
        "name": "EditProject组件路径:pages/home/dialog/editProject/EditProject.vue(行1-119)"
      },
      {
        "id": "3",
        "name": "自动聚焦实现依赖于el-dialog的@opened事件触发handleDialogOpened方法"
      },
      {
        "id": "4",
        "name": "isFocus prop默认为true,可以控制是否自动聚焦和选中"
      },
      {
        "id": "5",
        "name": "选中文本的作用是方便用户直接输入新名称,无需手动删除旧名称"
      }
    ]
  },
  {
    "purpose": "点击修改按钮,弹出修改名称弹窗,并且输入框选中对应项目名称,点击确认后项目列表卡片名称更新为最新,顶部导航栏项目名称更新为最新",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动,处于/home首页"
      },
      {
        "id": "2",
        "name": "项目列表已加载,存在至少一个项目"
      },
      {
        "id": "3",
        "name": "该项目已在顶部导航栏打开(Header.vue中存在对应Tab)"
      },
      {
        "id": "4",
        "name": "EditProject.vue弹窗已打开,输入框已选中项目名称"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在编辑项目弹窗的输入框中输入新的项目名称(例如:\"新项目名称\")"
      },
      {
        "id": "2",
        "name": "验证输入框内容已更新为新名称"
      },
      {
        "id": "3",
        "name": "点击弹窗底部的\"确定\"按钮"
      },
      {
        "id": "4",
        "name": "等待表单验证和API/缓存更新完成"
      },
      {
        "id": "5",
        "name": "观察弹窗是否关闭"
      },
      {
        "id": "6",
        "name": "检查项目列表中对应卡片的项目名称是否更新"
      },
      {
        "id": "7",
        "name": "检查顶部导航栏中对应Tab的项目名称是否更新"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击确定后,表单验证通过(项目名称非空且非纯空格)"
      },
      {
        "id": "2",
        "name": "弹窗立即关闭,dialogVisible2.value设置为false"
      },
      {
        "id": "3",
        "name": "项目列表自动刷新,调用getProjectList()方法"
      },
      {
        "id": "4",
        "name": "对应项目卡片的.project-name元素显示的文本更新为新名称"
      },
      {
        "id": "5",
        "name": "顶部导航栏接收IPC事件apiflow.contentToTopBar.projectRenamed"
      },
      {
        "id": "6",
        "name": "顶部导航栏中对应Tab的显示名称更新为新名称"
      },
      {
        "id": "7",
        "name": "IndexedDB(离线模式)或服务器数据库(在线模式)中的项目名称已持久化"
      },
      {
        "id": "8",
        "name": "修改成功后显示成功提示消息(ElMessage.success)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "EditProject.vue的handleEditProject方法被调用(行88-117)"
      },
      {
        "id": "2",
        "name": "formRef.value.validate()表单验证通过"
      },
      {
        "id": "3",
        "name": "projectManagerStore.updateProject(projectId, projectName)被调用"
      },
      {
        "id": "4",
        "name": "离线模式:projectCache.updateProject(projectId, { projectName })更新IndexedDB"
      },
      {
        "id": "5",
        "name": "在线模式:request.put(\"/api/project/edit_project\", params)调用API"
      },
      {
        "id": "6",
        "name": "emit(\"success\", { id: projectId, name: projectName })触发成功事件"
      },
      {
        "id": "7",
        "name": "ProjectManager.vue的handleEditSuccess方法被调用(行493-501)"
      },
      {
        "id": "8",
        "name": "getProjectList()方法被调用,重新加载项目列表"
      },
      {
        "id": "9",
        "name": "window.electronAPI.ipcManager.sendToMain发送projectRenamed事件(行496-500)"
      },
      {
        "id": "10",
        "name": "IPC payload:{ projectId: data.id, projectName: data.name }"
      },
      {
        "id": "11",
        "name": "Header.vue接收IPC事件并更新对应Tab的name属性"
      },
      {
        "id": "12",
        "name": "projectList computed属性重新计算,卡片名称响应式更新"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "表单验证规则:required + 自定义validator检查空格(EditProject.vue 行62-76)"
      },
      {
        "id": "2",
        "name": "projectManagerStore.updateProject返回boolean,表示更新是否成功"
      },
      {
        "id": "3",
        "name": "IPC事件定义:IPC_EVENTS.apiflow.contentToTopBar.projectRenamed"
      },
      {
        "id": "4",
        "name": "IPC通信路径:Renderer -> Main Process -> TopBar View(Header.vue)"
      },
      {
        "id": "5",
        "name": "IndexedDB更新使用合并策略:{ ...existingProject, ...project }(projectCache.ts 行94-107)"
      },
      {
        "id": "6",
        "name": "成功后emit传递的data对象:{ id, name }用于IPC通信和列表刷新"
      }
    ]
  },
  {
    "purpose": "未收藏项目,点击收藏图标,图标变为已收藏图标,并且在收藏的项目中展示被收藏项目",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动,处于/home首页"
      },
      {
        "id": "2",
        "name": "项目列表已加载,\"全部项目\"区域显示至少一个未收藏的项目"
      },
      {
        "id": "3",
        "name": "该项目的isStared属性为false"
      },
      {
        "id": "4",
        "name": "starLoading.value为false(无其他收藏操作进行中)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在\"全部项目\"区域定位到一个未收藏的项目卡片"
      },
      {
        "id": "2",
        "name": "找到该卡片上的收藏图标(空心星星Star图标)"
      },
      {
        "id": "3",
        "name": "点击空心星星图标"
      },
      {
        "id": "4",
        "name": "等待收藏操作完成(starLoading状态变化)"
      },
      {
        "id": "5",
        "name": "观察该项目卡片的收藏图标变化"
      },
      {
        "id": "6",
        "name": "滚动页面到顶部,检查\"收藏的项目\"区域是否显示"
      },
      {
        "id": "7",
        "name": "验证被收藏的项目是否出现在\"收藏的项目\"区域"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击后,收藏图标立即从空心星星(Star)变为实心星星(StarFilled)"
      },
      {
        "id": "2",
        "name": "图标颜色变为主题色(theme-color类)"
      },
      {
        "id": "3",
        "name": "如果\"收藏的项目\"区域之前不存在(v-show=\"starProjects.length > 0\"为false),现在显示出来"
      },
      {
        "id": "4",
        "name": "\"收藏的项目\"标题区域正确渲染"
      },
      {
        "id": "5",
        "name": "被收藏的项目卡片出现在\"收藏的项目\"区域,内容与原卡片一致"
      },
      {
        "id": "6",
        "name": "被收藏的项目在\"全部项目\"区域仍然存在,但图标变为实心星星"
      },
      {
        "id": "7",
        "name": "项目的isStared属性已更新为true"
      },
      {
        "id": "8",
        "name": "starProjectIds数组包含该项目的_id"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleStar方法被正确调用(ProjectManager.vue 行432-444)"
      },
      {
        "id": "2",
        "name": "starLoading.value设置为true,防止重复点击"
      },
      {
        "id": "3",
        "name": "projectManagerStore.starProject(item._id)被调用"
      },
      {
        "id": "4",
        "name": "离线模式:直接修改projectList数组中对应项目的isStared属性为true"
      },
      {
        "id": "5",
        "name": "在线模式:request.put(\"/api/project/star\", { projectId })调用API"
      },
      {
        "id": "6",
        "name": "starProject方法返回true,表示收藏成功"
      },
      {
        "id": "7",
        "name": "starLoading.value设置回false,解除防抖"
      },
      {
        "id": "8",
        "name": "watch监听projectManagerStore.projectList变化,更新starProjectIds数组(行238-241)"
      },
      {
        "id": "9",
        "name": "starProjects computed属性重新计算,包含新收藏的项目(行300-313)"
      },
      {
        "id": "10",
        "name": "\"收藏的项目\"区域v-show条件满足,显示标题和卡片列表"
      },
      {
        "id": "11",
        "name": "收藏图标条件渲染:v-if=\"!item.isStared\"变为false,v-else分支渲染StarFilled图标"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "收藏图标点击事件:@click=\"handleStar(item)\"(ProjectManager.vue 行135-150)"
      },
      {
        "id": "2",
        "name": "projectManagerStore.starProject方法路径:行186-208"
      },
      {
        "id": "3",
        "name": "防抖机制:通过starLoading状态防止用户快速重复点击"
      },
      {
        "id": "4",
        "name": "\"收藏的项目\"区域在页面顶部,\"全部项目\"区域在下方"
      },
      {
        "id": "5",
        "name": "starProjects computed过滤逻辑:projectList.filter(val => val.isStared)"
      },
      {
        "id": "6",
        "name": "在线模式下,收藏状态会同步到服务器并持久化到MongoDB"
      }
    ]
  },
  {
    "purpose": "如果不存在收藏的项目,不展示收藏的项目标题",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动,处于/home首页"
      },
      {
        "id": "2",
        "name": "项目列表已加载"
      },
      {
        "id": "3",
        "name": "所有项目的isStared属性均为false"
      },
      {
        "id": "4",
        "name": "starProjects computed返回空数组(length为0)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "观察首页项目列表区域的布局结构"
      },
      {
        "id": "2",
        "name": "检查页面顶部是否存在\"收藏的项目\"标题"
      },
      {
        "id": "3",
        "name": "检查页面是否直接显示\"全部项目\"区域"
      },
      {
        "id": "4",
        "name": "验证DOM中是否渲染了.star-projects-wrap元素"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "\"收藏的项目\"标题及整个区域不显示"
      },
      {
        "id": "2",
        "name": ".star-projects-wrap元素的v-show条件为false,元素存在但display: none"
      },
      {
        "id": "3",
        "name": "页面顶部直接显示搜索框和新建项目按钮"
      },
      {
        "id": "4",
        "name": "\"全部项目\"标题和卡片列表正常显示"
      },
      {
        "id": "5",
        "name": "页面布局紧凑,没有为隐藏的\"收藏的项目\"区域保留空白空间"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "starProjects computed属性返回空数组(ProjectManager.vue 行300-313)"
      },
      {
        "id": "2",
        "name": "starProjects computed过滤条件:projectList.filter(val => val.isStared)结果为空"
      },
      {
        "id": "3",
        "name": "\"收藏的项目\"容器v-show=\"starProjects.length > 0\"计算为false(行40-42)"
      },
      {
        "id": "4",
        "name": "Vue的v-show指令将.star-projects-wrap元素设置为display: none"
      },
      {
        "id": "5",
        "name": "DOM中仍存在该元素节点,但不可见也不占据布局空间"
      },
      {
        "id": "6",
        "name": "\"全部项目\"区域正常渲染,不受\"收藏的项目\"隐藏影响"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "\"收藏的项目\"区域条件渲染:v-show=\"starProjects.length > 0\"(ProjectManager.vue 行40-42)"
      },
      {
        "id": "2",
        "name": "使用v-show而非v-if,元素始终存在于DOM中,仅切换display属性"
      },
      {
        "id": "3",
        "name": "当用户收藏第一个项目时,该区域会立即显示出来"
      },
      {
        "id": "4",
        "name": "starProjects computed属性具有响应式,会自动响应isStared属性变化"
      }
    ]
  },
  {
    "purpose": "收藏的项目,点击收藏图标,图标变为未收藏图标,并且从收藏的项目中移除",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动,处于/home首页"
      },
      {
        "id": "2",
        "name": "项目列表已加载,至少存在一个已收藏的项目"
      },
      {
        "id": "3",
        "name": "\"收藏的项目\"区域已显示,包含至少一个项目卡片"
      },
      {
        "id": "4",
        "name": "目标项目的isStared属性为true"
      },
      {
        "id": "5",
        "name": "unStarLoading.value为false(无其他取消收藏操作进行中)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在\"收藏的项目\"区域或\"全部项目\"区域定位到一个已收藏的项目卡片"
      },
      {
        "id": "2",
        "name": "找到该卡片上的收藏图标(实心星星StarFilled图标)"
      },
      {
        "id": "3",
        "name": "点击实心星星图标"
      },
      {
        "id": "4",
        "name": "等待取消收藏操作完成(unStarLoading状态变化)"
      },
      {
        "id": "5",
        "name": "观察该项目卡片的收藏图标变化"
      },
      {
        "id": "6",
        "name": "滚动页面到顶部,检查\"收藏的项目\"区域的变化"
      },
      {
        "id": "7",
        "name": "验证项目是否从\"收藏的项目\"区域移除"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击后,收藏图标立即从实心星星(StarFilled)变为空心星星(Star)"
      },
      {
        "id": "2",
        "name": "图标颜色恢复为默认颜色(不再是theme-color)"
      },
      {
        "id": "3",
        "name": "该项目卡片从\"收藏的项目\"区域立即消失"
      },
      {
        "id": "4",
        "name": "如果这是最后一个收藏的项目,\"收藏的项目\"整个区域隐藏(v-show变为false)"
      },
      {
        "id": "5",
        "name": "该项目在\"全部项目\"区域仍然存在,图标变为空心星星"
      },
      {
        "id": "6",
        "name": "项目的isStared属性已更新为false"
      },
      {
        "id": "7",
        "name": "starProjectIds数组不再包含该项目的_id"
      },
      {
        "id": "8",
        "name": "starProjects computed属性不再包含该项目"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleUnStar方法被正确调用(ProjectManager.vue 行446-458)"
      },
      {
        "id": "2",
        "name": "unStarLoading.value设置为true,防止重复点击"
      },
      {
        "id": "3",
        "name": "projectManagerStore.unstarProject(item._id)被调用"
      },
      {
        "id": "4",
        "name": "离线模式:直接修改projectList数组中对应项目的isStared属性为false"
      },
      {
        "id": "5",
        "name": "在线模式:request.put(\"/api/project/unstar\", { projectId })调用API"
      },
      {
        "id": "6",
        "name": "unstarProject方法返回true,表示取消收藏成功"
      },
      {
        "id": "7",
        "name": "unStarLoading.value设置回false,解除防抖"
      },
      {
        "id": "8",
        "name": "watch监听projectManagerStore.projectList变化,更新starProjectIds数组(行238-241)"
      },
      {
        "id": "9",
        "name": "starProjectIds数组filter移除该项目_id"
      },
      {
        "id": "10",
        "name": "starProjects computed属性重新计算,不再包含该项目(行300-313)"
      },
      {
        "id": "11",
        "name": "\"收藏的项目\"区域v-show条件根据starProjects.length重新评估"
      },
      {
        "id": "12",
        "name": "收藏图标条件渲染:v-if=\"!item.isStared\"变为true,渲染Star图标"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "取消收藏图标点击事件:@click=\"handleUnStar(item)\"(ProjectManager.vue 行60-75, 135-150)"
      },
      {
        "id": "2",
        "name": "data-testid区分:\"收藏的项目\"区域为home-star-project-unstar-btn,\"全部项目\"区域为home-project-unstar-btn"
      },
      {
        "id": "3",
        "name": "projectManagerStore.unstarProject方法路径:行210-232"
      },
      {
        "id": "4",
        "name": "防抖机制:通过unStarLoading状态防止用户快速重复点击"
      },
      {
        "id": "5",
        "name": "取消收藏后,如果starProjects为空,\"收藏的项目\"区域自动隐藏"
      },
      {
        "id": "6",
        "name": "在线模式下,取消收藏状态会同步到服务器并持久化"
      }
    ]
  },
  {
    "purpose": "点击删除项目图标,提示用户是否删除,确认后删除项目,在左下角出现撤回倒计时,在倒计时时间内允许用户撤回删除的项目",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动,处于/home首页"
      },
      {
        "id": "2",
        "name": "应用处于离线模式(isStandalone为true),在线模式无撤回功能"
      },
      {
        "id": "3",
        "name": "项目列表已加载,至少存在一个项目"
      },
      {
        "id": "4",
        "name": "UndoNotification组件已注册并可用"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "定位到任意一个项目卡片"
      },
      {
        "id": "2",
        "name": "点击项目卡片右上角的删除图标(DeleteIcon,data-testid=\"home-project-delete-btn\")"
      },
      {
        "id": "3",
        "name": "观察是否弹出删除确认对话框(ElMessageBox.confirm)"
      },
      {
        "id": "4",
        "name": "阅读确认对话框提示信息:\"此操作将删除该项目,是否继续？\""
      },
      {
        "id": "5",
        "name": "点击确认对话框的\"确定\"按钮"
      },
      {
        "id": "6",
        "name": "等待删除操作完成"
      },
      {
        "id": "7",
        "name": "观察项目列表是否移除该项目卡片"
      },
      {
        "id": "8",
        "name": "观察页面左下角是否出现撤回通知组件"
      },
      {
        "id": "9",
        "name": "检查撤回通知的提示消息和倒计时进度条"
      },
      {
        "id": "10",
        "name": "在60秒倒计时结束前,点击\"撤回\"按钮"
      },
      {
        "id": "11",
        "name": "观察项目列表是否恢复被删除的项目"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击删除图标后,立即弹出ElMessageBox确认对话框"
      },
      {
        "id": "2",
        "name": "对话框标题为\"提示\",内容为\"此操作将删除该项目,是否继续？\""
      },
      {
        "id": "3",
        "name": "对话框显示\"取消\"和\"确定\"两个按钮"
      },
      {
        "id": "4",
        "name": "点击确定后,该项目卡片从项目列表中消失"
      },
      {
        "id": "5",
        "name": "页面左下角(bottom: 24px, left: 24px)显示UndoNotification撤回通知组件"
      },
      {
        "id": "6",
        "name": "撤回通知消息为:\"项目已删除\""
      },
      {
        "id": "7",
        "name": "通知组件显示60秒倒计时进度条,进度逐渐减少"
      },
      {
        "id": "8",
        "name": "通知组件包含\"撤回\"按钮和关闭图标"
      },
      {
        "id": "9",
        "name": "点击\"撤回\"按钮后,通知组件立即消失"
      },
      {
        "id": "10",
        "name": "被删除的项目重新出现在项目列表中,位置和内容与删除前一致"
      },
      {
        "id": "11",
        "name": "项目的所有节点数据(httpNode,websocketNode等)也被恢复"
      },
      {
        "id": "12",
        "name": "顶部导航栏如果有该项目的Tab,不受影响(删除时未关闭Tab)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "deleteProject方法被调用,传入项目_id(ProjectManager.vue 行343-396)"
      },
      {
        "id": "2",
        "name": "ElMessageBox.confirm弹出确认对话框(行344-348)"
      },
      {
        "id": "3",
        "name": "用户点击确定后,进入then分支的离线模式逻辑(行359-385)"
      },
      {
        "id": "4",
        "name": "projectManagerStore.deleteProject(_id)被调用,返回备份数据backupData"
      },
      {
        "id": "5",
        "name": "backupData结构:{ project: ApidocProjectInfo, apiNodes: ApiNode[] }"
      },
      {
        "id": "6",
        "name": "deletedProjectData.value保存备份数据"
      },
      {
        "id": "7",
        "name": "showUndoNotification.value设置为true,显示撤回通知"
      },
      {
        "id": "8",
        "name": "undoMessage.value设置为\"项目已删除\""
      },
      {
        "id": "9",
        "name": "deleteTimer = setTimeout(清理函数, 60000)启动60秒计时器"
      },
      {
        "id": "10",
        "name": "httpMockLogsCache.clearLogsByProjectId(_id)清理Mock日志(仅计时器超时时)"
      },
      {
        "id": "11",
        "name": "UndoNotification组件接收props:{ message, duration: 60000, showProgress: true }"
      },
      {
        "id": "12",
        "name": "用户点击撤回触发handleUndoDelete方法(行398-413)"
      },
      {
        "id": "13",
        "name": "clearTimeout(deleteTimer)清除计时器,防止永久删除"
      },
      {
        "id": "14",
        "name": "projectManagerStore.restoreProjectFromBackup(deletedProjectData.value)恢复数据"
      },
      {
        "id": "15",
        "name": "restoreProjectFromBackup方法遍历恢复project和所有apiNodes(projectManagerStore.ts 行99-123)"
      },
      {
        "id": "16",
        "name": "projectCache.updateProject或addProject恢复项目数据"
      },
      {
        "id": "17",
        "name": "apiNodesCache.addNode逐个恢复节点数据"
      },
      {
        "id": "18",
        "name": "showUndoNotification.value设置为false,隐藏通知"
      },
      {
        "id": "19",
        "name": "deletedProjectData.value清空"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "删除图标点击事件:@click=\"deleteProject(item._id)\"(ProjectManager.vue 行155)"
      },
      {
        "id": "2",
        "name": "撤回功能仅在离线模式可用,在线模式删除后立即永久删除"
      },
      {
        "id": "3",
        "name": "UndoNotification组件路径:components/common/undoNotification/UndoNotification.vue(行1-186)"
      },
      {
        "id": "4",
        "name": "60秒倒计时使用setTimeout实现,超时后调用clearLogsByProjectId清理Mock日志"
      },
      {
        "id": "5",
        "name": "备份数据结构包含完整的project和apiNodes数组,支持完整恢复"
      },
      {
        "id": "6",
        "name": "删除是软删除,设置isDeleted=true,deletedAt=timestamp(projectCache.ts 行108-122)"
      },
      {
        "id": "7",
        "name": "IPC通知:删除后发送projectDeleted事件到顶部导航栏"
      },
      {
        "id": "8",
        "name": "如果用户点击通知的关闭图标而非撤回按钮,触发handleCloseUndo方法(行415-430)"
      }
    ]
  },
  {
    "purpose": "接口数量需要正确展示,项目中如果有5个httpNode节点,5个websocketNode节点,5个httpMockNode节点,5个websocketMockNode节点,5个folder节点,则项目中接口总数展示为20个",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动,处于离线模式"
      },
      {
        "id": "2",
        "name": "存在一个测试项目,包含以下节点:"
      },
      {
        "id": "3",
        "name": "- 5个type=\"http\"的httpNode节点(未删除)"
      },
      {
        "id": "4",
        "name": "- 5个type=\"websocket\"的websocketNode节点(未删除)"
      },
      {
        "id": "5",
        "name": "- 5个type=\"httpMock\"的httpMockNode节点(未删除)"
      },
      {
        "id": "6",
        "name": "- 5个type=\"websocketMock\"的websocketMockNode节点(未删除)"
      },
      {
        "id": "7",
        "name": "- 5个type=\"folder\"的folder节点(未删除)"
      },
      {
        "id": "8",
        "name": "所有节点的info.isDeleted属性均为false"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "使用apiNodesCache.addNode方法创建测试数据:5个httpNode,5个websocketNode,5个httpMockNode,5个websocketMockNode,5个folder"
      },
      {
        "id": "2",
        "name": "确保所有节点的projectId指向同一个测试项目"
      },
      {
        "id": "3",
        "name": "确保所有节点的info.isDeleted为false"
      },
      {
        "id": "4",
        "name": "调用apiNodesCache.updateProjectNodeNum(projectId)手动触发接口数量更新"
      },
      {
        "id": "5",
        "name": "导航到/home首页"
      },
      {
        "id": "6",
        "name": "找到对应的项目卡片"
      },
      {
        "id": "7",
        "name": "查看项目卡片上显示的\"接口总数\"数字"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "项目卡片显示\"接口总数: 20\""
      },
      {
        "id": "2",
        "name": "folder节点(5个)不计入接口总数"
      },
      {
        "id": "3",
        "name": "httpNode节点(5个)计入总数"
      },
      {
        "id": "4",
        "name": "websocketNode节点(5个)计入总数"
      },
      {
        "id": "5",
        "name": "httpMockNode节点(5个)计入总数"
      },
      {
        "id": "6",
        "name": "websocketMockNode节点(5个)计入总数"
      },
      {
        "id": "7",
        "name": "总数计算公式:5 + 5 + 5 + 5 = 20(不包括folder)"
      },
      {
        "id": "8",
        "name": "项目的docNum属性值为20"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "apiNodesCache.updateProjectNodeNum方法被调用(nodesCache.ts 行333-346)"
      },
      {
        "id": "2",
        "name": "updateProjectNodeNum内部调用getNodesByProjectId获取所有节点"
      },
      {
        "id": "3",
        "name": "过滤逻辑:docs.filter(doc => !doc.isDeleted && doc.info.type !== \"folder\")"
      },
      {
        "id": "4",
        "name": "folder类型节点被排除,不计入docNum"
      },
      {
        "id": "5",
        "name": "isDeleted为true的节点也被排除"
      },
      {
        "id": "6",
        "name": "docNum = filteredDocs.length计算结果为20"
      },
      {
        "id": "7",
        "name": "projectCache.updateProjectNodeNum(projectId, 20)更新项目的docNum字段"
      },
      {
        "id": "8",
        "name": "IndexedDB中的project对象的docNum字段更新为20"
      },
      {
        "id": "9",
        "name": "ProjectManager.vue中{{ item.docNum || 0 }}渲染显示为20(行169)"
      },
      {
        "id": "10",
        "name": "ApidocProjectInfo类型的docNum字段为number类型"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "接口数量计算逻辑:apiNodesCache.updateProjectNodeNum(projectId)(nodesCache.ts 行333-346)"
      },
      {
        "id": "2",
        "name": "统计规则:只统计非folder且未删除的节点"
      },
      {
        "id": "3",
        "name": "支持的节点类型:http,websocket,httpMock,websocketMock (folder不计入)"
      },
      {
        "id": "4",
        "name": "触发时机:添加节点,删除节点,恢复节点时自动调用updateProjectNodeNum"
      },
      {
        "id": "5",
        "name": "projectCache.updateProjectNodeNum方法路径:行184-197"
      },
      {
        "id": "6",
        "name": "docNum字段通过IndexedDB持久化存储,项目列表加载时直接读取"
      }
    ]
  }
],
}

export default node
