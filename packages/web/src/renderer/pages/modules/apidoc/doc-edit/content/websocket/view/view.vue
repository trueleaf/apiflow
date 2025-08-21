<template>
  <div class="ws-view">
    <div class="view-header">
      <div class="doc-title">
        <h2>{{ websocketInfo.info.name || 'WebSocket接口文档' }}</h2>
        <p v-if="websocketInfo.info.description" class="doc-description">
          {{ websocketInfo.info.description }}
        </p>
      </div>
      
      <div class="doc-actions">
        <el-button @click="handleEdit">编辑</el-button>
        <el-button type="primary" @click="handleTest">测试连接</el-button>
      </div>
    </div>

    <div class="view-content">
      <el-tabs v-model="activeTab" class="doc-tabs">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <div class="basic-info">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="协议">
                <el-tag :type="websocketInfo.item.protocol === 'wss' ? 'success' : 'info'">
                  {{ websocketInfo.item.protocol?.toUpperCase() }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="连接地址">
                <code class="url-text">{{ fullUrl }}</code>
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">
                {{ formatDate(websocketInfo.createdAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="更新时间">
                {{ formatDate(websocketInfo.updatedAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="接口ID" :span="2">
                <code>{{ websocketInfo._id }}</code>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>

        <!-- 连接头 -->
        <el-tab-pane name="headers">
          <template #label>
            <span>连接头</span>
            <el-badge 
              v-if="websocketInfo.item.headers?.length" 
              :value="websocketInfo.item.headers.length" 
              class="ml-1"
            />
          </template>
          
          <div class="headers-view">
            <el-table :data="websocketInfo.item.headers" style="width: 100%">
              <el-table-column prop="key" label="键" min-width="150"></el-table-column>
              <el-table-column prop="value" label="值" min-width="200"></el-table-column>
              <el-table-column prop="description" label="描述" min-width="200"></el-table-column>
              <el-table-column prop="required" label="必填" width="80" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.required" type="danger" size="small">必填</el-tag>
                  <el-tag v-else type="info" size="small">可选</el-tag>
                </template>
              </el-table-column>
            </el-table>
            
            <el-empty v-if="!websocketInfo.item.headers?.length" description="暂无连接头配置">
            </el-empty>
          </div>
        </el-tab-pane>

        <!-- 公共请求头 -->
        <el-tab-pane name="commonHeaders">
          <template #label>
            <span>公共请求头</span>
            <el-badge 
              v-if="websocketInfo.commonHeaders?.length" 
              :value="websocketInfo.commonHeaders.length" 
              class="ml-1"
            />
          </template>
          
          <div class="common-headers-view">
            <el-table :data="websocketInfo.commonHeaders" style="width: 100%">
              <el-table-column prop="key" label="键" min-width="150"></el-table-column>
              <el-table-column prop="value" label="值" min-width="200"></el-table-column>
              <el-table-column prop="description" label="描述" min-width="200"></el-table-column>
            </el-table>
            
            <el-empty v-if="!websocketInfo.commonHeaders?.length" description="暂无公共请求头">
            </el-empty>
          </div>
        </el-tab-pane>

        <!-- 前置脚本 -->
        <el-tab-pane label="前置脚本" name="preScript">
          <div class="script-view">
            <div v-if="websocketInfo.preRequest?.raw" class="script-content">
              <div class="script-header">
                <span class="script-title">连接前执行脚本</span>
                <el-button size="small" @click="handleCopyScript('pre')">
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-button>
              </div>
              <pre class="script-code"><code>{{ websocketInfo.preRequest.raw }}</code></pre>
            </div>
            
            <el-empty v-else description="暂无前置脚本">
            </el-empty>
          </div>
        </el-tab-pane>

        <!-- 后置脚本 -->
        <el-tab-pane label="后置脚本" name="afterScript">
          <div class="script-view">
            <div v-if="websocketInfo.afterRequest?.raw" class="script-content">
              <div class="script-header">
                <span class="script-title">连接后执行脚本</span>
                <el-button size="small" @click="handleCopyScript('after')">
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-button>
              </div>
              <pre class="script-code"><code>{{ websocketInfo.afterRequest.raw }}</code></pre>
            </div>
            
            <el-empty v-else description="暂无后置脚本">
            </el-empty>
          </div>
        </el-tab-pane>

        <!-- 示例代码 -->
        <el-tab-pane label="示例代码" name="examples">
          <div class="examples-view">
            <el-tabs v-model="exampleLang" type="card">
              <el-tab-pane label="JavaScript" name="javascript">
                <div class="example-content">
                  <div class="example-header">
                    <span>JavaScript WebSocket 连接示例</span>
                    <el-button size="small" @click="handleCopyExample('javascript')">
                      <el-icon><CopyDocument /></el-icon>
                      复制代码
                    </el-button>
                  </div>
                  <pre class="code-block"><code>{{ jsExample }}</code></pre>
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="Python" name="python">
                <div class="example-content">
                  <div class="example-header">
                    <span>Python WebSocket 连接示例</span>
                    <el-button size="small" @click="handleCopyExample('python')">
                      <el-icon><CopyDocument /></el-icon>
                      复制代码
                    </el-button>
                  </div>
                  <pre class="code-block"><code>{{ pythonExample }}</code></pre>
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="Node.js" name="nodejs">
                <div class="example-content">
                  <div class="example-header">
                    <span>Node.js WebSocket 连接示例</span>
                    <el-button size="small" @click="handleCopyExample('nodejs')">
                      <el-icon><CopyDocument /></el-icon>
                      复制代码
                    </el-button>
                  </div>
                  <pre class="code-block"><code>{{ nodejsExample }}</code></pre>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
import type { WebSocketNode } from '@/types/websocket/websocket'

const activeTab = ref('basic')
const exampleLang = ref('javascript')

// 模拟WebSocket数据
const websocketInfo = ref<WebSocketNode>({
  _id: 'ws_123456789',
  pid: 'project_001',
  projectId: 'proj_001',
  sort: 1,
  info: {
    name: '聊天室WebSocket接口',
    description: '实时聊天功能的WebSocket连接，支持文本消息、图片、文件传输等功能',
    version: '1.0.0',
    contact: {
      name: 'API团队',
      email: 'api@example.com',
      url: 'https://example.com'
    }
  },
  item: {
    protocol: 'wss',
    url: {
      path: '/chat',
      prefix: 'wss://api.example.com'
    },
    headers: [
      { key: 'Authorization', value: 'Bearer {{token}}', description: '用户认证令牌', required: true, type: 'string' },
      { key: 'User-Agent', value: 'ChatApp/1.0', description: '客户端标识', required: false, type: 'string' }
    ]
  },
  commonHeaders: [
    { key: 'Accept-Language', value: 'zh-CN,zh;q=0.9,en;q=0.8', description: '语言偏好' },
    { key: 'Origin', value: 'https://chat.example.com', description: '请求来源' }
  ],
  preRequest: {
    raw: `// 连接前脚本
const token = ws.getVariable('userToken');
if (!token) {
  throw new Error('用户未登录，无法建立连接');
}

// 设置认证头
ws.setHeader('Authorization', 'Bearer ' + token);

// 记录连接日志
console.log('正在连接到聊天服务器...', ws.getUrl());`
  },
  afterRequest: {
    raw: `// 连接成功后脚本
console.log('WebSocket连接已建立');

// 发送心跳消息
const heartbeat = () => {
  ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
};

// 每30秒发送一次心跳
setInterval(heartbeat, 30000);`
  },
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-20T14:22:00Z'
})

const fullUrl = computed(() => {
  const info = websocketInfo.value.item
  return `${info.url.prefix}${info.url.path}`
})

const jsExample = computed(() => {
  return `// JavaScript WebSocket 连接示例
const ws = new WebSocket('${fullUrl.value}');

// 连接建立
ws.onopen = function(event) {
  console.log('WebSocket连接已建立');
  
  // 发送登录消息
  ws.send(JSON.stringify({
    type: 'login',
    userId: 'user123',
    token: 'your_token_here'
  }));
};

// 接收消息
ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('收到消息:', data);
  
  // 处理不同类型的消息
  switch(data.type) {
    case 'message':
      displayMessage(data);
      break;
    case 'notification':
      showNotification(data);
      break;
  }
};

// 连接关闭
ws.onclose = function(event) {
  console.log('WebSocket连接已关闭:', event.code, event.reason);
};

// 连接错误
ws.onerror = function(error) {
  console.error('WebSocket错误:', error);
};

// 发送消息函数
function sendMessage(content) {
  const message = {
    type: 'message',
    content: content,
    timestamp: Date.now()
  };
  ws.send(JSON.stringify(message));
}`
})

const pythonExample = computed(() => {
  return `# Python WebSocket 连接示例
import asyncio
import websockets
import json

async def connect_websocket():
    uri = "${fullUrl.value}"
    headers = {
        "Authorization": "Bearer your_token_here",
        "User-Agent": "ChatApp/1.0"
    }
    
    async with websockets.connect(uri, extra_headers=headers) as websocket:
        print("WebSocket连接已建立")
        
        # 发送登录消息
        login_message = {
            "type": "login",
            "userId": "user123",
            "token": "your_token_here"
        }
        await websocket.send(json.dumps(login_message))
        
        # 监听消息
        async for message in websocket:
            data = json.loads(message)
            print(f"收到消息: {data}")
            
            # 处理不同类型的消息
            if data["type"] == "message":
                print(f"新消息: {data['content']}")
            elif data["type"] == "notification":
                print(f"通知: {data['content']}")

# 运行WebSocket客户端
if __name__ == "__main__":
    asyncio.run(connect_websocket())`
})

const nodejsExample = computed(() => {
  return `// Node.js WebSocket 连接示例
const WebSocket = require('ws');

const ws = new WebSocket('${fullUrl.value}', {
  headers: {
    'Authorization': 'Bearer your_token_here',
    'User-Agent': 'ChatApp/1.0'
  }
});

// 连接建立
ws.on('open', function open() {
  console.log('WebSocket连接已建立');
  
  // 发送登录消息
  const loginMessage = {
    type: 'login',
    userId: 'user123',
    token: 'your_token_here'
  };
  ws.send(JSON.stringify(loginMessage));
});

// 接收消息
ws.on('message', function message(data) {
  const parsed = JSON.parse(data.toString());
  console.log('收到消息:', parsed);
  
  // 处理不同类型的消息
  switch(parsed.type) {
    case 'message':
      console.log(\`新消息: \${parsed.content}\`);
      break;
    case 'notification':
      console.log(\`通知: \${parsed.content}\`);
      break;
  }
});

// 连接关闭
ws.on('close', function close(code, reason) {
  console.log(\`WebSocket连接已关闭: \${code} \${reason}\`);
});

// 连接错误
ws.on('error', function error(err) {
  console.error('WebSocket错误:', err);
});

// 发送消息函数
function sendMessage(content) {
  const message = {
    type: 'message',
    content: content,
    timestamp: Date.now()
  };
  ws.send(JSON.stringify(message));
}

module.exports = { ws, sendMessage };`
})

const formatDate = (dateString?: string) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleString('zh-CN')
}

const handleEdit = () => {
  console.log('切换到编辑模式')
}

const handleTest = () => {
  console.log('开始测试WebSocket连接')
}

const handleCopyScript = (type: 'pre' | 'after') => {
  const script = type === 'pre' 
    ? websocketInfo.value.preRequest?.raw 
    : websocketInfo.value.afterRequest?.raw
  
  if (script) {
    navigator.clipboard.writeText(script).then(() => {
      console.log('脚本已复制到剪贴板')
    })
  }
}

const handleCopyExample = (lang: string) => {
  let code = ''
  switch (lang) {
    case 'javascript':
      code = jsExample.value
      break
    case 'python':
      code = pythonExample.value
      break
    case 'nodejs':
      code = nodejsExample.value
      break
  }
  
  if (code) {
    navigator.clipboard.writeText(code).then(() => {
      console.log('示例代码已复制到剪贴板')
    })
  }
}
</script>

<style lang="scss" scoped>
.ws-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;

  .view-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 24px;
    border-bottom: 1px solid var(--gray-300);

    .doc-title {
      h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
        color: var(--gray-900);
      }

      .doc-description {
        margin: 0;
        color: var(--gray-600);
        line-height: 1.5;
      }
    }

    .doc-actions {
      display: flex;
      gap: 8px;
    }
  }

  .view-content {
    flex: 1;
    overflow: hidden;

    .doc-tabs {
      height: 100%;

      :deep(.el-tabs__content) {
        height: calc(100% - 40px);
        overflow-y: auto;
        padding: 16px;
      }
    }

    .basic-info {
      .url-text {
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        background: var(--gray-100);
        padding: 4px 8px;
        border-radius: 4px;
        color: var(--primary-color);
      }
    }

    .headers-view,
    .common-headers-view {
      :deep(.el-table) {
        font-size: 13px;
      }
    }

    .script-view {
      .script-content {
        .script-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--gray-300);

          .script-title {
            font-weight: 500;
            color: var(--gray-700);
          }
        }

        .script-code {
          background: var(--gray-50);
          border: 1px solid var(--gray-300);
          border-radius: 8px;
          padding: 16px;
          margin: 0;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.5;
          overflow-x: auto;
          color: var(--gray-800);
        }
      }
    }

    .examples-view {
      .example-content {
        .example-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-weight: 500;
          color: var(--gray-700);
        }

        .code-block {
          background: var(--gray-900);
          color: var(--gray-100);
          border-radius: 8px;
          padding: 20px;
          margin: 0;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.6;
          overflow-x: auto;
          white-space: pre;

          code {
            color: inherit;
            background: none;
          }
        }
      }
    }
  }
}
</style>
