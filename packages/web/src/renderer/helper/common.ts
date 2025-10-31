import { i18n } from '@/i18n';

/**
 * 将数组对象[{id: 1}]根据指定的key值进行去重,key值对应的数组元素不存在则直接过滤掉，若不传入id则默认按照set形式进行去重。
 */
export const uniqueByKey = <T extends Record<string, unknown>, K extends keyof T>(data: T[], key: K): T[] => {
  const result: T[] = [];
  for (let i = 0, len = data.length; i < len; i += 1) {
    const isInResult = result.find((val) => val[key] === data[i][key]);
    if (data[i][key] != null && !isInResult) {
      result.push(data[i]);
    }
  }
  return result;
}

/**
 * 拷贝文本
 */
export const copy = (str: string): void => {
  const dom = document.createElement('textarea');
  dom.value = str;
  dom.style.position = 'fixed';
  dom.style.top = '-9999px';
  dom.style.left = '-9999px';
  document.body.appendChild(dom);
  dom.select();
  document.execCommand('Copy', false);
  document.body.removeChild(dom);
}

/**
 * 生成指定范围的随机整数
 */
export const randomInt = (start: number, end: number): number => {
  if (start > end) {
    console.log('第二个参数必须大于第一个');
    return 0;
  }
  const range = end - start - 1;
  return Math.floor((Math.random() * range + 1))
}

/**
 * 模拟延迟
 */
export const sleep = async (delay: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      if (!delay) {
        resolve();
      }
      setTimeout(() => {
        resolve();
      }, delay)
    } catch (error) {
      reject(error);
    }
  })
}

/**
 * 导出文本为文件
 */
export const downloadStringAsText = (content: string, fileName: string, mimeType = 'text/plain;charset=utf-8'): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = fileName;  // 设置下载文件名
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * 计算距离过期时间的倒计时
 */
export const getCountdown = (expire: number) => {
  if (!expire) return '';
  const expireDate = new Date(expire).getTime();
  const now = Date.now();
  let diff = expireDate - now;
  if (diff <= 0) {
    return i18n.global.t('已过期');
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);
  const minutes = Math.floor(diff / (1000 * 60));
  diff -= minutes * (1000 * 60);
  const seconds = Math.floor(diff / 1000);
  // 国际化拼接
  let result = '';
  if (days > 0) result += days + i18n.global.t('天');
  if (hours > 0 || days > 0) result += hours + i18n.global.t('小时');
  if (minutes > 0 || hours > 0 || days > 0) result += minutes + i18n.global.t('分钟');
  result += seconds + i18n.global.t('秒');
  return result;
}
