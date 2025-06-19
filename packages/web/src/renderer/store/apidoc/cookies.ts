import { defineStore } from "pinia";
import { ref } from "vue";
import { parse } from 'set-cookie-parser';
import { apidocCache } from '@/cache/apidoc';
import { getDomainFromUrl, getPathFromUrl, uuid } from "@/helper/index.ts";
import dayjs from "dayjs";

export interface ApidocCookie {
  id: string;
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: string;
}

function isSameCookie(a: ApidocCookie, b: ApidocCookie) {
  return a.name === b.name && a.domain === b.domain && a.path === b.path;
}

export const useCookies = defineStore('apidocCookies', () => {
  const cookies = ref<ApidocCookie[]>([]);
  // 初始化时从缓存加载
  const initCookies = (projectId: string) => {
    const now = new Date();
    const allCookies = apidocCache.getApidocCookies(projectId) || [];
    const validCookies = allCookies.filter(cookie => {
      if (!cookie.expires) return false; // 初始化时如果没有expires字段则清空
      const expiresDate = new Date(cookie.expires);
      return isNaN(expiresDate.getTime()) || expiresDate > now;
    });
    if (validCookies.length !== allCookies.length) {
      apidocCache.setApidocCookies(projectId, validCookies);
    }
    cookies.value = apidocCache.getApidocCookies(projectId) || [];
  };

  // 通过Set-Cookie头批量更新
  const updateCookiesBySetCookieHeader = (setCookieStrList: string[], defaultDomain = '', projectId = '') => {
    const objCookies = setCookieStrList.map((str) => {
      const res = parse([str], { map: false });
      return res[0];
    });
    objCookies.forEach((objCookie) => {
      if (!objCookie.domain) objCookie.domain = defaultDomain;
      if (!objCookie.path) objCookie.path = '/';
      const newCookie: ApidocCookie = {
        id: uuid(),
        name: objCookie.name,
        value: objCookie.value,
        domain: objCookie.domain,
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
    apidocCache.setApidocCookies(projectId, cookies.value);
  };

  // 根据id修改cookie
  const updateCookiesById = (projectId: string, id: string, cookieInfo: Partial<ApidocCookie>) => {
    const idx = cookies.value.findIndex(c => c.id === id);
    if (idx !== -1) {
      cookies.value[idx] = { ...cookies.value[idx], ...cookieInfo };
      apidocCache.setApidocCookies(projectId, cookies.value);
    }
  };

  // deleteCookiesById 方法
  const deleteCookiesById = (projectId: string, id: string) => {
    const idx = cookies.value.findIndex(c => c.id === id);
    if (idx !== -1) {
      cookies.value.splice(idx, 1);
      apidocCache.setApidocCookies(projectId, cookies.value);
    }
  };
  // 获取匹配的cookie列表
  const getMachtedCookies = (url: string) => {
    const requestDomain = getDomainFromUrl(url);
    const requestPath = getPathFromUrl(url);
    const matchedCookies = cookies.value.filter(cookie => {
      // 域名匹配，支持.开头的domain和子域名
      const cookieDomain = cookie.domain.replace(/^\./, '');
      const host = requestDomain.replace(/^\./, '');
      const domainMatch = cookieDomain && (host === cookieDomain || host.endsWith('.' + cookieDomain));
      // 路径匹配
      const pathMatch = !cookie.path || requestPath.startsWith(cookie.path);
      // 只发送未过期的cookie
      const notExpired = !cookie.expires || dayjs(cookie.expires).isAfter(dayjs());
      return domainMatch && pathMatch && notExpired;
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
