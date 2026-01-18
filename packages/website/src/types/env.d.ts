declare const __APP_VERSION__: string;
declare namespace NodeJS {
  interface ProcessEnv {
    APP_BUILD_TIME: string;
    APP_VERSION: string;
  }
}
