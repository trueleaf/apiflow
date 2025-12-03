export type ApidocTabType =
  'http' |
  'config' |
  'onlineLink' |
  'exportDoc' |
  'importDoc' |
  'history' |
  'variable' |
  'recycler' |
  'guide' |
  'commonHeader' |
  'cookies' |
  'websocket' |
  'httpMock' |
  'websocketMock' |
  'prefix'
export type ApidocTab = {
  /**
   * 节点id
   */
  _id: string,
  /**
   * 项目id
   */
  projectId: string,
  /**
   * tab类型
   */
  tabType: ApidocTabType,
  /**
   * tab文案显示
   */
  label: string,
  /**
   * 头部图标
   */
  head: {
    /**
     * 图标
     */
    icon: string,
    /**
     * 颜色
     */
    color: string,
  },
  /**
   * 是否保存
   */
  saved: boolean,
  /**
   * 是否固定
   */
  fixed: boolean,
  /**
   * 是否选中
   */
  selected: boolean,
};