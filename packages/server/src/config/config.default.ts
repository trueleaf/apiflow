import { MidwayConfig } from '@midwayjs/core';
import { User } from '../entity/security/user.js';
import { Sms } from '../entity/security/sms.js';
import { ClientMenu } from '../entity/security/client_menu.js';
import { Role } from '../entity/security/role.js';
import { ClientRoutes } from '../entity/security/client_routes.js';
import { ServerRoutes } from '../entity/security/server_routes.js';
import { LoginRecord } from '../entity/security/login_record.js';
import { UserLimitRecord } from '../entity/security/user_limit_record.js';
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

export default (): MidwayConfig => {
  return {
    keys: 'apiflow',
    koa: {
      port: 7001,
      http2: false,
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
    mongoose: {
      dataSource: {
        default: {
          uri: 'mongodb://localhost:27017/apiflow',
          options: {
            user: '',
            pass: '',
          },
          // 关联实体
          entities: [
            User,
            Sms,
            ClientMenu,
            ClientRoutes,
            Role,
            ServerRoutes,
            LoginRecord,
            UserLimitRecord,
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
            GlobalCommonHeader
          ],
        },
      },
    },
    validate: {
      errorStatus: 200,
    },
    smsConfig: {
      accessKeyId: '',
      accessKeySecret: '',
      endpoint: '',
      signName: '',
      templateCode: '',
      maxAge: 0,
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
      defaultRegisterPassword: '111111',
      projectMaxMembers: 50,
      canManagedGroupNum: process.env.NODE_ENV === 'production' ? 10 : 5, //一个用户最多创建10个项目
    },
    jwtConfig: {
      secretOrPrivateKey: 'apiflow', //私钥
      expiresIn: `${1000 * 60 * 60 * 24 * 7}`, //过期时间
    },
    permission: {
      isFree: false,
      whiteList: [
        '/api/test/**',
        '/mock/image',
        '/mock',
        '/api/security/register',
        '/api/project/share',
        '/api/security/client_routes_multi',
        '/api/security/login_password',
        '/api/security/login_phone',
        '/api/security/sms',
        '/api/security/login_guest',
        '/api/security/captcha',
        '/api/project/doc_mock',
        '/api/project/share_info',
        '/api/project/share_check',
        '/api/project/export/share_banner',
        '/api/project/export/share_project_info',
        '/api/project/share_doc_detail',
        '/api/project/verify_share_password',
      ],
    },
    security: {
      strictPassword: true,
      defaultUserPassword: '111111'
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
