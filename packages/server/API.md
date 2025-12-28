# API 文档（自动汇总）

说明：本文件列出项目中 HTTP 接口的**URL / Method / 描述 / 参数（来源 + 展开字段） / 备注（鉴权/限流/文件上传）**。

---

## 目录
- [Security - 用户与鉴权](#security---用户与鉴权)
- [Security - 权限、角色、路由、菜单](#security---权限角色路由菜单)
- [Project - 项目相关](#project---项目相关)
- [Docs - 文档与导入导出](#docs---文档与导入导出)
- [Attachment - 文件上传](#attachment---文件上传)
- [Test / Misc](#test--misc)

---

## Security - 用户与鉴权 ✅

### [GET] `/api/security/sms`
- 描述：获取手机验证码
- 入参（query）：`SMSDto`
  - `phone` (string) — 必填
  - `captcha` (string) — 必填
  - `clientKey` (string) — 必填
- 备注：需要请求签名 `@ReqSign()`；会对图形验证码进行校验。

### [GET] `/api/security/captcha`
- 描述：获取图形验证码 (返回 SVG)
- 入参（query）：`SvgCaptchaDto`
  - `width` (number) — 默认 100
  - `height` (number) — 默认 100
- 备注：`@ReqSign()`，`@ReqLimit({ ttl:..., max: 10, limitBy: 'ip' })`，返回头 `content-type: image/svg+xml`。

### [POST] `/api/security/register`
- 描述：手机号用户注册
- 入参（body）：`RegisterByPhoneDto`
  - `loginName` (string) — 必填
  - `password` (string) — 必填
  - `smsCode` (string) — 必填
  - `phone?` (string) — 可选
  - `realName?` (string) — 可选
- 备注：`@ReqSign()`，`@ReqLimit(...)`

### [POST] `/api/security/login_password`
- 描述：账号密码登录
- 入参（body）：`LoginByPasswordDto`
  - `loginName` (string) — 必填
  - `password` (string) — 必填
  - `captcha?` (string) — 可选
- 备注：`@ReqSign()`，限流

### [POST] `/api/security/login_phone`
- 描述：手机 + 短信验证码登录
- 入参（body）：`LoginByPhoneDto`
  - `phone` (string) — 必填
  - `smsCode` (string) — 必填
- 备注：`@ReqSign()`，限流

### [PUT] `/api/security/user_password`
- 描述：修改密码（用户主动修改）
- 入参（body）：`ChangePasswordByUserDto`
  - `oldPassword` (string) — 必填
  - `newPassword` (string) — 必填

### [POST] `/api/security/user_reset_password`
- 描述：重置密码（用户）
- 入参：`ResetPasswordDto` (body 或 params，函数签名未显式 `@Body`)：
  - `phone` (string) — 必填
  - `smsCode` (string) — 必填
  - `password` (string) — 必填
- 备注：`@ReqSign()`，限流

### [PUT] `/api/security/reset_password`
- 描述：管理员重置密码
- 入参（body）：`ResetPasswordByAdminDto`
  - `userId` (string) — 必填
  - `password` (string) — 必填

### [POST] `/api/security/useradd`
- 描述：手动添加用户
- 入参（body）：`AddUserDto`
  - `loginName` (string) — 必填
  - `realName?` (string)
  - `phone?` (string)
  - `password?` (string)
  - `roleIds` (string[]) — 必填
  - `roleNames?` (string[])

### [GET] `/api/security/user_list`
- 描述：获取用户列表（分页）
- 入参（query）：`GetUserListDto`（继承自 TableSearchParams）
  - `loginName?` (string)
  - `realName?` (string)
  - `phone?` (string)

### [PUT] `/api/security/user_state`
- 描述：启用/禁用用户
- 入参（body）：`ChangeUserStateDto`
  - `_id` (string) — 必填
  - `isEnabled` (boolean) — 必填

### [GET] `/api/security/user_info_by_id`
- 描述：根据 id 获取用户信息
- 入参（query）：`GetUserInfoByIdDto`
  - `_id` (string) — 必填

### [GET] `/api/security/user_info`
- 描述：获取当前登录用户信息
- 入参：无

### [GET] `/api/security/userListByName`
- 描述：按名称查询用户列表
- 入参（query）：`GetUserListByNameDto`
  - `name` (string) — 可为空
- 备注：`@ReqSign()`，限流

### [GET] `/api/security/userOrGroupListByName`
- 描述：按用户/组/手机号查询
- 入参（query）：`GetUserListByNameDto`
- 备注：`@ReqSign()`，限流

### [PUT] `/api/security/user_permission`
- 描述：改变用户权限/手机号/登录名/昵称
- 入参（body）：`ChangeUserInfoDto`
  - `_id` (string) — 必填
  - `roleIds?` (string[])
  - `roleNames?` (string[])
  - `loginName?` (string)
  - `phone?` (string)
  - `realName?` (string)

### [GET] `/api/security/user_excel_template`
- 描述：下载用户批量导入模板
- 入参：无

### [POST] `/api/security/login_guest`
- 描述：访客登录（创建临时用户）
- 入参：无

### [POST] `/api/security/add_user_by_excel`
- 描述：通过 excel 批量导入用户
- 入参（files + body）：
  - `files` (上传文件，accept: excel mime types)
- 备注：文件类型检查，返回错误码 1006 如果文件格式不正确

### [PUT] `/api/project/visited`
- 描述：添加最近访问页面
- 入参（body）：`AddLastVisitedDto`
  - `projectId` (string) — 必填

### [PUT] `/api/project/star`
- 描述：收藏项目
- 入参（body）：`StarProjectDto` — `projectId` (string) — 必填

### [PUT] `/api/project/unstar`
- 描述：取消收藏项目
- 入参（body）：`UnStarProjectDto` — `projectId` (string) — 必填

---

## Security - 权限、角色、路由、菜单 ✅

### Group（分组）
- [POST] `/api/group/create` — 创建组 — body: `CreateGroupDTO`
  - `groupName` (string) — 必填
  - `description?` (string)
  - `members?` (Member[])
    - Member: `userId` (string), `userName` (string), `realName?`, `permission` ('readOnly'|'readAndWrite'|'admin'), `expireAt?` (Date)
- [PUT] `/api/group/update` — 更新组 — body: `UpdateGroupDTO` (`_id`, `groupName?`, `description?`, `isEnabled?`, `isAllowInvite`)
- [GET] `/api/group/list` — 获取组列表 — 无参数
- [POST] `/api/group/member/add` — 添加组成员 — body: `AddMemberDTO` (`groupId`, `userId`, `userName`, `permission`, `expireAt?`)
- [DEL] `/api/group/member/remove` — 移除组成员 — body: `RemoveMemberDTO` (`groupId`, `userId`)
- [DEL] `/api/group/remove` — 删除组 — body: `RemoveGroupDTO` (`ids`: string[])
- [PUT] `/api/group/member/permission` — 更新成员权限 — body: `UpdatePermissionDTO` (`groupId`, `userId`, `permission`)

### Role（角色）
- [POST] `/api/security/role` — 新增角色 — body: `AddRoleDto` (roleName, clientRoutes[], clientBanner[], serverRoutes[], remark?)
- [PUT] `/api/security/role` — 修改角色 — body: `EditRoleDto` (_id, roleName?, clientRoutes[], clientBanner[], serverRoutes[], remark?)
- [DEL] `/api/security/role` — 删除角色 — body: `DeleteRoleDto` (ids: string[])
- [GET] `/api/security/role_list` — 分页获取角色 — query: `GetRoleListDto`
- [GET] `/api/security/role_enum` — 获取角色枚举 — 无参数
- [GET] `/api/security/role_info` — 获取角色详情 — query: `GetRoleInfoDto` (`_id`)

### Server Routes（服务端路由）
- [POST] `/api/security/server_routes` — 新增 — body: `AddServerRouteDto` (path, method, name, groupName?)
- [PUT] `/api/security/server_routes` — 修改 — body: `EditServerRouteDto` (_id, path?, method?, name?, groupName?)
- [PUT] `/api/security/server_routes_type` — 批量修改分组 — body: `ChangeGroupNameByIdsDto` (ids: string[], groupName?)
- [DEL] `/api/security/server_routes` — 删除 — body: `DeleteServerRouteDto` (ids: string[])
- [GET] `/api/security/server_routes` — 获取全部服务端路由 — 无参数

### Client Routes（前端路由）
- [POST] `/api/security/client_routes` — 新增 — body: `AddClientRoutesDto` (name, path, groupName?)
- [PUT] `/api/security/client_routes` — 修改 — body: `EditClientRoutesDto` (_id, name?, path?, groupName?)
- [DEL] `/api/security/client_routes` — 删除 — body: `DeleteClientRoutesDto` (ids: string[])
- [PUT] `/api/security/client_routes_type` — 批量修改分组 — body: `ChangeGroupNameByIds` (ids: string[], groupName?)
- [GET] `/api/security/client_routes` — 获取全部前端路由 — 无参数

### Client Menu（前端菜单）
- [POST] `/api/security/client_menu` — 新增菜单 — body: `AddClientMenuDto` (name, path, type, pid?)
- [PUT] `/api/security/client_menu` — 修改菜单 — body: `EditClientMenuDto` (_id, name?, path?, type?)
- [DEL] `/api/security/client_menu` — 删除菜单 — body: `DeleteClientMenuDto` (ids: string[])
- [GET] `/api/security/client_menu_tree` — 获取菜单树 — 无参数
- [PUT] `/api/security/client_menu_position` — 修改菜单位置 — body: `ChangeCLientMenuPositionDto` (_id, pid?, sort)

### User Limit Records
- [GET] `/api/security/user_limit_records` — 获取用户限制记录列表 — query: { page, pageSize, limitType?: 'user'|'ip', userId?, ip?, isReleased? } — 有 `@ReqSign()` 和 `@ReqLimit`
- [GET] `/api/security/user_limit_record/:id` — 获取详情 — query: { id: string } — `@ReqSign()`
- [PUT] `/api/security/user_limit_record/release` — 手动解除限制 — body: { id: string } — `@ReqSign()`
- [GET] `/api/security/user_limit_stats` — 获取统计 — 无参数 — `@ReqSign()`

---

## Project - 项目相关 ✅

### Project 基本
- [POST] `/api/project/add_project` — 新增项目 — body: `AddProjectDto` (projectName, remark?, users?, groups?)
- [POST] `/api/project/add_user` — 给项目添加成员 — body: `AddMemberToProjectDto` (id, projectId, name, type, permission?)
- [DEL] `/api/project/delete_user` — 从项目删除成员 — body: `DeleteMemberFromProjectDto` (id, memberType, projectId)
- [PUT] `/api/project/change_permission` — 改变用户权限 — body: `ChangeMemberPermissionInProjectDto` (id, projectId, permission)
- [DEL] `/api/project/delete_project` — 删除项目 — body: `DeleteProjectDto` (ids: string[])
- [PUT] `/api/project/edit_project` — 修改项目信息 — body: `EditProjectDto` (_id, projectName?, remark?)
- [GET] `/api/project/project_list` — 获取项目列表 — query: `GetProjectListDto`
- [GET] `/api/project/project_full_info` — 获取项目完整信息 — query: `GetProjectFullInfoByIdDto` (`_id`)
- [GET] `/api/project/project_members` — 获取项目成员 — query: `GetProjectMembersByIdDto` (`_id`)
- [GET] `/api/project/project_enum` — 枚举方式获取项目 — 无参数

### Project Common Headers
- [GET] `/api/project/common_header_by_id` — 获取单个请求头 — query: `GetProjectCommonHeaderByIdDto` (projectId, id)
- [PUT] `/api/project/common_header` — 新增或修改请求头 — body: `UpsertProjectCommonHeaderDto` (projectId, id, commonHeaders[])
- [GET] `/api/project/common_headers` — 获取公共请求头 — query: `GetProjectCommonHeadersDto` (projectId)
- [GET] `/api/project/global_common_headers` — 获取全局请求头 — query: `GetGlobalProjectCommonHeadersDto` (projectId)
- [PUT] `/api/project/replace_global_common_headers` — 更新全局请求头 — body: `UpsertGlobalProjectCommonHeaderDto` (projectId, commonHeaders[])

### Project Share / Export
- [POST] `/api/project/export/online` — 生成在线链接 — body: `GenerateSharedProjectLinkDto` (shareName, projectId, password?, maxAge?, isCustomDate?, selectedDocs?)
- [PUT] `/api/project/export/online` — 编辑在线链接 — body: `EditSharedProjectLinkDto` (_id, projectId, shareName?, password?, maxAge?, isCustomDate?, selectedDocs?)
- [GET] `/api/project/export/online_list` — 获取在线链接列表 — query: `GetSharedProjectLinkListDto` (projectId)
- [DEL] `/api/project/export/online` — 删除在线链接 — body: `DeleteSharedProjectLinkDto` (projectId, _id)
- [GET] `/api/project/share_info` — 获取分享信息 — query: `GetSharedLinkInfoDto` (shareId) — `@ReqSign()` & `@ReqLimit`
- [GET] `/api/project/export/share_banner` — 获取分享文档 banner — query: `GetSharedProjectBannerDto` (shareId, password?)
- [GET] `/api/project/share_doc_detail` — 获取分享项目接口详情 — query: `GetSharedDocDetailDto` (docId, shareId, password?)
- [POST] `/api/project/verify_share_password` — 验证分享密码 — body: `VerifySharePasswordDto` (shareId, password) — `@ReqSign()` & `@ReqLimit`

### Project Variable（全局变量）
- [POST] `/api/project/project_variable` — 新增变量 — body: `AddProjectVariableDto` (projectId, name, type, value, fileValue?)
- [PUT] `/api/project/project_variable` — 修改变量 — body: `EditProjectVariableDto` (projectId, _id, name, type, value?, fileValue?)
- [DEL] `/api/project/project_variable` — 删除变量 — body: `DeleteProjectVariableDto` (projectId, ids)
- [GET] `/api/project/project_variable` — 列表 — query: `GetProjectVariableListDto` (projectId)
- [GET] `/api/project/project_variable_enum` — 枚举 — query: `GetProjectVariableEnumDto` (projectId)

---

## Docs - 文档与导出 ✅

### Docs（文档操作）
- [POST] `/api/project/new_doc` — 新增空白文档 — body: `AddEmptyDocDto` (name, type, pid?, projectId)
- [POST] `/api/project/copy_doc` — 生成文档副本 — body: `GenerateDocCopyDto` (_id, projectId)
- [POST] `/api/project/paste_docs` — 粘贴文档 — body: `PasteDocsDto` (projectId, fromProjectId, mountedId?, docs[])
- [PUT] `/api/project/change_doc_pos` — 改变文档位置信息 — body: `ChangeDocPositionDto` (projectId, _id, pid?, sort?)
- [PUT] `/api/project/change_doc_info` — 修改文档基础信息 — body: `ChangeDocBaseInfoDto` (_id, projectId, name?)
- [POST] `/api/project/fill_doc` — 更新文档 — body: `UpdateDoc` (docId, projectId, info, item?, preRequest?, afterRequest?, mockInfo?)
- [POST] `/api/project/save_doc` — 创建文档 — body: `CreateDocDto` (docInfo)
- [GET] `/api/project/doc_detail` — 获取文档详情 — query: `GetDocDetailDto` (_id, projectId) — 有限流
- [DEL] `/api/project/doc` — 删除文档 — body: `DeleteDocDto` (ids, projectId)
- [GET] `/api/project/doc_tree_node` — 获取文档树 — query: `GetDocsAsTreeDto` (projectId)
- [GET] `/api/project/doc_tree_folder_node` — 获取文件夹树 — query: `GetDocsAsTreeDto` (projectId)
- [POST] `/api/docs/docs_deleted_list` — 获取已删除文档列表 — body: `GetDeletedDocListDto`
- [GET] `/api/docs/docs_history_operator_enum` — 获取文档操作人员信息 — query: `GetDocHistoryOperatorsDto` (projectId)
- [PUT] `/api/docs/docs_restore` — 恢复文档 — body: `RestoreDocDto` (_id, projectId)

### Docs - 导入/导出
- [POST] `/api/project/export/html` — 导出为 HTML — body: `ExportAsHTMLDto` (projectId, selectedNodes[])
- [POST] `/api/project/export/word` — 导出为 Word — body: `ExportAsWordDto`
- [POST] `/api/project/export/json` — 导出为 Apiflow JSON — body: `ExportAsApiflowDto`
- [POST] `/api/project/export/openapi` — 导出为 OpenAPI — body: `ExportAsOpenApiDto`
- [POST] `/api/project/export/markdown` — 导出为 Markdown — body: `ExportAsMarkdownDto`
> 注：
> - 所有 `@ReqSign()` 的接口需要签名，`@ReqLimit()` 的接口有速率限制，文档中已在备注中标注。  
> - DTO 中若存在 `@Rule` 注解并标注 `required()` 则视为必填字段，文档中已尽可能标注。  
> - 若某方法签名没有显式 `@Body()`/`@Query()` 注解（例如个别 case），我已根据参数类型做了合理假设并在注记中标明（可复核）。

---

如需我把每个接口再细化（例如：为每个字段补充更详细描述 / 示例值 / 响应字段），我可以继续扩展。若当前样式没问题，我将提交该 `API.md` 为初版并等待你复核。 ✅
