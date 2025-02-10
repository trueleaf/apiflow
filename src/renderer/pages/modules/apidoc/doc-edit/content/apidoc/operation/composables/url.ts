/**
 * host相关处理
 */

import { computed } from 'vue'
import type { ApidocProperty } from '@src/types/global'
// import type { ApidocProjectHost } from "@src/types/store"
import { apidocGenerateProperty } from '@/helper/index'
import { useApidoc } from '@/store/apidoc/apidoc';
// import globalConfig from "@/../config/config"
// import { router } from "@/router/index"
// import { apidocCache } from "@/cache/apidoc"

/**
 * 从url中找出path参数
 */
export const handleChangeUrl = (): void => {
  const apidocStore = useApidoc()
  const requestPath = apidocStore.apidoc.item.url.path;
  const pathParamsReg = /(?<!\{)\{([^{}]+)\}(?!\})/g; //path参数匹配
  let matchedPathParams = requestPath.match(pathParamsReg);
  if (matchedPathParams) {
    matchedPathParams = matchedPathParams.map((val) => val.replace(/[{}]+/g, '')) as RegExpMatchArray
    const result = matchedPathParams.map((param) => {
      const property = apidocGenerateProperty();
      property.key = param;
      return property;
    });
    apidocStore.changePathParams(result);
  } else {
    apidocStore.changePathParams([]);
  }
};

/**
 * 将请求url后面查询参数转换为params
 */
const convertQueryToParams = (requestPath: string): void => {
  const apidocStore = useApidoc()
  const stringParams = requestPath.split('?')[1] || '';
  const urlSearchParams = new URLSearchParams(stringParams);
  const objectParams = Object.fromEntries(urlSearchParams.entries());
  const newParams: ApidocProperty<'string'>[] = [];
  Object.keys(objectParams).forEach(field => {
    const property = apidocGenerateProperty();
    property.key = field;
    property.value = objectParams[field];
    newParams.push(property)
  })
  const uniqueData: ApidocProperty<'string'>[] = [];
  const originParams = apidocStore.apidoc.item.queryParams;
  newParams.forEach(item => { //过滤重复的query值
    if (originParams.every(v => v.key !== item.key)) {
      uniqueData.push(item);
    }
  })
  apidocStore.unshiftQueryParams(uniqueData)
};

/**
 * 格式化url
 */
export function handleFormatUrl():void {
  const apidocStore = useApidoc()
  // const projectId = router.currentRoute.value.query.id as string;
  const requestPath = computed<string>({
    get() {
      return apidocStore.apidoc.item.url.path;
    },
    set(path) {
      apidocStore.changeApidocUrl(path)
    },
  });
    // const currentHost = computed<string>(() => store.state["apidoc/apidoc"].apidoc.item.url.host);
    // const hostEnum = computed<ApidocProjectHost[]>(() => {
    //     const localData = apidocCache.getApidocServer(projectId)
    //     return store.state["apidoc/baseInfo"].hosts.concat(localData)
    // })
    // const matchedHost = hostEnum.value.find(hostInfo => hostInfo.url === currentHost.value)
    // /**
    //  * 用例：http://127.0.0.1:80
    //  * 用例：http://127.0.0.1
    //  * 用例：http://255.255.0.1
    //  * 用例：https://www.baidu.com
    //  * 用例：demo.google.com
    //  * 用例：{{ testUrl }}/api/test
    //  */
  convertQueryToParams(requestPath.value);
  const ipReg = /^https?:\/\/((\d|[1-9]\d|1\d{2}|2[0-5]{2})\.){3}(2[0-5]{2}|1\d{2}|[1-9]\d|\d)/;
  const ipWithPortReg = /^https?:\/\/((\d|[1-9]\d|1\d{2}|2[0-5]{2})\.){3}(2[0-5]{2}|1\d{2}|[1-9]\d|\d)(:\d{2,5})/;
  const dominReg = /^(https?:\/\/)?([^./]{1,62}\.){1,}[^./]{1,62}/;
  const localhostReg = /^(https?:\/\/)?(localhost)/;
  const startsWithVarReg = /^\{\{(.*)\}\}/;
  const matchedIp = requestPath.value.match(ipReg);
  const matchedIpWithPort = requestPath.value.match(ipWithPortReg);
  const matchedDomin = requestPath.value.match(dominReg);
  const matchedLocalhost = requestPath.value.match(localhostReg);
  const isStartsWithVar = requestPath.value.match(startsWithVarReg);
  let formatPath = requestPath.value;
  if (!matchedIp && !matchedDomin && !matchedIpWithPort && !matchedLocalhost && !isStartsWithVar) {
    // const mockServer = `http://${globalConfig.renderConfig.mock.ip}:${store.state["apidoc/mock"].mockServerPort}`;
    // const pathReg = /\/(?!\/)[^#\\?:]+/; //查询路径正则
    //路径处理
    if (formatPath.trim() === '') {
      formatPath = '/';
    } else if (!formatPath.startsWith('/')) {
      formatPath = `/${formatPath}`;
    }
  }
  const queryReg = /(\?.*$)|(\/*$)/;
  formatPath = formatPath.replace(queryReg, '');
  requestPath.value = formatPath;
}
