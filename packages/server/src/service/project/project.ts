import { Config, Context, Inject, Provide, Logger } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { AddProjectDto, AddMemberToProjectDto, ChangeMemberPermissionInProjectDto, DeleteProjectDto, DeleteMemberFromProjectDto, EditProjectDto, GetDeletedProjectListDto, GetProjectByKeywordDto, GetProjectFullInfoByIdDto, GetProjectInfoByIdDto, GetProjectListDto, GetProjectMembersByIdDto, RestoreProjectDto } from '../../types/dto/project/project.dto.js';
import { GroupItem, Project } from '../../entity/project/project.js';
import { Doc } from '../../entity/doc/doc.js';
import { GlobalConfig, LoginTokenInfo } from '../../types/types.js';
import { User } from '../../entity/security/user.js';
import { throwError } from '../../utils/utils.js';
import { CommonController } from '../../controller/common/common.js';
import lodash from 'lodash';
import { DocMindParams } from '../../entity/doc/doc_mind_params.js';
import { DocMindParamsServer } from '../doc/doc_mind_params.js';
import { DocPrefixServer } from '../doc/doc_prefix.js';
import { ProjectVariableService } from './project_variable.js';
import { ProjectRulesService } from './project_rules.js';
import { Group } from '../../entity/security/group.js';
import { ILogger } from '@midwayjs/logger';

@Provide()
export class ProjectService {
  @Config('apiflow')
    config: GlobalConfig['apiflow'];
  @InjectEntityModel(Project)
    projectModel: ReturnModelType<typeof Project>;
  @InjectEntityModel(DocMindParams)
    docMindParamsModel: ReturnModelType<typeof DocMindParams>;
  @InjectEntityModel(Doc)
    docModel: ReturnModelType<typeof Doc>;
  @InjectEntityModel(User)
    userModel: ReturnModelType<typeof User>;
  @InjectEntityModel(Group)
    groupModel: ReturnModelType<typeof Group>;
  @Inject()
    docMindParamsService: DocMindParamsServer;
  @Inject()
    projectRulesService: ProjectRulesService;
  @Inject()
    projectVariableService: ProjectVariableService;
  @Inject()
    docPrefixService: DocPrefixServer;
  @Inject()
    commonControl: CommonController
  @Inject()
    ctx: Context & { tokenInfo: LoginTokenInfo };
  @Logger()
    logger: ILogger;
  /**
   * 新增项目
   */
  async addProject(params: AddProjectDto) {
    const { projectName, remark, users = [], groups = [] } = params;
    const projectInfo: Partial<Project> = {};
    projectInfo.projectName = projectName;
    projectInfo.remark = remark;
    projectInfo.users = users;
    //创建者默认为管理员
    projectInfo.users.unshift({
      userName: this.ctx.tokenInfo.loginName,
      userId: this.ctx.tokenInfo.id,
      permission: 'admin'
    });
    projectInfo.owner = {
      id: this.ctx.tokenInfo.id,
      name: this.ctx.tokenInfo.loginName
    };
    // const session = await this.userModel.startSession();
    try {
      // await session.startTransaction();
      const matchedGroups = await this.groupModel.find({ _id: { $in: groups.map(v => v.groupId) } }).lean();
      const userSet = new Set();
      userSet.add(this.ctx.tokenInfo.id);
      const fullGroups: GroupItem[] = [];
      matchedGroups.forEach(group => {
        fullGroups.push({
          groupId: group._id.toString(),
          groupName: group.groupName,
          groupUsers: group.members
        })
        group.members.forEach(member => {
          userSet.add(member.userId);
        })
      })
      users.forEach(user => {
        userSet.add(user.userId);
      })
      projectInfo.groups = fullGroups;
      const result = await this.projectModel.create([projectInfo]);
      const userIds = Array.from(userSet);
      await this.userModel.updateMany({ _id: { $in: userIds } }, { $push: { couldVisitProjects: result[0]._id.toString() } });
      // await session.commitTransaction();
      return result[0]._id;
    } catch (error) {
      // await session.abortTransaction();
      this.logger.error('新增项目失败:', error);
      throwError(1015, '新增项目失败')
    } finally {
      // session.endSession();
    }
  }
  /**
   * 给项目添加成员
   */
  async addMemberToProject(params: AddMemberToProjectDto) {
    const { projectId, name, type, permission, id } = params;
    const { projectInfo } = await this.commonControl.checkDocOperationPermissions(projectId, 'admin');
    const memberLength = projectInfo.users.length + projectInfo.groups.length;
    if (type === 'user') {
      if (memberLength >= this.config.projectMaxMembers) {
        throwError(1014, '项目成员数量超过限制')
      }
      await this.projectModel.findByIdAndUpdate({ _id: projectId }, {
        $push: { users: {
          userName: name,
          userId: id,
          permission
        } }
      });
      await this.userModel.updateOne({ _id: id }, { $push: { couldVisitProjects: projectId } });
    } else if (type === 'group') {
      if (memberLength >= this.config.projectMaxMembers) {
        throwError(1014, '项目成员数量超过限制')
      }
      const groupInfo = await this.groupModel.findOne({ _id: id }).lean();
      await this.projectModel.findByIdAndUpdate({ _id: projectId }, {
        $push: { groups: {
          groupId: id,
          groupName: name,
          permission
        } }
      });
      const memberIds = groupInfo.members.map(v => v.userId);
      await this.userModel.updateMany({ _id: { $in: memberIds } }, { $push: { couldVisitProjects: projectId } });
    }
  }
  /**
   * 从项目中删除成员
   */
  async deleteMemberFromProject(params: DeleteMemberFromProjectDto) {
    const { projectId, id, memberType } = params;
    const { projectInfo, uniqueUsers } = await this.commonControl.checkDocOperationPermissions(projectId, 'admin');
    const isDeleteSelf = this.ctx.tokenInfo.id === id;
    const hasAdminUser = (uniqueUsers.filter(v => v.permission === 'admin').length > 1); //删除自身时候，项目至少保留一个管理员
    if (!hasAdminUser && isDeleteSelf) {
      return throwError(1013, '至少保留一个管理员')
    }
    if (memberType === 'user') {
      await this.userModel.updateOne({ _id: id }, { $pull: { couldVisitProjects: projectId } });
      await this.projectModel.findByIdAndUpdate({ _id: projectId }, {
        $pull: {
          users: { userId: id },
        }
      });
    } else if (memberType === 'group') {
      const groupUserIds: string[] = []
      projectInfo.groups.forEach(group => {
        if (group.groupId === id) {
          group.groupUsers.forEach(user => {
            groupUserIds.push(user.userId);
          })
        }
      })
      await this.userModel.updateMany({ _id: { $in: groupUserIds } }, { $pull: { couldVisitProjects: projectId } });
      await this.projectModel.findByIdAndUpdate({ _id: projectId }, {
        $pull: {
          groups: { groupId: id },
        }
      })
    }
    return;
  }
  /**
   * 改变用户在项目中的权限
   */
  async changeMemberPermissionInProject(params: ChangeMemberPermissionInProjectDto) {
    const { projectId, id, permission } = params;
    const { uniqueUsers } = await this.commonControl.checkDocOperationPermissions(projectId, 'admin');
    const isChangeSelf = this.ctx.tokenInfo.id === id;
    const hasAdminUser = (uniqueUsers.filter(v => v.permission === 'admin').length > 1); //删除自身时候，项目至少保留一个管理员
    if (!hasAdminUser && isChangeSelf) {
      return throwError(1013, '至少保留一个管理员')
    }
    await this.projectModel.updateOne({ _id: projectId, 'users.userId': id }, {
      $set: { 'users.$.permission': permission }
    });
  }
  /**
   * 删除项目
   */
  async deleteProject(params: DeleteProjectDto) {
    const { ids } = params;
    const deletedProjects: Project[] = []
    for(let i = 0; i < ids.length; i ++) {
      const { projectInfo } = await this.commonControl.checkDocOperationPermissions(ids[i], 'admin');
      deletedProjects.push(projectInfo)
    }

    const deletedAt = Date.now();
    const result = await this.projectModel.updateMany(
      { _id: { $in: ids }},
      { $set: { isEnabled: false, deletedAt }}
    );
    //同时删除每个用户可访问项目
    const userIds: Set<string> = new Set()
    deletedProjects.forEach(deletedProject => {
      deletedProject.users.forEach(user => {
        userIds.add(user.userId);
      })
      deletedProject.groups.forEach(group => {
        group.groupUsers.forEach(user => {
          userIds.add(user.userId);
        })
      })
    })
    await this.userModel.updateMany({ _id: { $in: userIds } }, { $pull: { couldVisitProjects: { $in: ids } } });
    return result;
  }

  /**
   * 获取已删除项目列表
   * - 全局role=admin：可查看所有已删除项目
   * - 否则：仅返回当前用户在项目内permission=admin的已删除项目
   */
  async getDeletedProjectList(params: GetDeletedProjectListDto) {
    const { pageNum, pageSize, startTime, endTime, projectName } = params;
    const isGlobalAdmin = this.ctx.tokenInfo.role === 'admin';

    const query = { isEnabled: false } as {
      isEnabled: boolean;
      projectName?: RegExp;
      createdAt?: {
        $gt?: number,
        $lt?: number,
      };
      $or?: any[];
    };

    let skipNum = 0;
    let limit = 100;
    if (pageSize != null && pageNum != null) {
      skipNum = (pageNum - 1) * pageSize;
      limit = pageSize;
    }
    if (startTime != null && endTime == null) {
      query.createdAt = { $gt: startTime, $lt: Date.now() };
    } else if (startTime != null && endTime != null) {
      query.createdAt = { $gt: startTime, $lt: endTime };
    }
    if (projectName != null) {
      query.projectName = new RegExp(lodash.escapeRegExp(projectName));
    }

    if (!isGlobalAdmin) {
      const userId = this.ctx.tokenInfo.id;
      query.$or = [
        { users: { $elemMatch: { userId, permission: 'admin' } } },
        { groups: { $elemMatch: { groupUsers: { $elemMatch: { userId, permission: 'admin' } } } } },
      ];
    }

    const list = await this.projectModel
      .find(query, { createdAt: 0 })
      .skip(skipNum)
      .limit(limit)
      .sort({ deletedAt: -1, updatedAt: -1 })
      .lean();

    return list.map(project => ({ ...project, isDeleted: true }));
  }

  /**
   * 恢复项目（软删除恢复）
   * - 允许：全局role=admin 或 项目内permission=admin
   * - 同时恢复成员可访问关系(couldVisitProjects)
   */
  async restoreProject(params: RestoreProjectDto): Promise<string[]> {
    const ids = lodash.uniq(params.ids || []).filter(Boolean);
    const isGlobalAdmin = this.ctx.tokenInfo.role === 'admin';
    const restoredIds: string[] = [];

    for (let i = 0; i < ids.length; i++) {
      const projectId = ids[i];
      if (!isGlobalAdmin) {
        await this.commonControl.checkDocOperationPermissions(projectId, 'admin');
      }

      const project = await this.projectModel.findById(projectId).lean();
      if (!project) {
        continue;
      }

      await this.projectModel.updateOne(
        { _id: projectId },
        { $set: { isEnabled: true }, $unset: { deletedAt: 1 } }
      );

      const userIds: Set<string> = new Set();
      (project.users || []).forEach(user => userIds.add(user.userId));
      (project.groups || []).forEach(group => {
        (group.groupUsers || []).forEach(user => userIds.add(user.userId));
      });

      if (userIds.size > 0) {
        await this.userModel.updateMany(
          { _id: { $in: Array.from(userIds) } },
          { $addToSet: { couldVisitProjects: projectId } }
        );
      }

      restoredIds.push(projectId);
    }

    return restoredIds;
  }
  /**
   * 修改项目
   */
  async editProject(params: EditProjectDto) {
    const { _id, projectName, remark } = params;
    await this.commonControl.checkDocOperationPermissions(_id, 'admin');
    const updateDoc: Partial<Project> = {};
    if (projectName) {
      updateDoc.projectName = projectName;
    }
    if (remark) {
      updateDoc.remark = remark;
    }
    await this.projectModel.findByIdAndUpdate({ _id }, updateDoc);
    return;
  }
  /**
   * 列表形式获取项目
   */
  async getProjectList(params: GetProjectListDto) {
    const { pageNum, pageSize, startTime, endTime, projectName } = params;
    const query = { isEnabled: true } as {
      projectName?: RegExp;
      isEnabled: boolean;
      createdAt?: {
        $gt?: number,
        $lt?: number,
      };
      $or: Record<string, string>[]
    };
    let skipNum = 0;
    let limit = 100;
    //基础查询
    if (pageSize != null && pageNum != null) {
      skipNum = (pageNum - 1) * pageSize;
      limit = pageSize;
    }
    if (startTime != null && endTime == null) {
      query.createdAt = { $gt: startTime, $lt: Date.now() };
    } else if (startTime != null && endTime != null) {
      query.createdAt = { $gt: startTime, $lt: endTime };
    }
    if (projectName != null) {
      query.projectName = new RegExp(lodash.escapeRegExp(projectName));
    }
    query.$or = [
      {
        'users.userId': this.ctx.tokenInfo.id
      },
      {
        'groups.groupUsers.userId': this.ctx.tokenInfo.id
      }
    ];
    const tokenInfo = this.ctx.tokenInfo;
    const visitAndStar = await this.userModel.findOne({ _id: tokenInfo.id }, { recentVisitProjects: 1, starProjects: 1 }).lean();
    const result: {
      list: Omit<Project, 'isEnabled' | 'createdAt'>[];
      recentVisitProjects: string[];
      starProjects: string[];
    } = {
      list: [],
      recentVisitProjects: [],
      starProjects: [],
    };
    result.list = await this.projectModel.find(query, { isEnabled: 0, createdAt: 0 }).skip(skipNum).limit(limit).sort({ updatedAt: -1 });
    result.recentVisitProjects = visitAndStar.recentVisitProjects || [];
    result.starProjects = visitAndStar.starProjects || [];
    return result;
  }
  /**
   * 根据id获取项目基本信息
   */
  async getProjectInfoById(params: GetProjectInfoByIdDto) {
    const { _id } = params;
    await this.commonControl.checkDocOperationPermissions(_id, 'readOnly');
    const result = await this.projectModel.findById(
      { _id, isEnabled: true },
      { createdAt: 0, updatedAt: 0, apidocs: 0, isEnabled: 0 }
    );
    return result;
  }
  /**
   * 根据id获取项目完整信息
   */
  async getProjectFullInfoById(params: GetProjectFullInfoByIdDto) {
    const { _id } = params;
    await this.commonControl.checkDocOperationPermissions(_id, 'readOnly');
    const mindParams = await this.docMindParamsService.geMindParams({ projectId: _id });
    const hosts = await this.docPrefixService.getDocPrefixEnum({ projectId: _id });
    const variables = await this.projectVariableService.getProjectVariableEnum({ projectId: _id });
    const rules = await this.projectRulesService.getProjectRulesById({ projectId: _id });
    const projectInfo = await this.projectModel.findById(
      {
        _id,
        isEnabled: true
      },
      {
        projectName: 1,
      },
    );
    const result = {
      mindParams,
      projectName: projectInfo.projectName,
      _id: projectInfo._id,
      hosts,
      variables,
      rules,
    }
    return result;
  }
  /**
   * 根据id获取项目成员信息
   */
  async getProjectMembersById(params: GetProjectMembersByIdDto) {
    const { _id } = params;
    await this.commonControl.checkDocOperationPermissions(_id, 'readOnly');
    const result = await this.projectModel.findById(
      { _id, isEnabled: true },
      { users: 1, 'groups.groupId': 1, "groups.groupName": 1 }
    );
    return {
      users: result.users,
      groups: result.groups
    };
  }
  /**
   * 以枚举方式获取项目
   */
  async getProjectEnum() {
    const query = {
      isEnabled: true,
      $or: [
        {
          'users.userId': this.ctx.tokenInfo.id
        },
        {
          'groups.groupUsers.userId': this.ctx.tokenInfo.id
        }
      ]
    }
    const limit = 100;
    const result = await this.projectModel.find(query, { projectName: 1 }).limit(limit);
    return result;
  }
  /**
   * 根据关键字获取项目列表
   */
  async getProjectListByKeyword(params: GetProjectByKeywordDto) {
    const { keyword } = params;
    const query: {
      isEnabled: boolean;
      $or: Record<string, string>[]
    } = { isEnabled: true, $or: [] }
    const limit = 100;
    // if (projectName != null) {
    //   query.projectName = new RegExp(lodash.escapeRegExp(projectName));
    // }
    query.$or = [
      {
        'members.userId': this.ctx.tokenInfo.id
      }
    ];
    const allProjects = await this.projectModel.find(query, { isEnabled: 0, createdAt: 0 }).limit(limit).sort({ updatedAt: -1 }).lean();
    const projectIds = allProjects.map(v => v._id);

    const docs = await this.docModel.find({
      projectId: { $in: projectIds },
      'item.url.path': new RegExp(lodash.escapeRegExp(keyword))
    }, {
      projectId: 1,
    }).lean();

    const filteredProjects = allProjects.filter(project => {
      return docs.find(docInfo => docInfo.projectId === project._id.toString()) 
    });
    const tokenInfo = this.ctx.tokenInfo;
    const visitAndStar = await this.userModel.findOne({ _id: tokenInfo.id }, { recentVisitProjects: 1, starProjects: 1 }).lean();
    const result: {
      list: Omit<Project, 'isEnabled' | 'createdAt'>[];
      recentVisitProjects: string[];
      starProjects: string[];
    } = {
      list: [],
      recentVisitProjects: [],
      starProjects: [],
    };
    result.list = filteredProjects;
    result.recentVisitProjects = visitAndStar.recentVisitProjects || [];
    result.starProjects = visitAndStar.starProjects || [];
    return result;
  }
}
