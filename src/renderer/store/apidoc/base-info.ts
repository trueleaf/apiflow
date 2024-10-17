import { axios } from "@/api/api";
import {
  ApidocCookieInfo,
  ApidocProjectBaseInfoState,
  ApidocProjectCommonHeader,
  ApidocProjectHost,
  ApidocProjectParamsTemplate,
  ApidocProjectRules,
  ApidocProjectVariable
} from "@src/types/apidoc/base-info";
import { event } from '@/helper'
import { ApidocMindParam, ApidocProperty, Response } from "@src/types/global";
import { defineStore } from "pinia"
import { ref } from "vue";
import { router } from "@/router";

type ChangeProjectBaseInfo = {
  _id: string;
  projectName: string,
  variables: ApidocProjectVariable[],
  mindParams: ApidocMindParam[],
  paramsTemplate: ApidocProjectParamsTemplate[],
  rules: ApidocProjectRules,
  hosts: ApidocProjectHost[],
}
type HeaderInfo = Pick<ApidocProperty, 'key' | 'value' | 'description'>
type CommonHeaderResult = {
  matched: boolean,
  data: HeaderInfo[]
};
type MatchedHeaderOptions = {
  id: string | undefined,
  preCommonHeaders: HeaderInfo[],
  result: CommonHeaderResult,
  deep: number
}

const getMatchedHeaders = (data: ApidocProjectBaseInfoState['commonHeaders'], options: MatchedHeaderOptions) => {
  for (let i = 0; i < data.length; i += 1) {
    const currentItem = data[i];
    const currentHeaders: HeaderInfo[] = []
    const { _id, commonHeaders, children } = currentItem;
    if (_id === options.id) {
      options.result.matched = true;
      options.result.data = options.preCommonHeaders;
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
  const variables = ref<ApidocProjectVariable[]>([]);
  const tempVariables = ref<Omit<ApidocProjectVariable, '_id'>[]>([]);
  const mindParams = ref<ApidocMindParam[]>([]);
  const paramsTemplate = ref<ApidocProjectParamsTemplate[]>([]);
  const rules = ref<ApidocProjectRules>({
    fileInFolderLimit: 255,
    requestMethods: []
  });
  const hosts = ref<ApidocProjectHost[]>([]);
  const globalCookies = ref<Record<string, ApidocCookieInfo[]>>({});
  const layout = ref<'vertical' | 'horizontal'>('horizontal');
  const webProxy = ref(true);
  const mode = ref<'view' | 'edit'>('view');
  const commonHeaders = ref<ApidocProjectCommonHeader[]>([]);
  /*
  |--------------------------------------------------------------------------
  | 方法
  |--------------------------------------------------------------------------
  */
  //改变项目基本信息
  const changeProjectBaseInfo = (payload: ChangeProjectBaseInfo): void => {
    _id.value = payload._id;
    projectName.value = payload.projectName;
    variables.value = payload.variables;
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
  //根据id改变host治
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
  //改变变量信息
  const changeVariables = (variablesOption: ApidocProjectVariable[]): void => {
    variables.value = variablesOption;
  }
  //清空临时变量
  const clearTempVariables = (): void => {
    tempVariables.value = [];
  }
  //改版临时变量的值
  const changeTempVariables = (tempVariablesOption: (Omit<ApidocProjectVariable, '_id'>[])): void => {
    tempVariables.value = tempVariablesOption;
  }
  //改变公共请求头信息
  const changeCommonHeaders = (headers: ApidocProjectCommonHeader[]): void => {
    commonHeaders.value = headers
  }
  //根据文档id获取公共请求头
  const getCommonHeadersById = (id: string) => {
    if (!id) {
      console.warn('必须传递id');
      return [];
    }
    const result: CommonHeaderResult = {
      matched: false,
      data: []
    };
    getMatchedHeaders(commonHeaders.value, {
      id,
      preCommonHeaders: [],
      deep: 1,
      result,
    });
    return result.data?.filter(v => v.key) || [];
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
    return new Promise((resolve, reject) => {
      const params = {
        _id: payload.projectId,
      }
      axios.get<Response<ApidocProjectBaseInfoState>, Response<ApidocProjectBaseInfoState>>('/api/project/project_full_info', { params }).then((res) => {
        changeProjectBaseInfo(res.data);
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
      axios.get<Response<ApidocProjectBaseInfoState>, Response<ApidocProjectBaseInfoState>>('/api/project/export/share_project_info', { params }).then((res) => {
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
    return new Promise((resolve, reject) => {
      const projectId = router.currentRoute.value.query.id as string;
      const params = {
        projectId
      }
      axios.get<Response<ApidocProjectBaseInfoState['commonHeaders']>, Response<ApidocProjectBaseInfoState['commonHeaders']>>('/api/project/common_headers', { params }).then((res) => {
        changeCommonHeaders(res.data)
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
    variables,
    tempVariables,
    commonHeaders,
    rules,
    mindParams,
    hosts,
    globalCookies,
    changeProjectBaseInfo,
    updateHostById,
    initCookies,
    changeLayout,
    initLayout,
    addParamsTemplate,
    deleteParamsTemplate,
    changeWebProxy,
    changeMode,
    changeVariables,
    clearTempVariables,
    changeTempVariables,
    changeCommonHeaders,
    changeProjectRules,
    changeMindParams,
    deleteMindParamsById,
    changeProjectHosts,
    getProjectBaseInfo,
    getSharedProjectBaseInfo,
    getCommonHeaders,
    getCommonHeadersById,
  }
})