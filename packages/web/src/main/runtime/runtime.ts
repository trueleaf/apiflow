// Runtime 运行时状态管理类
type Language = 'zh-cn' | 'zh-tw' | 'en' | 'ja';

export class Runtime {
  private language: Language = 'zh-cn';

  // 获取当前语言环境
  public getLanguage(): Language {
    return this.language;
  }

  // 设置语言环境
  public setLanguage(language: Language): void {
    this.language = language;
  }
}

// 导出单例实例
export const runtime = new Runtime();
