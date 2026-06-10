export const brandConfig = {
  isCleanMode: __APP_CLEAN_MODE__,
  offlineOnly: __APP_CLEAN_MODE__,
  appName: __APP_BRAND_NAME__,
  officialLinksEnabled: !__APP_CLEAN_MODE__,
  defaultServerUrl: __APP_DEFAULT_SERVER_URL__,
  officialUrl: __APP_OFFICIAL_URL__,
  githubUrl: __APP_GITHUB_URL__,
  giteeUrl: __APP_GITEE_URL__,
  releaseUrl: __APP_RELEASE_URL__,
  licenseUrl: __APP_LICENSE_URL__,
  copyright: __APP_COPYRIGHT__,
} as const;
