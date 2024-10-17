import { ActionContext } from 'vuex'
import type { State as RootState, ApidocProjectBaseInfoState, ApidocProjectParamsTemplate } from '@src/types/store'
import type { Response, ApidocMindParam, ApidocProperty, ApidocPropertyType } from '@src/types/global'
import { axios } from '@/pages/modules/apidoc/doc-view/api/api'
import router from '../../router/index'

type CommonHeaderResult = {
  matched: boolean,
  data: Pick<ApidocProperty, 'key' | 'value' | 'description'>[]
};

const getMatchedHeaders = (data: ApidocProjectBaseInfoState['commonHeaders'], id: string | undefined, preCommonHeaders: Pick<ApidocProperty, 'key' | 'value' | 'description'>[], result: CommonHeaderResult) => {
  const loopList = [];
  for (let i = 0; i < data.length; i += 1) {
    if (result.matched) {
      return;
    }
    if (preCommonHeaders && preCommonHeaders.length > 0) {
      preCommonHeaders.forEach(headerInfo => {
        const matchedHeader = result.data.find(v => v.key === headerInfo.key);
        if (matchedHeader) { //子节点覆盖父节点
          matchedHeader.key = headerInfo.key;
          matchedHeader.value = headerInfo.value;
          matchedHeader.description = headerInfo.description;
        } else {
          result.data.push({
            key: headerInfo.key,
            value: headerInfo.value,
            description: headerInfo.description,
          })
        }
      })
    }
    const { _id, commonHeaders, children } = data[i];
    if (_id === id) { //找到子节点结束递归
      result.matched = true;
      const cpData = JSON.parse(JSON.stringify(result.data));
      result.data = cpData;
      return;
    }
    if (children.length > 0 && !result.matched) {
      const preData = commonHeaders.length > 0 ? commonHeaders : preCommonHeaders;
      loopList.push({
        preData,
        children,
      });
    }
  }
  loopList.forEach(v => {
    getMatchedHeaders(v.children, id, JSON.parse(JSON.stringify(v.preData)), result);
  })
}

const baseInfo = {
  namespaced: true,
  state: {
    _id: '',
    projectName: '',
    variables: [],
    mindParams: [],
    paramsTemplate: [],
    rules: {},
    hosts: [],
    globalCookies: {},
    layout: 'horizontal',
    webProxy: true,
    proxy: {
      path: '',
      enabled: false,
    },
    mode: 'view',
    commonHeaders: [],
  },
  mutations: {
    //改变项目基本信息
    changeProjectBaseInfo(state: ApidocProjectBaseInfoState, payload: ApidocProjectBaseInfoState): void {
      state._id = payload._id;
      state.projectName = payload.projectName;
      state.variables = payload.variables;
      state.mindParams = payload.mindParams;
      state.paramsTemplate = payload.paramsTemplate;
      state.rules = payload.rules;
      state.hosts = payload.hosts;
    },
    //改变联想参数信息
    changeMindParams(state: ApidocProjectBaseInfoState, payload: ApidocMindParam[]): void {
      state.mindParams = payload;
    },
    //根据id删除联想参数
    deleteMindParamsById(state: ApidocProjectBaseInfoState, id: string): void {
      const delIndex = state.mindParams.findIndex(v => v._id === id);
      state.mindParams.splice(delIndex, 1)
    },
    //改变hosts
    changeProjectHosts(state: ApidocProjectBaseInfoState, payload: ApidocProjectBaseInfoState['hosts']): void {
      state.hosts = payload;
    },
    //初始化cookie值
    initCookies(state: ApidocProjectBaseInfoState): void {
      const localCookies = localStorage.getItem('apidoc/globalCookies') || '{}';
      try {
        const jsonCookies = JSON.parse(localCookies)
        state.globalCookies = jsonCookies;
      } catch (error) {
        console.error(error);
        localStorage.setItem('apidoc/globalCookies', '{}')
      }
    },
    //改变布局方式
    changeLayout(state: ApidocProjectBaseInfoState, layout: 'horizontal' | 'vertical'): void {
      state.layout = layout;
      localStorage.setItem('apidoc/layout', layout)
    },
    //初始化布局
    initLayout(state: ApidocProjectBaseInfoState): void {
      const localLayout = localStorage.getItem('apidoc/layout');
      if (localLayout !== 'horizontal' && localLayout !== 'vertical') {
        state.layout = 'horizontal';
      } else {
        state.layout = localLayout;
      }
    },
    //添加一个模板
    addParamsTemplate(state: ApidocProjectBaseInfoState, payload: ApidocProjectParamsTemplate): void {
      state.paramsTemplate.push(payload);
    },
    //改变web代理
    changeWebProxy(state: ApidocProjectBaseInfoState, isProxy: boolean): void {
      state.webProxy = isProxy;
    },
    //改变操作模式
    changeMode(state: ApidocProjectBaseInfoState, mode: 'edit' | 'view'): void {
      state.mode = mode;
    },
    //改变公共请求头信息
    changeCommonHeaders(state: ApidocProjectBaseInfoState, headers: ApidocProjectBaseInfoState['commonHeaders']): void {
      state.commonHeaders = headers
    },
    //根据id获取公共请求头
    getCommonHeadersById(state: ApidocProjectBaseInfoState, id: string): Pick<ApidocProperty<ApidocPropertyType>, 'key' | 'value' | 'description'>[] {
      if (!id) {
        console.warn('必须传递id');
        return [];
      }
      const result: CommonHeaderResult = {
        matched: false,
        data: []
      };
      getMatchedHeaders(state.commonHeaders, id, [], result);
      return result.data;
    }
  },
  actions: {
    /**
         * 获取项目基本信息
         */
    async getProjectBaseInfo(context: ActionContext<ApidocProjectBaseInfoState, RootState>, payload: { projectId: string }): Promise<void> {
      return new Promise((resolve, reject) => {
        const params = {
          _id: payload.projectId,
        }
        request.get<Response<ApidocProjectBaseInfoState>, Response<ApidocProjectBaseInfoState>>('/api/project/project_full_info', { params }).then((res) => {
          context.commit('changeProjectBaseInfo', res.data)
          resolve()
        }).catch((err) => {
          console.error(err);
          reject(err);
        })
      });
    },
    /**
         * 获取分享项目基本信息
         */
    async getSharedProjectBaseInfo(context: ActionContext<ApidocProjectBaseInfoState, RootState>, payload: { shareId: string, password: string }): Promise<void> {
      return new Promise((resolve, reject) => {
        const params = {
          shareId: payload.shareId,
          password: payload.password,
        };
        request.get<Response<ApidocProjectBaseInfoState>, Response<ApidocProjectBaseInfoState>>('/api/project/export/share_project_info', { params }).then((res) => {
          if (res.code === 101005) {
            router.replace({
              path: '/check',
              query: {
                share_id: router.currentRoute.value.query.share_id,
                id: router.currentRoute.value.query.id,
              },
            });
            return;
          }
          context.commit('changeProjectBaseInfo', res.data)
          resolve()
        }).catch((err) => {
          console.error(err);
          reject(err);
        })
      });
    },
    /**
         * 获取全部公共请求头信息
         */
    async getCommonHeaders(context: ActionContext<ApidocProjectBaseInfoState, RootState>): Promise<void> {
      return new Promise((resolve, reject) => {
        const projectId = router.currentRoute.value.query.id as string;
        const params = {
          projectId
        }
        request.get<Response<ApidocProjectBaseInfoState['commonHeaders'][]>, Response<ApidocProjectBaseInfoState['commonHeaders'][]>>('/api/project/common_headers', { params }).then((res) => {
          context.commit('changeCommonHeaders', res.data)
          resolve();
        }).catch((err) => {
          console.error(err);
          reject(err);
        });
      });
    },
  },
}

export { baseInfo }
