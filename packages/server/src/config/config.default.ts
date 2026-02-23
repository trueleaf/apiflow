import { MidwayConfig } from '@midwayjs/core';
import { User } from '../entity/security/user.js';
import { ClientMenu } from '../entity/security/client_menu.js';
import { Role } from '../entity/security/role.js';
import { ClientRoutes } from '../entity/security/client_routes.js';
import { ServerRoutes } from '../entity/security/server_routes.js';
import { LoginRecord } from '../entity/security/login_record.js';
import { UserLimitRecord } from '../entity/security/user_limit_record.js';
import { EmailVerifyCode } from '../entity/security/email_verify_code.js';
import { Project } from '../entity/project/project.js';
import { ProjectVariable } from '../entity/project/project_variable.js';
import { ProjectCode } from '../entity/project/project_code.js';
import { Doc } from '../entity/doc/doc.js';
import { DocPrefix } from '../entity/doc/doc_prefix.js';
import { DocMindParams } from '../entity/doc/doc_mind_params.js';
import { ProjectShare } from '../entity/project/project_share.js';
import { ProjectRules } from '../entity/project/project_rules.js';
import * as koa from '@midwayjs/koa';
import { Attachment } from '../entity/attachment/attachment.js';
import { Group } from '../entity/security/group.js';
import { GlobalCommonHeader } from '../entity/project/project_common_headers.js';
import { SystemConfig } from '../entity/security/system_config.js';

export default (): MidwayConfig => {
  const mongooseOptions: Record<string, unknown> = {};
  if (process.env.MONGODB_USER) {
    mongooseOptions.user = process.env.MONGODB_USER;
  }
  if (process.env.MONGODB_PASS) {
    mongooseOptions.pass = process.env.MONGODB_PASS;
  }
  if (process.env.MONGODB_AUTH_SOURCE) {
    mongooseOptions.authSource = process.env.MONGODB_AUTH_SOURCE;
  }

  return {
    keys: 'apiflow',
    koa: {
      port: 7001,
      http2: false,
    },
    webSocket: {
      // 不设置port，复用koa的端口
    },
    i18n: {
      writeCookie: false,
    },
    cacheManager: {
      clients: {
        default: {
          store: 'memory',
          options: {
            max: 10000,
            ttl: 1000,
          },
        },
      },
    },
    midwayLogger: {
      default: {
        dir: process.env.LOG_DIR || 'logs',
        level: 'info',
        consoleLevel: 'info',
      }
    },
    
    logrotator: {
      maxDays: 14,
      maxFileSize: '100m',
      rotateDuration: '1d',
    },
    mongoose: {
      dataSource: {
        default: {
          uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/apiflow',
          options: {
            ...mongooseOptions,
          },
          // 关联实体
          entities: [
            User,
            ClientMenu,
            ClientRoutes,
            Role,
            ServerRoutes,
            LoginRecord,
            UserLimitRecord,
            EmailVerifyCode,
            Project,
            ProjectVariable,
            ProjectCode,
            ProjectShare,
            Doc,
            DocPrefix,
            DocMindParams,
            ProjectRules,
            Attachment,
            Group,
            GlobalCommonHeader,
            SystemConfig,
          ],
        },
      },
    },
    validate: {
      errorStatus: 200,
    },
    ossConfig: {
      client: {
        endPoint: '',
        region: 'oss-cn-hangzhou',
        accessKeyId: 'access-key',
        accessKeySecret: 'secret',
        bucket: 'bucket'
      }
    },
    uploadConfig: {
      storageService: 'local',
      dir: '/data/apiflow_upload',// 实际存储目录
      fileSize: 1024 * 1024 * 5,
      shareRange: ['project'], //用户自行部署时候，项目内上传附件，只要用户拥有项目访问权限，均可共享
    },
    apiflow: {
      projectMaxMembers: 50,
      canManagedGroupNum: process.env.NODE_ENV === 'production' ? 10 : 5, //一个用户最多创建10个项目
    },
    jwtConfig: {
      secretOrPrivateKey: 'apiflow', //私钥
      expiresIn: `${1000 * 60 * 60 * 24 * 7}`, //过期时间
    },
    llmConfig: {
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1/chat/completions',
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    },
    permission: {
      isFree: (process.env.DEPLOYMENT_TYPE || 'user') === 'user',
      whiteList: [
        '/api/health',
        '/mock/image',
        '/mock',
        '/api/project/share',
        '/api/security/login_password',
        '/api/security/login_guest',
        '/api/security/captcha',
        '/api/security/send_email_code',
        '/api/security/register_email',
        '/api/security/login_email',
        '/api/security/reset_password_by_email',
        '/api/project/share_info',
        '/api/project/export/share_banner',
        '/api/project/share_doc_detail',
        '/api/project/verify_share_password',
        '/api/llm/chat',
        '/api/llm/chat/stream',
        '/api/proxy/http',
        '/api/system/config',
      ],
    },
    security: {
      strictPassword: true,
      defaultUserPassword: '111111',
      allowEmailRegister: process.env.ALLOW_EMAIL_REGISTER === 'true', // 是否允许邮箱注册，默认false
    },
    emailConfig: {
      accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || '',
      accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || '',
      accountName: process.env.ALIYUN_EMAIL_ACCOUNT || '', // 发件人地址
      fromAlias: process.env.ALIYUN_EMAIL_FROM_ALIAS || 'ApiFlow', // 发件人名称
      region: process.env.ALIYUN_EMAIL_REGION || 'cn-hangzhou', // 地域
      verifyCodeExpire: 5 * 60 * 1000, // 验证码有效期 5分钟
      verifyCodeLength: 6, // 验证码长度
    },
    pagination: {
      max: 100,
    },
    upload: {
      fileSize: '20mb',
      whitelist: ['.xlsx', '.jpg', '.png', '.jpeg', '.txt'],

    },
    cors: {
      origin(app: koa.Context) {
        const origin = app.headers.origin;
        return origin;
      },
      credentials: true,
      allowMethods: 'GET,PUT,POST,DELETE',
      exposeHeaders: ['content-disposition', 'x-client-key'],
      allowHeaders: ['Authorization', 'x-sign', 'x-sign-headers', 'x-sign-timestamp', 'x-sign-nonce', 'content-type'],
      maxAge: 60 * 60 * 24
    },
    signConfig: {
      ttl: 1000 * 60
    },
    rateLimitConfig: {
      globalMaxRequests: 100,
      banDuration: 1000 * 60 * 60 * 24, // 1天
      enableGlobalLimit: true,
    },
  }
};
