<template>
  <div class="demo-page">
    <!-- 页面头部 -->
    <div class="demo-header">
      <div class="demo-header-content">
        <h1 class="demo-title">
          团队管理功能演示
        </h1>
        <p class="demo-subtitle">
          API Flow 团队管理模块功能展示与测试指南 - 构建高效协作的团队管理体系
        </p>
      </div>
    </div>
    
    <!-- 功能描述区域 -->
    <div class="demo-content">
      <div class="section-header">
        <h2>核心功能特性</h2>
      </div>
      <div class="features-grid">
        <!-- 团队创建与配置 -->
        <div class="feature-card-demo group">
          <div class="feature-card-body">
            <div class="feature-header-demo">
              <div class="feature-icon-demo bg-blue-light">
                <el-icon class="text-blue group-hover:text-white text-xl transition-colors duration-300">
                  <UserFilled />
                </el-icon>
              </div>
              <h3 class="feature-title-demo">团队创建与配置</h3>
            </div>
            
            <div class="feature-content">
              <div>
                <h4 class="font-semibold text-blue mb-2">团队创建：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-blue"></div>
                    <span>创建新团队，设置团队名称和描述</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-blue"></div>
                    <span>配置团队邀请限制和加入策略</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-blue"></div>
                    <span>设置团队可见性和访问权限</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 class="font-semibold text-blue mb-2">团队配置：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-blue"></div>
                    <span>团队基本信息管理和编辑</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-blue"></div>
                    <span>团队标识和Logo设置</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-blue"></div>
                    <span>团队删除和数据迁移功能</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 团队搜索与管理 -->
        <div class="feature-card-demo group">
          <div class="feature-card-body">
            <div class="feature-header-demo">
              <div class="feature-icon-demo bg-green-light">
                <el-icon class="text-green group-hover:text-white text-xl transition-colors duration-300">
                  <Search />
                </el-icon>
              </div>
              <h3 class="feature-title-demo">团队搜索与管理</h3>
            </div>
            
            <div class="feature-content">
              <div>
                <h4 class="font-semibold text-green mb-2">搜索功能：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-green"></div>
                    <span>按团队名称快速搜索和筛选</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-green"></div>
                    <span>支持模糊匹配和精确查找</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-green"></div>
                    <span>实时搜索结果更新和展示</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 class="font-semibold text-green mb-2">团队管理：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-green"></div>
                    <span>团队列表侧边栏展示和导航</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-green"></div>
                    <span>团队状态管理（活跃/暂停）</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-green"></div>
                    <span>团队数据统计和报表功能</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 成员管理系统 -->
        <div class="feature-card-demo group">
          <div class="feature-card-body">
            <div class="feature-header-demo">
              <div class="feature-icon-demo bg-yellow-light">
                <el-icon class="text-yellow group-hover:text-white text-xl transition-colors duration-300">
                  <Avatar />
                </el-icon>
              </div>
              <h3 class="feature-title-demo">成员管理系统</h3>
            </div>
            
            <div class="feature-content">
              <div>
                <h4 class="font-semibold text-yellow mb-2">成员邀请：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-yellow"></div>
                    <span>通过邮箱邀请新成员加入团队</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-yellow"></div>
                    <span>生成邀请链接供用户自主加入</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-yellow"></div>
                    <span>批量邀请和导入成员功能</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 class="font-semibold text-yellow mb-2">成员展示：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-yellow"></div>
                    <span>成员头像和基本信息展示</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-yellow"></div>
                    <span>成员活跃度和贡献统计</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-yellow"></div>
                    <span>成员状态管理（在线/离线）</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 权限控制体系 -->
        <div class="feature-card-demo group">
          <div class="feature-card-body">
            <div class="feature-header-demo">
              <div class="feature-icon-demo bg-red-light">
                <el-icon class="text-red group-hover:text-white text-xl transition-colors duration-300">
                  <Key />
                </el-icon>
              </div>
              <h3 class="feature-title-demo">权限控制体系</h3>
            </div>
            
            <div class="feature-content">
              <div>
                <h4 class="font-semibold text-red mb-2">权限级别：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-red"></div>
                    <span>只读权限：浏览团队内容和项目</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-red"></div>
                    <span>可编辑权限：修改和创建项目内容</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-red"></div>
                    <span>管理员权限：完整的团队管理功能</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 class="font-semibold text-red mb-2">权限管理：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-red"></div>
                    <span>实时权限修改和生效</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-red"></div>
                    <span>权限变更历史记录和审计</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-red"></div>
                    <span>细粒度权限控制和分配</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 团队信息管理 -->
        <div class="feature-card-demo group">
          <div class="feature-card-body">
            <div class="feature-header-demo">
              <div class="feature-icon-demo bg-purple-light">
                <el-icon class="text-purple group-hover:text-white text-xl transition-colors duration-300">
                  <Setting />
                </el-icon>
              </div>
              <h3 class="feature-title-demo">团队信息管理</h3>
            </div>
            
            <div class="feature-content">
              <div>
                <h4 class="font-semibold text-purple mb-2">基本信息：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-purple"></div>
                    <span>团队名称、描述的实时编辑</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-purple"></div>
                    <span>创建时间和更新历史记录</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-purple"></div>
                    <span>团队创建者和管理员信息</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 class="font-semibold text-purple mb-2">高级设置：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-purple"></div>
                    <span>团队邀请策略和限制配置</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-purple"></div>
                    <span>数据备份和恢复选项</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-purple"></div>
                    <span>团队解散和数据清理功能</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 批量操作功能 -->
        <div class="feature-card-demo group">
          <div class="feature-card-body">
            <div class="feature-header-demo">
              <div class="feature-icon-demo bg-indigo-light">
                <el-icon class="text-indigo group-hover:text-white text-xl transition-colors duration-300">
                  <Operation />
                </el-icon>
              </div>
              <h3 class="feature-title-demo">批量操作功能</h3>
            </div>
            
            <div class="feature-content">
              <div>
                <h4 class="font-semibold text-indigo mb-2">成员操作：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-indigo"></div>
                    <span>批量修改成员权限级别</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-indigo"></div>
                    <span>批量移除或暂停成员</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-indigo"></div>
                    <span>成员权限模板应用功能</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 class="font-semibold text-indigo mb-2">团队操作：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-indigo"></div>
                    <span>团队数据导出和备份</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-indigo"></div>
                    <span>多团队合并和拆分功能</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-indigo"></div>
                    <span>团队模板创建和应用</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 测试步骤区域 -->
      <div class="section-header">
        <h2>功能测试指南</h2>
      </div>
      <div class="test-steps-grid">
        <!-- 团队创建测试 -->
        <div class="test-card">
          <div class="test-card-body">
            <div class="test-header">
              <div class="test-icon bg-blue-light">
                <el-icon class="text-blue text-xl">
                  <Plus />
                </el-icon>
              </div>
              <h3 class="test-title">团队创建测试</h3>
            </div>
            
            <ol class="test-steps">
              <li class="test-step">
                <span class="step-number bg-blue-number">1</span>
                <span>点击左侧菜单的"创建团队"图标</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-blue-number">2</span>
                <span>填写团队名称（如："开发团队A"）</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-blue-number">3</span>
                <span>输入团队描述（如："负责API开发和维护的团队"）</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-blue-number">4</span>
                <span>设置邀请限制选项（允许/不允许被邀请）</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-blue-number">5</span>
                <span>点击"创建"按钮完成团队创建</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-green-number">✓</span>
                <span class="step-expected text-green-expected">预期结果：团队创建成功，左侧列表显示新团队，进入团队配置页面</span>
              </li>
            </ol>
          </div>
        </div>

        <!-- 团队搜索测试 -->
        <div class="test-card">
          <div class="test-card-body">
            <div class="test-header">
              <div class="test-icon bg-green-light">
                <el-icon class="text-green text-xl">
                  <Search />
                </el-icon>
              </div>
              <h3 class="test-title">团队搜索测试</h3>
            </div>
            
            <ol class="test-steps">
              <li class="test-step">
                <span class="step-number bg-green-number">1</span>
                <span>在左侧搜索框输入团队名称关键词</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-green-number">2</span>
                <span>观察团队列表实时筛选效果</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-green-number">3</span>
                <span>测试精确匹配和模糊匹配功能</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-green-number">4</span>
                <span>清空搜索条件验证列表恢复</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-green-number">5</span>
                <span>点击搜索到的团队进入详情页面</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-green-number">✓</span>
                <span class="step-expected text-green-expected">预期结果：搜索响应迅速，结果准确，支持多种匹配模式</span>
              </li>
            </ol>
          </div>
        </div>

        <!-- 成员管理测试 -->
        <div class="test-card">
          <div class="test-card-body">
            <div class="test-header">
              <div class="test-icon bg-yellow-light">
                <el-icon class="text-yellow text-xl">
                  <UserFilled />
                </el-icon>
              </div>
              <h3 class="test-title">成员管理测试</h3>
            </div>
            
            <ol class="test-steps">
              <li class="test-step">
                <span class="step-number bg-yellow-number">1</span>
                <span>进入团队详情页面，查看成员列表</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-yellow-number">2</span>
                <span>点击"邀请成员"按钮</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-yellow-number">3</span>
                <span>输入用户邮箱或用户名进行搜索</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-yellow-number">4</span>
                <span>选择成员并设置初始权限级别</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-yellow-number">5</span>
                <span>发送邀请并确认邀请状态</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-yellow-number">6</span>
                <span>测试成员头像和信息展示功能</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-green-number">✓</span>
                <span class="step-expected text-green-expected">预期结果：成员邀请成功，列表实时更新，信息展示完整</span>
              </li>
            </ol>
          </div>
        </div>

        <!-- 权限管理测试 -->
        <div class="test-card">
          <div class="test-card-body">
            <div class="test-header">
              <div class="test-icon bg-red-light">
                <el-icon class="text-red text-xl">
                  <Key />
                </el-icon>
              </div>
              <h3 class="test-title">权限管理测试</h3>
            </div>
            
            <ol class="test-steps">
              <li class="test-step">
                <span class="step-number bg-red-number">1</span>
                <span>选择一个团队成员，点击其权限级别</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-red-number">2</span>
                <span>在权限下拉菜单中选择新的权限级别</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-red-number">3</span>
                <span>确认权限修改，观察界面反馈</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-red-number">4</span>
                <span>测试不同权限级别的功能访问限制</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-red-number">5</span>
                <span>验证权限变更的即时生效性</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-red-number">6</span>
                <span>检查权限修改历史记录</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-green-number">✓</span>
                <span class="step-expected text-green-expected">预期结果：权限修改立即生效，访问控制准确，操作记录完整</span>
              </li>
            </ol>
          </div>
        </div>

        <!-- 团队信息编辑测试 -->
        <div class="test-card">
          <div class="test-card-body">
            <div class="test-header">
              <div class="test-icon bg-purple-light">
                <el-icon class="text-purple text-xl">
                  <Edit />
                </el-icon>
              </div>
              <h3 class="test-title">团队信息编辑测试</h3>
            </div>
            
            <ol class="test-steps">
              <li class="test-step">
                <span class="step-number bg-purple-number">1</span>
                <span>在团队配置页面修改团队名称</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-purple-number">2</span>
                <span>更新团队描述信息</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-purple-number">3</span>
                <span>调整团队邀请限制设置</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-purple-number">4</span>
                <span>查看团队创建和更新时间信息</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-purple-number">5</span>
                <span>保存修改并验证更新结果</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-green-number">✓</span>
                <span class="step-expected text-green-expected">预期结果：团队信息更新成功，所有界面同步显示新信息</span>
              </li>
            </ol>
          </div>
        </div>

        <!-- 团队删除测试 -->
        <div class="test-card">
          <div class="test-card-body">
            <div class="test-header">
              <div class="test-icon bg-red-light">
                <el-icon class="text-red text-xl">
                  <Delete />
                </el-icon>
              </div>
              <h3 class="test-title">团队删除测试</h3>
            </div>
            
            <ol class="test-steps">
              <li class="test-step">
                <span class="step-number bg-red-number">1</span>
                <span>选择一个测试团队，点击删除图标</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-red-number">2</span>
                <span>在确认对话框中阅读删除警告信息</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-red-number">3</span>
                <span>输入团队名称确认删除操作</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-red-number">4</span>
                <span>了解数据删除和备份策略</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-red-number">5</span>
                <span>确认删除并验证团队移除结果</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-green-number">✓</span>
                <span class="step-expected text-green-expected">预期结果：团队删除成功，数据清理完整，无残留信息</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  UserFilled, Search, Avatar, Key, Setting, Operation, 
  Plus, Edit, Delete 
} from '@element-plus/icons-vue'
// 团队管理功能展示页面
</script>