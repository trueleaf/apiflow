import { Inject, Provide } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { Project } from '../../entity/project/project.js';
import { LoginTokenInfo } from '../../types/types.js';
import { throwError } from '../../utils/utils.js';
import lodash from 'lodash';
const ReadOnlyUrl = [
  {
    url: '/api/project/project_list',
    method: 'get',
  },
  {
    url: '/api/project/project_info',
    method: 'get',
  },
  {
    url: '/api/project/project_full_info',
    method: 'get',
  },
  {
    url: '/api/project/project_members',
    method: 'get',
  },
  {
    url: '/api/project/visited',
    method: 'put',
  },
  {
    url: '/api/project/star',
    method: 'put',
  },
  {
    url: '/api/project/unstar',
    method: 'put',
  },
  {
    url: '/api/project/share_info',
    method: 'get',
  },
  {
    url: '/api/project/share',
    method: 'get',
  },
  {
    url: '/api/apidoc/project/project_rules',
    method: 'get',
  },
  {
    url: '/api/project/doc_tree_node',
    method: 'get',
  },
  {
    url: '/api/project/doc_tree_folder_node',
    method: 'get',
  },
  {
    url: '/api/project/doc_detail',
    method: 'get',
  },
  {
    url: '/api/project/doc_mock',
    method: 'get',
  },
  {
    url: '/api/project/export/html',
    method: 'post',
  },
  {
    url: '/api/project/export/moyu',
    method: 'post',
  },
  {
    url: '/api/project/export/online',
    method: 'post',
  },
  {
    url: '/api/docs/docs_history',
    method: 'post',
  },
  {
    url: '/api/docs/docs_records',
    method: 'get',
  },
  {
    url: '/api/docs/docs_history_operator_enum',
    method: 'get',
  },
  {
    url: '/api/docs/docs_deleted_list',
    method: 'get',
  },
  {
    url: '/api/project/project_variable',
    method: 'get',
  },
  {
    url: '/api/project/project_variable_enum',
    method: 'get',
  },
  {
    url: '/api/project/doc_preset_params_list',
    method: 'get',
  },
  {
    url: '/api/project/doc_preset_params_enum',
    method: 'get',
  },
  {
    url: '/api/project/doc_preset_params',
    method: 'get',
  },
  {
    url: '/api/project/doc_service',
    method: 'get',
  },
  {
    url: '/api/project/doc_service_info',
    method: 'get',
  },
];

@Provide()
export class CommonController {
  @Inject()
  private ctx: Context & { tokenInfo: LoginTokenInfo };

  @InjectEntityModel(Project)
  private projectModel: ReturnModelType<typeof Project>;


  //检查权限是否满足
  isValidPermission(userPermission: 'admin' | 'readAndWrite' | 'readOnly', needPermission: 'admin' | 'readAndWrite' | 'readOnly' = 'admin') {
    if (userPermission === 'admin') {
      return true;
    }
    if (userPermission === 'readAndWrite' && (needPermission === 'readAndWrite' || needPermission === 'readOnly')) {
      return true;
    }
    if (needPermission === 'readOnly') {
      return true;
    }
    return false;
  }
  async checkDocOperationPermissions(projectId: string, needPermission: 'admin' | 'readAndWrite' | 'readOnly' = 'admin') {
    const method = this.ctx.request.method.toLowerCase();
    const URL = this.ctx.request.URL;
    const matchedProject = await this.projectModel.findById({ _id: projectId }).lean();
    if (!matchedProject) {
      return throwError(4002, '暂无当前项目权限');
    }
    
    const users = matchedProject.users;
    const groups = matchedProject.groups;
    const groupUsers: {
      userId: string;
      userName: string;
      permission: 'admin' | 'readAndWrite' | 'readOnly';
    }[] = [];
    groups.forEach(group => {
      group.groupUsers.forEach(groupUser => {
        groupUsers.push(groupUser);
      })
    })
    const allUsers = [...users, ...groupUsers];
    const uniqueUsers = lodash.uniqBy(allUsers, (item) => `${item.userId}-${item.permission}`)
    const matchedUsers = allUsers.filter(user => user.userId === this.ctx.tokenInfo.id);
    if (matchedUsers.length === 0) {
      throwError(4002, '暂无当前项目权限');
    }
    let permission: 'readOnly' | 'admin' | 'readAndWrite' = 'readOnly';
    //取最大权限
    for (let i = 0; i < matchedUsers.length; i++) {
      if (matchedUsers[i].permission === 'admin') {
        permission = 'admin';
        break;
      } else if (matchedUsers[i].permission === 'readAndWrite') {
        permission = 'readAndWrite';
        break;
      }
    }
    //如果用户为只读用户，那么限制用户对于文档操作，只有白名单里面接口允许用户操作
    const accessableReadonlyUrl = ReadOnlyUrl.find(urlInfo => {
      return urlInfo.method === method && URL.pathname.startsWith(urlInfo.url)
    });
    if (permission === 'readOnly' && !accessableReadonlyUrl) {
      return throwError(1012, '只读用户不允许当前操作');
    }
    if (!this.isValidPermission(permission, needPermission)) {
      return throwError(1012, '当前权限无法执行当前操作');
    }
    return {
      projectInfo: matchedProject,
      permission,
      uniqueUsers
    }
  }
}
