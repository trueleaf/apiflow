/**
 * 图片处理工具函数
 * 用于处理头像和Logo图片的上传、转换和验证
 */

/**
 * 支持的图片格式
 */
export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

/**
 * 图片配置
 */
export const IMAGE_CONFIG = {
  avatar: {
    maxSize: 2 * 1024 * 1024, // 2MB
    maxWidth: 800,
    maxHeight: 800,
  },
  logo: {
    maxSize: 2 * 1024 * 1024, // 2MB
    maxWidth: 500,
    maxHeight: 500,
  },
};

/**
 * 验证文件类型
 */
export function validateImageType(file: File): { valid: boolean; message?: string } {
  if (!SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
    return {
      valid: false,
      message: `不支持的文件格式。支持的格式: JPG, PNG, GIF`,
    };
  }
  return { valid: true };
}

/**
 * 验证文件大小
 */
export function validateImageSize(file: File, maxSize: number): { valid: boolean; message?: string } {
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      message: `文件大小超过限制。最大支持: ${maxSizeMB}MB`,
    };
  }
  return { valid: true };
}

/**
 * 压缩图片
 * @param file 原始文件
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 * @param quality 压缩质量 0-1
 * @returns Promise<Blob>
 */
export function compressImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // 计算新的尺寸，保持宽高比
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法创建Canvas上下文'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('图片压缩失败'));
            }
          },
          file.type,
          quality
        );
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * 将文件转换为Base64字符串
 * @param file 文件对象
 * @returns Promise<string> Base64字符串
 */
export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * 处理图片上传（验证 + 压缩 + 转Base64）
 * @param file 上传的文件
 * @param type 图片类型 'avatar' | 'logo'
 * @returns Promise<string> Base64字符串
 */
export async function processImageUpload(
  file: File,
  type: 'avatar' | 'logo'
): Promise<{ success: boolean; data?: string; message?: string }> {
  try {
    // 验证文件类型
    const typeValidation = validateImageType(file);
    if (!typeValidation.valid) {
      return { success: false, message: typeValidation.message };
    }

    // 验证文件大小
    const config = IMAGE_CONFIG[type];
    const sizeValidation = validateImageSize(file, config.maxSize);
    if (!sizeValidation.valid) {
      return { success: false, message: sizeValidation.message };
    }

    // 压缩图片
    const compressedBlob = await compressImage(file, config.maxWidth, config.maxHeight);

    // 转换为Base64
    const base64String = await fileToBase64(compressedBlob);

    return { success: true, data: base64String };
  } catch (error) {
    console.error('图片处理失败:', error);
    return { success: false, message: error instanceof Error ? error.message : '图片处理失败' };
  }
}

/**
 * 验证Base64字符串是否为有效的图片
 * @param base64String Base64字符串
 * @returns boolean
 */
export function isValidImageBase64(base64String: string): boolean {
  if (!base64String) return false;
  // 检查是否是data URL格式
  const dataUrlPattern = /^data:image\/(jpeg|jpg|png|gif);base64,/;
  return dataUrlPattern.test(base64String);
}
