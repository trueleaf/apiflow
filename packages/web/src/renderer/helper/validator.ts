/**
 * 检测是否在 Electron 环境中
 */
export const isElectron = () => {
  if (
    typeof window !== "undefined" &&
    typeof window.process === "object" &&
    window.process.type === "renderer"
  ) {
    return true;
  }
  if (
    typeof process !== "undefined" &&
    typeof process.versions === "object" &&
    !!process.versions.electron
  ) {
    return true;
  }
  if (
    typeof navigator === "object" &&
    typeof navigator.userAgent === "string" &&
    navigator.userAgent.indexOf("Electron") >= 0
  ) {
    return true;
  }
  return false;
};

/**
 * 判断字符串是否为有效的JSON格式
 */
export const isJsonString = (str: string): boolean => {
  if (!str || typeof str !== 'string') {
    return false;
  }

  // 去除首尾空白字符
  const trimmedStr = str.trim();

  // 空字符串不是有效的 JSON
  if (!trimmedStr) {
    return false;
  }

  // JSON 必须以 { 或 [ 开头
  if (!trimmedStr.startsWith('{') && !trimmedStr.startsWith('[')) {
    return false;
  }

  try {
    JSON.parse(trimmedStr);
    return true;
  } catch (error) {
    return false;
  }
};
