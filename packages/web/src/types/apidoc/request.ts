import type { HttpNodeRequestMethod } from "../httpNode/types";
import type { Headers } from '@src/types/request'

export type ApidocRequest = {
  url: string, //请求url
  encodedUrl: string, //编码后的url
  headers: Headers, //请求头
  method: HttpNodeRequestMethod, //请求方法
  body: string | FormData, //请求body
};