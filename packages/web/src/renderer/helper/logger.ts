import { i18n } from '@/i18n'

interface LogParams {
  [key: string]: unknown;
  error?: Error | unknown;
}

class Logger {
  private get t() {
    return i18n.global.t;
  }
  private hasTranslation(key: string): boolean {
    try {
      const translated = this.t(key);
      return translated !== key;
    } catch {
      return false;
    }
  }
  private formatMessage(message: string, params?: LogParams): string {
    if (!params) return message;

    let formatted = message;
    Object.keys(params).forEach(key => {
      if (key !== 'error') {
        const placeholder = `{${key}}`;
        if (formatted.includes(placeholder)) {
          formatted = formatted.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), String(params[key]));
        }
      }
    });

    return formatted;
  }
  private translate(message: string, params?: LogParams): string {
    const logKey = `log.${message}`;
    if (this.hasTranslation(logKey)) {
      return this.t(logKey, params || {});
    }
    return this.formatMessage(message, params);
  }
  private buildLogOutput(translatedMessage: string, params?: LogParams): unknown[] {
    const output: unknown[] = [translatedMessage];

    if (params?.error) {
      output.push('\n', params.error);
    }

    return output;
  }
  log(message: string, params?: LogParams): void {
    const translated = this.translate(message, params);
    const output = this.buildLogOutput(translated, params);
    console.log(...output);
  }
  info(message: string, params?: LogParams): void {
    const translated = this.translate(message, params);
    const output = this.buildLogOutput(translated, params);
    console.info(...output);
  }
  warn(message: string, params?: LogParams): void {
    const translated = this.translate(message, params);
    const output = this.buildLogOutput(translated, params);
    console.warn(...output);
  }
  error(message: string, params?: LogParams): void {
    const translated = this.translate(message, params);
    const output = this.buildLogOutput(translated, params);
    console.error(...output);
  }
  debug(message: string, params?: LogParams): void {
    if (process.env.NODE_ENV === 'development') {
      const translated = this.translate(message, params);
      const output = this.buildLogOutput(translated, params);
      console.log('[DEBUG]', ...output);
    }
  }
}
export const logger = new Logger();
