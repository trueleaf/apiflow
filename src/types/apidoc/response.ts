import type { ApidocCookieInfo } from "./base-info";


export type ApidocResponseState = {
  /**
    * 返回头信息
  */
  header: Record<string, string>,
  /**
    * 返回值contentType
  */
  contentType?: string,
  /**
    * http版本信息
  */
  httpVersion: string,
  /**
    * 远端ip信息
  */
  ip: string,
  /**
    * 状态码
  */
  statusCode: number,
  /**
    * 状态信息
  */
  statusMessage: string,
  /**
    * 耗时
  */
  rt: number,
  /**
    * 返回值大小
  */
  size: number,
  /**
    * 是否正在请求中
  */
  loading: boolean,
  /**
    * 是否已经接收到返回值
  */
  isResponse: boolean,
  /**
    * cookie信息
  */
  cookies: ApidocCookieInfo[],
  /**
    * 返回进度
  */
  process: {
    /**
      * 百分比
    */
    percent: number,
    /**
      * 总大小
    */
    total: number,
    /**
      * 当前传输数据大小
    */
    transferred: number,
  },
  /**
    * 返回值
  */
  data: {
    /**
      * 文件类型
    */
    file: {
      url: string,
      raw: string,
      mime: string, //mime类型
      ext: string, //后缀
      name: string, //文件名称
    },
    /**
      * 数据类型(contentType)
    */
    type?: string,
    /**
      * 文本返回值
    */
    text: string,
  },
}