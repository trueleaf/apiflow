<template>
  <div class="about-container">
    <div class="page-header">
      <h2>{{ t('关于') }}</h2>
    </div>

    <div class="about-content">
      <div class="app-identity-card">
        <div class="card-body">
          <div class="logo-wrapper">
            <img :src="logoImg" alt="ApiFlow" class="app-logo" />
          </div>
          
          <div class="app-info">
            <h1 class="app-name">ApiFlow</h1>
            <div class="version-tag">v{{ appVersion }}</div>
          </div>
          
          <div class="build-info">
            <span class="build-label">{{ t('构建时间') }}: </span>
            <span class="build-value">{{ formatDate(buildTime) }}</span>
          </div>
          
          <div class="divider"></div>
          
          <div class="links-buttons">
            <a class="link-item" role="button" tabindex="0" @click.prevent="openLink('https://github.com/trueleaf/apiflow')">
              <Github :size="16" />
              <span class="link-text">GitHub</span>
            </a>
            <a class="link-item" role="button" tabindex="0" @click.prevent="openLink('https://apiflow.dev')">
              <Globe :size="16" />
              <span class="link-text">{{ t('官网') }}</span>
            </a>
            <a class="link-item" role="button" tabindex="0" @click.prevent="openLink('https://github.com/trueleaf/apiflow/blob/main/LICENSE')">
              <FileText :size="14" />
              <span class="link-text">License(MIT)</span>
            </a>
            <a class="link-item" role="button" tabindex="0" @click.prevent="openLink('https://github.com/trueleaf/apiflow/releases')">
              <FileText :size="14" />
              <span class="link-text">{{ t('更新日志') }}</span>
            </a>
          </div>
          
          <div class="copyright">
            © 2026 TrueLeaf Team
          </div>
        </div>
      </div>

      <UpdateCard class="update-card-wrapper" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Github, FileText, Globe } from 'lucide-vue-next'
import { formatDate } from '@/helper'
import logoImg from '@/assets/imgs/logo.png'
import UpdateCard from './components/UpdateCard.vue'
const { t } = useI18n()

const appVersion = __APP_VERSION__
const buildTime = __APP_BUILD_TIME__
const openLink = (url: string) => {
  window.open(url, '_blank')
}
</script>

<style lang="scss" scoped>
.about-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 24px 24px;
  box-sizing: border-box;
  overflow-y: auto;

  .page-header {
    margin-bottom: 24px;
    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .about-content {
    display: flex;
    height: 100%;
  }

  .app-identity-card {
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-right: none;
    width: 360px;
    flex-shrink: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    
    .card-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-light);
      
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
      }
    }
    
    .card-body {
      padding: 32px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      flex: 1;
    }
    
    .logo-wrapper {
      margin-bottom: 20px;
      .app-logo {
        width: 100px;
        height: 100px;
        border-radius: 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
    }

    .app-info {
      margin-bottom: 16px;
      .app-name {
        font-size: 24px;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 8px 0;
      }
      
      .version-tag {
        font-size: 16px;
        font-weight: 500;
        color: var(--text-primary);
      }
    }
    
    .build-info {
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 24px;
    }
    
    .divider {
      width: 100%;
      height: 1px;
      background: var(--border-light);
      margin: 24px 0;
    }
    
    .links-buttons {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .links-buttons .link-item {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
      width: 100%;
      max-width: 240px;
      color: var(--text-primary);
      text-decoration: none;
      padding: 6px 8px;
      cursor: pointer;
      &:hover {
        color: var(--primary);
      }
    }

    .links-buttons .link-item .link-text {
      text-align: left;
      display: inline-block;
      font-size: 14px;
    }

    .license-info {
      margin-bottom: 16px;
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .license-info .link-item {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
      width: 100%;
      max-width: 240px;
      color: var(--text-primary);
      text-decoration: none;
      padding: 6px 8px;
    }

    .copyright {
      margin-top: auto;
      padding-top: 16px;
      font-size: 12px;
      color: var(--text-secondary);
    }
  }
  
  .update-card-wrapper {
    flex: 1;
  }
}
</style>
