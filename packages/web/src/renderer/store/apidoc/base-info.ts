import { request } from '@/api/api';
import {
  ApidocCookieInfo,
  ApidocProjectBaseInfoState,
  ApidocProjectCommonHeader,
  ApidocProjectHost,
  ApidocProjectParamsTemplate,
  ApidocProjectRules,
} from "@src/types/apidoc/base-info";
import { event } from '@/helper'
import { ApidocMindParam, ApidocProperty, Response } from "@src/types/global";
import { defineStore } from "pinia"
import { ref } from "vue";
import { router } from "@/router";
import { useVariable } from './variables';
import { standaloneCache } from '@/cache/standalone.ts';
import { requestMethods } from '@/data/data.ts';

type ChangeProjectBaseInfo = {
  _id: string;
  projectName: string,
  mindParams: ApidocMindParam[],
  paramsTemplate: ApidocProjectParamsTemplate[],
  rules: ApidocProjectRules,
  hosts: ApidocProjectHost[],
}
type HeaderInfo = Pick<ApidocProperty, '_id' | 'key' | 'value' | 'description' | "select"> & { path?: string[], nodeId?: string }
type CommonHeaderResult = {
  matched: boolean,
  nodeId: string;
  data: HeaderInfo[]
};
type MatchedHeaderOptions = {
  id: string | undefined,
  preCommonHeaders: HeaderInfo[],
  result: CommonHeaderResult,
  deep: number
}
type GlobalCommonHeader = Pick<ApidocProperty, "_id" | "key" | "value" | "description" | "select"> & { path?: string[], nodeId?: string };

const getMatchedHeaders = (data: ApidocProjectBaseInfoState['commonHeaders'], options: MatchedHeaderOptions) => {
  for (let i = 0; i < data.length; i += 1) {
    const currentItem = data[i];
    const currentHeaders: HeaderInfo[] = []
    const { _id, commonHeaders, children } = currentItem;
    if (_id === options.id) {
      options.result.matched = true;
      options.result.data = options.preCommonHeaders;
      options.result.nodeId = currentItem.pid;
      return;
    }
    //当前headers覆盖老的headers
    options.preCommonHeaders.concat(commonHeaders).forEach(header => {
      if (header && currentHeaders.every(v => v.key !== header.key)) {
        currentHeaders.push(JSON.parse(JSON.stringify(header)))
      }
    })
    
    if (children?.length > 0) {
      getMatchedHeaders(children, {
        id: options.id,
        deep: options.deep + 1,
        result: options.result,
        preCommonHeaders: currentHeaders,
      })
    }
  }
}
export const useApidocBaseInfo = defineStore('apidocBaseInfo', () => {
  const _id = ref('');
  const projectName = ref('');
  const mindParams = ref<ApidocMindParam[]>([]);
  const paramsTemplate = ref<ApidocProjectParamsTemplate[]>([]);
  const rules = ref<ApidocProjectRules>({
    fileInFolderLimit: 255,
    requestMethods: requestMethods
  });
  const hosts = ref<ApidocProjectHost[]>([]);
  const globalCookies = ref<Record<string, ApidocCookieInfo[]>>({});
  const layout = ref<'vertical' | 'horizontal'>('horizontal');
  const webProxy = ref(true);
  const mode = ref<'view' | 'edit'>('view');
  const commonHeaders = ref<ApidocProjectCommonHeader[]>([]);
  const globalCommonHeaders = ref<GlobalCommonHeader[]>([]);
  // const validCommonHeaders = ref<Pick<ApidocProperty, 'key' | 'value' | 'description' | 'select'>[]>([]);
  const projectId = ref('');
  /*
  |--------------------------------------------------------------------------
  | 方法
  |--------------------------------------------------------------------------
  */
  //改变项目id
  const changeProjectId = (id: string): void => {
    projectId.value = id;
  }
  //改变项目基本信息
  const changeProjectBaseInfo = (payload: ChangeProjectBaseInfo): void => {
    _id.value = payload._id;
    projectName.value = payload.projectName;
    mindParams.value = payload.mindParams;
    paramsTemplate.value = payload.paramsTemplate;
    rules.value = payload.rules;
    hosts.value = payload.hosts;
  }
  //改变rules
  const changeProjectRules = (payload: ApidocProjectRules): void => {
    rules.value = payload;
  }
  //改变联想参数信息
  const changeMindParams = (payload: ApidocMindParam[]): void => {
    mindParams.value = payload;
  }
  //根据id删除联想参数
  const deleteMindParamsById = (id: string): void => {
    const delIndex = mindParams.value.findIndex(v => v._id === id);
    mindParams.value.splice(delIndex, 1)
  }
  //改变hosts
  const changeProjectHosts = (payload: ApidocProjectHost[]): void => {
    hosts.value = payload;
  }
  //根据id改变host
  const updateHostById = (payload: { _id: string, url: string, name: string }): void => {
    const matchedHost = hosts.value.find(v => v._id === payload._id);
    if (matchedHost) {
      matchedHost.url = payload.url;
      matchedHost.name = payload.name;
    }
  }
  //初始化cookie值
  const initCookies = (): void => {
    const localCookies = localStorage.getItem('apidoc/globalCookies') || '{}';
    try {
      const jsonCookies = JSON.parse(localCookies)
      globalCookies.value = jsonCookies;
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/globalCookies', '{}')
    }
  }
  //改变布局方式
  const changeLayout = (layoutOption: 'horizontal' | 'vertical'): void => {
    layout.value = layoutOption;
    localStorage.setItem('apidoc/layout', layoutOption)
  }
  //初始化布局
  const initLayout = (): void => {
    const localLayout = localStorage.getItem('apidoc/layout');
    if (localLayout !== 'horizontal' && localLayout !== 'vertical') {
      layout.value = 'horizontal';
    } else {
      layout.value = localLayout;
    }
  }
  //添加一个模板
  const addParamsTemplate = (payload: ApidocProjectParamsTemplate): void => {
    paramsTemplate.value.push(payload);
  }
  //删除一个模板
  const deleteParamsTemplate = (index: number): void => {
    paramsTemplate.value.splice(index, 1)
  }
  //改变web代理
  const changeWebProxy = (isProxy: boolean): void => {
    webProxy.value = isProxy;
  }
  //改变操作模式
  const changeMode = (modeOption: 'edit' | 'view'): void => {
    mode.value = modeOption;
  }
  //改变公共请求头信息
  const changeCommonHeaders = (headers: ApidocProjectCommonHeader[]): void => {
    commonHeaders.value = headers
  }
  //改变实际发送的公共请求头
  // const changeValidCommonHeaders = (headers: Pick<ApidocProperty, 'key' | 'value' | 'description' | 'select'>[]) => {
  //   validCommonHeaders.value = headers;
  // }
  const getCommonHeaderPathById = (headerItemId: string) => {
    const path: string[] = [];
    const cpComonHeaders = commonHeaders.value;
    let isMatched = false;
    const loop = (loopData: ApidocProjectCommonHeader[], id: string, level: number) => {
      for (let i = 0; i < loopData.length; i++) {
        if (isMatched) {
          return
        }
        const data = loopData[i];
        if (level === 0) {
          path.length = 0;
        }
        path[level] = data.name as string;
        for (let j = 0; j < data.commonHeaders.length; j++) {
          const header = data.commonHeaders[j];
          if (header._id === id) {
            isMatched = true;
            return;
          }
        }
        if (data.children.length) {
          loop(data.children, id, level + 1)
        }
      }
    }
    loop(cpComonHeaders, headerItemId, 0);
    return path
  }
  //根据文档id获取公共请求头
  const getCommonHeadersById = (id: string) => {
    if (!id) {
      return [];
    }
    const result: CommonHeaderResult = {
      matched: false,
      nodeId: '',
      data: []
    };
    getMatchedHeaders(commonHeaders.value, {
      id,
      preCommonHeaders: [],
      deep: 1,
      result,
    });
    const validCommonHeaders = result.data?.filter(v => v.key && v.select) || [];
    validCommonHeaders.forEach(header => {
      header.path = getCommonHeaderPathById(header._id);
      header.nodeId = result.nodeId;
    })
    const validGlobalCommonHeaders = globalCommonHeaders.value?.filter(v => v.key && v.select) || [];
    // console.log('comm', [...validCommonHeaders, ...validGlobalCommonHeaders]);
    return [...validCommonHeaders, ...validGlobalCommonHeaders];
  }
  /*
  |--------------------------------------------------------------------------
  | 接口调用
  |--------------------------------------------------------------------------
  */
  /**
   * 获取项目基本信息
   */
  const getProjectBaseInfo = async (payload: { projectId: string }): Promise<void> => {
    if(__STANDALONE__){
      const projectInfo = await standaloneCache.getProjectInfo(payload.projectId);
      if(projectInfo){
        projectName.value = projectInfo.projectName;
        _id.value = projectInfo._id;
      }
      return;
    }
    const { replaceVariables } = useVariable();
    return new Promise((resolve, reject) => {
      const params = {
        _id: payload.projectId,
      }
      request.get<Response<ApidocProjectBaseInfoState>, Response<ApidocProjectBaseInfoState>>('/api/project/project_full_info', { params }).then((res) => {
        changeProjectBaseInfo(res.data);
        replaceVariables(res.data.variables)
        event.emit('apidoc/getBaseInfo', res.data);
        resolve()
      }).catch((err) => {
        console.error(err);
        reject(err);
      })
    });
  }
  /**
   * 获取分享项目基本信息
   */
  const getSharedProjectBaseInfo = async (payload: { shareId: string, password: string }): Promise<void> => {
    return new Promise((resolve, reject) => {
      const params = {
        shareId: payload.shareId,
        password: payload.password,
      };
      request.get<Response<ApidocProjectBaseInfoState>, Response<ApidocProjectBaseInfoState>>('/api/project/export/share_project_info', { params }).then((res) => {
        if (res.code === 101005) {
          //todo
          // shareRouter.replace({
          //   path: '/check',
          //   query: {
          //     share_id: shareRouter.currentRoute.value.query.share_id,
          //     id: shareRouter.currentRoute.value.query.id,
          //   },
          // });
          return;
        }
        changeProjectBaseInfo(res.data)
        resolve()
      }).catch((err) => {
        console.error(err);
        reject(err);
      })
    });
  }
  /**
   * 获取全部公共请求头信息
   */
  const getCommonHeaders = async (): Promise<void> => {
    if(__STANDALONE__){
      // todo
      return;
    }
    return new Promise((resolve, reject) => {
      const projectId = router.currentRoute.value.query.id as string;
      const params = {
        projectId
      }
      request.get<Response<ApidocProjectBaseInfoState['commonHeaders']>, Response<ApidocProjectBaseInfoState['commonHeaders']>>('/api/project/common_headers', { params }).then((res) => {
        changeCommonHeaders(res.data)
        resolve();
      }).catch((err) => {
        console.error(err);
        reject(err);
      });
    });
  }
  /**
   * 获取全局公共请求头
   */
  const getGlobalCommonHeaders = async (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      if(__STANDALONE__){
        const commonHeaders = await standaloneCache.getCommonHeaders();
        globalCommonHeaders.value = commonHeaders;
        resolve();
        return;
      }
      const params = {
        projectId: router.currentRoute.value.query.id as string
      }
      request.get<Response<GlobalCommonHeader[]>, Response<GlobalCommonHeader[]>>('/api/project/global_common_headers', {params}).then((res) => {
        globalCommonHeaders.value = res.data;
        resolve();
      }).catch((err) => {
        console.error(err);
        reject(err);
      });
    });
  }
  return {
    _id,
    layout,
    paramsTemplate,
    webProxy,
    projectName,
    mode,
    commonHeaders,
    rules,
    mindParams,
    hosts,
    globalCookies,
    projectId,
    globalCommonHeaders,
    // validCommonHeaders,
    changeProjectId,
    changeProjectBaseInfo,
    updateHostById,
    initCookies,
    changeLayout,
    initLayout,
    addParamsTemplate,
    deleteParamsTemplate,
    changeWebProxy,
    changeMode,
    changeCommonHeaders,
    changeProjectRules,
    changeMindParams,
    deleteMindParamsById,
    changeProjectHosts,
    getProjectBaseInfo,
    getSharedProjectBaseInfo,
    getCommonHeaders,
    getCommonHeadersById,
    getGlobalCommonHeaders,
    // changeValidCommonHeaders
  }
})