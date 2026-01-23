// 错误页面参数
type ErrorPageParams = {
  errorCode: number;
  errorDescription: string;
  failedUrl: string;
  retryCount: number;
  maxRetries: number;
};
// 获取错误码对应的友好描述
const getErrorMessage = (errorCode: number): { title: string; description: string } => {
  const errorMessages: Record<number, { title: string; description: string }> = {
    [-2]: {
      title: 'Network Error',
      description: 'Unable to connect to the network. Please check your internet connection.',
    },
    [-3]: {
      title: 'Request Cancelled',
      description: 'The page load was cancelled.',
    },
    [-6]: {
      title: 'File Not Found',
      description: 'The requested file could not be found.',
    },
    [-7]: {
      title: 'Connection Timeout',
      description: 'The connection timed out. The server may be slow or unavailable.',
    },
    [-21]: {
      title: 'Network Changed',
      description: 'The network connection was interrupted due to a network change.',
    },
    [-100]: {
      title: 'Connection Closed',
      description: 'The connection was closed unexpectedly.',
    },
    [-101]: {
      title: 'Connection Reset',
      description: 'The connection was reset by the server.',
    },
    [-102]: {
      title: 'Connection Refused',
      description: 'The server refused the connection. It may be offline or not accepting connections.',
    },
    [-103]: {
      title: 'Connection Failed',
      description: 'Failed to establish a connection to the server.',
    },
    [-104]: {
      title: 'Name Not Resolved',
      description: 'The server name could not be resolved. Please check the URL.',
    },
    [-105]: {
      title: 'Address Unreachable',
      description: 'The server address is unreachable.',
    },
    [-106]: {
      title: 'Internet Disconnected',
      description: 'You are not connected to the internet.',
    },
    [-109]: {
      title: 'Address Invalid',
      description: 'The server address is invalid.',
    },
    [-118]: {
      title: 'Connection Timed Out',
      description: 'The connection to the server timed out.',
    },
    [-130]: {
      title: 'Proxy Connection Failed',
      description: 'Failed to connect through the proxy server.',
    },
    [-200]: {
      title: 'Certificate Error',
      description: 'There is a problem with the website\'s security certificate.',
    },
    [-1]: {
      title: 'Page Crashed',
      description: 'The page has crashed unexpectedly.',
    },
  };
  return errorMessages[errorCode] || {
    title: 'Page Load Failed',
    description: 'An unexpected error occurred while loading the page.',
  };
};
// 生成错误页面 HTML
export const generateErrorPageHtml = (params: ErrorPageParams): string => {
  const { errorCode, errorDescription, failedUrl, retryCount, maxRetries } = params;
  const errorInfo = getErrorMessage(errorCode);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Load Error - Apiflow</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #e0e0e0;
      padding: 20px;
    }
    .container {
      text-align: center;
      max-width: 500px;
      width: 100%;
    }
    .icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      background: rgba(255, 107, 107, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon svg {
      width: 40px;
      height: 40px;
      stroke: #ff6b6b;
    }
    h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #ffffff;
    }
    .description {
      font-size: 14px;
      color: #a0a0a0;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .error-details {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      text-align: left;
      font-size: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .error-details .label {
      color: #888;
      margin-bottom: 4px;
    }
    .error-details .value {
      color: #e0e0e0;
      word-break: break-all;
      margin-bottom: 12px;
    }
    .error-details .value:last-child {
      margin-bottom: 0;
    }
    .retry-info {
      font-size: 12px;
      color: #888;
      margin-bottom: 24px;
    }
    .buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
    button {
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      outline: none;
    }
    .btn-primary {
      background: #4f46e5;
      color: white;
    }
    .btn-primary:hover {
      background: #4338ca;
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #e0e0e0;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    .btn-primary:active, .btn-secondary:active {
      transform: scale(0.98);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    </div>
    <h1>${errorInfo.title}</h1>
    <p class="description">${errorInfo.description}</p>
    <div class="error-details">
      <div class="label">URL</div>
      <div class="value">${failedUrl}</div>
      <div class="label">Error Code</div>
      <div class="value">${errorCode} - ${errorDescription}</div>
    </div>
    <p class="retry-info">Auto retry attempts: ${retryCount}/${maxRetries}</p>
    <div class="buttons">
      <button class="btn-primary" onclick="window.electronAPI.contentViewRetry()">
        Retry
      </button>
      <button class="btn-secondary" onclick="window.electronAPI.contentViewFallback()">
        Use Local Version
      </button>
    </div>
  </div>
  <script>
    // 如果 electronAPI 不可用，使用 postMessage 作为后备方案
    if (!window.electronAPI) {
      window.electronAPI = {
        contentViewRetry: () => {
          window.postMessage({ type: 'contentView:retry' }, '*');
        },
        contentViewFallback: () => {
          window.postMessage({ type: 'contentView:fallback' }, '*');
        }
      };
    }
  </script>
</body>
</html>`;
};
