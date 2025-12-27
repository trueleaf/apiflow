import { defineStore } from "pinia";
import { ref } from "vue";
import { parse } from 'set-cookie-parser';
import { httpNodeCache } from '@/cache/httpNode/httpNodeCache.ts';
import { parseUrlInfo } from "@/helper";
import { nanoid } from 'nanoid/non-secure';
import dayjs from "dayjs";
import type { ApidocCookie } from '@src/types/projectWorkbench/cookies';

const isSameCookie = (a: ApidocCookie, b: ApidocCookie) => {
  return a.name === b.name && a.domain === b.domain && a.path === b.path && !!a.hostOnly === !!b.hostOnly;
}
const normalizeHost = (host: string) => {
  return host.trim().toLowerCase().replace(/\.$/, '');
}
const domainMatches = (requestHost: string, cookieDomain: string) => {
  if (requestHost === cookieDomain) return true;
  return requestHost.endsWith(`.${cookieDomain}`);
}
const getDefaultPath = (requestPath: string) => {
  if (!requestPath.startsWith('/')) return '/';
  if (requestPath === '/') return '/';
  const rightMostSlashIndex = requestPath.lastIndexOf('/');
  if (rightMostSlashIndex <= 0) return '/';
  return requestPath.slice(0, rightMostSlashIndex);
}

export const useCookies = defineStore('projectCookies', () => {
  const cookies = ref<ApidocCookie[]>([]);
  // 初始化时从缓存加载
  const initCookies = (projectId: string) => {
    const now = new Date();
    const allCookies = httpNodeCache.getHttpNodeCookies(projectId) || [];
    const validCookies = allCookies.filter(cookie => {
      if (!cookie.expires) return false; // 初始化时如果没有expires字段则清空
      const expiresDate = new Date(cookie.expires);
      return isNaN(expiresDate.getTime()) || expiresDate > now;
    });
    if (validCookies.length !== allCookies.length) {
      httpNodeCache.setHttpNodeCookies(projectId, validCookies);
    }
    cookies.value = httpNodeCache.getHttpNodeCookies(projectId) || [];
  };
  // 通过Set-Cookie头批量更新
  const updateCookiesBySetCookieHeader = (setCookieStrList: string[], requestUrl = '', projectId = '') => {
    const urlInfo = parseUrlInfo(requestUrl);
    const requestHost = normalizeHost(urlInfo.domain);
    const requestPath = urlInfo.path || '/';
    const objCookies = setCookieStrList.map((str) => {
      const res = parse([str], { map: false });
      return res[0];
    });
    objCookies.forEach((objCookie) => {
      const now = Date.now();
      const hasDomainAttr = typeof objCookie.domain === 'string' && objCookie.domain.trim() !== '';
      const hostOnly = !hasDomainAttr;
      const normalizedDomainAttr = hasDomainAttr ? normalizeHost(objCookie.domain!.replace(/^\./, '')) : '';
      const cookieDomain = hostOnly ? requestHost : normalizedDomainAttr;
      if (!cookieDomain) return;
      if (!hostOnly && !domainMatches(requestHost, cookieDomain)) return;
      const hasPathAttr = typeof objCookie.path === 'string' && objCookie.path.trim() !== '';
      const cookiePath = hasPathAttr && objCookie.path!.startsWith('/') ? objCookie.path! : getDefaultPath(requestPath);
      const realPath = cookiePath.startsWith('/') ? cookiePath : '/';
      const maxAge = typeof objCookie.maxAge === 'number' ? objCookie.maxAge : undefined;
      const expiresDate = maxAge !== undefined ? new Date(now + maxAge * 1000) : objCookie.expires;
      const expires = expiresDate ? expiresDate.toISOString() : '';
      const isExpired = maxAge !== undefined ? maxAge <= 0 : (expiresDate ? expiresDate.getTime() <= now : false);
      const nextCookie: ApidocCookie = {
        id: nanoid(),
        name: objCookie.name,
        value: objCookie.value,
        domain: cookieDomain,
        path: realPath,
        expires,
        httpOnly: !!objCookie.httpOnly,
        secure: !!objCookie.secure,
        sameSite: objCookie.sameSite || '',
        hostOnly,
        creationTime: now,
      };
      if (isExpired) {
        deleteCookieByKey(projectId, nextCookie);
        return;
      }
      addCookie(projectId, nextCookie);
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
    httpNodeCache.setHttpNodeCookies(projectId, cookies.value);
  };
  // 根据id修改cookie
  const deleteCookieByKey = (projectId: string, cookie: ApidocCookie) => {
    const idx = cookies.value.findIndex(c => isSameCookie(c, cookie));
    if (idx !== -1) {
      cookies.value.splice(idx, 1);
      httpNodeCache.setHttpNodeCookies(projectId, cookies.value);
    }
  };
  const updateCookiesById = (projectId: string, id: string, cookieInfo: Partial<ApidocCookie>) => {
    const idx = cookies.value.findIndex(c => c.id === id);
    if (idx !== -1) {
      cookies.value[idx] = { ...cookies.value[idx], ...cookieInfo };
      httpNodeCache.setHttpNodeCookies(projectId, cookies.value);
    }
  };
  // deleteCookiesById 方法
  const deleteCookiesById = (projectId: string, id: string) => {
    const idx = cookies.value.findIndex(c => c.id === id);
    if (idx !== -1) {
      cookies.value.splice(idx, 1);
      httpNodeCache.setHttpNodeCookies(projectId, cookies.value);
    }
  };
  // 获取匹配的cookie列表
  const getMachtedCookies = (url: string) => {
    const urlInfo = parseUrlInfo(url);
    const requestDomain = normalizeHost(urlInfo.domain);
    const requestPath = urlInfo.path;
    const requestProtocol = urlInfo.protocol;
    const matchedCookies = cookies.value.filter(cookie => {
      // 域名匹配：如果是.开头的域名则匹配根域名和子域名，否则只匹配完全相同的域名
      if (cookie.secure && requestProtocol !== 'https:') return false;
      const isEmptyDomain = cookie.domain === '';
      let isDomainMatch = false;
      if (isEmptyDomain) {
        isDomainMatch = true; // 空域名匹配所有域名,这种方式只能是用户手动创建的cookie才行
      } else if (cookie.hostOnly) {
        isDomainMatch = requestDomain === cookie.domain;
      } else {
        isDomainMatch = domainMatches(requestDomain, cookie.domain);
      }
      // 路径匹配（RFC6265）
      let isPathMatch = false;
      if (cookie.path === '/') {
        isPathMatch = true;
      } else if (requestPath === cookie.path) {
        isPathMatch = true;
      } else if (requestPath.startsWith(cookie.path)) {
        const nextChar = requestPath.charAt(cookie.path.length);
        isPathMatch = nextChar === '/' || nextChar === '';
      }
      // 过期时间匹配：如果expires字段不存在则认为不过期
      const notExpired = !cookie.expires || dayjs(cookie.expires).isAfter(dayjs());
      return isDomainMatch && isPathMatch && notExpired;
    });
    const sortedCookies = [...matchedCookies].sort((a, b) => {
      if (a.path.length !== b.path.length) return b.path.length - a.path.length;
      const aTime = a.creationTime ?? 0;
      const bTime = b.creationTime ?? 0;
      return aTime - bTime;
    });
    return JSON.parse(JSON.stringify(sortedCookies)) as ApidocCookie[]; // 防止修改请求头导致原数据被修改
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
