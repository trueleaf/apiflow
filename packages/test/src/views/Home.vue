<template>
  <div class="page-container">
    <!-- Header -->
    <header class="page-header">
      <div class="container">
        <h1 class="header-title">
          API Flow 测试展示平台
        </h1>
        <p class="header-subtitle">
          专业的 API 文档管理与协作平台
        </p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="page-content">
      <div class="container">
        <div class="feature-grid">
          <!-- 项目管理卡片 -->
          <div class="feature-card group">
            <div class="card-body">
              <div class="feature-header">
                <div class="feature-icon bg-primary-light group-hover:bg-primary">
                  <el-icon class="icon-primary group-hover:text-white">
                    <Tickets />
                  </el-icon>
                </div>
                <h3 class="feature-title">项目管理</h3>
              </div>
              <p class="feature-description">
                展示项目创建、编辑、搜索等核心功能，体验完整的项目生命周期管理流程
              </p>
              <div class="feature-actions">
                <button
                  @click="$router.push('/doc-list/projects')"
                  class="btn btn-primary btn-lg"
                >
                  进入项目管理
                </button>
              </div>
            </div>
          </div>

          <!-- 团队管理卡片 -->
          <div class="feature-card group">
            <div class="card-body">
              <div class="feature-header">
                <div class="feature-icon bg-success-light group-hover:bg-success">
                  <el-icon class="icon-success group-hover:text-white">
                    <School />
                  </el-icon>
                </div>
                <h3 class="feature-title">团队管理</h3>
              </div>
              <p class="feature-description">
                展示团队创建、成员管理、权限控制等功能，打造高效的团队协作环境
              </p>
              <div class="feature-actions">
                <button
                  @click="$router.push('/doc-list/teams')"
                  class="btn btn-success btn-lg"
                >
                  进入团队管理
                </button>
              </div>
            </div>
          </div>

          <!-- 功能演示卡片 -->
          <div class="feature-card disabled">
            <div class="card-body">
              <div class="feature-header">
                <div class="feature-icon bg-secondary">
                  <el-icon class="icon-muted">
                    <Setting />
                  </el-icon>
                </div>
                <h3 class="feature-title">功能演示</h3>
              </div>
              <p class="feature-description">
                综合功能演示和测试用例展示，更多精彩功能即将上线
              </p>
              <div class="feature-actions">
                <button
                  disabled
                  class="btn btn-secondary btn-lg"
                >
                  敬请期待
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部信息区域 -->
        <div class="status-section">
          <div class="status-indicator">
            <div class="status-dot animate-pulse"></div>
            <span class="status-text">系统运行正常</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { Tickets, School, Setting } from '@element-plus/icons-vue'
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, var(--color-primary-bg) 0%, #ffffff 50%, #f0f9ff 100%);
}

.page-header {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border-light);
  position: sticky;
  top: 0;
  z-index: var(--z-index-sticky);
}

.header-title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  text-align: center;
  margin-bottom: var(--spacing-sm);
}

.header-subtitle {
  color: var(--color-text-secondary);
  text-align: center;
  font-size: var(--font-size-lg);
}

.page-content {
  width: 100%;
  padding: var(--spacing-4xl) 0;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: var(--spacing-2xl);
}

@media (min-width: 1024px) {
  .feature-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--spacing-3xl);
  }
  
  .header-title {
    font-size: var(--font-size-5xl);
  }
  
  .page-content {
    padding: var(--spacing-5xl) 0;
  }
}

.feature-card {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  overflow: hidden;
  transition: all var(--duration-slow) ease;
}

.feature-card:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-4px);
}

.feature-card.disabled {
  opacity: 0.75;
}

.feature-card.disabled:hover {
  transform: none;
  box-shadow: var(--shadow-sm);
}

.card-body {
  padding: var(--spacing-2xl);
}

.feature-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.feature-icon {
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-slow) ease;
}

.icon-primary {
  color: var(--color-primary);
  font-size: var(--font-size-xl);
  transition: color var(--duration-slow) ease;
}

.icon-success {
  color: var(--color-success);
  font-size: var(--font-size-xl);
  transition: color var(--duration-slow) ease;
}

.icon-muted {
  color: var(--color-text-muted);
  font-size: var(--font-size-xl);
}

.feature-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.feature-description {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-2xl);
  line-height: var(--line-height-relaxed);
}

.feature-actions {
  display: flex;
  justify-content: center;
}

.status-section {
  margin-top: var(--spacing-5xl);
  text-align: center;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: var(--radius-full);
  background-color: var(--color-success);
}

.status-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* 组响应式增强 */
.group:hover .group-hover\:bg-primary {
  background-color: var(--color-primary);
}

.group:hover .group-hover\:bg-success {
  background-color: var(--color-success);
}

.group:hover .group-hover\:text-white {
  color: var(--color-text-white);
}
</style>