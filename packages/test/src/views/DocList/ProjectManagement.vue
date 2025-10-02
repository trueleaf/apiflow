<template>
  <div class="demo-page">
    <!-- 页面头部 -->
    <div class="demo-header">
      <div class="demo-header-content">
        <h1 class="demo-title">
          项目管理功能演示
        </h1>
        <p class="demo-subtitle">
          API Flow 项目管理模块功能展示与测试指南 - 体验完整的项目生命周期管理流程
        </p>
      </div>
    </div>
    
    <!-- 功能描述区域 -->
    <div class="demo-content">
      <div class="section-header">
        <h2>核心功能特性</h2>
      </div>
      <div class="features-grid">
        <!-- 项目创建与编辑 -->
        <div class="feature-card-demo group">
          <div class="feature-card-body">
            <div class="feature-header-demo">
              <div class="feature-icon-demo bg-blue-light">
                <el-icon class="text-blue">
                  <DocumentAdd />
                </el-icon>
              </div>
              <h3 class="feature-title-demo">项目创建与编辑</h3>
            </div>
              
            <div class="feature-content">
              <div>
                <h4 class="font-semibold text-blue mb-2">核心功能：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-blue"></div>
                    <span>创建新的API文档项目，支持项目名称和描述设置</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-blue"></div>
                    <span>编辑已有项目的基本信息和配置</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-blue"></div>
                    <span>项目信息实时保存，支持自动草稿功能</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 class="font-semibold text-blue mb-2">技术特点：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-blue"></div>
                    <span>表单验证确保项目名称唯一性</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-blue"></div>
                    <span>支持富文本描述编辑</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-blue"></div>
                    <span>创建向导引导用户完成项目初始化</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 智能搜索系统 -->
        <div class="feature-card-demo group">
          <div class="feature-card-body">
            <div class="feature-header-demo">
              <div class="feature-icon-demo bg-green-light">
                <el-icon class="text-green group-hover:text-white text-xl transition-colors duration-300">
                  <Search />
                </el-icon>
              </div>
              <h3 class="feature-title-demo">智能搜索系统</h3>
            </div>
            
            <div class="feature-content">
              <div>
                <h4 class="font-semibold text-green mb-2">基础搜索：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-green"></div>
                    <span>按项目名称快速搜索，支持模糊匹配</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-green"></div>
                    <span>实时搜索结果展示，无需手动触发</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-green"></div>
                    <span>支持清空搜索条件快速重置</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 class="font-semibold text-green mb-2">高级搜索：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-green"></div>
                    <span>支持接口URL精确搜索</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-green"></div>
                    <span>组合条件搜索，提高查找精度</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-green"></div>
                    <span>搜索历史记录和快速搜索建议</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 项目收藏管理 -->
        <div class="feature-card-demo group">
          <div class="feature-card-body">
            <div class="feature-header-demo">
              <div class="feature-icon-demo bg-yellow-light">
                <el-icon class="text-yellow group-hover:text-white text-xl transition-colors duration-300">
                  <Star />
                </el-icon>
              </div>
              <h3 class="feature-title-demo">项目收藏管理</h3>
            </div>
            
            <div class="feature-content">
              <div>
                <h4 class="font-semibold text-yellow mb-2">收藏功能：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-yellow"></div>
                    <span>一键收藏/取消收藏重要项目</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-yellow"></div>
                    <span>收藏项目独立区域展示，便于快速访问</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-yellow"></div>
                    <span>收藏状态实时同步，多端数据一致</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 class="font-semibold text-yellow mb-2">管理特性：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-yellow"></div>
                    <span>收藏项目自动排序，最近使用优先</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-yellow"></div>
                    <span>支持收藏项目批量操作</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-yellow"></div>
                    <span>收藏数量限制和提醒机制</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 权限控制系统 -->
        <div class="feature-card-demo group">
          <div class="feature-card-body">
            <div class="feature-header-demo">
              <div class="feature-icon-demo bg-red-light">
                <el-icon class="text-red group-hover:text-white text-xl transition-colors duration-300">
                  <UserFilled />
                </el-icon>
              </div>
              <h3 class="feature-title-demo">权限控制系统</h3>
            </div>
            
            <div class="feature-content">
              <div>
                <h4 class="font-semibold text-red mb-2">成员管理：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-red"></div>
                    <span>邀请团队成员加入项目协作</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-red"></div>
                    <span>成员头像展示和基本信息管理</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-red"></div>
                    <span>成员活跃度和贡献度统计</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 class="font-semibold text-red mb-2">权限控制：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-red"></div>
                    <span>三级权限：只读、可编辑、管理员</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-red"></div>
                    <span>细粒度权限控制，确保数据安全</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-red"></div>
                    <span>权限变更日志和审计功能</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 项目列表展示 -->
        <div class="feature-card-demo group">
          <div class="feature-card-body">
            <div class="feature-header-demo">
              <div class="feature-icon-demo bg-purple-light">
                <el-icon class="text-purple group-hover:text-white text-xl transition-colors duration-300">
                  <List />
                </el-icon>
              </div>
              <h3 class="feature-title-demo">项目列表展示</h3>
            </div>
            
            <div class="feature-content">
              <div>
                <h4 class="font-semibold text-purple mb-2">展示形式：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-purple"></div>
                    <span>卡片式布局，信息一目了然</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-purple"></div>
                    <span>收藏项目和全部项目分区展示</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-purple"></div>
                    <span>支持列表折叠/展开，节省空间</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 class="font-semibold text-purple mb-2">信息丰富：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-purple"></div>
                    <span>项目基本信息：名称、描述、更新时间</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-purple"></div>
                    <span>统计数据：接口数量、成员数量</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-purple"></div>
                    <span>快速操作：编辑、预览、删除等</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 批量操作管理 -->
        <div class="feature-card-demo group">
          <div class="feature-card-body">
            <div class="feature-header-demo">
              <div class="feature-icon-demo bg-indigo-light">
                <el-icon class="text-indigo group-hover:text-white text-xl transition-colors duration-300">
                  <Operation />
                </el-icon>
              </div>
              <h3 class="feature-title-demo">批量操作管理</h3>
            </div>
            
            <div class="feature-content">
              <div>
                <h4 class="font-semibold text-indigo mb-2">批量操作：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-indigo"></div>
                    <span>支持多项目选择和批量删除</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-indigo"></div>
                    <span>批量导出项目数据和配置</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-indigo"></div>
                    <span>批量权限设置和成员管理</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 class="font-semibold text-indigo mb-2">安全机制：</h4>
                <ul class="feature-list">
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-indigo"></div>
                    <span>删除确认弹窗，防止误操作</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-indigo"></div>
                    <span>操作日志记录，可追溯历史</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="feature-dot bg-indigo"></div>
                    <span>数据备份和恢复功能</span>
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
        <!-- 项目创建测试 -->
        <div class="test-card">
          <div class="test-card-body">
            <div class="test-header">
              <div class="test-icon bg-blue-light">
                <el-icon class="text-blue text-xl">
                  <Plus />
                </el-icon>
              </div>
              <h3 class="test-title">项目创建测试</h3>
            </div>
            
            <ol class="test-steps">
              <li class="test-step">
                <span class="step-number bg-blue-number">1</span>
                <span>点击"新建项目"按钮</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-blue-number">2</span>
                <span>填写项目名称（如："测试API项目"）</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-blue-number">3</span>
                <span>输入项目描述（如："这是一个测试用的API文档项目"）</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-blue-number">4</span>
                <span>点击"确认"按钮完成创建</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-green-number">✓</span>
                <span class="step-expected text-green-expected">预期结果：项目创建成功，返回项目列表页面，新项目显示在列表中</span>
              </li>
            </ol>
          </div>
        </div>

        <!-- 搜索功能测试 -->
        <div class="test-card">
          <div class="test-card-body">
            <div class="test-header">
              <div class="test-icon bg-green-light">
                <el-icon class="text-green text-xl">
                  <Search />
                </el-icon>
              </div>
              <h3 class="test-title">搜索功能测试</h3>
            </div>
            
            <ol class="test-steps">
              <li class="test-step">
                <span class="step-number bg-green-number">1</span>
                <span><strong>基础搜索：</strong>在搜索框输入项目名称关键词</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-green-number">2</span>
                <span>观察搜索结果实时过滤效果</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-green-number">3</span>
                <span>清空搜索条件，验证列表恢复显示</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-green-number">4</span>
                <span><strong>高级搜索：</strong>点击搜索框右侧"工具"图标</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-green-number">5</span>
                <span>在高级搜索框输入接口URL关键词</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-green-number">6</span>
                <span>点击搜索按钮执行搜索</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-green-number">✓</span>
                <span class="step-expected text-green-expected">预期结果：搜索结果准确匹配，支持模糊查询和精确查询</span>
              </li>
            </ol>
          </div>
        </div>

        <!-- 收藏功能测试 -->
        <div class="test-card">
          <div class="test-card-body">
            <div class="test-header">
              <div class="test-icon bg-yellow-light">
                <el-icon class="text-yellow text-xl">
                  <Star />
                </el-icon>
              </div>
              <h3 class="test-title">收藏功能测试</h3>
            </div>
            
            <ol class="test-steps">
              <li class="test-step">
                <span class="step-number bg-yellow-number">1</span>
                <span>在项目卡片右上角点击"收藏"图标</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-yellow-number">2</span>
                <span>验证图标状态变为"已收藏"（金色星形）</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-yellow-number">3</span>
                <span>观察项目移动到"收藏的项目"区域</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-yellow-number">4</span>
                <span>再次点击星形图标取消收藏</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-yellow-number">5</span>
                <span>验证项目从收藏区域移除</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-green-number">✓</span>
                <span class="step-expected text-green-expected">预期结果：收藏状态实时更新，收藏项目独立展示</span>
              </li>
            </ol>
          </div>
        </div>

        <!-- 项目编辑测试 -->
        <div class="test-card">
          <div class="test-card-body">
            <div class="test-header">
              <div class="test-icon bg-red-light">
                <el-icon class="text-red text-xl">
                  <Edit />
                </el-icon>
              </div>
              <h3 class="test-title">项目编辑测试</h3>
            </div>
            
            <ol class="test-steps">
              <li class="test-step">
                <span class="step-number bg-red-number">1</span>
                <span>点击项目卡片右上角"更多"按钮（三个点）</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-red-number">2</span>
                <span>在下拉菜单中选择"编辑"</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-red-number">3</span>
                <span>修改项目名称和描述信息</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-red-number">4</span>
                <span>点击"保存"按钮提交更改</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-red-number">5</span>
                <span>返回列表页面验证修改是否生效</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-green-number">✓</span>
                <span class="step-expected text-green-expected">预期结果：项目信息更新成功，列表显示最新内容</span>
              </li>
            </ol>
          </div>
        </div>

        <!-- 权限管理测试 -->
        <div class="test-card">
          <div class="test-card-body">
            <div class="test-header">
              <div class="test-icon bg-purple-light">
                <el-icon class="text-purple text-xl">
                  <UserFilled />
                </el-icon>
              </div>
              <h3 class="test-title">权限管理测试</h3>
            </div>
            
            <ol class="test-steps">
              <li class="test-step">
                <span class="step-number bg-purple-number">1</span>
                <span>点击项目操作菜单中的"权限管理"</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-purple-number">2</span>
                <span>在权限管理页面点击"添加成员"</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-purple-number">3</span>
                <span>输入用户邮箱或用户名搜索成员</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-purple-number">4</span>
                <span>为新成员分配权限级别（只读/可编辑/管理员）</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-purple-number">5</span>
                <span>点击"确认"添加成员</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-purple-number">6</span>
                <span>测试修改现有成员的权限级别</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-green-number">✓</span>
                <span class="step-expected text-green-expected">预期结果：成员权限设置生效，项目协作功能正常</span>
              </li>
            </ol>
          </div>
        </div>

        <!-- 项目删除测试 -->
        <div class="test-card">
          <div class="test-card-body">
            <div class="test-header">
              <div class="test-icon bg-red-light">
                <el-icon class="text-red text-xl">
                  <Delete />
                </el-icon>
              </div>
              <h3 class="test-title">项目删除测试</h3>
            </div>
            
            <ol class="test-steps">
              <li class="test-step">
                <span class="step-number bg-red-number">1</span>
                <span>选择一个测试项目，点击"更多"按钮</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-red-number">2</span>
                <span>在下拉菜单中选择"删除"</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-red-number">3</span>
                <span>在确认对话框中仔细阅读删除警告</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-red-number">4</span>
                <span>输入项目名称确认删除操作</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-red-number">5</span>
                <span>点击"确认删除"按钮</span>
              </li>
              <li class="test-step">
                <span class="step-number bg-green-number">✓</span>
                <span class="step-expected text-green-expected">预期结果：项目删除成功，从列表中移除，数据无法恢复</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DocumentAdd, Search, Star, UserFilled, List, Operation, Plus, Edit, Delete } from '@element-plus/icons-vue'
// 项目管理功能展示页面
</script>