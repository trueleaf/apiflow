import { computed } from 'vue'
import type { ApidocProperty } from '@src/types'
import { generateEmptyProperty } from '@/helper'
import { useHttpNode } from '@/store/httpNode/httpNodeStore';

/**
 * 从url中找出path参数
 */
export const handleChangeUrl = (): void => {
  const httpNodeStore = useHttpNode()
  const requestPath = httpNodeStore.httpNodeInfo.item.url.path;
  const pathParamsReg = /(?<!\{)\{([^{}]+)\}(?!\})/g; //path参数匹配
  let matchedPathParams = requestPath.match(pathParamsReg);
  if (matchedPathParams) {
    matchedPathParams = matchedPathParams.map((val) => val.replace(/[{}]+/g, '')) as RegExpMatchArray
    const result = matchedPathParams.map((param) => {
      const property = generateEmptyProperty();
      property.key = param;
      return property;
    });
    httpNodeStore.changePathParams(result);
  } else {
    httpNodeStore.changePathParams([]);
  }
};

/**
 * 将请求url后面查询参数转换为params
 */
const convertQueryToParams = (requestPath: string): void => {
  const httpNodeStore = useHttpNode()
  const stringParams = requestPath.split('?')[1] || '';

  const objectParams: Record<string, string> = {};
  stringParams.split('&').forEach(pair => {
    const [encodedKey, encodedValue] = pair.split(/=(.*)/s);
    objectParams[encodedKey] = encodedValue;
  });
  const newParams: ApidocProperty<'string'>[] = [];
  Object.keys(objectParams).forEach(field => {
    const property = generateEmptyProperty();
    property.key = field;
    property.value = objectParams[field] || ''; //防止undefined导致字段缺失
    newParams.push(property)
  })
  const uniqueData: ApidocProperty<'string'>[] = [];
  const originParams = httpNodeStore.httpNodeInfo.item.queryParams;
  newParams.forEach(item => { //过滤重复的query值
    const matchedItem = originParams.find(v => v.key === item.key);
    if (originParams.every(v => v.key !== item.key)) {
      uniqueData.push(item);
    }
    if (matchedItem) {
      matchedItem.value = item.value;
    }
  })
  httpNodeStore.unshiftQueryParams(uniqueData)
};

/**
 * 格式化url
 */
export const handleFormatUrl = ():void => {
  const httpNodeStore = useHttpNode()
  // const projectId = router.currentRoute.value.query.id as string;
  const requestPath = computed({
    get() {
      return httpNodeStore.httpNodeInfo.item.url.path;
    },
    set(path) {
      httpNodeStore.changeHttpNodeUrl(path)
    },
  });
    // const currentPrefix = computed<string>(() => store.state["apidoc/apidoc"].apidoc.item.url.prefix);
    // /**
    //  * 用例：http://127.0.0.1:80
    //  * 用例：http://127.0.0.1
    //  * 用例：http://255.255.0.1
    //  * 用例：https://www.baidu.com
    //  * 用例：demo.google.com
    //  * 用例：demo.google.com/ 保留末尾/
    //  * 用例：{{ testUrl }}/api/test
    //  * 用例：ipv6地址 http://[2001:db8::1]:8080/api
    //  */
  convertQueryToParams(requestPath.value);
  // const ipReg = /^https?:\/\/((\d|[1-9]\d|1\d{2}|2[0-5]{2})\.){3}(2[0-5]{2}|1\d{2}|[1-9]\d|\d)/;
  // const ipWithPortReg = /^https?:\/\/((\d|[1-9]\d|1\d{2}|2[0-5]{2})\.){3}(2[0-5]{2}|1\d{2}|[1-9]\d|\d)(:\d{2,5})/;
  // const ipv6Reg = /^https?:\/\/\[[0-9a-fA-F:]+\]/;
  // const dominReg = /^(https?:\/\/)?([^./]{1,62}\.){1,}[^./]{1,62}/;
  // const localhostReg = /^(https?:\/\/)?(localhost)/;
  // const hasVarReg = /\{\{.*?\}\}/;
  // const matchedIp = requestPath.value.match(ipReg);
  // const matchedIpWithPort = requestPath.value.match(ipWithPortReg);
  // const matchedIpv6 = requestPath.value.match(ipv6Reg);
  // const matchedDomin = requestPath.value.match(dominReg);
  // const matchedLocalhost = requestPath.value.match(localhostReg);
  // const hasVar = requestPath.value.match(hasVarReg);
  let formatPath = requestPath.value;
  // 如果URL不为空且不以http://或https://开头，且不是以变量开头，且不是以/开头的相对路径，则添加http://前缀
  if (formatPath.trim() !== '' && !formatPath.startsWith('http://') && !formatPath.startsWith('https://') && !formatPath.startsWith('{{') && !formatPath.startsWith('/')) {
    formatPath = `http://${formatPath}`;
  }
  const queryReg = /(\?.*$)/;
  formatPath = formatPath.replace(queryReg, '');
  requestPath.value = formatPath;
}
