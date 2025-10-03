import type { ModuleTreeNode, TestModule } from '../types'

// 测试模块Mock数据
export const testModulesData: TestModule[] = [
  {
    id: 'module-001',
    name: '项目管理',
    testCases: [
      // ==================== 基础功能测试用例（离线+在线） ====================
      {
        id: 'tc-001',
        name: '【离线模式】基础项目创建流程',
        steps: [
          { description: '确认当前处于离线模式（offline）', expectedResult: '界面不显示成员管理相关功能' },
          { description: '点击"新建项目"按钮', expectedResult: '弹出项目创建对话框' },
          { description: '输入项目名称"离线测试项目001"', expectedResult: '项目名称输入框显示输入内容' },
          { description: '确认对话框中不显示"选择成员或组"选项', expectedResult: '对话框中只有项目名称输入框' },
          { description: '点击"确定"按钮', expectedResult: '项目创建成功，自动跳转到项目编辑页面' }
        ],
        results: [
          { description: '项目成功创建并保存到本地缓存' },
          { description: '自动跳转到项目编辑页面，URL包含项目ID和名称' },
          { description: '项目模式为edit模式' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-002',
        name: '【在线模式】基础项目创建流程',
        steps: [
          { description: '确认当前处于在线模式（online）', expectedResult: '界面显示"团队管理"标签页' },
          { description: '点击"新建项目"按钮', expectedResult: '弹出项目创建对话框' },
          { description: '输入项目名称"在线测试项目001"', expectedResult: '项目名称输入框显示输入内容' },
          { description: '不添加任何成员，直接点击"确定"按钮', expectedResult: '发送API请求创建项目' }
        ],
        results: [
          { description: '项目创建成功，返回项目ID' },
          { description: '自动跳转到项目编辑页面' },
          { description: '项目信息正确显示在项目列表中' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-003',
        name: '【在线模式】创建项目并添加单个用户成员',
        steps: [
          { description: '点击"新建项目"按钮', expectedResult: '弹出项目创建对话框' },
          { description: '输入项目名称"多人协作项目"', expectedResult: '项目名称输入框显示输入内容' },
          { description: '在"选择成员或组"搜索框中输入用户名"张三"', expectedResult: '显示远程搜索结果列表' },
          { description: '点击搜索结果中的用户"张三"', expectedResult: '用户添加到成员列表中，默认权限为"读写"' },
          { description: '在成员列表中确认显示用户"张三"，类型标签为"用户"', expectedResult: '成员信息正确显示' },
          { description: '点击"确定"按钮', expectedResult: '项目创建成功，包含成员信息' }
        ],
        results: [
          { description: '项目创建成功' },
          { description: '用户"张三"显示在项目成员列表中，权限为"读写"' },
          { description: '成员类型正确标记为"用户"' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-004',
        name: '【在线模式】创建项目并添加组成员',
        steps: [
          { description: '点击"新建项目"按钮', expectedResult: '弹出项目创建对话框' },
          { description: '输入项目名称"团队协作项目"', expectedResult: '项目名称输入框显示输入内容' },
          { description: '在"选择成员或组"搜索框中输入组名"开发组"', expectedResult: '显示远程搜索结果列表' },
          { description: '点击搜索结果中的组"开发组"', expectedResult: '组添加到成员列表中' },
          { description: '确认组成员的权限列显示为"/"', expectedResult: '组成员不显示权限选择器' },
          { description: '点击"确定"按钮', expectedResult: '项目创建成功，包含组成员' }
        ],
        results: [
          { description: '项目创建成功' },
          { description: '组"开发组"显示在项目成员列表中' },
          { description: '成员类型正确标记为"组"，显示绿色标签' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-005',
        name: '【在线模式】创建项目并添加多个成员（用户+组）',
        steps: [
          { description: '点击"新建项目"按钮', expectedResult: '弹出项目创建对话框' },
          { description: '输入项目名称"大型协作项目"', expectedResult: '项目名称输入框显示输入内容' },
          { description: '搜索并添加用户"张三"，设置权限为"管理员"', expectedResult: '用户"张三"添加成功，权限为管理员' },
          { description: '搜索并添加用户"李四"，保持默认权限"读写"', expectedResult: '用户"李四"添加成功，权限为读写' },
          { description: '搜索并添加组"测试组"', expectedResult: '组"测试组"添加成功' },
          { description: '搜索并添加用户"王五"，设置权限为"只读"', expectedResult: '用户"王五"添加成功，权限为只读' },
          { description: '点击"确定"按钮', expectedResult: '项目创建成功，包含所有成员' }
        ],
        results: [
          { description: '项目创建成功' },
          { description: '成员列表显示4个成员：张三（管理员）、李四（读写）、测试组（组）、王五（只读）' },
          { description: '所有成员信息和权限正确保存' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-006',
        name: '【离线模式】编辑项目名称',
        steps: [
          { description: '在离线模式下，找到已存在的项目"离线测试项目001"', expectedResult: '项目显示在列表中' },
          { description: '点击项目卡片上的"编辑"图标按钮', expectedResult: '弹出编辑项目对话框' },
          { description: '将项目名称修改为"离线测试项目001-已修改"', expectedResult: '输入框显示新的项目名称' },
          { description: '点击"确定"按钮', expectedResult: '项目名称更新成功' }
        ],
        results: [
          { description: '对话框关闭' },
          { description: '项目列表刷新，显示新的项目名称"离线测试项目001-已修改"' },
          { description: '修改保存到本地缓存' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-007',
        name: '【在线模式】编辑项目名称',
        steps: [
          { description: '在在线模式下，找到已存在的项目"在线测试项目001"', expectedResult: '项目显示在列表中' },
          { description: '点击项目卡片上的"编辑"图标按钮', expectedResult: '弹出编辑项目对话框' },
          { description: '将项目名称修改为"在线测试项目001-V2"', expectedResult: '输入框显示新的项目名称' },
          { description: '点击"确定"按钮', expectedResult: '发送API请求更新项目' }
        ],
        results: [
          { description: '项目名称更新成功' },
          { description: '项目列表刷新，显示新名称' },
          { description: '如果项目在顶部tab中打开，tab标题也同步更新' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-008',
        name: '【离线模式】删除项目',
        steps: [
          { description: '在离线模式下，找到要删除的项目"离线测试项目002"', expectedResult: '项目显示在列表中' },
          { description: '点击项目卡片上的"删除"图标按钮', expectedResult: '弹出确认删除对话框' },
          { description: '在确认对话框中点击"确定"按钮', expectedResult: '项目从本地缓存中删除' }
        ],
        results: [
          { description: '确认对话框关闭' },
          { description: '项目从列表中移除' },
          { description: '如果项目在编辑状态打开，对应的tab也被关闭' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-009',
        name: '【在线模式】删除项目',
        steps: [
          { description: '在在线模式下，找到要删除的项目"临时测试项目"', expectedResult: '项目显示在列表中' },
          { description: '点击项目卡片上的"删除"图标按钮', expectedResult: '弹出确认删除对话框，提示"确定要删除此项目吗？"' },
          { description: '在确认对话框中点击"确定"按钮', expectedResult: '发送API请求删除项目' }
        ],
        results: [
          { description: '项目删除成功' },
          { description: '项目从列表中移除' },
          { description: '发送IPC事件通知topBarView删除对应tab' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-010',
        name: '【在线模式】删除项目-取消操作',
        steps: [
          { description: '找到要删除的项目"重要项目"', expectedResult: '项目显示在列表中' },
          { description: '点击项目卡片上的"删除"图标按钮', expectedResult: '弹出确认删除对话框' },
          { description: '在确认对话框中点击"取消"按钮', expectedResult: '对话框关闭，不执行删除操作' }
        ],
        results: [
          { description: '对话框关闭' },
          { description: '项目仍然保留在列表中' },
          { description: '未发送任何删除请求' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },

      // ==================== 收藏功能测试用例 ====================
      {
        id: 'tc-011',
        name: '【离线模式】收藏项目',
        steps: [
          { description: '在离线模式下，找到未收藏的项目"离线项目A"', expectedResult: '项目显示空心星标图标' },
          { description: '点击项目卡片上的空心星标图标', expectedResult: '图标变为实心黄色星标' }
        ],
        results: [
          { description: '项目收藏状态更新为已收藏' },
          { description: '项目出现在"收藏的项目"区域' },
          { description: '收藏状态保存到本地缓存' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-012',
        name: '【离线模式】取消收藏项目',
        steps: [
          { description: '在离线模式下，找到已收藏的项目"离线项目A"', expectedResult: '项目显示实心黄色星标图标' },
          { description: '点击项目卡片上的实心星标图标', expectedResult: '图标变为空心星标' }
        ],
        results: [
          { description: '项目收藏状态更新为未收藏' },
          { description: '项目从"收藏的项目"区域移除' },
          { description: '项目仍显示在"全部项目"区域' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-013',
        name: '【在线模式】收藏项目',
        steps: [
          { description: '在在线模式下，找到未收藏的项目"在线项目B"', expectedResult: '项目显示空心星标图标' },
          { description: '点击项目卡片上的空心星标图标', expectedResult: '显示加载动画，发送收藏API请求' }
        ],
        results: [
          { description: 'API请求成功，项目收藏状态更新' },
          { description: '图标变为实心黄色星标' },
          { description: '项目出现在"收藏的项目"区域' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-014',
        name: '【在线模式】取消收藏项目',
        steps: [
          { description: '在在线模式下，找到已收藏的项目"在线项目B"', expectedResult: '项目显示实心黄色星标图标' },
          { description: '点击项目卡片上的实心星标图标', expectedResult: '显示加载动画，发送取消收藏API请求' }
        ],
        results: [
          { description: 'API请求成功，项目收藏状态更新' },
          { description: '图标变为空心星标' },
          { description: '项目从"收藏的项目"区域移除' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },

      // ==================== 搜索功能测试用例 ====================
      {
        id: 'tc-015',
        name: '【通用】基础搜索-按项目名称搜索',
        steps: [
          { description: '在项目列表页面的搜索框中输入"测试"', expectedResult: '实时过滤显示项目名称包含"测试"的项目' },
          { description: '确认搜索结果中项目名称都包含"测试"关键字', expectedResult: '所有结果项目名称高亮显示"测试"' },
          { description: '清空搜索框', expectedResult: '显示所有项目' }
        ],
        results: [
          { description: '搜索功能正常工作' },
          { description: '搜索结果准确匹配' },
          { description: '清空后恢复所有项目显示' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-016',
        name: '【通用】基础搜索-搜索结果为空',
        steps: [
          { description: '在项目列表页面的搜索框中输入"不存在的项目名xyz123"', expectedResult: '项目列表为空' },
          { description: '确认"收藏的项目"和"全部项目"区域都为空', expectedResult: '不显示任何项目卡片' }
        ],
        results: [
          { description: '搜索功能正确处理无结果情况' },
          { description: '界面显示为空，不报错' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-017',
        name: '【通用】高级搜索-打开高级搜索面板',
        steps: [
          { description: '在基础搜索框右侧找到"高级搜索"图标（工具图标）', expectedResult: '图标显示为灰色' },
          { description: '点击"高级搜索"图标', expectedResult: '图标变为蓝色，下方展开高级搜索输入框' },
          { description: '确认高级搜索输入框显示，占位符为"输入接口url eg: 接口url"', expectedResult: '高级搜索输入框正确显示' }
        ],
        results: [
          { description: '高级搜索面板成功打开' },
          { description: '界面状态正确更新' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-018',
        name: '【离线模式】高级搜索-按接口URL搜索',
        steps: [
          { description: '打开高级搜索面板', expectedResult: '显示高级搜索输入框' },
          { description: '在高级搜索框中输入"/api/user"', expectedResult: '输入内容显示在搜索框中' },
          { description: '点击"搜索"按钮或按回车', expectedResult: '显示加载状态，执行本地搜索' }
        ],
        results: [
          { description: '在本地文档中搜索URL包含"/api/user"的接口' },
          { description: '显示包含匹配接口的项目列表' },
          { description: '搜索结果正确显示' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-019',
        name: '【在线模式】高级搜索-按接口URL搜索',
        steps: [
          { description: '打开高级搜索面板', expectedResult: '显示高级搜索输入框' },
          { description: '在高级搜索框中输入"/api/product"', expectedResult: '输入内容显示在搜索框中' },
          { description: '点击"搜索"按钮', expectedResult: '显示加载状态，发送API请求' }
        ],
        results: [
          { description: '调用/api/project/project_list_by_keyword接口' },
          { description: '显示包含匹配关键字的项目列表' },
          { description: '搜索结果从服务器返回并正确显示' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-020',
        name: '【离线模式】高级搜索-按创建者搜索',
        steps: [
          { description: '打开高级搜索面板', expectedResult: '显示高级搜索输入框' },
          { description: '在高级搜索框中输入创建者名称"张三"', expectedResult: '输入内容显示在搜索框中' },
          { description: '点击"搜索"按钮', expectedResult: '显示加载状态，执行本地搜索' }
        ],
        results: [
          { description: '搜索创建者名称包含"张三"的文档' },
          { description: '显示包含匹配文档的项目列表' },
          { description: '搜索结果正确显示' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-021',
        name: '【通用】高级搜索-清空搜索条件',
        steps: [
          { description: '在高级搜索状态下，显示搜索结果', expectedResult: '项目列表显示搜索结果' },
          { description: '清空高级搜索输入框内容', expectedResult: '输入框变为空' },
          { description: '等待防抖时间（1秒）', expectedResult: '自动恢复显示所有项目' }
        ],
        results: [
          { description: '搜索条件清空' },
          { description: '项目列表恢复显示所有项目' },
          { description: '高级搜索面板保持打开状态' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },

      // ==================== UI交互功能测试用例 ====================
      {
        id: 'tc-022',
        name: '【通用】折叠全部项目列表',
        steps: [
          { description: '确认"全部项目"区域当前是展开状态，显示所有项目', expectedResult: '可以看到项目卡片列表' },
          { description: '点击"全部项目(数量)"标题', expectedResult: '图标从向下箭头变为向右箭头' }
        ],
        results: [
          { description: '全部项目列表折叠，不显示项目卡片' },
          { description: '折叠状态保存到localStorage，key为"doc-list/isFold"' },
          { description: '页面刷新后保持折叠状态' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-023',
        name: '【通用】展开全部项目列表',
        steps: [
          { description: '确认"全部项目"区域当前是折叠状态', expectedResult: '不显示项目卡片，图标为向右箭头' },
          { description: '点击"全部项目(数量)"标题', expectedResult: '图标从向右箭头变为向下箭头' }
        ],
        results: [
          { description: '全部项目列表展开，显示所有项目卡片' },
          { description: '展开状态保存到localStorage' },
          { description: '页面刷新后保持展开状态' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-024',
        name: '【通用】项目信息展示验证',
        steps: [
          { description: '在项目列表中找到任意项目卡片', expectedResult: '项目卡片正确显示' },
          { description: '验证卡片显示项目名称', expectedResult: '项目名称正确显示，超长名称显示省略号' },
          { description: '验证卡片显示创建者信息', expectedResult: '显示"创建者: 姓名"' },
          { description: '验证卡片显示更新时间', expectedResult: '显示"最新更新: 时间"，格式化显示' },
          { description: '验证卡片显示接口数', expectedResult: '显示"接口数: X"，数字为青色' }
        ],
        results: [
          { description: '项目信息完整显示' },
          { description: '所有字段格式正确' },
          { description: '界面布局美观' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-025',
        name: '【离线模式】跳转到项目编辑页面',
        steps: [
          { description: '在离线模式项目列表中找到项目"离线项目A"', expectedResult: '项目卡片正确显示' },
          { description: '点击项目卡片底部的"编辑"按钮', expectedResult: '页面跳转到项目编辑页面' }
        ],
        results: [
          { description: '成功跳转到/v1/apidoc/doc-edit路由' },
          { description: 'URL包含query参数: id、name、mode=edit' },
          { description: 'store中的projectId更新为当前项目ID' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-026',
        name: '【在线模式】跳转到项目编辑页面',
        steps: [
          { description: '在在线模式项目列表中找到项目"在线项目B"', expectedResult: '项目卡片正确显示' },
          { description: '点击项目卡片底部的"编辑"按钮', expectedResult: '发送访问记录API请求，页面跳转' }
        ],
        results: [
          { description: '调用/api/project/visited接口记录访问' },
          { description: '成功跳转到项目编辑页面' },
          { description: 'URL包含正确的项目信息和mode=edit' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-027',
        name: '【在线模式】跳转到项目预览页面',
        steps: [
          { description: '在在线模式项目列表中找到项目"在线项目B"', expectedResult: '项目卡片正确显示，有"预览"按钮' },
          { description: '点击项目卡片底部的"预览"按钮', expectedResult: '发送访问记录API请求，页面跳转' }
        ],
        results: [
          { description: '调用/api/project/visited接口记录访问' },
          { description: '成功跳转到项目预览页面' },
          { description: 'URL包含mode=view参数，表示预览模式' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-028',
        name: '【离线模式】确认不显示预览按钮',
        steps: [
          { description: '在离线模式下查看项目列表', expectedResult: '所有项目卡片正确显示' },
          { description: '检查项目卡片底部按钮区域', expectedResult: '只显示"编辑"按钮' },
          { description: '确认没有"预览"按钮', expectedResult: '离线模式下不提供预览功能' }
        ],
        results: [
          { description: '离线模式正确隐藏预览按钮' },
          { description: '界面符合离线模式的功能限制' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },

      // ==================== 成员管理功能测试用例（仅在线模式） ====================
      {
        id: 'tc-029',
        name: '【在线模式】打开成员管理对话框',
        steps: [
          { description: '在在线模式项目列表中找到项目"多人协作项目"', expectedResult: '项目卡片正确显示' },
          { description: '点击项目卡片操作区的"成员管理"图标（用户图标）', expectedResult: '弹出成员管理对话框' }
        ],
        results: [
          { description: '成员管理对话框成功打开' },
          { description: '显示当前项目的所有成员列表' },
          { description: '对话框标题显示项目名称' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-030',
        name: '【在线模式】修改成员权限',
        steps: [
          { description: '打开项目"多人协作项目"的成员管理对话框', expectedResult: '对话框显示成员列表' },
          { description: '找到成员"李四"，当前权限为"读写"', expectedResult: '权限下拉框显示"读写"' },
          { description: '点击权限下拉框，选择"管理员"', expectedResult: '下拉框显示可选权限：只读、读写、管理员' },
          { description: '选择"管理员"选项', expectedResult: '权限更新为"管理员"' },
          { description: '点击"保存"按钮', expectedResult: '发送API请求更新成员权限' }
        ],
        results: [
          { description: '成员权限更新成功' },
          { description: '对话框关闭' },
          { description: '下次打开成员管理对话框时，显示更新后的权限' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-031',
        name: '【在线模式】从项目中移除成员',
        steps: [
          { description: '打开项目"大型协作项目"的成员管理对话框', expectedResult: '对话框显示成员列表' },
          { description: '找到成员"王五"', expectedResult: '成员"王五"显示在列表中' },
          { description: '点击成员行的"移除"按钮', expectedResult: '弹出确认对话框' },
          { description: '在确认对话框中点击"确定"', expectedResult: '发送API请求移除成员' }
        ],
        results: [
          { description: '成员"王五"从项目中移除' },
          { description: '成员列表刷新，不再显示"王五"' },
          { description: 'API请求成功' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-032',
        name: '【在线模式】向项目添加新成员',
        steps: [
          { description: '打开项目"在线测试项目001-V2"的成员管理对话框', expectedResult: '对话框显示当前成员列表' },
          { description: '在"添加成员"搜索框中输入用户名"赵六"', expectedResult: '显示远程搜索结果' },
          { description: '点击搜索结果中的用户"赵六"', expectedResult: '用户添加到待添加列表' },
          { description: '设置用户"赵六"的权限为"读写"', expectedResult: '权限选择器显示"读写"' },
          { description: '点击"保存"按钮', expectedResult: '发送API请求添加成员' }
        ],
        results: [
          { description: '用户"赵六"成功添加到项目' },
          { description: '成员列表刷新，显示新成员' },
          { description: '新成员的权限正确保存' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },

      // ==================== 异常和边界场景测试用例 ====================
      {
        id: 'tc-033',
        name: '【通用】创建项目-项目名称为空验证',
        steps: [
          { description: '点击"新建项目"按钮', expectedResult: '弹出项目创建对话框' },
          { description: '不输入项目名称，直接点击"确定"按钮', expectedResult: '触发表单验证' }
        ],
        results: [
          { description: '显示错误提示："请填写项目名称"' },
          { description: '项目名称输入框标记为错误状态（红色边框）' },
          { description: '对话框不关闭，不创建项目' },
          { description: '输入框自动获得焦点' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-034',
        name: '【通用】创建项目-项目名称包含特殊字符',
        steps: [
          { description: '点击"新建项目"按钮', expectedResult: '弹出项目创建对话框' },
          { description: '输入项目名称"测试项目<script>alert(1)</script>"', expectedResult: '项目名称输入框显示输入内容' },
          { description: '点击"确定"按钮', expectedResult: '项目创建流程执行' }
        ],
        results: [
          { description: '项目创建成功' },
          { description: '项目名称正确保存和显示，特殊字符被转义处理' },
          { description: '不触发XSS攻击' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-035',
        name: '【通用】创建项目-超长项目名称',
        steps: [
          { description: '点击"新建项目"按钮', expectedResult: '弹出项目创建对话框' },
          { description: '输入超长项目名称（200个字符）', expectedResult: '项目名称输入框显示输入内容' },
          { description: '点击"确定"按钮', expectedResult: '项目创建流程执行' }
        ],
        results: [
          { description: '项目创建成功' },
          { description: '项目列表中项目名称显示省略号，鼠标悬停显示完整名称' },
          { description: '项目名称完整保存在数据库中' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-036',
        name: '【通用】编辑项目-清空项目名称验证',
        steps: [
          { description: '打开编辑项目对话框', expectedResult: '对话框显示当前项目名称' },
          { description: '清空项目名称输入框', expectedResult: '输入框变为空' },
          { description: '点击"确定"按钮', expectedResult: '触发表单验证' }
        ],
        results: [
          { description: '显示错误提示："请填写项目名称"' },
          { description: '输入框标记为错误状态' },
          { description: '对话框不关闭，项目名称不更新' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-037',
        name: '【在线模式】添加成员-重复添加同一用户',
        steps: [
          { description: '打开项目创建对话框', expectedResult: '对话框正确显示' },
          { description: '输入项目名称"重复成员测试项目"', expectedResult: '项目名称输入成功' },
          { description: '搜索并添加用户"张三"', expectedResult: '用户"张三"添加到成员列表' },
          { description: '再次搜索用户"张三"并尝试添加', expectedResult: '触发重复验证' }
        ],
        results: [
          { description: '显示警告提示："请勿重复添加"' },
          { description: '用户"张三"不会被重复添加到成员列表' },
          { description: '成员列表中只显示一个"张三"' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-038',
        name: '【在线模式】成员搜索-搜索框为空',
        steps: [
          { description: '打开项目创建对话框', expectedResult: '对话框正确显示' },
          { description: '点击"选择成员或组"搜索框', expectedResult: '搜索框获得焦点' },
          { description: '不输入任何内容，直接尝试搜索', expectedResult: '不触发远程搜索' }
        ],
        results: [
          { description: '不发送API请求' },
          { description: '不显示搜索结果下拉列表' },
          { description: '搜索功能正确处理空输入' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-039',
        name: '【在线模式】成员搜索-搜索无结果',
        steps: [
          { description: '打开项目创建对话框', expectedResult: '对话框正确显示' },
          { description: '在"选择成员或组"搜索框中输入不存在的用户名"不存在的用户xyz999"', expectedResult: '发送远程搜索请求' }
        ],
        results: [
          { description: 'API返回空列表' },
          { description: '搜索结果下拉列表显示"暂无数据"提示' },
          { description: '不显示任何可选项' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-040',
        name: '【通用】收藏功能-重复点击防抖',
        steps: [
          { description: '找到未收藏的项目', expectedResult: '项目显示空心星标' },
          { description: '快速连续点击星标图标3次', expectedResult: '只触发一次收藏操作' }
        ],
        results: [
          { description: '项目收藏状态正确更新' },
          { description: '不会因为重复点击导致状态混乱' },
          { description: '加载状态正确显示和隐藏' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-041',
        name: '【离线模式】高级搜索-性能测试（大量数据）',
        steps: [
          { description: '确认本地缓存中有100+个项目和1000+个接口文档', expectedResult: '数据量充足' },
          { description: '打开高级搜索面板', expectedResult: '高级搜索输入框显示' },
          { description: '输入常见关键字"api"进行搜索', expectedResult: '触发本地搜索' },
          { description: '观察搜索响应时间', expectedResult: '搜索在合理时间内完成（<3秒）' }
        ],
        results: [
          { description: '搜索功能在大数据量下仍然流畅' },
          { description: '搜索结果正确返回' },
          { description: '界面不卡顿' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-042',
        name: '【在线模式】网络异常-创建项目失败处理',
        steps: [
          { description: '模拟网络异常环境（断网或API服务不可用）', expectedResult: '网络环境异常' },
          { description: '尝试创建新项目"网络测试项目"', expectedResult: '发送API请求' }
        ],
        results: [
          { description: 'API请求失败' },
          { description: '显示错误提示信息' },
          { description: '对话框保持打开，用户可以重试' },
          { description: '已输入的数据不丢失' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-043',
        name: '【离线模式】确认不显示成员管理图标',
        steps: [
          { description: '在离线模式下查看项目列表', expectedResult: '所有项目卡片正确显示' },
          { description: '检查项目卡片操作区图标', expectedResult: '显示编辑、收藏、删除图标' },
          { description: '确认没有"成员管理"图标（用户图标）', expectedResult: '离线模式不提供成员管理功能' }
        ],
        results: [
          { description: '离线模式正确隐藏成员管理功能' },
          { description: '界面符合离线模式的功能限制' },
          { description: '操作图标布局正确' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-044',
        name: '【离线模式】确认不显示团队管理标签页',
        steps: [
          { description: '在离线模式下进入项目列表页面', expectedResult: '页面正确显示' },
          { description: '查看顶部标签页', expectedResult: '只显示"项目列表"标签页' },
          { description: '确认没有"团队管理"标签页', expectedResult: '离线模式不提供团队管理功能' }
        ],
        results: [
          { description: '标签页正确显示' },
          { description: '离线模式功能限制正确实现' },
          { description: '界面简洁清晰' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      },
      {
        id: 'tc-045',
        name: '【通用】项目列表加载状态显示',
        steps: [
          { description: '刷新页面或首次进入项目列表', expectedResult: '触发项目列表加载' },
          { description: '在数据加载过程中观察界面', expectedResult: '显示Loading加载状态' }
        ],
        results: [
          { description: '加载状态正确显示（离线模式可能不显示）' },
          { description: '数据加载完成后Loading消失' },
          { description: '项目列表正确渲染' }
        ],
        status: 'pending',
        executedAt: '',
        executedBy: ''
      }
    ]
  },
]

// 生成模块树数据
const generateModuleTreeData = (): ModuleTreeNode[] => {
  return testModulesData.map((module) => ({
    id: module.id,
    label: module.name,
    moduleId: module.id
  }))
}

// 导出模块树数据
export const moduleTreeData: ModuleTreeNode[] = generateModuleTreeData()


