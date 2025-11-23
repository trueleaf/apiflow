// 原子功能（atomicFunc）里的一条用例
export interface AtomicFunc {
  purpose: string;
  precondition: { id: string; name: string }[];
  operationSteps: { id: string; name: string }[];
  expectedResults: { id: string; name: string }[];
  checkpoints: { id: string; name: string }[];
  notes: { id: string; name: string }[];
}

// 通用树节点
export interface ModelNode {
  modelName: string;
  description: string;
  children?: ModelNode[];
  atomicFunc?: AtomicFunc[];
}

// 整个模块的入口类型
export type TestCase = ModelNode[];

export const testCase: TestCase = [
  {
    modelName: 'httpNode',
    description: 'http请求节点',
    children: [],
  },
  {
    modelName: 'websocketNode',
    description: 'websocket请求节点',
    children: [],
  },
  {
    modelName: 'httpMockNode',
    description: 'http mock节点',
    children: [],
  },
  {
    modelName: 'websocketMockNode',
    description: 'websocket mock节点',
    children: [],
  },
  {
    modelName: 'projectManager',
    description: '项目管理器',
    children: [],
  },
  {
    modelName: 'appWorkbench',
    description: '应用工作区',
    children: [
      {
        modelName: 'logo',
        description: 'logo',
        children: [],
      },
      {
        modelName: 'home',
        description: '首页',
        children: [],
      },
      {
        modelName: 'nav',
        description: '导航',
        children: [],
      },
      {
        modelName: 'addProjectToggle',
        description: '添加项目开关',
        children: [],
      },
      {
        modelName: 'aiToggle',
        description: 'AI助手开关',
        children: [],
      },
      {
        modelName: 'refresh',
        description: '刷新',
        children: [],
      },
      {
        modelName: 'maximize',
        description: '最大化',
        children: [],
      },
      {
        modelName: 'minimize',
        description: '最小化',
        children: [],
      },
      {
        modelName: 'settingsToggle',
        description: '设置开关',
        children: [],
      },
      {
        modelName: 'networkToggle',
        description: '网络开关',
        children: [],
      },
      {
        modelName: 'languageToggle',
        description: '语言切换开关',
        children: [],
      },
    ],
  },
  {
    modelName: 'projectAddon',
    description: '项目辅助功能',
    children: [
      {
        modelName: 'import',
        description: '导入项目',
        children: [],
      },
      {
        modelName: 'export',
        description: '导出项目',
        children: [],
      },
      {
        modelName: 'variable',
        description: '变量管理',
        children: [],
      },
      {
        modelName: 'commonHeader',
        description: '公共请求头',
        children: [],
      },
      {
        modelName: 'trash',
        description: '接口回收站',
        children: [],
      },
      {
        modelName: 'cookieManagement',
        description: 'cookie管理',
        children: [],
      },
    ],
  },
  {
    modelName: 'projectWorkbench',
    description: '项目工作区',
    children: [
      {
        modelName: 'banner',
        description: '项目工作区banner导航',
        children: [
          {
            modelName: 'search',
            description: '搜索',
            atomicFunc: [
              {
                purpose: '搜索框默认UI样式验证，placeholder内容、筛选图标、focus后边框高亮、输入内容后出现清空按钮',
                precondition: [
                  { id: '1', name: '项目已打开，Banner区域正常展示' },
                  { id: '2', name: '搜索框处于默认未聚焦状态' },
                ],
                operationSteps: [
                  { id: '1', name: '观察搜索框默认状态' },
                  { id: '2', name: '点击搜索框使其获得焦点' },
                  { id: '3', name: '在搜索框中输入任意内容' },
                  { id: '4', name: '观察搜索框右侧区域' },
                ],
                expectedResults: [
                  { id: '1', name: 'placeholder显示"文档名称、文档url"' },
                  { id: '2', name: '搜索框右侧显示高级筛选图标(icongaojishaixuan)' },
                  { id: '3', name: 'focus后边框高亮显示' },
                  { id: '4', name: '输入内容后出现清空按钮(clearable属性)' },
                ],
                checkpoints: [
                  { id: '1', name: 'el-input组件clearable属性生效' },
                  { id: '2', name: '高级筛选图标正确显示且可点击' },
                  { id: '3', name: 'focus样式正确应用' },
                ],
                notes: [
                  { id: '1', name: '搜索框组件位置: src/renderer/pages/projectWorkbench/layout/banner/tool/Tool.vue:34' },
                  { id: '2', name: '高级筛选图标: src/renderer/pages/projectWorkbench/layout/banner/tool/Tool.vue:39-41' },
                ],
              },
              {
                purpose: '搜索框默认UI样式验证，placeholder内容、筛选图标、focus后边框高亮',
                precondition: [
                  { id: '1', name: '项目已打开，Banner区域正常展示' },
                ],
                operationSteps: [
                  { id: '1', name: '查看搜索框默认placeholder文本' },
                  { id: '2', name: '检查高级筛选图标是否显示' },
                  { id: '3', name: '点击搜索框观察边框变化' },
                ],
                expectedResults: [
                  { id: '1', name: 'placeholder为"文档名称、文档url"' },
                  { id: '2', name: '高级筛选图标显示在搜索框右侧' },
                  { id: '3', name: 'focus时边框颜色高亮' },
                ],
                checkpoints: [
                  { id: '1', name: 'i18n翻译key正确' },
                  { id: '2', name: 'CSS样式正确应用' },
                ],
                notes: [
                  { id: '1', name: '组件路径: src/renderer/pages/projectWorkbench/layout/banner/tool/Tool.vue:34' },
                ],
              },
              {
                purpose: '搜索框输入内容后，可以匹配接口的url和名称，需要验证搜索算法对不对',
                precondition: [
                  { id: '1', name: '项目中存在多个接口节点' },
                  { id: '2', name: '接口节点包含不同的name和url' },
                ],
                operationSteps: [
                  { id: '1', name: '在搜索框输入接口名称的部分字符' },
                  { id: '2', name: '观察树节点过滤结果' },
                  { id: '3', name: '清空搜索框，输入url的部分字符' },
                  { id: '4', name: '观察树节点过滤结果' },
                ],
                expectedResults: [
                  { id: '1', name: '输入名称时，匹配到包含该字符的节点' },
                  { id: '2', name: '输入url时，匹配到url包含该字符的http/websocket节点' },
                  { id: '3', name: '不匹配的节点被过滤隐藏' },
                  { id: '4', name: '大小写不敏感匹配（使用match方法）' },
                ],
                checkpoints: [
                  { id: '1', name: 'filterNode方法正确匹配name和url' },
                  { id: '2', name: 'http节点匹配bannerData.url' },
                  { id: '3', name: 'websocket节点匹配bannerData.url.path' },
                ],
                notes: [
                  { id: '1', name: '过滤逻辑: src/renderer/pages/projectWorkbench/layout/banner/Banner.vue:579-600' },
                  { id: '2', name: 'matchedUrl判断http和websocket类型: Banner.vue:589-595' },
                  { id: '3', name: 'matchedDocName匹配节点名称: Banner.vue:596' },
                ],
              },
              {
                purpose: '搜索框输入内容后，若无搜索结果，需要正确展示无搜索结果提示',
                precondition: [
                  { id: '1', name: '项目中存在多个接口节点' },
                ],
                operationSteps: [
                  { id: '1', name: '在搜索框输入一个不存在的字符串（如随机UUID）' },
                  { id: '2', name: '观察Banner树区域显示' },
                ],
                expectedResults: [
                  { id: '1', name: '所有节点被过滤，树区域为空' },
                  { id: '2', name: '显示无搜索结果的提示信息' },
                ],
                checkpoints: [
                  { id: '1', name: 'filterNode返回false时节点隐藏' },
                  { id: '2', name: '空状态UI正确显示' },
                ],
                notes: [
                  { id: '1', name: '过滤方法: src/renderer/pages/projectWorkbench/layout/banner/Banner.vue:579-600' },
                ],
              },
              {
                purpose: '搜索框输入内容后,如果存在节点名称匹配，需要在节点名称中高亮关键字，如果存在节点url匹配，需要在url中高亮关键字,匹配中的节点如果存在父元素，则递归展示所有父元素',
                precondition: [
                  { id: '1', name: '项目中存在多级目录结构' },
                  { id: '2', name: '存在子节点的接口' },
                ],
                operationSteps: [
                  { id: '1', name: '输入搜索关键字匹配某个子节点的名称' },
                  { id: '2', name: '观察匹配节点的名称显示' },
                  { id: '3', name: '观察匹配节点的父目录是否展开' },
                  { id: '4', name: '输入url关键字观察url高亮' },
                ],
                expectedResults: [
                  { id: '1', name: '匹配的节点名称中关键字高亮显示' },
                  { id: '2', name: '匹配的url中关键字高亮显示' },
                  { id: '3', name: '匹配节点的所有父元素自动展开显示' },
                  { id: '4', name: 'showMoreNodeInfo设置为true显示更多信息' },
                ],
                checkpoints: [
                  { id: '1', name: 'ClEmphasize组件正确高亮关键字' },
                  { id: '2', name: '父节点expanded属性正确设置' },
                  { id: '3', name: 'showMoreNodeInfo状态正确切换' },
                ],
                notes: [
                  { id: '1', name: '高亮组件: src/renderer/components/common/emphasize/ClEmphasize.vue' },
                  { id: '2', name: '过滤时设置showMoreNodeInfo: Banner.vue:598' },
                  { id: '3', name: '组件引入: Banner.vue:213' },
                ],
              },
              {
                purpose: '离线模式不展示高级筛选',
                precondition: [
                  { id: '1', name: '应用处于离线模式（networkMode === "offline"）' },
                ],
                operationSteps: [
                  { id: '1', name: '切换应用到离线模式' },
                  { id: '2', name: '打开项目进入工作区' },
                  { id: '3', name: '观察搜索框右侧区域' },
                ],
                expectedResults: [
                  { id: '1', name: '高级筛选图标不显示' },
                  { id: '2', name: '只显示基本搜索功能' },
                ],
                checkpoints: [
                  { id: '1', name: 'isStandalone计算属性正确判断离线模式' },
                  { id: '2', name: '高级筛选Popover条件渲染' },
                ],
                notes: [
                  { id: '1', name: '离线模式判断: src/renderer/pages/projectWorkbench/layout/banner/tool/Tool.vue:212' },
                  { id: '2', name: '高级筛选面板: Tool.vue:36-88' },
                ],
              },
            ],
          },
          {
            modelName: 'projectToggle',
            description: '项目切换',
            atomicFunc: [
              {
                purpose: '点击切换项目图标，弹出项目切换面板，点击项目名称可以切换项目，切换项目后顶部header区域需要添加一个切换项目的tab',
                precondition: [
                  { id: '1', name: '用户已登录且有多个项目' },
                  { id: '2', name: '当前已打开一个项目' },
                ],
                operationSteps: [
                  { id: '1', name: '点击项目名称旁边的切换按钮（Switch图标）' },
                  { id: '2', name: '观察弹出的项目切换面板' },
                  { id: '3', name: '在面板中点击另一个项目名称' },
                  { id: '4', name: '观察顶部header区域变化' },
                ],
                expectedResults: [
                  { id: '1', name: '切换面板正确弹出（el-popover placement="right"）' },
                  { id: '2', name: '面板显示收藏项目和项目列表两个区域' },
                  { id: '3', name: '点击项目后成功切换到目标项目' },
                  { id: '4', name: '顶部header区域新增项目tab' },
                  { id: '5', name: 'Banner区域更新为新项目的数据' },
                ],
                checkpoints: [
                  { id: '1', name: 'toggleProjectVisible状态正确切换' },
                  { id: '2', name: 'handleChangeProject方法正确执行' },
                  { id: '3', name: 'emit("changeProject")事件正确触发' },
                  { id: '4', name: '项目数据正确加载' },
                ],
                notes: [
                  { id: '1', name: '切换按钮: src/renderer/pages/projectWorkbench/layout/banner/tool/Tool.vue:9-13' },
                  { id: '2', name: '项目切换面板: Tool.vue:6-31' },
                  { id: '3', name: '收藏项目列表: Tool.vue:16-22' },
                  { id: '4', name: '项目列表: Tool.vue:23-29' },
                ],
              },
            ],
          },
          {
            modelName: 'tools',
            description: '工具栏',
            atomicFunc: [
              {
                purpose: '工具栏默认按顺序展示：新增目录、新增httpNode、刷新、折叠全部、回收站、导入文档、变量图标、更多操作',
                precondition: [
                  { id: '1', name: '首次打开项目或清除缓存后' },
                  { id: '2', name: '项目工作区正常加载' },
                ],
                operationSteps: [
                  { id: '1', name: '观察工具栏图标排列顺序' },
                  { id: '2', name: '悬停查看每个图标的title提示' },
                ],
                expectedResults: [
                  { id: '1', name: '图标按originOperations中pin为true的顺序排列' },
                  { id: '2', name: '每个图标title正确显示功能名称' },
                  { id: '3', name: '最右侧显示更多操作按钮（MoreFilled图标）' },
                ],
                checkpoints: [
                  { id: '1', name: 'pinOperations数组初始化正确' },
                  { id: '2', name: 'SDraggable组件正确渲染固定工具' },
                ],
                notes: [
                  { id: '1', name: '工具栏定义: src/renderer/pages/projectWorkbench/layout/banner/tool/operations.ts' },
                  { id: '2', name: '工具栏渲染: Tool.vue:91-111' },
                  { id: '3', name: '初始化缓存: Tool.vue:233-259' },
                ],
              },
              {
                purpose: '工具栏图标可以自由拖拽交换顺序，刷新页面后顺序保持不变',
                precondition: [
                  { id: '1', name: '工具栏有多个固定图标' },
                ],
                operationSteps: [
                  { id: '1', name: '拖拽某个工具图标到另一个位置' },
                  { id: '2', name: '释放鼠标完成拖拽' },
                  { id: '3', name: '刷新页面' },
                  { id: '4', name: '观察工具栏图标顺序' },
                ],
                expectedResults: [
                  { id: '1', name: '图标位置成功交换' },
                  { id: '2', name: '拖拽动画流畅（animation=150）' },
                  { id: '3', name: '刷新后顺序保持不变' },
                ],
                checkpoints: [
                  { id: '1', name: 'SDraggable正确处理拖拽' },
                  { id: '2', name: 'watch监听pinOperations变化并缓存' },
                  { id: '3', name: 'projectWorkbenchCache正确存储' },
                ],
                notes: [
                  { id: '1', name: '拖拽组件: Tool.vue:93使用vuedraggable' },
                  { id: '2', name: '缓存监听: Tool.vue:261-265' },
                  { id: '3', name: '缓存方法: projectWorkbenchCache.setProjectWorkbenchPinToolbarOperations' },
                ],
              },
              {
                purpose: '点击更多操作按钮展示更多操作，显示完整的工具列表，工具列表可以自由拖拽交换顺序，刷新页面后顺序保持不变',
                precondition: [
                  { id: '1', name: '工具栏正常显示' },
                ],
                operationSteps: [
                  { id: '1', name: '点击更多操作按钮（MoreFilled图标）' },
                  { id: '2', name: '观察弹出面板内容' },
                  { id: '3', name: '在面板中拖拽工具调整顺序' },
                  { id: '4', name: '刷新页面后再次打开面板' },
                ],
                expectedResults: [
                  { id: '1', name: '弹出宽度320px的面板' },
                  { id: '2', name: '显示所有工具列表包含名称、快捷键、固定按钮' },
                  { id: '3', name: '工具顺序成功调整' },
                  { id: '4', name: '刷新后顺序保持' },
                ],
                checkpoints: [
                  { id: '1', name: 'visible状态正确切换' },
                  { id: '2', name: 'operations数组正确渲染' },
                  { id: '3', name: '缓存持久化成功' },
                ],
                notes: [
                  { id: '1', name: '更多操作按钮: Tool.vue:115-119' },
                  { id: '2', name: '工具列表面板: Tool.vue:113-154' },
                  { id: '3', name: '面板样式: popper-class="tool-panel"' },
                ],
              },
              {
                purpose: '更多操作中的工具列表可以固定，点击固定后展示在工具栏，点击取消固定后从工具栏移除',
                precondition: [
                  { id: '1', name: '更多操作面板已打开' },
                ],
                operationSteps: [
                  { id: '1', name: '找到一个未固定的工具，点击其固定按钮（pin图标）' },
                  { id: '2', name: '观察工具栏变化' },
                  { id: '3', name: '再次点击该工具的固定按钮' },
                  { id: '4', name: '观察工具栏变化' },
                ],
                expectedResults: [
                  { id: '1', name: '点击固定后，工具图标出现在工具栏' },
                  { id: '2', name: '固定按钮显示active状态' },
                  { id: '3', name: '取消固定后，工具图标从工具栏移除' },
                  { id: '4', name: '固定按钮恢复默认状态' },
                ],
                checkpoints: [
                  { id: '1', name: 'togglePin方法正确切换pin状态' },
                  { id: '2', name: 'pinOperations正确过滤pin为true的工具' },
                ],
                notes: [
                  { id: '1', name: '固定按钮: Tool.vue:150' },
                  { id: '2', name: 'togglePin方法: Tool.vue:268-271' },
                ],
              },
              {
                purpose: '更多操作面板打开时候，点击关闭或者空白区域可以关闭面板',
                precondition: [
                  { id: '1', name: '更多操作面板已打开' },
                ],
                operationSteps: [
                  { id: '1', name: '点击面板右上角关闭按钮' },
                  { id: '2', name: '再次打开面板' },
                  { id: '3', name: '点击面板外部空白区域' },
                ],
                expectedResults: [
                  { id: '1', name: '点击关闭按钮后面板关闭' },
                  { id: '2', name: '点击空白区域后面板关闭' },
                ],
                checkpoints: [
                  { id: '1', name: 'visible设为false' },
                  { id: '2', name: 'handleHidePopover事件监听正确' },
                ],
                notes: [
                  { id: '1', name: '关闭按钮: Tool.vue:122-126' },
                  { id: '2', name: '全局点击隐藏: Tool.vue:273-276, 278' },
                ],
              },
              {
                purpose: '点击新增目录按钮，弹出目录新增面板，可以新增目录，新增目录后，新增目录面板关闭，新增目录展示在节点树中,位置排序在根目录下最后一个目录节点下方',
                precondition: [
                  { id: '1', name: '项目工作区正常加载' },
                  { id: '2', name: '用户有编辑权限' },
                ],
                operationSteps: [
                  { id: '1', name: '点击新增目录按钮' },
                  { id: '2', name: '在弹出面板中输入目录名称' },
                  { id: '3', name: '点击确认按钮' },
                  { id: '4', name: '观察节点树变化' },
                ],
                expectedResults: [
                  { id: '1', name: 'SAddFolderDialog弹出显示' },
                  { id: '2', name: '输入目录名称后可以提交' },
                  { id: '3', name: '提交成功后面板关闭' },
                  { id: '4', name: '新目录出现在根目录最后一个目录节点下方' },
                ],
                checkpoints: [
                  { id: '1', name: 'addFolderDialogVisible状态正确' },
                  { id: '2', name: 'handleAddFileAndFolderCb回调正确处理' },
                  { id: '3', name: '节点排序逻辑正确' },
                ],
                notes: [
                  { id: '1', name: '新增目录对话框: Tool.vue:159' },
                  { id: '2', name: 'op="addRootFolder"处理: Tool.vue:291-293' },
                  { id: '3', name: '回调处理: Tool.vue:217-219' },
                ],
              },
              {
                purpose: '点击新增接口按钮，弹出接口新增面板，可以新增接口，新增接口后，新增接口面板关闭，新增接口展示在节点树中,位置排序在根接最下方(需要在httpNode、websocketNode、httpMockNode、websocketMock下)',
                precondition: [
                  { id: '1', name: '项目工作区正常加载' },
                  { id: '2', name: '用户有编辑权限' },
                ],
                operationSteps: [
                  { id: '1', name: '点击新增接口按钮' },
                  { id: '2', name: '在弹出面板中选择接口类型并输入名称' },
                  { id: '3', name: '点击确认按钮' },
                  { id: '4', name: '观察节点树变化' },
                ],
                expectedResults: [
                  { id: '1', name: 'SAddFileDialog弹出显示' },
                  { id: '2', name: '可选择http/websocket/httpMock/websocketMock类型' },
                  { id: '3', name: '提交成功后面板关闭' },
                  { id: '4', name: '新接口出现在根目录最下方' },
                ],
                checkpoints: [
                  { id: '1', name: 'addFileDialogVisible状态正确' },
                  { id: '2', name: '接口类型选择正确' },
                  { id: '3', name: '节点排序在末尾' },
                ],
                notes: [
                  { id: '1', name: '新增文件对话框: Tool.vue:157-158' },
                  { id: '2', name: 'op="addRootFile"处理: Tool.vue:294-296' },
                ],
              },
              {
                purpose: '点击刷新按钮，刷新当前banner数据',
                precondition: [
                  { id: '1', name: '项目工作区正常加载' },
                ],
                operationSteps: [
                  { id: '1', name: '点击刷新按钮' },
                  { id: '2', name: '观察Banner区域变化' },
                ],
                expectedResults: [
                  { id: '1', name: 'Banner数据重新加载' },
                  { id: '2', name: '节点树刷新显示最新数据' },
                ],
                checkpoints: [
                  { id: '1', name: 'emit("fresh")事件触发' },
                  { id: '2', name: '数据请求成功' },
                ],
                notes: [
                  { id: '1', name: 'op="freshBanner"处理: Tool.vue:297-298' },
                ],
              },
              {
                purpose: '点击回收站图标，展示回收站页面',
                precondition: [
                  { id: '1', name: '项目工作区正常加载' },
                ],
                operationSteps: [
                  { id: '1', name: '点击回收站图标' },
                  { id: '2', name: '观察导航栏和内容区域变化' },
                ],
                expectedResults: [
                  { id: '1', name: '导航栏新增回收站tab' },
                  { id: '2', name: 'tab标签显示"回收站"' },
                  { id: '3', name: '内容区域显示回收站页面' },
                ],
                checkpoints: [
                  { id: '1', name: 'apidocTabsStore.addTab正确调用' },
                  { id: '2', name: 'tabType为"recycler"' },
                  { id: '3', name: 'tab为fixed和selected状态' },
                ],
                notes: [
                  { id: '1', name: 'op="recycler"处理: Tool.vue:345-359' },
                ],
              },
              {
                purpose: '点击导入文档图标，展示导入文档页面',
                precondition: [
                  { id: '1', name: '项目工作区正常加载' },
                  { id: '2', name: '用户有编辑权限' },
                ],
                operationSteps: [
                  { id: '1', name: '点击导入文档图标' },
                  { id: '2', name: '观察导航栏和内容区域变化' },
                ],
                expectedResults: [
                  { id: '1', name: '导航栏新增导入文档tab' },
                  { id: '2', name: 'tab标签显示"导入文档"' },
                  { id: '3', name: '内容区域显示导入文档页面' },
                ],
                checkpoints: [
                  { id: '1', name: 'tabType为"importDoc"' },
                  { id: '2', name: 'tab正确添加到导航栏' },
                ],
                notes: [
                  { id: '1', name: 'op="importDoc"处理: Tool.vue:330-344' },
                ],
              },
              {
                purpose: '点击导出文档图标，展示导出文档页面',
                precondition: [
                  { id: '1', name: '项目工作区正常加载' },
                ],
                operationSteps: [
                  { id: '1', name: '点击导出文档图标' },
                  { id: '2', name: '观察导航栏和内容区域变化' },
                ],
                expectedResults: [
                  { id: '1', name: '导航栏新增导出文档tab' },
                  { id: '2', name: 'tab标签显示"导出文档"' },
                  { id: '3', name: '内容区域显示导出文档页面' },
                ],
                checkpoints: [
                  { id: '1', name: 'tabType为"exportDoc"' },
                ],
                notes: [
                  { id: '1', name: 'op="exportDoc"处理: Tool.vue:315-329' },
                ],
              },
              {
                purpose: '点击Cookie图标，展示Cookie页面',
                precondition: [
                  { id: '1', name: '项目工作区正常加载' },
                ],
                operationSteps: [
                  { id: '1', name: '点击Cookie图标' },
                  { id: '2', name: '观察导航栏和内容区域变化' },
                ],
                expectedResults: [
                  { id: '1', name: '导航栏新增Cookie管理tab' },
                  { id: '2', name: '内容区域显示Cookie管理页面' },
                ],
                checkpoints: [
                  { id: '1', name: 'tabType为"cookie"' },
                ],
                notes: [
                  { id: '1', name: 'Cookie管理功能在operations.ts中定义' },
                ],
              },
              {
                purpose: '点击变量图标，展示变量页面',
                precondition: [
                  { id: '1', name: '项目工作区正常加载' },
                ],
                operationSteps: [
                  { id: '1', name: '点击变量图标（Variable图标）' },
                  { id: '2', name: '观察导航栏和内容区域变化' },
                ],
                expectedResults: [
                  { id: '1', name: '导航栏新增变量tab' },
                  { id: '2', name: 'tab标签显示"变量"' },
                  { id: '3', name: '内容区域显示变量管理页面' },
                ],
                checkpoints: [
                  { id: '1', name: 'tabType为"variable"' },
                  { id: '2', name: 'apidocTabsStore.addTab正确调用' },
                ],
                notes: [
                  { id: '1', name: 'op="variable"处理: Tool.vue:390-401' },
                  { id: '2', name: '变量图标: Tool.vue:97-99使用lucide-vue-next的Variable' },
                ],
              },
            ],
          },
          {
            modelName: 'nodeTree',
            description: '节点树',
            children: [
              {
                modelName: 'addNode',
                description: '添加节点',
                children: [
                  {
                    modelName: '新增httpNode',
                    description: '新增http节点',
                    atomicFunc: [
                      {
                        purpose: '鼠标右键空白区域添加http节点',
                        precondition: [
                          { id: '1', name: '项目工作区正常加载' },
                          { id: '2', name: '用户有编辑权限' },
                        ],
                        operationSteps: [
                          { id: '1', name: '在节点树空白区域点击鼠标右键' },
                          { id: '2', name: '在右键菜单中选择"新建接口"' },
                          { id: '3', name: '选择HTTP类型' },
                          { id: '4', name: '输入接口名称并确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: '右键菜单正确弹出' },
                          { id: '2', name: '新建接口选项可用' },
                          { id: '3', name: '新建http节点成功' },
                          { id: '4', name: '节点出现在根目录末尾' },
                        ],
                        checkpoints: [
                          { id: '1', name: '右键菜单位置正确' },
                          { id: '2', name: '节点type为http' },
                          { id: '3', name: '节点排序正确' },
                        ],
                        notes: [
                          { id: '1', name: '右键菜单处理: src/renderer/pages/projectWorkbench/layout/banner/Banner.vue' },
                        ],
                      },
                      {
                        purpose: '鼠标右键空白区域添加http节点(AI)',
                        precondition: [
                          { id: '1', name: '项目工作区正常加载' },
                          { id: '2', name: 'AI功能已启用' },
                          { id: '3', name: '用户有编辑权限' },
                        ],
                        operationSteps: [
                          { id: '1', name: '在节点树空白区域点击鼠标右键' },
                          { id: '2', name: '在右键菜单中选择"新建接口(AI)"' },
                          { id: '3', name: '选择HTTP类型' },
                          { id: '4', name: '输入接口描述，等待AI生成' },
                        ],
                        expectedResults: [
                          { id: '1', name: 'AI生成接口配置' },
                          { id: '2', name: '新建http节点成功' },
                          { id: '3', name: '节点包含AI生成的配置数据' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'AI接口调用成功' },
                          { id: '2', name: '生成数据格式正确' },
                        ],
                        notes: [
                          { id: '1', name: 'AI功能需要配置AI设置' },
                        ],
                      },
                      {
                        purpose: '鼠标右键目录添加http节点',
                        precondition: [
                          { id: '1', name: '项目中存在目录节点' },
                          { id: '2', name: '用户有编辑权限' },
                        ],
                        operationSteps: [
                          { id: '1', name: '在目录节点上点击鼠标右键' },
                          { id: '2', name: '在右键菜单中选择"新建接口"' },
                          { id: '3', name: '选择HTTP类型' },
                          { id: '4', name: '输入接口名称并确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: '新建http节点成功' },
                          { id: '2', name: '节点出现在该目录内末尾位置' },
                          { id: '3', name: '目录自动展开显示新节点' },
                        ],
                        checkpoints: [
                          { id: '1', name: '父节点ID正确设置' },
                          { id: '2', name: '节点排序在目录内末尾' },
                        ],
                        notes: [
                          { id: '1', name: '目录右键菜单包含新建接口选项' },
                        ],
                      },
                      {
                        purpose: '鼠标右键目录添加http节点(AI)',
                        precondition: [
                          { id: '1', name: '项目中存在目录节点' },
                          { id: '2', name: 'AI功能已启用' },
                          { id: '3', name: '用户有编辑权限' },
                        ],
                        operationSteps: [
                          { id: '1', name: '在目录节点上点击鼠标右键' },
                          { id: '2', name: '在右键菜单中选择"新建接口(AI)"' },
                          { id: '3', name: '选择HTTP类型' },
                          { id: '4', name: '输入接口描述，等待AI生成' },
                        ],
                        expectedResults: [
                          { id: '1', name: 'AI生成接口配置' },
                          { id: '2', name: '新节点出现在目录内' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'AI响应正确解析' },
                          { id: '2', name: '节点父ID正确' },
                        ],
                        notes: [
                          { id: '1', name: 'AI生成需要网络连接' },
                        ],
                      },
                      {
                        purpose: '点击新增按钮添加http节点',
                        precondition: [
                          { id: '1', name: '项目工作区正常加载' },
                          { id: '2', name: '用户有编辑权限' },
                        ],
                        operationSteps: [
                          { id: '1', name: '点击工具栏新增接口按钮' },
                          { id: '2', name: '在弹出对话框中选择HTTP类型' },
                          { id: '3', name: '输入接口名称' },
                          { id: '4', name: '点击确认按钮' },
                        ],
                        expectedResults: [
                          { id: '1', name: 'SAddFileDialog正确弹出' },
                          { id: '2', name: '新建http节点成功' },
                          { id: '3', name: '对话框关闭' },
                          { id: '4', name: '节点出现在根目录末尾' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'addFileDialogVisible状态正确' },
                          { id: '2', name: 'handleAddFileAndFolderCb回调执行' },
                        ],
                        notes: [
                          { id: '1', name: '新增按钮: Tool.vue op="addRootFile"' },
                        ],
                      },
                      {
                        purpose: '点击新增按钮添加http节点(AI)',
                        precondition: [
                          { id: '1', name: 'AI功能已启用' },
                          { id: '2', name: '用户有编辑权限' },
                        ],
                        operationSteps: [
                          { id: '1', name: '点击工具栏新增接口按钮' },
                          { id: '2', name: '选择HTTP类型' },
                          { id: '3', name: '切换到AI模式' },
                          { id: '4', name: '输入接口描述并确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: 'AI生成接口配置' },
                          { id: '2', name: '新建http节点成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'AI模式切换正确' },
                          { id: '2', name: '生成数据正确应用' },
                        ],
                        notes: [
                          { id: '1', name: 'AI模式在对话框中切换' },
                        ],
                      },
                    ],
                  },
                  {
                    modelName: 'websocketNode',
                    description: 'websocket节点',
                    atomicFunc: [
                      {
                        purpose: '鼠标右键空白区域添加websocket节点',
                        precondition: [
                          { id: '1', name: '项目工作区正常加载' },
                          { id: '2', name: '用户有编辑权限' },
                        ],
                        operationSteps: [
                          { id: '1', name: '在节点树空白区域点击鼠标右键' },
                          { id: '2', name: '在右键菜单中选择"新建接口"' },
                          { id: '3', name: '选择WebSocket类型' },
                          { id: '4', name: '输入接口名称并确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: '新建websocket节点成功' },
                          { id: '2', name: '节点出现在根目录末尾' },
                          { id: '3', name: '节点图标显示WebSocket标识' },
                        ],
                        checkpoints: [
                          { id: '1', name: '节点type为websocket' },
                          { id: '2', name: '节点排序正确' },
                        ],
                        notes: [
                          { id: '1', name: 'WebSocket节点url结构包含path属性' },
                        ],
                      },
                      {
                        purpose: '鼠标右键空白区域添加websocket节点(AI)',
                        precondition: [
                          { id: '1', name: '项目工作区正常加载' },
                          { id: '2', name: 'AI功能已启用' },
                        ],
                        operationSteps: [
                          { id: '1', name: '在节点树空白区域点击鼠标右键' },
                          { id: '2', name: '选择"新建接口(AI)"' },
                          { id: '3', name: '选择WebSocket类型' },
                          { id: '4', name: '输入描述等待AI生成' },
                        ],
                        expectedResults: [
                          { id: '1', name: 'AI生成WebSocket配置' },
                          { id: '2', name: '节点创建成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'AI生成的url.path格式正确' },
                        ],
                        notes: [
                          { id: '1', name: 'AI需理解WebSocket协议特性' },
                        ],
                      },
                      {
                        purpose: '鼠标右键目录添加websocket节点',
                        precondition: [
                          { id: '1', name: '项目中存在目录节点' },
                          { id: '2', name: '用户有编辑权限' },
                        ],
                        operationSteps: [
                          { id: '1', name: '在目录节点上点击鼠标右键' },
                          { id: '2', name: '选择"新建接口"' },
                          { id: '3', name: '选择WebSocket类型' },
                          { id: '4', name: '输入名称并确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: '新节点出现在目录内末尾' },
                          { id: '2', name: '目录自动展开' },
                        ],
                        checkpoints: [
                          { id: '1', name: '父节点ID正确' },
                        ],
                        notes: [
                          { id: '1', name: '与httpNode创建流程类似' },
                        ],
                      },
                      {
                        purpose: '鼠标右键目录添加websocket节点(AI)',
                        precondition: [
                          { id: '1', name: '目录节点存在' },
                          { id: '2', name: 'AI功能启用' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键目录节点' },
                          { id: '2', name: '选择"新建接口(AI)"' },
                          { id: '3', name: '选择WebSocket类型' },
                          { id: '4', name: '输入描述确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: 'AI生成配置' },
                          { id: '2', name: '节点创建在目录内' },
                        ],
                        checkpoints: [
                          { id: '1', name: '父节点关联正确' },
                        ],
                        notes: [
                          { id: '1', name: 'AI生成需网络连接' },
                        ],
                      },
                      {
                        purpose: '点击新增按钮添加websocket节点',
                        precondition: [
                          { id: '1', name: '项目工作区正常加载' },
                        ],
                        operationSteps: [
                          { id: '1', name: '点击工具栏新增接口按钮' },
                          { id: '2', name: '选择WebSocket类型' },
                          { id: '3', name: '输入名称确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: '对话框正确弹出' },
                          { id: '2', name: '节点创建成功' },
                          { id: '3', name: '节点在根目录末尾' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'type选择正确' },
                        ],
                        notes: [
                          { id: '1', name: '使用SAddFileDialog组件' },
                        ],
                      },
                      {
                        purpose: '点击新增按钮添加websocket节点(AI)',
                        precondition: [
                          { id: '1', name: 'AI功能启用' },
                        ],
                        operationSteps: [
                          { id: '1', name: '点击新增按钮' },
                          { id: '2', name: '选择WebSocket类型' },
                          { id: '3', name: '切换AI模式' },
                          { id: '4', name: '输入描述确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: 'AI生成配置' },
                          { id: '2', name: '节点创建成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'AI模式切换正确' },
                        ],
                        notes: [
                          { id: '1', name: 'WebSocket AI生成包含连接参数' },
                        ],
                      },
                    ],
                  },
                  {
                    modelName: 'httpMockNode',
                    description: 'http mock节点',
                    atomicFunc: [
                      {
                        purpose: '鼠标右键空白区域添加httpMock节点',
                        precondition: [
                          { id: '1', name: '项目工作区正常加载' },
                          { id: '2', name: '用户有编辑权限' },
                        ],
                        operationSteps: [
                          { id: '1', name: '在节点树空白区域点击鼠标右键' },
                          { id: '2', name: '选择"新建接口"' },
                          { id: '3', name: '选择HTTP Mock类型' },
                          { id: '4', name: '输入名称并确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: '新建httpMock节点成功' },
                          { id: '2', name: '节点出现在根目录末尾' },
                          { id: '3', name: '节点可配置Mock响应规则' },
                        ],
                        checkpoints: [
                          { id: '1', name: '节点type为httpMock' },
                          { id: '2', name: 'Mock配置数据结构正确' },
                        ],
                        notes: [
                          { id: '1', name: 'Mock节点需配置端口、路径、响应等' },
                        ],
                      },
                      {
                        purpose: '鼠标右键空白区域添加httpMock节点(AI)',
                        precondition: [
                          { id: '1', name: 'AI功能已启用' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键空白区域' },
                          { id: '2', name: '选择"新建接口(AI)"' },
                          { id: '3', name: '选择HTTP Mock类型' },
                          { id: '4', name: '输入描述等待生成' },
                        ],
                        expectedResults: [
                          { id: '1', name: 'AI生成Mock配置' },
                          { id: '2', name: '包含响应数据模板' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'AI生成响应规则正确' },
                        ],
                        notes: [
                          { id: '1', name: 'AI可生成Mock数据模板' },
                        ],
                      },
                      {
                        purpose: '鼠标右键目录添加httpMock节点',
                        precondition: [
                          { id: '1', name: '目录节点存在' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键目录节点' },
                          { id: '2', name: '选择"新建接口"' },
                          { id: '3', name: '选择HTTP Mock类型' },
                          { id: '4', name: '输入名称确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: '节点创建在目录内' },
                        ],
                        checkpoints: [
                          { id: '1', name: '父节点ID正确' },
                        ],
                        notes: [
                          { id: '1', name: '与其他节点类型创建流程一致' },
                        ],
                      },
                      {
                        purpose: '鼠标右键目录添加httpMock节点(AI)',
                        precondition: [
                          { id: '1', name: '目录存在且AI启用' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键目录' },
                          { id: '2', name: '选择AI新建' },
                          { id: '3', name: '选择HTTP Mock' },
                          { id: '4', name: '输入描述确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: 'AI生成配置' },
                          { id: '2', name: '节点在目录内创建' },
                        ],
                        checkpoints: [
                          { id: '1', name: '生成数据正确' },
                        ],
                        notes: [
                          { id: '1', name: 'AI生成Mock响应模板' },
                        ],
                      },
                      {
                        purpose: '点击新增按钮添加httpMock节点',
                        precondition: [
                          { id: '1', name: '项目工作区正常' },
                        ],
                        operationSteps: [
                          { id: '1', name: '点击新增按钮' },
                          { id: '2', name: '选择HTTP Mock类型' },
                          { id: '3', name: '输入名称确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: '节点创建成功' },
                          { id: '2', name: '在根目录末尾' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'type正确' },
                        ],
                        notes: [
                          { id: '1', name: '使用SAddFileDialog' },
                        ],
                      },
                      {
                        purpose: '点击新增按钮添加httpMock节点(AI)',
                        precondition: [
                          { id: '1', name: 'AI功能启用' },
                        ],
                        operationSteps: [
                          { id: '1', name: '点击新增' },
                          { id: '2', name: '选择HTTP Mock' },
                          { id: '3', name: '切换AI模式' },
                          { id: '4', name: '输入描述确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: 'AI生成Mock配置' },
                          { id: '2', name: '节点创建成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'AI模式正确' },
                        ],
                        notes: [
                          { id: '1', name: 'Mock节点AI生成包含响应规则' },
                        ],
                      },
                    ],
                  },
                  {
                    modelName: 'websocketMockNode',
                    description: 'websocket mock节点',
                    atomicFunc: [
                      {
                        purpose: '鼠标右键空白区域添加websocketMock节点',
                        precondition: [
                          { id: '1', name: '项目工作区正常加载' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键空白区域' },
                          { id: '2', name: '选择"新建接口"' },
                          { id: '3', name: '选择WebSocket Mock类型' },
                          { id: '4', name: '输入名称确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: '节点创建成功' },
                          { id: '2', name: '可配置WebSocket Mock规则' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'type为websocketMock' },
                        ],
                        notes: [
                          { id: '1', name: 'WebSocket Mock支持连接生命周期管理' },
                        ],
                      },
                      {
                        purpose: '鼠标右键空白区域添加websocketMock节点(AI)',
                        precondition: [
                          { id: '1', name: 'AI功能启用' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键空白区域' },
                          { id: '2', name: '选择AI新建' },
                          { id: '3', name: '选择WebSocket Mock' },
                          { id: '4', name: '输入描述确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: 'AI生成Mock配置' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'AI生成数据正确' },
                        ],
                        notes: [
                          { id: '1', name: 'AI生成包含消息响应规则' },
                        ],
                      },
                      {
                        purpose: '鼠标右键目录添加websocketMock节点',
                        precondition: [
                          { id: '1', name: '目录节点存在' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键目录' },
                          { id: '2', name: '选择新建接口' },
                          { id: '3', name: '选择WebSocket Mock' },
                          { id: '4', name: '确认创建' },
                        ],
                        expectedResults: [
                          { id: '1', name: '节点在目录内创建' },
                        ],
                        checkpoints: [
                          { id: '1', name: '父节点正确' },
                        ],
                        notes: [
                          { id: '1', name: '流程与其他类型一致' },
                        ],
                      },
                      {
                        purpose: '鼠标右键目录添加websocketMock节点(AI)',
                        precondition: [
                          { id: '1', name: 'AI启用且目录存在' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键目录' },
                          { id: '2', name: 'AI新建' },
                          { id: '3', name: '选择类型' },
                          { id: '4', name: '确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: 'AI生成并创建节点' },
                        ],
                        checkpoints: [
                          { id: '1', name: '配置正确' },
                        ],
                        notes: [
                          { id: '1', name: 'AI理解WebSocket协议' },
                        ],
                      },
                      {
                        purpose: '点击新增按钮添加websocketMock节点',
                        precondition: [
                          { id: '1', name: '项目正常加载' },
                        ],
                        operationSteps: [
                          { id: '1', name: '点击新增' },
                          { id: '2', name: '选择WebSocket Mock' },
                          { id: '3', name: '输入名称确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: '节点创建成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'type正确' },
                        ],
                        notes: [
                          { id: '1', name: '使用SAddFileDialog' },
                        ],
                      },
                      {
                        purpose: '点击新增按钮添加websocketMock节点(AI)',
                        precondition: [
                          { id: '1', name: 'AI功能启用' },
                        ],
                        operationSteps: [
                          { id: '1', name: '点击新增' },
                          { id: '2', name: '选择类型' },
                          { id: '3', name: 'AI模式' },
                          { id: '4', name: '确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: 'AI生成配置并创建' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'AI模式正确' },
                        ],
                        notes: [
                          { id: '1', name: 'WebSocket Mock AI生成' },
                        ],
                      },
                    ],
                  },
                  {
                    modelName: 'folderNode',
                    description: 'folder节点',
                    atomicFunc: [
                      {
                        purpose: '鼠标右键空白区域添加folder节点',
                        precondition: [
                          { id: '1', name: '项目工作区正常加载' },
                          { id: '2', name: '用户有编辑权限' },
                        ],
                        operationSteps: [
                          { id: '1', name: '在节点树空白区域点击鼠标右键' },
                          { id: '2', name: '选择"新建文件夹"' },
                          { id: '3', name: '输入文件夹名称' },
                          { id: '4', name: '点击确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: '新建folder节点成功' },
                          { id: '2', name: '节点出现在根目录最后一个目录节点下方' },
                          { id: '3', name: '节点可展开/收起' },
                        ],
                        checkpoints: [
                          { id: '1', name: '节点type为folder' },
                          { id: '2', name: '排序在目录区域内' },
                        ],
                        notes: [
                          { id: '1', name: 'folder节点排序规则不同于接口节点' },
                        ],
                      },
                      {
                        purpose: '鼠标右键目录添加folder节点',
                        precondition: [
                          { id: '1', name: '项目中存在目录节点' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键目录节点' },
                          { id: '2', name: '选择"新建文件夹"' },
                          { id: '3', name: '输入名称确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: '子目录创建成功' },
                          { id: '2', name: '排在父目录内最后一个目录节点下方' },
                          { id: '3', name: '父目录自动展开' },
                        ],
                        checkpoints: [
                          { id: '1', name: '父节点ID正确' },
                          { id: '2', name: '嵌套目录结构正确' },
                        ],
                        notes: [
                          { id: '1', name: '支持多级目录嵌套' },
                        ],
                      },
                      {
                        purpose: '在folder节点上，点击新增按钮添加folder节点',
                        precondition: [
                          { id: '1', name: '选中一个folder节点' },
                        ],
                        operationSteps: [
                          { id: '1', name: '选中folder节点' },
                          { id: '2', name: '点击节点更多操作按钮' },
                          { id: '3', name: '选择"新建文件夹"' },
                          { id: '4', name: '输入名称确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: '子目录在当前目录内创建' },
                          { id: '2', name: '位置正确' },
                        ],
                        checkpoints: [
                          { id: '1', name: '通过更多操作创建' },
                        ],
                        notes: [
                          { id: '1', name: '更多操作按钮在节点hover时显示' },
                        ],
                      },
                      {
                        purpose: '点击新增按钮添加folder节点',
                        precondition: [
                          { id: '1', name: '项目工作区正常加载' },
                        ],
                        operationSteps: [
                          { id: '1', name: '点击工具栏新增目录按钮' },
                          { id: '2', name: '输入目录名称' },
                          { id: '3', name: '点击确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: 'SAddFolderDialog正确弹出' },
                          { id: '2', name: '新目录创建成功' },
                          { id: '3', name: '位于根目录最后一个目录节点下方' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'addFolderDialogVisible状态' },
                          { id: '2', name: '排序逻辑正确' },
                        ],
                        notes: [
                          { id: '1', name: 'op="addRootFolder"处理' },
                        ],
                      },
                    ],
                  },
                  {
                    modelName: '边界情况测试',
                    description: '边界情况测试',
                    atomicFunc: [
                      {
                        purpose: '鼠标右键非folder节点不出现新建接口选项',
                        precondition: [
                          { id: '1', name: '项目中存在非folder类型节点（http/websocket/mock）' },
                        ],
                        operationSteps: [
                          { id: '1', name: '在非folder节点上点击鼠标右键' },
                          { id: '2', name: '观察右键菜单选项' },
                        ],
                        expectedResults: [
                          { id: '1', name: '右键菜单不显示"新建接口"选项' },
                          { id: '2', name: '右键菜单不显示"新建文件夹"选项' },
                          { id: '3', name: '只显示剪切、复制、生成副本、重命名、删除等选项' },
                        ],
                        checkpoints: [
                          { id: '1', name: '右键菜单根据节点类型动态显示' },
                          { id: '2', name: '菜单选项正确过滤' },
                        ],
                        notes: [
                          { id: '1', name: '非folder节点只能进行自身操作，不能在其内部创建子节点' },
                        ],
                      },
                      {
                        purpose: '非folder节点点击更多按钮不出现新建接口选项',
                        precondition: [
                          { id: '1', name: '项目中存在非folder类型节点' },
                        ],
                        operationSteps: [
                          { id: '1', name: '将鼠标悬停在非folder节点上' },
                          { id: '2', name: '点击节点右侧的更多操作按钮' },
                          { id: '3', name: '观察下拉菜单选项' },
                        ],
                        expectedResults: [
                          { id: '1', name: '更多操作菜单不显示"新建接口"选项' },
                          { id: '2', name: '更多操作菜单不显示"新建文件夹"选项' },
                        ],
                        checkpoints: [
                          { id: '1', name: '更多操作菜单根据节点类型过滤' },
                        ],
                        notes: [
                          { id: '1', name: '更多操作与右键菜单逻辑一致' },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                modelName: 'deleteNode',
                description: '删除节点',
                children: [
                  {
                    modelName: '删除httpNode',
                    description: '删除httpNode节点',
                    atomicFunc: [
                      {
                        purpose: '鼠标右键httpNode节点删除',
                        precondition: [
                          { id: '1', name: '项目中存在httpNode节点' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键httpNode节点' },
                          { id: '2', name: '选择"删除"' },
                          { id: '3', name: '确认删除' },
                        ],
                        expectedResults: [
                          { id: '1', name: '节点从树中移除' },
                          { id: '2', name: '节点移至回收站' },
                          { id: '3', name: '对应tab关闭' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'handleDeleteNodes方法执行' },
                          { id: '2', name: 'tab同步关闭' },
                        ],
                        notes: [
                          { id: '1', name: '删除处理: Banner.vue handleDeleteNodes' },
                        ],
                      },
                      {
                        purpose: '鼠标移动到httpNode节点，点击更多操作删除节点',
                        precondition: [
                          { id: '1', name: '存在httpNode节点' },
                        ],
                        operationSteps: [
                          { id: '1', name: '悬停httpNode节点' },
                          { id: '2', name: '点击更多操作按钮' },
                          { id: '3', name: '选择删除' },
                        ],
                        expectedResults: [
                          { id: '1', name: '节点删除成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: '更多操作菜单正确显示' },
                        ],
                        notes: [
                          { id: '1', name: '与右键删除逻辑一致' },
                        ],
                      },
                      {
                        purpose: '按住ctrl鼠标左键批量选择httpNode节点，鼠标右键批量删除',
                        precondition: [
                          { id: '1', name: '存在多个httpNode节点' },
                        ],
                        operationSteps: [
                          { id: '1', name: '按住Ctrl点击多个节点' },
                          { id: '2', name: '右键选中区域' },
                          { id: '3', name: '选择删除' },
                        ],
                        expectedResults: [
                          { id: '1', name: '所有选中节点删除' },
                          { id: '2', name: '对应tabs关闭' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'pressCtrl状态正确' },
                          { id: '2', name: '批量选择逻辑正确' },
                        ],
                        notes: [
                          { id: '1', name: 'Ctrl多选: Banner.vue:648-650' },
                        ],
                      },
                    ],
                  },
                  {
                    modelName: '删除websocketNode',
                    description: '删除websocketNode节点',
                    atomicFunc: [
                      {
                        purpose: '鼠标右键websocketNode节点删除',
                        precondition: [
                          { id: '1', name: '存在websocketNode节点' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键节点' },
                          { id: '2', name: '选择删除' },
                        ],
                        expectedResults: [
                          { id: '1', name: '节点删除成功' },
                          { id: '2', name: '如有连接则断开' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'WebSocket连接清理' },
                        ],
                        notes: [
                          { id: '1', name: '删除时需处理WebSocket连接' },
                        ],
                      },
                      {
                        purpose: '鼠标移动到websocketNode节点，点击更多操作删除节点',
                        precondition: [
                          { id: '1', name: '存在websocketNode' },
                        ],
                        operationSteps: [
                          { id: '1', name: '悬停节点' },
                          { id: '2', name: '更多操作' },
                          { id: '3', name: '删除' },
                        ],
                        expectedResults: [
                          { id: '1', name: '删除成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: '流程正确' },
                        ],
                        notes: [
                          { id: '1', name: '与右键删除一致' },
                        ],
                      },
                      {
                        purpose: '按住ctrl鼠标左键批量选择websocketNode节点，鼠标右键批量删除',
                        precondition: [
                          { id: '1', name: '多个websocketNode' },
                        ],
                        operationSteps: [
                          { id: '1', name: 'Ctrl多选' },
                          { id: '2', name: '右键删除' },
                        ],
                        expectedResults: [
                          { id: '1', name: '批量删除成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: '多选正确' },
                        ],
                        notes: [
                          { id: '1', name: '批量操作' },
                        ],
                      },
                    ],
                  },
                  {
                    modelName: '删除httpMockNode',
                    description: '删除httpMockNode节点',
                    atomicFunc: [
                      {
                        purpose: '鼠标右键httpMockNode节点删除',
                        precondition: [
                          { id: '1', name: '存在httpMockNode' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键节点' },
                          { id: '2', name: '删除' },
                        ],
                        expectedResults: [
                          { id: '1', name: '节点删除' },
                          { id: '2', name: 'Mock服务停止' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'Mock服务清理' },
                        ],
                        notes: [
                          { id: '1', name: '删除时停止对应Mock服务' },
                        ],
                      },
                      {
                        purpose: '鼠标移动到httpMockNode节点，点击更多操作删除节点',
                        precondition: [
                          { id: '1', name: '存在节点' },
                        ],
                        operationSteps: [
                          { id: '1', name: '悬停' },
                          { id: '2', name: '更多操作' },
                          { id: '3', name: '删除' },
                        ],
                        expectedResults: [
                          { id: '1', name: '删除成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: '流程正确' },
                        ],
                        notes: [
                          { id: '1', name: '一致逻辑' },
                        ],
                      },
                      {
                        purpose: '按住ctrl鼠标左键批量选择httpMockNode节点，鼠标右键批量删除',
                        precondition: [
                          { id: '1', name: '多个节点' },
                        ],
                        operationSteps: [
                          { id: '1', name: 'Ctrl多选' },
                          { id: '2', name: '批量删除' },
                        ],
                        expectedResults: [
                          { id: '1', name: '全部删除' },
                        ],
                        checkpoints: [
                          { id: '1', name: '批量正确' },
                        ],
                        notes: [
                          { id: '1', name: '批量操作' },
                        ],
                      },
                    ],
                  },
                  {
                    modelName: '删除websocketMockNode',
                    description: '删除websocketMockNode节点',
                    atomicFunc: [
                      {
                        purpose: '鼠标右键websocketMockNode节点删除',
                        precondition: [
                          { id: '1', name: '存在websocketMockNode' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键删除' },
                        ],
                        expectedResults: [
                          { id: '1', name: '节点删除' },
                          { id: '2', name: 'Mock服务停止' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'WebSocket Mock清理' },
                        ],
                        notes: [
                          { id: '1', name: '清理连接和服务' },
                        ],
                      },
                      {
                        purpose: '鼠标移动到websocketMockNode节点，点击更多操作删除节点',
                        precondition: [
                          { id: '1', name: '存在节点' },
                        ],
                        operationSteps: [
                          { id: '1', name: '更多操作删除' },
                        ],
                        expectedResults: [
                          { id: '1', name: '删除成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: '正确执行' },
                        ],
                        notes: [
                          { id: '1', name: '逻辑一致' },
                        ],
                      },
                      {
                        purpose: '按住ctrl鼠标左键批量选择websocketMockNode节点，鼠标右键批量删除',
                        precondition: [
                          { id: '1', name: '多个节点' },
                        ],
                        operationSteps: [
                          { id: '1', name: 'Ctrl批量删除' },
                        ],
                        expectedResults: [
                          { id: '1', name: '全部删除' },
                        ],
                        checkpoints: [
                          { id: '1', name: '批量正确' },
                        ],
                        notes: [
                          { id: '1', name: '批量操作' },
                        ],
                      },
                    ],
                  },
                  {
                    modelName: '删除folder',
                    description: '删除folder节点',
                    atomicFunc: [
                      {
                        purpose: '鼠标右键folder节点删除',
                        precondition: [
                          { id: '1', name: '存在folder节点' },
                          { id: '2', name: 'folder可能包含子节点' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键folder' },
                          { id: '2', name: '选择删除' },
                          { id: '3', name: '确认删除' },
                        ],
                        expectedResults: [
                          { id: '1', name: 'folder及其所有子节点删除' },
                          { id: '2', name: '所有子节点对应tab关闭' },
                          { id: '3', name: '移至回收站' },
                        ],
                        checkpoints: [
                          { id: '1', name: '递归删除子节点' },
                          { id: '2', name: '批量关闭tabs' },
                        ],
                        notes: [
                          { id: '1', name: '删除folder会级联删除所有子节点' },
                        ],
                      },
                      {
                        purpose: '鼠标移动到folder节点，点击更多操作删除节点',
                        precondition: [
                          { id: '1', name: '存在folder' },
                        ],
                        operationSteps: [
                          { id: '1', name: '悬停folder' },
                          { id: '2', name: '更多操作删除' },
                        ],
                        expectedResults: [
                          { id: '1', name: '删除成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: '级联删除' },
                        ],
                        notes: [
                          { id: '1', name: '与右键一致' },
                        ],
                      },
                      {
                        purpose: '按住ctrl鼠标左键批量选择folder节点，鼠标右键批量删除',
                        precondition: [
                          { id: '1', name: '多个folder' },
                        ],
                        operationSteps: [
                          { id: '1', name: 'Ctrl多选folder' },
                          { id: '2', name: '批量删除' },
                        ],
                        expectedResults: [
                          { id: '1', name: '所有选中folder及子节点删除' },
                        ],
                        checkpoints: [
                          { id: '1', name: '批量级联删除' },
                        ],
                        notes: [
                          { id: '1', name: '注意嵌套folder情况' },
                        ],
                      },
                    ],
                  },
                  {
                    modelName: '删除混合节点',
                    description: '删除混合节点',
                    atomicFunc: [
                      {
                        purpose: '按住ctrl鼠标左键批量选择httpNode、websocketNode、httpMockNode、websocketMockNode、folder节点，鼠标右键批量删除',
                        precondition: [
                          { id: '1', name: '项目中存在多种类型节点' },
                        ],
                        operationSteps: [
                          { id: '1', name: '按住Ctrl依次点击不同类型节点' },
                          { id: '2', name: '右键选中区域' },
                          { id: '3', name: '选择删除' },
                        ],
                        expectedResults: [
                          { id: '1', name: '所有选中节点删除' },
                          { id: '2', name: 'folder子节点一并删除' },
                          { id: '3', name: '所有对应tabs关闭' },
                          { id: '4', name: '相关Mock服务停止' },
                        ],
                        checkpoints: [
                          { id: '1', name: '混合类型批量删除' },
                          { id: '2', name: '各类型清理逻辑都执行' },
                        ],
                        notes: [
                          { id: '1', name: '测试混合选择场景确保各类型处理正确' },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                modelName: '重命名节点',
                description: '重命名节点',
                children: [
                  {
                    modelName: '重命名节点httpNode节点',
                    description: '重命名节点httpNode节点',
                    atomicFunc: [
                      {
                        purpose: 'active 节点，点击节点右键，点击重命名，输入名称，回车或blur',
                        precondition: [
                          { id: '1', name: '存在httpNode节点' },
                        ],
                        operationSteps: [
                          { id: '1', name: '点击选中httpNode节点' },
                          { id: '2', name: '右键节点选择"重命名"' },
                          { id: '3', name: '输入新名称' },
                          { id: '4', name: '按回车或点击其他区域blur' },
                        ],
                        expectedResults: [
                          { id: '1', name: '节点进入编辑模式' },
                          { id: '2', name: '名称更新成功' },
                          { id: '3', name: '对应tab名称同步更新' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'editNode状态正确' },
                          { id: '2', name: 'handleRenameNode方法执行' },
                        ],
                        notes: [
                          { id: '1', name: 'F2快捷键: Banner.vue:651-652' },
                        ],
                      },
                      {
                        purpose: 'active 节点，F2重命名，输入名称，回车或blur',
                        precondition: [
                          { id: '1', name: '节点已选中激活' },
                        ],
                        operationSteps: [
                          { id: '1', name: '选中节点' },
                          { id: '2', name: '按F2键' },
                          { id: '3', name: '输入新名称' },
                          { id: '4', name: '回车确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: '进入编辑模式' },
                          { id: '2', name: '重命名成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'F2快捷键响应' },
                          { id: '2', name: 'readonly检查' },
                        ],
                        notes: [
                          { id: '1', name: 'readonly节点不能重命名' },
                        ],
                      },
                      {
                        purpose: '点击节点更多操作，点击重命名，输入名称，回车或blur',
                        precondition: [
                          { id: '1', name: '存在节点' },
                        ],
                        operationSteps: [
                          { id: '1', name: '悬停节点' },
                          { id: '2', name: '点击更多操作' },
                          { id: '3', name: '选择重命名' },
                          { id: '4', name: '输入确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: '重命名成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: '更多操作正确' },
                        ],
                        notes: [
                          { id: '1', name: '与右键重命名一致' },
                        ],
                      },
                      {
                        purpose: '节点名称未填写不允许重命名',
                        precondition: [
                          { id: '1', name: '节点处于编辑模式' },
                        ],
                        operationSteps: [
                          { id: '1', name: '清空名称输入框' },
                          { id: '2', name: '尝试确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: '显示错误提示' },
                          { id: '2', name: '重命名不生效' },
                          { id: '3', name: '保持原名称' },
                        ],
                        checkpoints: [
                          { id: '1', name: '空名称校验' },
                          { id: '2', name: 'error样式显示' },
                        ],
                        notes: [
                          { id: '1', name: '校验逻辑: Banner.vue:559-563' },
                        ],
                      },
                    ],
                  },
                  {
                    modelName: '重命名节点websocketNode节点',
                    description: '重命名节点websocketNode节点',
                    atomicFunc: [
                      {
                        purpose: 'active 节点，点击节点右键，点击重命名，输入名称，回车或blur',
                        precondition: [
                          { id: '1', name: '存在websocketNode' },
                        ],
                        operationSteps: [
                          { id: '1', name: '选中节点' },
                          { id: '2', name: '右键重命名' },
                          { id: '3', name: '输入确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: '重命名成功' },
                          { id: '2', name: 'tab同步' },
                        ],
                        checkpoints: [
                          { id: '1', name: '流程正确' },
                        ],
                        notes: [
                          { id: '1', name: '与httpNode一致' },
                        ],
                      },
                      {
                        purpose: 'active 节点，F2重命名，输入名称，回车或blur',
                        precondition: [
                          { id: '1', name: '节点激活' },
                        ],
                        operationSteps: [
                          { id: '1', name: 'F2编辑' },
                          { id: '2', name: '输入确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: '重命名成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'F2响应' },
                        ],
                        notes: [
                          { id: '1', name: '快捷键操作' },
                        ],
                      },
                      {
                        purpose: '点击节点更多操作，点击重命名，输入名称，回车或blur',
                        precondition: [
                          { id: '1', name: '节点存在' },
                        ],
                        operationSteps: [
                          { id: '1', name: '更多操作重命名' },
                        ],
                        expectedResults: [
                          { id: '1', name: '成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: '正确' },
                        ],
                        notes: [
                          { id: '1', name: '一致逻辑' },
                        ],
                      },
                      {
                        purpose: '节点名称未填写不允许重命名',
                        precondition: [
                          { id: '1', name: '编辑模式' },
                        ],
                        operationSteps: [
                          { id: '1', name: '清空确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: '校验失败' },
                        ],
                        checkpoints: [
                          { id: '1', name: '空值校验' },
                        ],
                        notes: [
                          { id: '1', name: '必填校验' },
                        ],
                      },
                    ],
                  },
                  {
                    modelName: '重命名节点httpMockNode节点',
                    description: '重命名节点httpMockNode节点',
                    atomicFunc: [
                      {
                        purpose: 'active 节点，点击节点右键，点击重命名，输入名称，回车或blur',
                        precondition: [
                          { id: '1', name: '存在httpMockNode' },
                        ],
                        operationSteps: [
                          { id: '1', name: '选中右键重命名' },
                        ],
                        expectedResults: [
                          { id: '1', name: '成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: '正确' },
                        ],
                        notes: [
                          { id: '1', name: '一致' },
                        ],
                      },
                      {
                        purpose: 'active 节点，F2重命名，输入名称，回车或blur',
                        precondition: [
                          { id: '1', name: '激活' },
                        ],
                        operationSteps: [
                          { id: '1', name: 'F2重命名' },
                        ],
                        expectedResults: [
                          { id: '1', name: '成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: '响应' },
                        ],
                        notes: [
                          { id: '1', name: '快捷键' },
                        ],
                      },
                      {
                        purpose: '点击节点更多操作，点击重命名，输入名称，回车或blur',
                        precondition: [
                          { id: '1', name: '存在' },
                        ],
                        operationSteps: [
                          { id: '1', name: '更多重命名' },
                        ],
                        expectedResults: [
                          { id: '1', name: '成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: '正确' },
                        ],
                        notes: [
                          { id: '1', name: '一致' },
                        ],
                      },
                      {
                        purpose: '节点名称未填写不允许重命名',
                        precondition: [
                          { id: '1', name: '编辑' },
                        ],
                        operationSteps: [
                          { id: '1', name: '清空' },
                        ],
                        expectedResults: [
                          { id: '1', name: '失败' },
                        ],
                        checkpoints: [
                          { id: '1', name: '校验' },
                        ],
                        notes: [
                          { id: '1', name: '必填' },
                        ],
                      },
                    ],
                  },
                  {
                    modelName: '重命名节点websocketMock节点',
                    description: '重命名节点websocketMock节点',
                    atomicFunc: [
                      {
                        purpose: 'active 节点，点击节点右键，点击重命名，输入名称，回车或blur',
                        precondition: [
                          { id: '1', name: '存在websocketMock' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键重命名' },
                        ],
                        expectedResults: [
                          { id: '1', name: '成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: '正确' },
                        ],
                        notes: [
                          { id: '1', name: '一致' },
                        ],
                      },
                      {
                        purpose: 'active 节点，F2重命名，输入名称，回车或blur',
                        precondition: [
                          { id: '1', name: '激活' },
                        ],
                        operationSteps: [
                          { id: '1', name: 'F2' },
                        ],
                        expectedResults: [
                          { id: '1', name: '成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: '响应' },
                        ],
                        notes: [
                          { id: '1', name: '快捷键' },
                        ],
                      },
                      {
                        purpose: '点击节点更多操作，点击重命名，输入名称，回车或blur',
                        precondition: [
                          { id: '1', name: '存在' },
                        ],
                        operationSteps: [
                          { id: '1', name: '更多' },
                        ],
                        expectedResults: [
                          { id: '1', name: '成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: '正确' },
                        ],
                        notes: [
                          { id: '1', name: '一致' },
                        ],
                      },
                      {
                        purpose: '节点名称未填写不允许重命名',
                        precondition: [
                          { id: '1', name: '编辑' },
                        ],
                        operationSteps: [
                          { id: '1', name: '清空' },
                        ],
                        expectedResults: [
                          { id: '1', name: '失败' },
                        ],
                        checkpoints: [
                          { id: '1', name: '校验' },
                        ],
                        notes: [
                          { id: '1', name: '必填' },
                        ],
                      },
                    ],
                  },
                  {
                    modelName: '重命名节点folder节点',
                    description: '重命名节点folder节点',
                    atomicFunc: [
                      {
                        purpose: 'active 节点，点击节点右键，点击重命名，输入名称，回车或blur',
                        precondition: [
                          { id: '1', name: '存在folder节点' },
                        ],
                        operationSteps: [
                          { id: '1', name: '选中folder' },
                          { id: '2', name: '右键重命名' },
                          { id: '3', name: '输入确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: 'folder名称更新' },
                          { id: '2', name: '树结构保持' },
                        ],
                        checkpoints: [
                          { id: '1', name: '重命名正确' },
                        ],
                        notes: [
                          { id: '1', name: 'folder重命名不影响子节点' },
                        ],
                      },
                      {
                        purpose: 'active 节点，F2重命名，输入名称，回车或blur',
                        precondition: [
                          { id: '1', name: 'folder激活' },
                        ],
                        operationSteps: [
                          { id: '1', name: 'F2编辑' },
                        ],
                        expectedResults: [
                          { id: '1', name: '成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'F2响应' },
                        ],
                        notes: [
                          { id: '1', name: '快捷键操作' },
                        ],
                      },
                      {
                        purpose: '点击节点更多操作，点击重命名，输入名称，回车或blur',
                        precondition: [
                          { id: '1', name: '存在folder' },
                        ],
                        operationSteps: [
                          { id: '1', name: '更多操作重命名' },
                        ],
                        expectedResults: [
                          { id: '1', name: '成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: '正确' },
                        ],
                        notes: [
                          { id: '1', name: '一致逻辑' },
                        ],
                      },
                      {
                        purpose: '节点名称未填写不允许重命名',
                        precondition: [
                          { id: '1', name: '编辑模式' },
                        ],
                        operationSteps: [
                          { id: '1', name: '清空名称' },
                        ],
                        expectedResults: [
                          { id: '1', name: '校验失败' },
                          { id: '2', name: '保持原名' },
                        ],
                        checkpoints: [
                          { id: '1', name: '空值校验' },
                        ],
                        notes: [
                          { id: '1', name: '必填校验' },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                modelName: '鼠标右键',
                description: '鼠标右键',
                children: [
                  {
                    modelName: '鼠标右键空白区域',
                    description: '鼠标右键空白区域',
                    atomicFunc: [
                      {
                        purpose: '鼠标右键空白区域，出现新建接口、新建文件夹、设置公共请求头、粘贴节点(可能置灰)等功能',
                        precondition: [
                          { id: '1', name: '项目工作区正常加载' },
                        ],
                        operationSteps: [
                          { id: '1', name: '在节点树空白区域点击鼠标右键' },
                          { id: '2', name: '观察弹出的右键菜单' },
                        ],
                        expectedResults: [
                          { id: '1', name: '显示"新建接口"子菜单' },
                          { id: '2', name: '显示"新建文件夹"选项' },
                          { id: '3', name: '显示"设置公共请求头"选项' },
                          { id: '4', name: '显示"粘贴"选项（无剪贴板数据时置灰）' },
                        ],
                        checkpoints: [
                          { id: '1', name: '右键菜单正确弹出' },
                          { id: '2', name: '粘贴状态根据剪贴板判断' },
                        ],
                        notes: [
                          { id: '1', name: '空白区域右键菜单与节点右键菜单不同' },
                        ],
                      },
                      {
                        purpose: '鼠标右键空白区域，点击新建接口(httpNode、websocketNode、httpMockNode、websocketMockNode)、成功后在根节点末尾生成节点',
                        precondition: [
                          { id: '1', name: '项目工作区正常' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键空白区域' },
                          { id: '2', name: '选择"新建接口"' },
                          { id: '3', name: '选择具体类型' },
                          { id: '4', name: '输入名称确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: '节点创建成功' },
                          { id: '2', name: '位于根目录末尾' },
                        ],
                        checkpoints: [
                          { id: '1', name: '排序正确' },
                        ],
                        notes: [
                          { id: '1', name: '新建接口在末尾' },
                        ],
                      },
                      {
                        purpose: '鼠标右键空白区域，点击新建文件夹、成功后在根节点最后一个目录节点下面生成目录节点',
                        precondition: [
                          { id: '1', name: '项目正常加载' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键空白' },
                          { id: '2', name: '选择新建文件夹' },
                          { id: '3', name: '输入确认' },
                        ],
                        expectedResults: [
                          { id: '1', name: 'folder创建成功' },
                          { id: '2', name: '位于最后一个目录节点下方' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'folder排序规则正确' },
                        ],
                        notes: [
                          { id: '1', name: 'folder排在接口节点前面' },
                        ],
                      },
                      {
                        purpose: '鼠标右键空白区域，点击设置公共请求头，导航区域增加公共请求头标签、内容区域出现公共请求头设置内容',
                        precondition: [
                          { id: '1', name: '项目正常' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键空白' },
                          { id: '2', name: '选择设置公共请求头' },
                        ],
                        expectedResults: [
                          { id: '1', name: '导航栏新增公共请求头tab' },
                          { id: '2', name: '内容区显示设置界面' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'tabType为commonHeader' },
                        ],
                        notes: [
                          { id: '1', name: '公共请求头会应用到所有请求' },
                        ],
                      },
                      {
                        purpose: '鼠标右键空白区域，点击粘贴，可以粘贴节点',
                        precondition: [
                          { id: '1', name: '已复制或剪切节点' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键空白' },
                          { id: '2', name: '点击粘贴' },
                        ],
                        expectedResults: [
                          { id: '1', name: '节点粘贴到根目录' },
                          { id: '2', name: '按类型排序' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'handlePasteNode执行' },
                          { id: '2', name: 'Ctrl+V快捷键: Banner.vue:657-658' },
                        ],
                        notes: [
                          { id: '1', name: '粘贴位置根据节点类型确定' },
                        ],
                      },
                    ],
                  },
                  {
                    modelName: '鼠标右键folder节点',
                    description: '鼠标右键folder节点',
                    atomicFunc: [
                      {
                        purpose: '鼠标右键folder节点，出现新建接口、新建文件夹、设置公共请求头、剪切、复制、粘贴(可能置灰)、重命名、删除等功能',
                        precondition: [
                          { id: '1', name: '存在folder节点' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键folder节点' },
                        ],
                        expectedResults: [
                          { id: '1', name: '显示完整的右键菜单' },
                          { id: '2', name: '包含新建、剪切、复制、粘贴、重命名、删除' },
                        ],
                        checkpoints: [
                          { id: '1', name: '菜单选项完整' },
                        ],
                        notes: [
                          { id: '1', name: 'folder右键菜单最完整' },
                        ],
                      },
                      {
                        purpose: '鼠标右键folder节点，点击新建接口(httpNode、websocketNode、httpMockNode、websocketMockNode)、成功后在当前folder内生成节点，并且生成的节点排在末尾',
                        precondition: [
                          { id: '1', name: '存在folder' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键folder' },
                          { id: '2', name: '新建接口' },
                        ],
                        expectedResults: [
                          { id: '1', name: '节点在folder内创建' },
                          { id: '2', name: '排在末尾' },
                        ],
                        checkpoints: [
                          { id: '1', name: '父节点正确' },
                        ],
                        notes: [
                          { id: '1', name: '在folder内创建' },
                        ],
                      },
                      {
                        purpose: '鼠标右键folder节点，点击新建文件夹、成功后在当前folder内生成节点，生成的节点在当前节点最后一个folder节点下面',
                        precondition: [
                          { id: '1', name: 'folder存在' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键新建文件夹' },
                        ],
                        expectedResults: [
                          { id: '1', name: '子folder创建' },
                          { id: '2', name: '排在最后一个子folder下面' },
                        ],
                        checkpoints: [
                          { id: '1', name: '嵌套正确' },
                        ],
                        notes: [
                          { id: '1', name: '支持多级嵌套' },
                        ],
                      },
                      {
                        purpose: '鼠标右键folder节点，点击设置公共请求头，导航区域增加公共请求头标签，标签文案正确、内容区域出现公共请求头设置内容',
                        precondition: [
                          { id: '1', name: 'folder存在' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键选择设置公共请求头' },
                        ],
                        expectedResults: [
                          { id: '1', name: '公共请求头tab打开' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'tab正确' },
                        ],
                        notes: [
                          { id: '1', name: '公共请求头应用范围' },
                        ],
                      },
                      {
                        purpose: '鼠标右键folder节点，点击剪切，被剪切节点样式发生改变，点击粘贴(空白区域、folder节点上)，可以粘贴节点',
                        precondition: [
                          { id: '1', name: 'folder存在' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键剪切' },
                          { id: '2', name: '到目标位置粘贴' },
                        ],
                        expectedResults: [
                          { id: '1', name: '剪切样式显示' },
                          { id: '2', name: '粘贴后原位置移除' },
                          { id: '3', name: '新位置出现' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'handleCutNode: Ctrl+X' },
                          { id: '2', name: 'handlePasteNode执行' },
                        ],
                        notes: [
                          { id: '1', name: '剪切是移动操作' },
                        ],
                      },
                      {
                        purpose: '鼠标右键folder节点，点击复制，点击粘贴(空白区域、folder节点上)，可以粘贴节点',
                        precondition: [
                          { id: '1', name: 'folder存在' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键复制' },
                          { id: '2', name: '粘贴' },
                        ],
                        expectedResults: [
                          { id: '1', name: '原节点保留' },
                          { id: '2', name: '新位置生成副本' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'handleCopyNode: Ctrl+C' },
                        ],
                        notes: [
                          { id: '1', name: '复制保留原节点' },
                        ],
                      },
                      {
                        purpose: '鼠标右键folder节点，点击粘贴，可以按照逻辑(情况一：单个httpNode、websocketNode、httpMockNode、websocketMockNode。情况二:单个folder。情况三：多个非folder节点。情况四：多个纯folder节点。情况五：混合类型节点)粘贴节点',
                        precondition: [
                          { id: '1', name: '已复制/剪切节点' },
                          { id: '2', name: '目标folder存在' },
                        ],
                        operationSteps: [
                          { id: '1', name: '在folder上粘贴' },
                        ],
                        expectedResults: [
                          { id: '1', name: '非folder节点排末尾' },
                          { id: '2', name: 'folder节点排在子folder区域' },
                          { id: '3', name: '混合类型分别排序' },
                        ],
                        checkpoints: [
                          { id: '1', name: '各类型排序规则' },
                        ],
                        notes: [
                          { id: '1', name: '粘贴排序逻辑复杂' },
                        ],
                      },
                      {
                        purpose: '鼠标右键folder节点，点击重命名(或f2)，可以正常重命名',
                        precondition: [
                          { id: '1', name: 'folder存在' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键重命名或F2' },
                        ],
                        expectedResults: [
                          { id: '1', name: '重命名成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: '流程正确' },
                        ],
                        notes: [
                          { id: '1', name: '与其他节点一致' },
                        ],
                      },
                      {
                        purpose: '鼠标右键folder节点，点击删除(或delete)，可以正常删除目录',
                        precondition: [
                          { id: '1', name: 'folder存在' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键删除或Ctrl+D' },
                        ],
                        expectedResults: [
                          { id: '1', name: 'folder及子节点删除' },
                        ],
                        checkpoints: [
                          { id: '1', name: '级联删除' },
                        ],
                        notes: [
                          { id: '1', name: '删除folder会删除所有子节点' },
                        ],
                      },
                    ],
                  },
                  {
                    modelName: '鼠标右键非folder节点',
                    description: '鼠标右键非folder节点',
                    atomicFunc: [
                      {
                        purpose: '鼠标右键非folder节点，出现剪切、复制、生成副本、重命名、删除等功能',
                        precondition: [
                          { id: '1', name: '存在非folder节点' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键非folder节点' },
                        ],
                        expectedResults: [
                          { id: '1', name: '显示精简右键菜单' },
                          { id: '2', name: '无新建选项' },
                          { id: '3', name: '有生成副本选项' },
                        ],
                        checkpoints: [
                          { id: '1', name: '菜单选项正确过滤' },
                        ],
                        notes: [
                          { id: '1', name: '非folder没有新建子节点功能' },
                        ],
                      },
                      {
                        purpose: '鼠标右键非folder节点，点击剪切，被剪切节点样式发生改变，点击粘贴(空白区域、folder节点上)，可以粘贴节点',
                        precondition: [
                          { id: '1', name: '非folder节点存在' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键剪切' },
                          { id: '2', name: '粘贴到目标' },
                        ],
                        expectedResults: [
                          { id: '1', name: '节点移动成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: '剪切移动' },
                        ],
                        notes: [
                          { id: '1', name: 'Ctrl+X快捷键' },
                        ],
                      },
                      {
                        purpose: '鼠标右键非folder节点，点击复制，点击粘贴(空白区域、folder节点上)，可以粘贴节点',
                        precondition: [
                          { id: '1', name: '节点存在' },
                        ],
                        operationSteps: [
                          { id: '1', name: '复制粘贴' },
                        ],
                        expectedResults: [
                          { id: '1', name: '副本创建' },
                        ],
                        checkpoints: [
                          { id: '1', name: '复制保留原节点' },
                        ],
                        notes: [
                          { id: '1', name: 'Ctrl+C快捷键' },
                        ],
                      },
                      {
                        purpose: '鼠标右键非folder节点，点击生成副本，可以在当前节点后面生成副本节点',
                        precondition: [
                          { id: '1', name: '非folder节点存在' },
                        ],
                        operationSteps: [
                          { id: '1', name: '右键选择生成副本' },
                        ],
                        expectedResults: [
                          { id: '1', name: '副本在当前节点后面生成' },
                          { id: '2', name: '名称添加"副本"后缀' },
                        ],
                        checkpoints: [
                          { id: '1', name: '副本位置正确' },
                          { id: '2', name: '数据复制完整' },
                        ],
                        notes: [
                          { id: '1', name: '生成副本是快速复制功能' },
                        ],
                      },
                      {
                        purpose: '鼠标右键非folder节点，点击重命名(或f2)，可以正常重命名',
                        precondition: [
                          { id: '1', name: '节点存在' },
                        ],
                        operationSteps: [
                          { id: '1', name: '重命名' },
                        ],
                        expectedResults: [
                          { id: '1', name: '成功' },
                        ],
                        checkpoints: [
                          { id: '1', name: '正确' },
                        ],
                        notes: [
                          { id: '1', name: 'F2快捷键' },
                        ],
                      },
                      {
                        purpose: '鼠标右键非folder节点，点击删除(或delete)，可以正常删除目录',
                        precondition: [
                          { id: '1', name: '节点存在' },
                        ],
                        operationSteps: [
                          { id: '1', name: '删除' },
                        ],
                        expectedResults: [
                          { id: '1', name: '删除成功' },
                          { id: '2', name: 'tab关闭' },
                        ],
                        checkpoints: [
                          { id: '1', name: 'Ctrl+D快捷键' },
                        ],
                        notes: [
                          { id: '1', name: '删除会关闭对应tab' },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                modelName: '节点树其他情况',
                description: '节点树其他情况',
                atomicFunc: [
                  {
                    purpose: '在根节点新增、粘贴非folder节点，会排序在末尾',
                    precondition: [
                      { id: '1', name: '根目录已有节点' },
                    ],
                    operationSteps: [
                      { id: '1', name: '在根目录新增或粘贴非folder节点' },
                    ],
                    expectedResults: [
                      { id: '1', name: '非folder节点排在根目录末尾' },
                      { id: '2', name: '在所有folder节点之后' },
                    ],
                    checkpoints: [
                      { id: '1', name: '排序规则: folder在前，接口在后' },
                    ],
                    notes: [
                      { id: '1', name: '节点排序规则统一' },
                    ],
                  },
                  {
                    purpose: '在根节点新增、粘贴folder节点，会排序到根目录下最后一个目录节点下面',
                    precondition: [
                      { id: '1', name: '根目录已有folder和接口节点' },
                    ],
                    operationSteps: [
                      { id: '1', name: '新增或粘贴folder到根目录' },
                    ],
                    expectedResults: [
                      { id: '1', name: 'folder排在最后一个folder之后' },
                      { id: '2', name: '在第一个非folder节点之前' },
                    ],
                    checkpoints: [
                      { id: '1', name: 'folder区域和接口区域分开' },
                    ],
                    notes: [
                      { id: '1', name: 'folder始终排在接口前面' },
                    ],
                  },
                  {
                    purpose: '在根节点粘贴包含folder节点的混合节点，folder节点会排序到根目录下最后一个目录节点下面，非folder节点会排序在末尾',
                    precondition: [
                      { id: '1', name: '已复制包含folder和接口的混合节点' },
                    ],
                    operationSteps: [
                      { id: '1', name: '粘贴到根目录' },
                    ],
                    expectedResults: [
                      { id: '1', name: 'folder节点归入folder区域' },
                      { id: '2', name: '接口节点归入接口区域末尾' },
                    ],
                    checkpoints: [
                      { id: '1', name: '混合类型分别排序' },
                    ],
                    notes: [
                      { id: '1', name: '粘贴时自动分类排序' },
                    ],
                  },
                ],
              },
            ],
          },
          {
            modelName: 'banner区域其他功能',
            description: 'banner区域其他功能',
            atomicFunc: [
              {
                purpose: '可左右拖拽banner，需要判断最大和最小宽度，双击需要还原为默认样式',
                precondition: [
                  { id: '1', name: '项目工作区正常加载' },
                ],
                operationSteps: [
                  { id: '1', name: '拖拽banner右边缘调整宽度' },
                  { id: '2', name: '拖拽到最小宽度' },
                  { id: '3', name: '拖拽到最大宽度' },
                  { id: '4', name: '双击边缘' },
                ],
                expectedResults: [
                  { id: '1', name: '宽度随拖拽变化' },
                  { id: '2', name: '不能小于最小宽度' },
                  { id: '3', name: '不能大于最大宽度' },
                  { id: '4', name: '双击还原默认宽度' },
                ],
                checkpoints: [
                  { id: '1', name: '宽度限制正确' },
                  { id: '2', name: '双击还原功能' },
                ],
                notes: [
                  { id: '1', name: '拖拽宽度缓存到localStorage' },
                ],
              },
              {
                purpose: 'httpMockNode启动后，banner节点需要有呼吸小圆点效果',
                precondition: [
                  { id: '1', name: '存在httpMockNode' },
                  { id: '2', name: 'Mock服务已启动' },
                ],
                operationSteps: [
                  { id: '1', name: '启动httpMock服务' },
                  { id: '2', name: '观察banner中对应节点' },
                ],
                expectedResults: [
                  { id: '1', name: '节点显示呼吸小圆点动画' },
                  { id: '2', name: '表示服务正在运行' },
                ],
                checkpoints: [
                  { id: '1', name: '运行状态指示正确' },
                ],
                notes: [
                  { id: '1', name: '视觉反馈Mock服务运行状态' },
                ],
              },
            ],
          },
        ],
      },
      {
        modelName: 'nav',
        description: '工作区导航',
        children: [
          {
            modelName: '项目工作区导航基本样式',
            description: '项目工作区导航基本样式',
            children: [],
          },
          {
            modelName: 'banner与项目工作区导航交互',
            description: 'banner与项目工作区导航交互',
            atomicFunc: [
              {
                purpose: '单击左侧非folder类型节点，右侧导航栏会新增一个tab页签，并且页签为非固定状态，页签中字体为斜体',
                precondition: [
                  { id: '1', name: '存在非folder节点' },
                ],
                operationSteps: [
                  { id: '1', name: '单击非folder节点' },
                ],
                expectedResults: [
                  { id: '1', name: '新增tab页签' },
                  { id: '2', name: 'tab为非固定状态（fixed=false）' },
                  { id: '3', name: '字体为斜体' },
                ],
                checkpoints: [
                  { id: '1', name: 'tab fixed状态' },
                  { id: '2', name: '斜体样式' },
                ],
                notes: [
                  { id: '1', name: '单击预览模式，双击固定模式' },
                ],
              },
              {
                purpose: '双击左侧非folder类型节点，右侧导航栏会新增一个tab页签，并且页签为固定状态，页签中字体正常展示',
                precondition: [
                  { id: '1', name: '存在非folder节点' },
                ],
                operationSteps: [
                  { id: '1', name: '双击非folder节点' },
                ],
                expectedResults: [
                  { id: '1', name: '新增tab页签' },
                  { id: '2', name: 'tab为固定状态（fixed=true）' },
                  { id: '3', name: '字体正常显示' },
                ],
                checkpoints: [
                  { id: '1', name: 'fixed状态正确' },
                ],
                notes: [
                  { id: '1', name: '双击直接固定tab' },
                ],
              },
              {
                purpose: '单击左侧folder类型节点，右侧导航栏不会新增一个tab页签',
                precondition: [
                  { id: '1', name: '存在folder节点' },
                ],
                operationSteps: [
                  { id: '1', name: '单击folder节点' },
                ],
                expectedResults: [
                  { id: '1', name: '不新增tab' },
                  { id: '2', name: 'folder展开/收起' },
                ],
                checkpoints: [
                  { id: '1', name: 'folder不创建tab' },
                ],
                notes: [
                  { id: '1', name: 'folder只能展开收起' },
                ],
              },
              {
                purpose: '单击左侧非folder类型节点A，再点击左侧folder类型节点B，节点B的tab会覆盖节点A的tab',
                precondition: [
                  { id: '1', name: '存在非folder节点A' },
                  { id: '2', name: '存在非folder节点B' },
                ],
                operationSteps: [
                  { id: '1', name: '单击节点A' },
                  { id: '2', name: '单击节点B' },
                ],
                expectedResults: [
                  { id: '1', name: 'A的tab被B覆盖' },
                  { id: '2', name: '只有一个非固定tab' },
                ],
                checkpoints: [
                  { id: '1', name: '预览tab覆盖逻辑' },
                ],
                notes: [
                  { id: '1', name: '非固定tab会被覆盖' },
                ],
              },
              {
                purpose: 'tab页签存在固定页签和非固定页签，当前选中页签可以是固定也可以是非固定的，单击左侧非folder类型节点，会选中并覆盖未固定页签，并且也是未固定的',
                precondition: [
                  { id: '1', name: '存在固定和非固定tab' },
                ],
                operationSteps: [
                  { id: '1', name: '单击新节点' },
                ],
                expectedResults: [
                  { id: '1', name: '覆盖非固定tab' },
                  { id: '2', name: '保持非固定状态' },
                ],
                checkpoints: [
                  { id: '1', name: '覆盖逻辑正确' },
                ],
                notes: [
                  { id: '1', name: '只覆盖非固定tab' },
                ],
              },
              {
                purpose: 'tab页签存在固定页签和非固定页签，当前选中页签可以是固定也可以是非固定的，双击左侧非folder类型节点，会选中并覆盖未固定页签，并且是固定的',
                precondition: [
                  { id: '1', name: '存在非固定tab' },
                ],
                operationSteps: [
                  { id: '1', name: '双击新节点' },
                ],
                expectedResults: [
                  { id: '1', name: '覆盖非固定tab' },
                  { id: '2', name: '变为固定状态' },
                ],
                checkpoints: [
                  { id: '1', name: '双击固定覆盖' },
                ],
                notes: [
                  { id: '1', name: '双击将tab固定' },
                ],
              },
              {
                purpose: 'banner新增一个节点会在右侧导航栏新增一个tab页签，页签位置在当前激活页签右侧',
                precondition: [
                  { id: '1', name: '项目正常加载' },
                ],
                operationSteps: [
                  { id: '1', name: '新建节点' },
                ],
                expectedResults: [
                  { id: '1', name: 'tab新增在当前激活tab右侧' },
                  { id: '2', name: '新tab被选中' },
                ],
                checkpoints: [
                  { id: '1', name: 'tab插入位置' },
                ],
                notes: [
                  { id: '1', name: 'apidocTabsStore.addTab' },
                ],
              },
              {
                purpose: '删除banner节点，右侧导航栏删除对应tab页签',
                precondition: [
                  { id: '1', name: '节点已打开tab' },
                ],
                operationSteps: [
                  { id: '1', name: '删除节点' },
                ],
                expectedResults: [
                  { id: '1', name: '对应tab关闭' },
                  { id: '2', name: '选中相邻tab' },
                ],
                checkpoints: [
                  { id: '1', name: 'tab同步删除' },
                ],
                notes: [
                  { id: '1', name: '删除节点自动关闭tab' },
                ],
              },
              {
                purpose: '重命名banner节点，右侧导航栏对应tab页签字体更新',
                precondition: [
                  { id: '1', name: '节点已打开tab' },
                ],
                operationSteps: [
                  { id: '1', name: '重命名节点' },
                ],
                expectedResults: [
                  { id: '1', name: 'tab名称同步更新' },
                ],
                checkpoints: [
                  { id: '1', name: '名称同步' },
                ],
                notes: [
                  { id: '1', name: 'tab标题与节点名称绑定' },
                ],
              },
              {
                purpose: '点击tab页签，左侧banner节点高亮，若无节点相关tab页签被选中，则取消banner高亮',
                precondition: [
                  { id: '1', name: '存在多个tab' },
                ],
                operationSteps: [
                  { id: '1', name: '点击不同tab' },
                  { id: '2', name: '点击非节点tab（如变量）' },
                ],
                expectedResults: [
                  { id: '1', name: '对应banner节点高亮' },
                  { id: '2', name: '非节点tab时取消高亮' },
                ],
                checkpoints: [
                  { id: '1', name: 'banner选中状态同步' },
                ],
                notes: [
                  { id: '1', name: 'tab与banner节点联动' },
                ],
              },
            ],
          },
          {
            modelName: 'tab操作',
            description: 'tab操作',
            children: [],
          },
          {
            modelName: 'tab拖拽',
            description: 'tab拖拽',
            children: [],
          },
        ],
      },
      {
        modelName: 'httpNode工作区',
        description: 'httpNode工作区',
        children: [
          {
            modelName: 'operation',
            description: '操作区域',
            children: [
              {
                modelName: '请求方法录入区域',
                description: '请求方法录入区域',
                atomicFunc: [
                  {
                    purpose: '正确展示GET, POST, PUT, DEL, PATCH, HEAD, OPTIONS,选择或者点击空白区域下拉菜单消失',
                    precondition: [
                      { id: '1', name: '打开httpNode节点' },
                    ],
                    operationSteps: [
                      { id: '1', name: '点击请求方法下拉框' },
                      { id: '2', name: '观察下拉选项' },
                      { id: '3', name: '选择一个方法或点击空白区域' },
                    ],
                    expectedResults: [
                      { id: '1', name: '显示7种HTTP方法' },
                      { id: '2', name: '选择后下拉框关闭' },
                      { id: '3', name: '点击空白区域下拉框关闭' },
                    ],
                    checkpoints: [
                      { id: '1', name: '方法列表完整' },
                      { id: '2', name: '下拉交互正确' },
                    ],
                    notes: [
                      { id: '1', name: 'HTTP方法使用el-select组件' },
                    ],
                  },
                  {
                    purpose: '切换请求方法不会改变banner节点中的请求方法、也不会改变nav栏节点中的请求方法，只有保存后才会生效',
                    precondition: [
                      { id: '1', name: 'httpNode已打开' },
                    ],
                    operationSteps: [
                      { id: '1', name: '切换请求方法' },
                      { id: '2', name: '观察banner和nav' },
                      { id: '3', name: '保存后再观察' },
                    ],
                    expectedResults: [
                      { id: '1', name: '切换时banner/nav不变' },
                      { id: '2', name: '保存后banner/nav更新' },
                    ],
                    checkpoints: [
                      { id: '1', name: '未保存状态隔离' },
                      { id: '2', name: '保存后同步' },
                    ],
                    notes: [
                      { id: '1', name: '编辑状态与持久化状态分离' },
                    ],
                  },
                  {
                    purpose: '切换所有请求方法，点击发送请求，调用测试服务器/echo接口，返回method为选中的method',
                    precondition: [
                      { id: '1', name: '测试服务器运行' },
                      { id: '2', name: 'url配置正确' },
                    ],
                    operationSteps: [
                      { id: '1', name: '依次选择GET/POST/PUT/DEL等方法' },
                      { id: '2', name: '每次发送请求' },
                      { id: '3', name: '检查响应中的method' },
                    ],
                    expectedResults: [
                      { id: '1', name: '响应method与选择一致' },
                    ],
                    checkpoints: [
                      { id: '1', name: '请求方法正确传递' },
                    ],
                    notes: [
                      { id: '1', name: 'echo接口会返回请求信息' },
                    ],
                  },
                ],
              },
              {
                modelName: '请求url录入区域',
                description: '请求url录入区域',
                atomicFunc: [
                  {
                    purpose: '输入http://localhost:{环境变量中的端口}/echo,点击发送请求，调用测试服务器/echo接口，成功返回',
                    precondition: [
                      { id: '1', name: '环境变量中配置端口' },
                      { id: '2', name: '测试服务器运行' },
                    ],
                    operationSteps: [
                      { id: '1', name: '输入带变量的url' },
                      { id: '2', name: '发送请求' },
                    ],
                    expectedResults: [
                      { id: '1', name: '变量正确解析' },
                      { id: '2', name: '请求成功返回' },
                    ],
                    checkpoints: [
                      { id: '1', name: '{{变量}}语法解析' },
                      { id: '2', name: 'localhost解析' },
                    ],
                    notes: [
                      { id: '1', name: '变量使用{{name}}格式' },
                    ],
                  },
                  {
                    purpose: '输入http://127.0.0.1:{环境变量中的端口}/echo,点击发送请求，调用测试服务器/echo接口，成功返回',
                    precondition: [
                      { id: '1', name: '环境变量配置正确' },
                    ],
                    operationSteps: [
                      { id: '1', name: '使用127.0.0.1格式url' },
                      { id: '2', name: '发送请求' },
                    ],
                    expectedResults: [
                      { id: '1', name: '请求成功' },
                    ],
                    checkpoints: [
                      { id: '1', name: 'IP格式解析' },
                    ],
                    notes: [
                      { id: '1', name: '127.0.0.1等同localhost' },
                    ],
                  },
                  {
                    purpose: '定义一个localUrl变量，输入http://{{ localUrl }}:{环境变量中的端口}/echo,点击发送请求，调用测试服务器/echo接口，成功返回',
                    precondition: [
                      { id: '1', name: '定义localUrl变量（如localhost）' },
                      { id: '2', name: '定义端口变量' },
                    ],
                    operationSteps: [
                      { id: '1', name: '输入包含多个变量的url' },
                      { id: '2', name: '发送请求' },
                    ],
                    expectedResults: [
                      { id: '1', name: '多个变量都正确解析' },
                      { id: '2', name: '请求成功' },
                    ],
                    checkpoints: [
                      { id: '1', name: '多变量解析' },
                    ],
                    notes: [
                      { id: '1', name: '支持url中使用多个变量' },
                    ],
                  },
                  {
                    purpose: '输入127.0.0.1:{环境变量中的端口}/echo(没有协议自动添加http), 点击发送请求，调用测试服务器/echo接口，成功返回',
                    precondition: [
                      { id: '1', name: '配置正确' },
                    ],
                    operationSteps: [
                      { id: '1', name: '输入无协议的url' },
                      { id: '2', name: '发送请求' },
                    ],
                    expectedResults: [
                      { id: '1', name: '自动添加http协议' },
                      { id: '2', name: '请求成功' },
                    ],
                    checkpoints: [
                      { id: '1', name: '协议自动补全' },
                    ],
                    notes: [
                      { id: '1', name: '默认使用http协议' },
                    ],
                  },
                  {
                    purpose: '输入127.0.0.1:{环境变量中的端口}/echo?id=3&name=lee, blur后，url结果为http://127.0.0.1:{环境变量中的端口}/echo，id和name会出现在query参数中',
                    precondition: [
                      { id: '1', name: 'httpNode已打开' },
                    ],
                    operationSteps: [
                      { id: '1', name: '输入带query参数的url' },
                      { id: '2', name: '触发blur事件' },
                      { id: '3', name: '查看url和query参数区域' },
                    ],
                    expectedResults: [
                      { id: '1', name: 'url中query参数被提取' },
                      { id: '2', name: 'id=3出现在query参数区域' },
                      { id: '3', name: 'name=lee出现在query参数区域' },
                    ],
                    checkpoints: [
                      { id: '1', name: 'query参数自动解析' },
                      { id: '2', name: 'url与query同步' },
                    ],
                    notes: [
                      { id: '1', name: 'blur时解析url中的query参数' },
                    ],
                  },
                  {
                    purpose: '输入127.0.0.1:{环境变量中的端口}/echo?id=3&name=lee, blur后，url结果为http://127.0.0.1:{环境变量中的端口}/echo，id和name会出现在query参数中，点击发送请求，返回结果中url和query参数正确',
                    precondition: [
                      { id: '1', name: '测试服务器运行' },
                    ],
                    operationSteps: [
                      { id: '1', name: '输入带query的url并blur' },
                      { id: '2', name: '发送请求' },
                      { id: '3', name: '检查响应' },
                    ],
                    expectedResults: [
                      { id: '1', name: '请求url正确' },
                      { id: '2', name: '响应中query参数正确' },
                    ],
                    checkpoints: [
                      { id: '1', name: 'query参数正确发送' },
                    ],
                    notes: [
                      { id: '1', name: 'echo接口返回完整请求信息' },
                    ],
                  },
                  {
                    purpose: '输入127.0.0.1:{环境变量中的端口}/echo/{userId}/posts/{postId}，userId和postId会出现在query参数中，点击发送请求，返回结果中url和path参数正确',
                    precondition: [
                      { id: '1', name: '测试服务器运行' },
                    ],
                    operationSteps: [
                      { id: '1', name: '输入带path参数的url' },
                      { id: '2', name: '查看path参数区域' },
                      { id: '3', name: '填写参数值并发送' },
                    ],
                    expectedResults: [
                      { id: '1', name: 'userId和postId出现在path参数区域' },
                      { id: '2', name: 'url中{userId}和{postId}被替换' },
                      { id: '3', name: '响应中path参数正确' },
                    ],
                    checkpoints: [
                      { id: '1', name: 'path参数自动解析' },
                      { id: '2', name: '参数替换正确' },
                    ],
                    notes: [
                      { id: '1', name: 'path参数使用{name}格式' },
                    ],
                  },
                ],
              },
              {
                modelName: '请求url展示区域',
                description: '请求url展示区域',
                children: [],
              },
              {
                modelName: '请求操作区域',
                description: '请求操作区域',
                children: [],
              },
            ],
          },
          {
            modelName: 'inputArea',
            description: '录入区域',
            children: [
              {
                modelName: 'query',
                description: 'Query参数',
                children: [],
              },
              {
                modelName: 'body',
                description: '请求体',
                children: [],
              },
              {
                modelName: 'header',
                description: '请求头',
                children: [],
              },
              {
                modelName: 'preScript',
                description: '前置脚本',
                children: [],
              },
              {
                modelName: 'afterScript',
                description: '后置脚本',
                children: [],
              },
              {
                modelName: 'remark',
                description: '备注',
                children: [],
              },
            ],
          },
          {
            modelName: 'settings',
            description: '设置',
            children: [
              {
                modelName: 'responseInfo',
                description: '返回信息',
                children: [
                  {
                    modelName: 'responseValue',
                    description: '返回值',
                    children: [],
                  },
                  {
                    modelName: 'responseHeader',
                    description: '返回头',
                    children: [],
                  },
                  {
                    modelName: 'responseCookie',
                    description: '返回cookie',
                    children: [],
                  },
                  {
                    modelName: 'rawValue',
                    description: '原始值',
                    children: [],
                  },
                ],
              },
              {
                modelName: 'basicInfo',
                description: '基础信息',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
];
