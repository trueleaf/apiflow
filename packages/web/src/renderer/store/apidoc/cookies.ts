import { defineStore } from "pinia";
import { ref } from "vue";
import { parse } from 'set-cookie-parser';
import { httpNodeCache } from '@/cache/httpNode/httpNodeCache.ts';
import { getDomainFromUrl, getPathFromUrl, uuid } from "@/helper/index.ts";
import dayjs from "dayjs";

export type ApidocCookie = {
  id: string;
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: string;
};

function isSameCookie(a: ApidocCookie, b: ApidocCookie) {
  return a.name === b.name && a.domain === b.domain && a.path === b.path;
}

export const useCookies = defineStore('apidocCookies', () => {
  const cookies = ref<ApidocCookie[]>([]);
  // 初始化时从缓存加载
  const initCookies = (projectId: string) => {
    const now = new Date();
    const allCookies = httpNodeCache.getApidocCookies(projectId) || [];
    const validCookies = allCookies.filter(cookie => {
      if (!cookie.expires) return false; // 初始化时如果没有expires字段则清空
      const expiresDate = new Date(cookie.expires);
      return isNaN(expiresDate.getTime()) || expiresDate > now;
    });
    if (validCookies.length !== allCookies.length) {
      httpNodeCache.setApidocCookies(projectId, validCookies);
    }
    cookies.value = httpNodeCache.getApidocCookies(projectId) || [];
  };

  // 通过Set-Cookie头批量更新
  const updateCookiesBySetCookieHeader = (setCookieStrList: string[], defaultDomain = '', projectId = '') => {
    const objCookies = setCookieStrList.map((str) => {
      const res = parse([str], { map: false });
      return res[0];
    });
    objCookies.forEach((objCookie) => {
      let realDomain = objCookie.domain
      if (realDomain && /^[\w.-]+\.[a-zA-Z]{2,}$/.test(realDomain)) {
        realDomain = '.' + realDomain.replace(/^\./, '');
      } else {
        realDomain = defaultDomain;
      }
      if (!objCookie.path) objCookie.path = '/';
      const newCookie: ApidocCookie = {
        id: uuid(),
        name: objCookie.name,
        value: objCookie.value,
        domain: realDomain,
        path: objCookie.path,
        expires: typeof objCookie.expires === 'string' ? objCookie.expires : (objCookie.expires ? objCookie.expires.toISOString() : ''),
        httpOnly: !!objCookie.httpOnly,
        secure: !!objCookie.secure,
        sameSite: objCookie.sameSite || '',
      };
      addCookie(projectId, newCookie);
    });
  };

  // 新增cookie
  const addCookie = (projectId: string, cookie: ApidocCookie) => {
    const idx = cookies.value.findIndex(c => isSameCookie(c, cookie));
    if (idx !== -1) {
      cookies.value[idx] = { ...cookie, id: cookies.value[idx].id };
    } else {
      cookies.value.push(cookie);
    }
    httpNodeCache.setApidocCookies(projectId, cookies.value);
  };

  // 根据id修改cookie
  const updateCookiesById = (projectId: string, id: string, cookieInfo: Partial<ApidocCookie>) => {
    const idx = cookies.value.findIndex(c => c.id === id);
    if (idx !== -1) {
      cookies.value[idx] = { ...cookies.value[idx], ...cookieInfo };
      httpNodeCache.setApidocCookies(projectId, cookies.value);
    }
  };

  // deleteCookiesById 方法
  const deleteCookiesById = (projectId: string, id: string) => {
    const idx = cookies.value.findIndex(c => c.id === id);
    if (idx !== -1) {
      cookies.value.splice(idx, 1);
      httpNodeCache.setApidocCookies(projectId, cookies.value);
    }
  };
  // 获取匹配的cookie列表
  const getMachtedCookies = (url: string) => {
    const requestDomain = getDomainFromUrl(url);
    const requestPath = getPathFromUrl(url);
    // console.log(cookies.value)
    const matchedCookies = cookies.value.filter(cookie => {
      /**
       * 域名匹配
       * 如果是.开头的域名则匹配根域名和子域名
       * 例如：.example.com 可以匹配 example.com 和 sub.example.com
       * 如果非.开头的域名则只匹配完全相同的域名
       * 例如：example.com 只匹配 example.com
       */
      const cookieIsDotDomain = cookie.domain.startsWith('.'); 
      const withoutDotCookieDomain = cookie.domain.replace(/^\./, '');
      const isEmptyDomain = withoutDotCookieDomain === '';
      let isDomainMatch = false;
      if (isEmptyDomain) {
        isDomainMatch = true; // 空域名匹配所有域名,这种方式只能是用户手动创建的cookie才行
      } else if (cookieIsDotDomain) {
        isDomainMatch = requestDomain === withoutDotCookieDomain || requestDomain.endsWith('.' + withoutDotCookieDomain);
      } else {
        isDomainMatch = requestDomain === cookie.domain;
      }
      /**
       * 路径匹配（RFC6265）
       * 1. 请求路径等于cookie path
       * 2. 或请求路径以cookie path开头，且下一个字符是/（或cookie path为/）
       * 例如：cookie path为/api，/api、/api/、/api/v1都匹配，/apix不匹配
       */
      let isPathMatch = false;
      if (cookie.path === '/') {
        isPathMatch = true;
      } else if (requestPath === cookie.path) {
        isPathMatch = true;
      } else if (requestPath.startsWith(cookie.path)) {
        const nextChar = requestPath.charAt(cookie.path.length);
        isPathMatch = nextChar === '/' || nextChar === '';
      }
      /**
       * 过期时间匹配
       * 如果expires字段不存在则认为不过期
       */
      const notExpired = !cookie.expires || dayjs(cookie.expires).isAfter(dayjs());
      return isDomainMatch && isPathMatch && notExpired;
    });
    return JSON.parse(JSON.stringify(matchedCookies)) as ApidocCookie[]; // 防止修改请求头导致原数据被修改
  }

  return {
    cookies,
    updateCookiesBySetCookieHeader,
    addCookie,
    updateCookiesById,
    deleteCookiesById,
    initCookies,
    getMachtedCookies,
  };
});
