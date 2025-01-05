import type { ApidocMindParam, ApidocParamsType, ApidocProperty, ApidocPropertyType, ApidocRequestParamTypes, ApidocVariable } from "../global"



export type ApidocProjectVariable = {
   /**
    * 变量id
   */
   _id: string,
   /**
    * 变量名称
   */
   name: string,
   /**
    * 变量值类型
   */
   type: ApidocPropertyType,
   /**
    * 变量值
   */
   value: string,
}
//项目host信息
export type ApidocProjectHost = {
   /**
    * 主机名称
   */
   name: string,
   /**
    * 主机地址
   */
   url: string,
   /**
    * 主机id
   */
   _id: string,
}
//项目参数模板
export type ApidocProjectParamsTemplate = {
   /**
    * 模板id
    */
   _id: string,
   /**
    * 模板名称
    */
   name: string,
   /**
    * 模板参数类型
    */
   presetParamsType: ApidocParamsType,
   /**
    * 创建者
    */
   creatorName: string,
   /**
    * 参数信息
    */
   items: ApidocProperty[],
}
//请求方法规则
export type ApidocRequestMethodRule = {
   /**
    * 允许请求参数类型
   */
   enabledContenTypes: ApidocRequestParamTypes,
   /**
    * 方法名称
   */
   name: string,
   /**
    * 值
   */
   value: string,
   /**
    * 颜色
   */
   iconColor: string,
   /**
    * 是否启用
   */
   enabled: boolean,
};
//项目规则
export type ApidocProjectRules = {
   /**
    * 单个文件夹允许最大文件个数
   */
   fileInFolderLimit: number,
   /**
    * 请求方法
   */
   requestMethods: ApidocRequestMethodRule[],
}
export type ApidocCookieInfo = {
   /**
      * cookie键
      */
   name: string,
   /**
      * cookie值
      */
   value: string,
   /**
      * 有效域
      */
   domin: string,
   /**
      * path
      */
   path: string,
   /**
      * expires
      */
   expires: string,
   /**
      * httpOnly
      */
   httpOnly: boolean,
   /**
      * secure
      */
   secure: boolean,
   /**
      * sameSite
      */
   sameSite: string,
}
//公共请求头信息
export type ApidocProjectCommonHeader = {
   /**
      * _id值
      */
   _id: string,
   /**
      * 是否为文件夹
      */
   isFolder: boolean,
   /**
      * 公共请求头信息
      */
   commonHeaders: Pick<ApidocProperty, '_id' | 'key' | 'value' | 'description'>[],
   /**
      * 子元素
      */
   children: ApidocProjectCommonHeader[]
}
//项目基本信息
export type ApidocProjectBaseInfoState = {
   /**
      * 项目id
      */
   _id: string,
   /**
      * 项目名称
      */
   projectName: string,
   /**
      * 项目变量信息
      */
   variables: ApidocVariable[],
   /**
      * 临时变量，主要用于脚本中
      */
   tempVariables: Omit<ApidocVariable, '_id'>[],
   /**
      * 项目host信息
      */
   hosts: ApidocProjectHost[],
   /**
      * 联想参数
      */
   mindParams: ApidocMindParam[],
   /**
      * 参数模板信息
      */
   paramsTemplate: ApidocProjectParamsTemplate[],
   /**
      * 项目规则
      */
   rules: ApidocProjectRules,
   /**
      * 全局cookie信息
      */
   globalCookies: Record<string, ApidocCookieInfo[]>,
   /**
      * 布局
      */
   layout: 'vertical' | 'horizontal',
   /**
      * 是否启用web端代理功能
      */
   webProxy: boolean,
   /**
      * 代理服务器信息
      */
   proxy: {
      /**
           * 代理服务器地址
           */
      path: string,
      /**
           * 是否启用代理
           */
      enabled: boolean
   },
   /**
      * 模式，view,edit
      */
   mode: 'view' | 'edit',
   /**
      * 公共请求头
      */
   commonHeaders: ApidocProjectCommonHeader[]
};
