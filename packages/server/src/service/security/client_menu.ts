import { Provide } from '@midwayjs/core';
import { AddClientMenuDto, ChangeCLientMenuPositionDto, DeleteClientMenuDto, EditClientMenuDto } from '../../types/dto/security/client.menu.dto.js';
import { throwError } from '../../utils/utils.js';
import { ClientMenu } from '../../entity/security/client_menu.js';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { Types } from 'mongoose';

@Provide()
export class ClientMenuService {
  @InjectEntityModel(ClientMenu)
    clientMenuModel: ReturnModelType<typeof ClientMenu>;
  /**
   * 新增前端菜单
   */
  async addClientMenu(params: AddClientMenuDto) {
    const { name, path, pid, type } = params;
    const doc: Partial<ClientMenu> = {};
    doc.name = name;
    doc.path = path;
    doc.pid = pid;
    if (type) {
      doc.type = type;
    }
    const hasClientMenu = await this.clientMenuModel.findOne({ name });
    if (hasClientMenu) {
      return throwError(1003, '当前菜单名称已存在')
    }
    const result = await this.clientMenuModel.create(doc);
    return { _id: result._id };
  }
  /**
   * 修改前端菜单
   */
  async editClientMenu(params: EditClientMenuDto) {
    const { _id, name, path, type } = params;
    const updateDoc: Partial<ClientMenu> = {};
    if (name) {
      updateDoc.name = name;
    }
    if (path) {
      updateDoc.path = path;
    }
    if (type) {
      updateDoc.type = type;
    }
    const hasClientMenu = await this.clientMenuModel.findOne({ _id: { $ne: _id }, name });
    if (hasClientMenu) {
      throwError(1003, '当前菜单名称已存在')
    }
    await this.clientMenuModel.findByIdAndUpdate({ _id }, updateDoc);
  }
  /**
   * 删除前端菜单
   */
  async deleteClientMenu(params: DeleteClientMenuDto) {
    const { ids } = params;
    const result = await this.clientMenuModel.deleteMany({
      $or: [
        { _id: { $in: ids }},
        { pid: { $in: ids }}
      ]
    });
    return result;
  }
  /**
   * 以树形结构获取前端菜单
   */
  async getClientMenuAsTreeData() {
    const allMenus = await this.clientMenuModel
      .find({ isEnabled: true }, { type: 1, name: 1, path: 1, pid: 1, sort: 1 })
      .sort({ sort: -1 })
      .lean() as (ClientMenu & { children: ClientMenu[], _id: Types.ObjectId })[];
    const result: ClientMenu[] = [];
    for (let i = 0, len = allMenus.length; i < len; i++) {
      if (allMenus[i].pid == null || allMenus[i].pid === '') {
        allMenus[i].children = [];
        result.push(allMenus[i]);
      }
      const id = allMenus[i]._id.toString();
      for (let j = 0, len2 = allMenus.length; j < len2; j++) {
        if (id === allMenus[j].pid) {
          if (allMenus[i].children == null) {
            allMenus[i].children = [];
          }
          allMenus[i].children.push(allMenus[j]);
        }
      }
    }
    return result;
  }
  /**
   * 修改前端菜单位置
   */
  async changeClientMenuPosition(params: ChangeCLientMenuPositionDto) {
    const { _id, pid, sort } = params;
    if (_id === pid) {
      return throwError(1003, '拖拽节点id与放置节点id重复')
    }
    const updateDoc: {
      $set: {
        pid: string;
        sort: number;
      }
    } = { $set: {
      pid: '',
      sort: 0,
    }};
    updateDoc.$set.pid = pid;
    updateDoc.$set.sort = sort;
    await this.clientMenuModel.findByIdAndUpdate({ _id }, updateDoc);
    return;
  }
}
