import { defineStore } from "pinia";
import { ref } from "vue";
import { parse } from 'set-cookie-parser';
import { apidocCache } from '@/cache/apidoc';
import { getDomainFromUrl, getPathFromUrl } from "@/helper/index.ts";
import dayjs from "dayjs";

export interface ApidocCookie {
  _id: string;
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: string;
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
    // console.log('Cookies initialized:', cookies.value);
  };
  const updateCookies = (setCookieStrList: string[], defaultDomain = '', projectId = '') => {
    const isSameCookie = (cookie: ApidocCookie) => {
      for (let i = 0; i < objCookies.length; i++) {
        const objCookie = objCookies[i];
        if (!objCookie.domain) {
          objCookie.domain = defaultDomain;
        }
        if (!objCookie.path) {
          objCookie.path = '/';
        }
        if (cookie.name === objCookie.name && cookie.domain === objCookie.domain && cookie.path === objCookie.path) {
          return true;
        }
      }
      return false
    };
    const objCookies = setCookieStrList.map((str) => {
      const res = parse([str], { map: false });
      return res[0];
    });
    const newCookies: ApidocCookie[] = [];
    cookies.value.forEach((existCookie) => {
      if (!isSameCookie(existCookie)) {
        newCookies.push({
          _id: existCookie._id,
          name: existCookie.name,
          value: existCookie.value,
          domain: existCookie.domain,
          path: existCookie.path,
          expires: existCookie.expires,
          httpOnly: existCookie.httpOnly,
          secure: existCookie.secure,
          sameSite: existCookie.sameSite,
        });
      }
    });
    // 合并新解析的cookie
    objCookies.forEach((objCookie) => {
      if (!objCookie.domain) objCookie.domain = defaultDomain;
      if (!objCookie.path) objCookie.path = '/';
      newCookies.push({
        _id: `${objCookie.name}_${objCookie.domain}_${objCookie.path}`,
        name: objCookie.name,
        value: objCookie.value,
        domain: objCookie.domain,
        path: objCookie.path,
        expires: typeof objCookie.expires === 'string' ? objCookie.expires : (objCookie.expires ? objCookie.expires.toISOString() : ''),
        httpOnly: !!objCookie.httpOnly,
        secure: !!objCookie.secure,
        sameSite: objCookie.sameSite || '',
      });
    });
    cookies.value = newCookies;
    // 同步更新缓存
    if (projectId) {
      apidocCache.setApidocCookies(projectId, newCookies);
    }
  };
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
    updateCookies,
    initCookies,
    getMachtedCookies,
  };
});
