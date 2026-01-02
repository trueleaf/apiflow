<template>
  <div class="about-container">
    <div class="page-header">
      <h2>{{ t('关于') }}</h2>
    </div>

    <div class="about-content">
      <div class="app-identity-card">
        <div class="logo-wrapper">
          <img :src="logoImg" alt="Apiflow" class="app-logo" />
        </div>
        <div class="app-info">
          <h1 class="app-name">Apiflow</h1>
          <div class="version-info">
            <span class="version-tag">v{{ appVersion }}</span>
            <span class="build-time" v-if="buildTime">{{ buildTime }}</span>
          </div>
        </div>
        
        <div class="links-list">
          <a href="https://github.com/trueleaf/apiflow" target="_blank" class="link-item">
            <Github :size="16" />
            <span>GitHub</span>
            <span v-if="starCount" class="star-count">
              <Star :size="12" />
              {{ starCount }}
            </span>
          </a>
          <div class="link-item">
            <FileText :size="16" />
            <span>MIT License</span>
          </div>
          <div class="copyright">
            Copyright © 2026 TrueLeaf Team
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Github, FileText, Star } from 'lucide-vue-next'
import logoImg from '@/assets/imgs/logo.png'

const { t } = useI18n()

const starCount = ref('')

const appVersion = __APP_VERSION__
const buildTime = computed(() => {
  try {
    if (typeof __APP_BUILD_TIME__ !== 'undefined' && __APP_BUILD_TIME__) {
      const date = new Date(__APP_BUILD_TIME__)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    }
  } catch {
    // ignore
  }
  return ''
})
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
    justify-content: center;
    align-items: flex-start;
    padding-top: 40px;
  }

  .app-identity-card {
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: 12px;
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 360px;
    
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
      margin-bottom: 32px;
      .app-name {
        font-size: 24px;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 8px 0;
      }
      
      .version-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        
        .version-tag {
          font-size: 16px;
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .build-time {
          font-size: 12px;
          color: var(--text-secondary);
        }
      }
    }

    .links-list {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
      border-top: 1px solid var(--border-light);
      padding-top: 24px;

      .link-item {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 14px;
        transition: color 0.2s;
        cursor: pointer;

        &:hover {
          color: var(--el-color-primary);
        }

        .star-count {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          font-size: 12px;
          padding: 1px 6px;
          background: var(--el-fill-color-light);
          border-radius: 10px;
        }
      }

      .copyright {
        margin-top: 12px;
        font-size: 12px;
        color: var(--text-secondary);
      }
    }
  }
}

@media (max-width: 900px) {
  .about-container {
    .about-content {
      padding-top: 20px;
    }
    
    .app-identity-card {
      max-width: 100%;
    }
  }
}
</style>
