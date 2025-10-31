import dayjs from 'dayjs';

/**
 * 获取字符串宽度
 */
export const getTextWidth = (text: string, font: string): number => {
  let canvas: HTMLCanvasElement | null = document.createElement('canvas');
  const context = canvas.getContext('2d');
  (context as CanvasRenderingContext2D).font = font;
  const metrics = (context as CanvasRenderingContext2D).measureText(text);
  canvas = null;
  return metrics.width;
}

/**
 * 格式化时间
 */
export const formatDate = (date: string | number | Date | dayjs.Dayjs | undefined, rule?: string): string => {
  const realRule = rule || 'YYYY-MM-DD HH:mm'
  const result = dayjs(date).format(realRule);
  return result;
}

/**
 * 通用单位格式化函数
 * @param value 要格式化的数值
 * @param type 格式化类型：'bytes' 或 'time'
 */
export const formatUnit = (value: number, type: 'bytes' | 'time'): string => {
  if (!value && type === 'time') {
    return '';
  }

  if (type === 'bytes') {
    // 字节转换
    const units = ['B', 'KB', 'MB', 'GB'];
    const threshold = 1024;

    if (value >= 0 && value < threshold) {
      return `${value}B`;
    }

    let index = 0;
    let result = value;
    while (result >= threshold && index < units.length - 1) {
      result /= threshold;
      index++;
    }

    return `${result.toFixed(2)}${units[index]}`;
  } else {
    // 时间转换（毫秒）
    if (value > 0 && value < 1000) {
      return `${value}ms`;
    } else if (value >= 1000 && value < 1000 * 60) {
      return `${(value / 1000).toFixed(2)}s`;
    } else if (value >= 1000 * 60) {
      return `${(value / 1000 / 60).toFixed(2)}m`;
    }
    return '';
  }
}

/**
 * 格式化HTTP请求头名称
 */
export const formatHeader = (header: string) => {
  return header
    .split('-') // 拆分成单词数组
    .map(word =>
      word.charAt(0).toUpperCase() + // 首字母大写
      word.slice(1).toLowerCase()    // 其余字母小写
    )
    .join('-'); // 重新连接成字符串
}
