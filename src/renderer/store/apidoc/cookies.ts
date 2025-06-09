import { defineStore } from "pinia";
import { ref } from "vue";
import { parse } from 'set-cookie-parser';
import { apidocCache } from '@/cache/apidoc';

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
    cookies.value = apidocCache.getApidocCookies(projectId) || [];
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

  return {
    cookies,
    updateCookies,
    initCookies,
  };
});
