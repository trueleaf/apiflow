import { generateEmptyProperty, generateHttpNode, safeDecodeURIComponent } from '@/helper'
import { eventEmitter } from '@/helper'
import { nanoid } from 'nanoid/non-secure';
import { cloneDeep, assign } from "lodash-es"
import {
  HttpNodeBodyMode,
  CommonResponse,
  HttpNodeBodyRawType,
  HttpNodeContentType,
  HttpNode,
  HttpNodeRequestMethod,
  ApidocProperty,
  HttpNodeBodyParams
} from '@src/types'
import { defineStore, storeToRefs } from "pinia"
import axios, { Canceler } from 'axios'
import { request as axiosInstance } from '@/api/api'
import { ref, watch } from "vue"
import { ClConfirm } from '@/components/ui/cleanDesign/clConfirm/ClConfirm'
import { router } from "@/router"
import { useProjectNav } from "../projectWorkbench/projectNavStore"
import { useBanner } from "../projectWorkbench/bannerStore"
import { DeepPartial } from "@src/types/index.ts"
import { useCookies } from "../projectWorkbench/cookiesStore.ts"
import { i18n } from "@/i18n"
import { getUrl } from "@/server/request/request.ts"
import { useVariable } from "../projectWorkbench/variablesStore.ts"
import { apiNodesCache } from "@/cache/nodes/nodesCache";
import { useRuntime } from '../runtime/runtimeStore';
import { httpNodeHistoryCache } from '@/cache/httpNode/httpNodeHistoryCache';
import { logger } from '@/helper';
import { useHttpNodeConfig } from './httpNodeConfigStore';


type EditHttpNodePropertyPayload<K extends keyof ApidocProperty> = {
  data: ApidocProperty,
  field: K,
  value: ApidocProperty[K]
}

export const useHttpNode = defineStore('httpNode', () => {
  const runtimeStore = useRuntime();
  const isOffline = () => runtimeStore.networkMode === 'offline';
  const cancel: Canceler[] = [] //请求列表  
  const httpNodeCookies = useCookies()
  const httpNodeInfo = ref<HttpNode>(generateHttpNode());
  const httpNodeVariableStore = useVariable()
  const originHttpNodeInfo = ref<HttpNode>(generateHttpNode());
  const defaultHeaders = ref<ApidocProperty<"string">[]>([]);
  const httpContentLoading = ref(false);
  const saveHttpNodeLoading = ref(false);
  const responseBodyLoading = ref(false)
  const saveDocDialogVisible = ref(false);
  const savedDocId = ref('');
  const httpNodeConfigStore = useHttpNodeConfig();
  /*
  |--------------------------------------------------------------------------   
  | 通用方法
  |--------------------------------------------------------------------------   
  */
  //更新cookie头
  watch([() => {
    return httpNodeInfo.value.item.url;
  }, () => {
    return httpNodeVariableStore.objectVariable;
  }, () => {
    return httpNodeCookies.cookies;
  }], async () => {
    const fullUrl = await getUrl(httpNodeInfo.value);
    const matchedCookies = httpNodeCookies.getMachtedCookies(fullUrl);
    const cookieIndex = defaultHeaders.value.findIndex(header => header.key === "Cookie");
    const autoCookieDescription = i18n.global.t('<发送时候自动计算>');
    const isAutoCookieHeader = (header: ApidocProperty<'string'> | undefined) => {
      if (!header) return false;
      return !!header._disableDelete && !!header._disableKey && !!header._disableDescription && header.description === autoCookieDescription;
    }
    if (matchedCookies.length > 0) {
      const cookieValue = matchedCookies
        .map(cookie => `${safeDecodeURIComponent(cookie.name)}=${safeDecodeURIComponent(cookie.value)}`)
        .join('; ');
      if (cookieIndex !== -1) {
        const existingHeader = defaultHeaders.value[cookieIndex];
        if (isAutoCookieHeader(existingHeader)) {
          defaultHeaders.value[cookieIndex].value = cookieValue;
        }
        return;
      }
      const property: ApidocProperty<'string'> = generateEmptyProperty();
      property.key = "Cookie";
      property.value = cookieValue;
      property.description = autoCookieDescription;
      property._disableDelete = true;
      property._disableKey = true;
      property._disableDescription = true;
      defaultHeaders.value.unshift(property);
      return;
    }
    if (cookieIndex === -1) {
      return;
    }
    const existingHeader = defaultHeaders.value[cookieIndex];
    if (isAutoCookieHeader(existingHeader)) {
      defaultHeaders.value.splice(cookieIndex, 1);
    }
  }, {
    deep: true,
    immediate: true,
  })
  /*
  |--------------------------------------------------------------------------
  | url、host、method、name、description
  |--------------------------------------------------------------------------
  */
  //改变prefix值
  const changeHttpNodePrefix = (prefix: string): void => {
    httpNodeInfo.value.item.url.prefix = prefix;
  }
  //改变url值
  const changeHttpNodeUrl = (path: string): void => {
    httpNodeInfo.value.item.url.path = path;
  }
  //改变请求method
  const changeHttpNodeMethod = (method: HttpNodeRequestMethod): void => {
    httpNodeInfo.value.item.method = method;
  }
  //改变接口名称
  const changeHttpNodeName = (name: string): void => {
    httpNodeInfo.value.info.name = name;
  }
  //改变api文档id值
  const changeHttpNodeId = (_id: string): void => {
    httpNodeInfo.value._id = _id;
  }
  //改变接口描述
  const changeDescription = (description: string): void => {
    httpNodeInfo.value.info.description = description;
  }
  /*
    |--------------------------------------------------------------------------
    | Params
    |--------------------------------------------------------------------------
  */
  //改变path参数
  const changePathParams = (paths: ApidocProperty<'string'>[]): void => {
    httpNodeInfo.value.item.paths = paths
  }
  //在头部插入查询参数
  const unshiftQueryParams = (queryParams: ApidocProperty<'string'>[]): void => {
    queryParams.forEach((params) => {
      httpNodeInfo.value.item.queryParams.unshift(params);
    })
  }
  /*
    |--------------------------------------------------------------------------
    | requestBody
    |--------------------------------------------------------------------------
    */
  //改变body参数mode类型
  const changeBodyMode = (mode: HttpNodeBodyMode): void => {
    httpNodeInfo.value.item.requestBody.mode = mode;
  }
  //改变body参数raw的mime类型
  const changeBodyRawType = (rawType: HttpNodeBodyRawType): void => {
    httpNodeInfo.value.item.requestBody.raw.dataType = rawType;
  }
  //改变rawBody数据
  const changeRawJson = (rawJson: string): void => {
    httpNodeInfo.value.item.requestBody.rawJson = rawJson;
  }
  //改变body参数error信息
  const changeFormDataErrorInfoById = (id: string, errorMsg: string): void => {
    const index = httpNodeInfo.value.item.requestBody.formdata.findIndex((v) => v._id === id);
    if (index !== -1) {
      httpNodeInfo.value.item.requestBody.formdata[index]._error = errorMsg;
    }
  }
  /*
  |--------------------------------------------------------------------------
  | raw参数
  |--------------------------------------------------------------------------
  */
  //改变raw的参数值
  const changeBodyRawValue = (rawValue: string): void => {
    httpNodeInfo.value.item.requestBody.raw.data = rawValue;
  }
  //改变contentType值
  const changeContentType = (contentType: HttpNodeContentType): void => {
    httpNodeInfo.value.item.contentType = contentType;
    const matchedValue = defaultHeaders.value.find((val) => val.key === 'Content-Type');
    const matchedIndex = defaultHeaders.value.findIndex((val) => val.key === 'Content-Type');
    if (contentType && matchedValue) { //存在contentType并且默认header值也有
      matchedValue.value = contentType
    } else if (contentType && !matchedValue) { //存在contentType但是默认header没有
      const params = generateEmptyProperty();
      params.key = 'Content-Type';
      params.value = contentType;
      params.description = '<根据body类型自动处理>';
      defaultHeaders.value.push(params);
    } else if (!contentType && matchedIndex !== -1) {
      defaultHeaders.value.splice(matchedIndex, 1)
    }
  }
  /*
  |--------------------------------------------------------------------------
  | binary类型参数
  |--------------------------------------------------------------------------
  */
  const handleChangeBinaryInfo = (payload: DeepPartial<HttpNodeBodyParams['binary']>) => {
    assign(httpNodeInfo.value.item.requestBody.binary, payload)
  }
  //从 curl 命令批量更新 HttpNode 数据
  const updateHttpNodeFromCurl = (curlData: Partial<HttpNode>): void => {
    if (curlData.item) {
      if (curlData.item.method) {
        httpNodeInfo.value.item.method = curlData.item.method
      }
      if (curlData.item.url) {
        httpNodeInfo.value.item.url.prefix = curlData.item.url.prefix
        httpNodeInfo.value.item.url.path = curlData.item.url.path
      }
      if (curlData.item.queryParams) {
        httpNodeInfo.value.item.queryParams = curlData.item.queryParams
      }
      if (curlData.item.headers) {
        httpNodeInfo.value.item.headers = curlData.item.headers
      }
      if (curlData.item.requestBody) {
        httpNodeInfo.value.item.requestBody = curlData.item.requestBody
      }
      if (curlData.item.contentType) {
        changeContentType(curlData.item.contentType)
      }
    }
  }
  /*
    |--------------------------------------------------------------------------
    | response参数
    |--------------------------------------------------------------------------
    */
  //改变某个response的title参数
  const changeResponseParamsTitleByIndex = (payload: { index: number, title: string }): void => {
    const { index, title } = payload
    httpNodeInfo.value.item.responseParams[index].title = title;
  }
  //改变某个response的statusCode值
  const changeResponseParamsCodeByIndex = (payload: { index: number, code: number }): void => {
    const { index, code } = payload
    httpNodeInfo.value.item.responseParams[index].statusCode = code;
  }
  //改变某个response的dataType值
  const changeResponseParamsDataTypeByIndex = (payload: { index: number, type: HttpNodeContentType }): void => {
    const { index, type } = payload
    httpNodeInfo.value.item.responseParams[index].value.dataType = type;
  }
  //改变某个response文本value值
  const changeResponseParamsTextValueByIndex = (payload: { index: number, value: string }): void => {
    const { index, value } = payload
    httpNodeInfo.value.item.responseParams[index].value.text = value;
  }
  //根据index值改变response的json数据
  const changeResponseStrJsonByIndex = (payload: { index: number, value: string }): void => {
    const { index, value } = payload
    httpNodeInfo.value.item.responseParams[index].value.strJson = value;
  }
  //新增一个response
  const addResponseParam = (): void => {
    httpNodeInfo.value.item.responseParams.push({
      _id: nanoid(),
      title: i18n.global.t('返回参数名称'),
      statusCode: 200,
      value: {
        strJson: '',
        dataType: 'application/json',
        text: '',
        file: {
          url: '',
          raw: '',
        }
      },
    })
  }
  //删除一个response
  const deleteResponseByIndex = (index: number): void => {
    httpNodeInfo.value.item.responseParams.splice(index, 1);
  }
  /*
    |--------------------------------------------------------------------------
    | 其它
    |--------------------------------------------------------------------------
    |
  */
  const initDefaultHeaders = (contentType?: HttpNodeContentType) => {
    defaultHeaders.value = [];
    //=========================================================================//
    const params3 = generateEmptyProperty();
    params3.key = 'Host';
    params3.description = '<主机信息>';
    params3._disableKey = true;
    params3._disableKeyTip = i18n.global.t('该请求头无法修改，也无法取消发送')
    params3._disableDeleteTip = 'Host请求头无法删除';
    params3._disableValue = true;
    params3._valuePlaceholder = '<发送请求时候自动处理>';
    params3._disableDescription = true;
    params3._disableAdd = true;
    params3._disableAddTip = ''
    params3._disableDelete = true;
    params3.disabled = true;
    defaultHeaders.value.push(params3);
    //=========================================================================//
    const params4 = generateEmptyProperty();
    params4.key = 'Accept-Encoding';
    params4._valuePlaceholder = 'gzip, deflate, br';
    params4.description = '<客户端理解的编码方式>';
    params4._disableKey = true;
    params4._disableDescription = true;
    params4._disableKeyTip = '';
    params4._disableValue = true;
    params4._disableAdd = true;
    params4._disableDelete = true;
    params4.disabled = true;
    defaultHeaders.value.push(params4);
    //=========================================================================//
    const params5 = generateEmptyProperty();
    params5.key = 'Connection';
    params5._valuePlaceholder = '<默认为：keep-alive>';
    params5.description = '<当前的事务完成后，是否会关闭网络连接>';
    params5._disableKey = true;
    params5._disableValue = true;
    params5._disableDescription = true;
    params5._disableDescription = true;
    params5._disableKeyTip = ''
    params5._disableAdd = true;
    params5._disableDelete = true;
    params5.disabled = true;
    defaultHeaders.value.push(params5);
    //=========================================================================//
    const params = generateEmptyProperty();
    params.key = 'Content-Length';
    params._valuePlaceholder = '<发送请求时候自动计算>';
    params._disableValue = true;
    params.description = '<消息的长度>';
    params._disableDeleteTip = 'Content-Length请求头无法删除';
    params._disableKey = true;
    params._disableKeyTip = ''
    params._disableDescription = true;
    params._disableAdd = true;
    params._disableDelete = true;
    params.disabled = true;
    defaultHeaders.value.push(params);
    //=========================================================================//
    const params2 = generateEmptyProperty();
    params2.key = 'User-Agent';
    params2._valuePlaceholder = httpNodeConfigStore.currentHttpNodeConfig.userAgent;
    params2.description = '<用户代理软件信息>';
    params2._disableKey = true;
    params2._disableKeyTip = ''
    params2._disableDescription = true;
    params2._disableAdd = true;
    params2._disableDelete = true;
    // params2._disableValue = true;
    defaultHeaders.value.push(params2);
    //=========================================================================//
    const params7 = generateEmptyProperty();
    params7.key = 'Accept';
    params7._valuePlaceholder = '*/*';
    params7.description = '<工具支持解析所有类型返回>';
    params7._disableKey = true;
    params7._disableDescription = true;
    params7._disableKeyTip = ''
    params7._disableAdd = true;
    params7._disableDelete = true;
    // params7._disableValue = true;
    defaultHeaders.value.push(params7);
    //=========================================================================//
    if (contentType) {
      const params6 = generateEmptyProperty();
      params6.key = 'Content-Type';
      params6.value = contentType;
      params6.description = i18n.global.t('资源的原始媒体类型');
      params6._valuePlaceholder = '<根据body类型自动处理,不推荐修改>';
      params6._disableKey = true;
      params6._disableDescription = true;
      params6._disableKeyTip = ''
      params6._disableAdd = true;
      params6._disableDelete = true;
      // params6.disabled = true;
      defaultHeaders.value.push(params6);
    }

  }
  //重新赋值httpNodeInfo数据
  const changeHttpNodeInfo = (payload: HttpNode): void => {
    // queryParams如果没有数据则默认添加一条空数据
    if (payload.item.queryParams.length === 0) {
      payload.item.queryParams.push(generateEmptyProperty());
    }
    //formData如果没有数据则默认添加一条空数据
    if (payload.item.requestBody.formdata.length === 0) {
      payload.item.requestBody.formdata.push(generateEmptyProperty());
    }
    //urlencoded如果没有数据则默认添加一条空数据
    if (payload.item.requestBody.urlencoded.length === 0) {
      payload.item.requestBody.urlencoded.push(generateEmptyProperty());
    }
    //headers如果没有数据则默认添加一条空数据
    if (payload.item.headers.length === 0) {
      payload.item.headers.push(generateEmptyProperty());
    }
    //responseParams如果没有数据则默认添加一条空数据
    if (payload.item.responseParams.length === 0) {
      payload.item.responseParams.push({
        _id: nanoid(),
        title: i18n.global.t('成功返回'),
        statusCode: 200,
        value: {
          file: {
            url: '',
            raw: ''
          },
          strJson: '',
          dataType: 'application/json',
          text: ''
        },
      });
    }
    initDefaultHeaders(payload.item.contentType)
    if (payload.item.headers.length === 0) {
      payload.item.headers.push(generateEmptyProperty());
    }
    // if (!payload.item.url.prefix && !payload.item.url.path.startsWith("http")) {
    // }
    httpNodeInfo.value = payload;
  }
  //改变originHttpNodeInfo原始缓存值
  const changeOriginHttpNodeInfo = (): void => {
    originHttpNodeInfo.value = cloneDeep(httpNodeInfo.value);
  }
  //改变httpNodeInfo数据加载状态
  const changeHttpContentLoading = (state: boolean): void => {
    httpContentLoading.value = state;
  }
  //保存httpNodeInfo时候更新loading
  const changeSaveHttpNodeLoading = (isLoading: boolean): void => {
    saveHttpNodeLoading.value = isLoading;
  }
  //响应体加载状态
  const changeResponseBodyLoading = (state: boolean): void => {
    responseBodyLoading.value = state;
  }
  //添加一个请求参数数据
  const addProperty = (payload: { data: ApidocProperty[], params: ApidocProperty }): void => {
    payload.data.push(payload.params);
  }
  //删除一个请求参数数据
  const deleteProperty = (payload: { data: ApidocProperty[], index: number }): void => {
    payload.data.splice(payload.index, 1);
  }
  //改变请求参数某个属性的值
  const changePropertyValue = <K extends keyof ApidocProperty>(payload: EditHttpNodePropertyPayload<K>): void => {
    const { data, field, value } = payload;
    data[field] = value;
  }
  //保存接口弹窗是否展示
  const changeSaveDocDialogVisible = (visible: boolean): void => {
    saveDocDialogVisible.value = visible;
  }
  //改变当前需要保存的节点id
  const changeSavedDocId = (id: string): void => {
    savedDocId.value = id;
  }

  /*
  |--------------------------------------------------------------------------
  | 预请求脚本
  |--------------------------------------------------------------------------
  */
  const changePreRequest = (preRequest: string): void => {
    httpNodeInfo.value.preRequest.raw = preRequest;
  }
  const changeAfterRequest = (afterRequest: string): void => {
    httpNodeInfo.value.afterRequest.raw = afterRequest;
  }
  /*
  |--------------------------------------------------------------------------
  | 接口调用
  |--------------------------------------------------------------------------
  */
  //获取项目基本信息
  const getHttpNodeDetail = async (payload: { id: string, projectId: string }): Promise<void> => {
    const { deleteNavByIds } = useProjectNav();
    httpNodeConfigStore.initHttpNodeConfig(payload.projectId)

    if (isOffline()) {
      const doc = await apiNodesCache.getNodeById(payload.id) as HttpNode;
      if (!doc) {
        ClConfirm({
          content: i18n.global.t('当前接口不存在，可能已经被删除'),
          title: i18n.global.t('提示'),
          confirmButtonText: i18n.global.t('关闭接口'),
          cancelButtonText: i18n.global.t('取消'),
          type: 'warning',
        }).then(() => {
          deleteNavByIds({
            projectId: payload.projectId,
            ids: [payload.id]
          })
        }).catch((err) => {
          if (err === 'cancel' || err === 'close') {
            return;
          }
          console.error(err);
        });
        return
      }
      changeHttpNodeInfo(doc);
      changeOriginHttpNodeInfo()
      return
    }


    if (cancel.length > 0) {
      cancel.forEach((c) => {
        c('取消请求');
      })
    }
    return new Promise((resolve, reject) => {
      changeHttpContentLoading(true);
      changeHttpContentLoading(true)
      const params = {
        projectId: payload.projectId,
        _id: payload.id,
      }
      axiosInstance.get<CommonResponse<HttpNode>, CommonResponse<HttpNode>>('/api/project/doc_detail', {
        params,
        cancelToken: new axios.CancelToken((c) => {
          cancel.push(c);
        }),
      }).then((res) => {
        if (res.data === null) { //接口不存在提示用户删除接口
          ClConfirm({
            content: i18n.global.t('当前接口不存在，可能已经被删除'),
            title: i18n.global.t('提示'),
            confirmButtonText: i18n.global.t('关闭接口'),
            cancelButtonText: i18n.global.t('取消'),
            type: 'warning',
          }).then(() => {
            deleteNavByIds({
              projectId: payload.projectId,
              ids: [payload.id]
            })
          }).catch((err) => {
            if (err === 'cancel' || err === 'close') {
              return;
            }
            console.error(err);
          });
          return;
        }
        changeHttpNodeInfo(res.data);
        changeOriginHttpNodeInfo()
        resolve()
      }).catch((err) => {
        console.error(err);
        reject(err);
      }).finally(() => {
        changeHttpContentLoading(false)
      })
    });
  }
  //保存接口
  const saveHttpNode = (): Promise<void> => {
    const { navs } = storeToRefs(useProjectNav());
    const { changeNavInfoById } = useProjectNav();
    const { changeHttpBannerInfoById } = useBanner()
    return new Promise(async (resolve, reject) => {
      //todo
      // const projectId = router.currentRoute.value.query.id as string || shareRouter.currentRoute.value.query.id as string;
      const projectId = router.currentRoute.value.query.id as string;
      const currentNavs = navs.value[projectId];
      const currentSelectNav = currentNavs?.find((nav) => nav.selected) || null;
      if (!currentSelectNav) {
        logger.warn('缺少nav信息');
        return;
      }
      changeSaveHttpNodeLoading(true);
      const httpNodeDetail = cloneDeep(httpNodeInfo.value);
      //todo
      // context.dispatch('saveMindParams');
      //删除_error字段
      httpNodeDetail.item.requestBody.formdata.forEach(v => {
        delete v._error;
      })
      const params = {
        _id: currentSelectNav._id,
        projectId,
        info: httpNodeDetail.info,
        item: httpNodeDetail.item,
        preRequest: httpNodeDetail.preRequest,
        afterRequest: httpNodeDetail.afterRequest,
      };
      if (isOffline()) {
        httpNodeDetail.updatedAt = new Date().toISOString();
        await apiNodesCache.replaceNode(httpNodeDetail);
        //改变nav请求方法
        changeNavInfoById({
          id: currentSelectNav._id,
          field: 'head',
          value: {
            icon: params.item.method,
            color: '',
          },
        })
        //改变banner请求方法
        changeHttpBannerInfoById({
          id: currentSelectNav._id,
          field: 'method',
          value: params.item.method,
        })
        //改变origindoc的值
        changeOriginHttpNodeInfo();
        //改变nav未保存小圆点
        changeNavInfoById({
          id: currentSelectNav._id,
          field: 'saved',
          value: true,
        })
        // 添加历史记录
        httpNodeHistoryCache.addHttpHistoryByNodeId(
          currentSelectNav._id,
          httpNodeInfo.value,
          runtimeStore.userInfo.id,
          runtimeStore.userInfo.loginName
        ).catch(error => {
          logger.error('添加历史记录失败', { error });
        });
        // 添加0.2秒的saveLoading效果
        setTimeout(() => {
          changeSaveHttpNodeLoading(false);
        }, 100);
        return
      }

      axiosInstance.post('/api/project/fill_doc', params).then(() => {
        //改变nav请求方法
        changeNavInfoById({
          id: currentSelectNav._id,
          field: 'head',
          value: {
            icon: params.item.method,
            color: '',
          },
        })

        //改变banner请求方法
        changeHttpBannerInfoById({
          id: currentSelectNav._id,
          field: 'method',
          value: params.item.method,
        })
        //改变origindoc的值
        changeOriginHttpNodeInfo();
        //改变nav未保存小圆点
        changeNavInfoById({
          id: currentSelectNav._id,
          field: 'saved',
          value: true,
        })
        // 添加历史记录
        httpNodeHistoryCache.addHttpHistoryByNodeId(
          currentSelectNav._id,
          httpNodeInfo.value,
          runtimeStore.userInfo.id,
          runtimeStore.userInfo.loginName
        ).catch(error => {
          logger.error('添加历史记录失败', { error });
        });
        //   id: currentSelectNav._id,
        //   projectId,
        //   url: apidocDetail.item.url.path,
        //   method: apidocDetail.item.method,
        // })
        resolve();
      }).catch((err) => {
        //改变nav未保存小圆点
        changeNavInfoById({
          id: currentSelectNav._id,
          field: 'saved',
          value: false,
        })
        console.error(err);
        reject(err);
      }).finally(() => {
        changeSaveHttpNodeLoading(false)
      });
    })
  }
  //保存联想参数

  //改变保存apidoc弹窗状态
  const openSaveDocDialog = (id: string): Promise<'save' | 'cancel'> => {
    changeSaveDocDialogVisible(true)
    changeSavedDocId(id)
    return new Promise((resolve, reject) => {
      try {
        eventEmitter.on('tabs/saveTabSuccess', () => {
          resolve('save');
        })
        eventEmitter.on('tabs/cancelSaveTab', () => {
          resolve('cancel');
        })
      } catch (error) {
        reject(error)
      }
    })
  }
  return {
    httpNodeInfo,
    originHttpNodeInfo,
    httpContentLoading,
    defaultHeaders,
    saveHttpNodeLoading,
    responseBodyLoading,
    saveDocDialogVisible,
    savedDocId,
    changeResponseBodyLoading,
    getHttpNodeDetail,
    changeSaveHttpNodeLoading,
    addProperty,
    deleteProperty,
    changeHttpNodeInfo,
    changeOriginHttpNodeInfo,
    changeHttpContentLoading,
    changeSaveDocDialogVisible,
    changeSavedDocId,
    changePropertyValue,
    changePathParams,
    unshiftQueryParams,
    changeBodyMode,
    changeBodyRawType,
    changeHttpNodePrefix,
    changeBodyRawValue,
    changeContentType,
    changeHttpNodeUrl,
    changeHttpNodeMethod,
    changeHttpNodeName,
    changeHttpNodeId,
    changeDescription,
    changeRawJson,
    changeResponseParamsTitleByIndex,
    changeResponseParamsCodeByIndex,
    changeResponseParamsDataTypeByIndex,
    changeResponseParamsTextValueByIndex,
    changeResponseStrJsonByIndex,
    addResponseParam,
    deleteResponseByIndex,
    saveHttpNode,
    openSaveDocDialog,
    changePreRequest,
    changeAfterRequest,
    changeFormDataErrorInfoById,
    handleChangeBinaryInfo,
    updateHttpNodeFromCurl,
  }
})
