import {
  generateHttpNode,
  event,
  apidocGenerateProperty,
  cloneDeep,
  uuid,
  apidocGenerateMockInfo,
} from "@/helper"
import {
  HttpNodeBodyMode,
  Response,
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
import 'element-plus/es/components/message-box/style/css';
import { ElMessageBox } from "element-plus"
import { router } from "@/router"
import { httpNodeCache } from "@/cache/http/httpNodeCache.ts"
import { useApidocTas } from "./tabs"
import { useApidocBanner } from "./banner"
import assign from "lodash/assign"
import { DeepPartial } from "@src/types/types.ts"
import { useCookies } from "./cookies.ts"
import i18next from "i18next"
import { getUrl } from "@/server/request/request.ts"
import { useVariable } from "./variables.ts"
import { config } from "@src/config/config.ts"
import { standaloneCache } from "@/cache/standalone.ts"

type EditApidocPropertyPayload<K extends keyof ApidocProperty> = {
  data: ApidocProperty,
  field: K,
  value: ApidocProperty[K]
}

export const useApidoc = defineStore('apidoc', () => {
  const cancel: Canceler[] = [] //请求列表  
  const apidocCookies = useCookies()
  const apidoc = ref<HttpNode>(generateHttpNode());
  const apidocVaribleStore = useVariable()
  const originApidoc = ref<HttpNode>(generateHttpNode());
  const defaultHeaders = ref<ApidocProperty<"string">[]>([]);
  const loading = ref(false);
  const saveLoading = ref(false);
  const responseBodyLoading = ref(false)
  const saveDocDialogVisible = ref(false);
  const savedDocId = ref('');
  /*
  |--------------------------------------------------------------------------
  | 通用方法
  |--------------------------------------------------------------------------
  */
  //更新cookie头
  watch([() => {
    return apidoc.value.item.url;
  }, () => {
    return apidocVaribleStore.objectVariable;
  }, () => {
    return apidocCookies.cookies;
  }], async () => {
    const fullUrl = await getUrl(apidoc.value);
    const matchedCookies = apidocCookies.getMachtedCookies(fullUrl);
    const property: ApidocProperty<'string'> = apidocGenerateProperty();
    property.key = "Cookie";
    let cookieValue = '';
    // console.log('initDefaultHeaders', fullUrl, matchedCookies);
    if (matchedCookies.length > 0) {
      cookieValue = matchedCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
      property.value = cookieValue;
      property.description = i18next.t('<发送时候自动计算>');
      property._disableDelete = true;
      property._disableKey = true;
      property._disableDescription = true;
      const cookieIndex = defaultHeaders.value.findIndex(header => header.key === "Cookie");
      if (cookieIndex !== -1) {
        defaultHeaders.value[cookieIndex].value = cookieValue;
      } else {
        defaultHeaders.value.unshift(property);
      }
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
  const changeApidocPrefix = (prefix: string): void => {
    apidoc.value.item.url.prefix = prefix;
  }
  //改变url值
  const changeApidocUrl = (path: string): void => {
    apidoc.value.item.url.path = path;
  }
  //改变请求method
  const changeApidocMethod = (method: HttpNodeRequestMethod): void => {
    apidoc.value.item.method = method;
  }
  //改变接口名称
  const changeApidocName = (name: string): void => {
    apidoc.value.info.name = name;
  }
  //改变api文档id值
  const changeApidocId = (_id: string): void => {
    apidoc.value._id = _id;
  }
  //改变接口描述
  const changeDescription = (description: string): void => {
    apidoc.value.info.description = description;
  }
  /*
    |--------------------------------------------------------------------------
    | Params
    |--------------------------------------------------------------------------
  */
  //改变path参数
  const changePathParams = (paths: ApidocProperty<'string'>[]): void => {
    apidoc.value.item.paths = paths
  }
  //在头部插入查询参数
  const unshiftQueryParams = (queryParams: ApidocProperty<'string'>[]): void => {
    queryParams.forEach((params) => {
      apidoc.value.item.queryParams.unshift(params);
    })
  }
  /*
    |--------------------------------------------------------------------------
    | requestBody
    |--------------------------------------------------------------------------
    */
  //改变body参数mode类型
  const changeBodyMode = (mode: HttpNodeBodyMode): void => {
    apidoc.value.item.requestBody.mode = mode;
  }
  //改变body参数raw的mime类型
  const changeBodyRawType = (rawType: HttpNodeBodyRawType): void => {
    apidoc.value.item.requestBody.raw.dataType = rawType;
  }
  //改变rawBody数据
  const changeRawJson = (rawJson: string): void => {
    apidoc.value.item.requestBody.rawJson = rawJson;
  }
  //改变body参数error信息
  const changeFormDataErrorInfoById = (id: string, errorMsg: string): void => {
    const index = apidoc.value.item.requestBody.formdata.findIndex((v) => v._id === id);
    if (index !== -1) {
      apidoc.value.item.requestBody.formdata[index]._error = errorMsg;
    }
  }
  /*
  |--------------------------------------------------------------------------
  | raw参数
  |--------------------------------------------------------------------------
  */
  //改变raw的参数值
  const changeBodyRawValue = (rawValue: string): void => {
    apidoc.value.item.requestBody.raw.data = rawValue;
  }
  //改变contentType值
  const changeContentType = (contentType: HttpNodeContentType): void => {
    apidoc.value.item.contentType = contentType;
    const matchedValue = defaultHeaders.value.find((val) => val.key === 'Content-Type');
    const matchedIndex = defaultHeaders.value.findIndex((val) => val.key === 'Content-Type');
    if (contentType && matchedValue) { //存在contentType并且默认header值也有
      matchedValue.value = contentType
    } else if (contentType && !matchedValue) { //存在contentType但是默认header没有
      const params = apidocGenerateProperty();
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
    assign(apidoc.value.item.requestBody.binary, payload)
  }
  /*
    |--------------------------------------------------------------------------
    | response参数
    |--------------------------------------------------------------------------
    */
  //改变某个response的title参数
  const changeResponseParamsTitleByIndex = (payload: { index: number, title: string }): void => {
    const { index, title } = payload
    apidoc.value.item.responseParams[index].title = title;
  }
  //改变某个response的statusCode值
  const changeResponseParamsCodeByIndex = (payload: { index: number, code: number }): void => {
    const { index, code } = payload
    apidoc.value.item.responseParams[index].statusCode = code;
  }
  //改变某个response的dataType值
  const changeResponseParamsDataTypeByIndex = (payload: { index: number, type: HttpNodeContentType }): void => {
    const { index, type } = payload
    apidoc.value.item.responseParams[index].value.dataType = type;
  }
  //改变某个response文本value值
  const changeResponseParamsTextValueByIndex = (payload: { index: number, value: string }): void => {
    const { index, value } = payload
    apidoc.value.item.responseParams[index].value.text = value;
  }
  //根据index值改变response
  const changeResponseByIndex = (payload: { index: number, value: string }): void => {
    const { index, value } = payload
    apidoc.value.item.responseParams[index].value.strJson = value;
  }
  //根据index值改变response的json数据
  const changeResponseStrJsonByIndex = (payload: { index: number, value: string }): void => {
    const { index, value } = payload
    apidoc.value.item.responseParams[index].value.strJson = value;
  }
  //根据index值改变mock值
  const changeResponseMockByIndex = (index: number): void => {
    apidoc.value.item.responseParams.forEach(v => {
      v.isMock = false;
    })
    apidoc.value.item.responseParams[index].isMock = true;
  }
  //新增一个response
  const addResponseParam = (): void => {
    apidoc.value.item.responseParams.push({
      _id: uuid(),
      title: '返回参数名称',
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
      isMock: false,
    })
  }
  //删除一个response
  const deleteResponseByIndex = (index: number): void => {
    apidoc.value.item.responseParams.splice(index, 1);
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
    const params3 = apidocGenerateProperty();
    params3.key = 'Host';
    params3.description = '<主机信息>';
    params3._disableKey = true;
    params3._disableKeyTip = '该请求头无法修改，也无法取消发送'
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
    const params4 = apidocGenerateProperty();
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
    const params5 = apidocGenerateProperty();
    params5.key = 'Connection';
    params5._valuePlaceholder = '<默认为：keep-alive>';
    params5.description = '<当前的事务完成后，是否会关闭网络连接>';
    params5._disableKey = true;
    params3._disableValue = true;
    params5._disableDescription = true;
    params5._disableDescription = true;
    params5._disableKeyTip = ''
    params5._disableAdd = true;
    params5._disableDelete = true;
    params5.disabled = true;
    defaultHeaders.value.push(params5);
    //=========================================================================//
    const params = apidocGenerateProperty();
    params.key = 'Content-Length';
    params._valuePlaceholder = '<发送请求时候自动计算,尽量不要手动填写>';
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
    const params2 = apidocGenerateProperty();
    params2.key = 'User-Agent';
    params2._valuePlaceholder = config.requestConfig.userAgent;
    params2.description = '<用户代理软件信息>';
    params2._disableKey = true;
    params2._disableKeyTip = ''
    params2._disableDescription = true;
    params2._disableAdd = true;
    params2._disableDelete = true;
    defaultHeaders.value.push(params2);
    //=========================================================================//
    const params7 = apidocGenerateProperty();
    params7.key = 'Accept';
    params7._valuePlaceholder = '*/*';
    params7.description = '<工具支持解析所有类型返回>';
    params7._disableKey = true;
    params7._disableDescription = true;
    params7._disableKeyTip = ''
    params7._disableAdd = true;
    params7._disableDelete = true;
    defaultHeaders.value.push(params7);
    //=========================================================================//
    if (contentType) {
      const params6 = apidocGenerateProperty();
      params6.key = 'Content-Type';
      params6.value = contentType;
      params6.description = '资源的原始媒体类型';
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
  //重新赋值apidoc数据
  const changeApidoc = (payload: HttpNode): void => {
    // queryParams如果没有数据则默认添加一条空数据
    if (payload.item.queryParams.length === 0) {
      payload.item.queryParams.push(apidocGenerateProperty());
    }
    //formData如果没有数据则默认添加一条空数据
    if (payload.item.requestBody.formdata.length === 0) {
      payload.item.requestBody.formdata.push(apidocGenerateProperty());
    }
    //urlencoded如果没有数据则默认添加一条空数据
    if (payload.item.requestBody.urlencoded.length === 0) {
      payload.item.requestBody.urlencoded.push(apidocGenerateProperty());
    }
    //headers如果没有数据则默认添加一条空数据
    if (payload.item.headers.length === 0) {
      payload.item.headers.push(apidocGenerateProperty());
    }
    initDefaultHeaders(payload.item.contentType)
    //若全部返回数据isMock都为false，则取第一条数据为mock数据
    // if (payload.item.responseParams.every(v => !v.isMock)) {
    //   payload.item.responseParams[0].isMock = true;
    // }
    if (payload.item.headers.length === 0) {
      payload.item.headers.push(apidocGenerateProperty());
    }
    if (payload.mockInfo == null) {
      payload.mockInfo = apidocGenerateMockInfo();
    }
    if (!payload.mockInfo.responseHeaders) {
      payload.mockInfo.responseHeaders = []
    }
    if (payload.mockInfo.responseHeaders?.length === 0) {
      payload.mockInfo.responseHeaders.push(apidocGenerateProperty());
    }
    //如果prefix为空则默认为mockserver
    // if (!payload.item.url.prefix && !payload.item.url.path.startsWith("http")) {
    //     payload.item.url.prefix = `http://${config.renderConfig.mock.ip}:${store.state["apidoc/mock"].mockServerPort}`
    // }
    apidoc.value = payload;
  }
  //改变apidoc原始缓存值
  const changeOriginApidoc = (): void => {
    originApidoc.value = cloneDeep(apidoc.value);
  }
  //改变apidoc数据加载状态
  const changeApidocLoading = (state: boolean): void => {
    loading.value = state;
  }
  //保存apidoc时候更新loading
  const changeApidocSaveLoading = (loading: boolean): void => {
    saveLoading.value = loading;
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
  const changePropertyValue = <K extends keyof ApidocProperty>(payload: EditApidocPropertyPayload<K>): void => {
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
    apidoc.value.preRequest.raw = preRequest;
  }
  const changeAfterRequest = (afterRequest: string): void => {
    apidoc.value.afterRequest.raw = afterRequest;
  }
  /*
  |--------------------------------------------------------------------------
  | 接口调用
  |--------------------------------------------------------------------------
  */
  //获取项目基本信息
  const getApidocDetail = async (payload: { id: string, projectId: string }): Promise<void> => {
    const { deleteTabByIds } = useApidocTas();

    if (__STANDALONE__) {
      const doc = await standaloneCache.getDocById(payload.id) as HttpNode;
      if (!doc) {
        ElMessageBox.confirm('当前接口不存在，可能已经被删除!', '提示', {
          confirmButtonText: '关闭接口',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          deleteTabByIds({
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
      changeApidoc(doc);
      changeOriginApidoc()
      return
    }


    if (cancel.length > 0) {
      cancel.forEach((c) => {
        c('取消请求');
      })
    }
    return new Promise((resolve, reject) => {
      changeApidocLoading(true);
      changeApidocLoading(true)
      const params = {
        projectId: payload.projectId,
        _id: payload.id,
      }
      axiosInstance.get<Response<HttpNode>, Response<HttpNode>>('/api/project/doc_detail', {
        params,
        cancelToken: new axios.CancelToken((c) => {
          cancel.push(c);
        }),
      }).then((res) => {
        if (res.data === null) { //接口不存在提示用户删除接口
          ElMessageBox.confirm('当前接口不存在，可能已经被删除!', '提示', {
            confirmButtonText: '关闭接口',
            cancelButtonText: '取消',
            type: 'warning',
          }).then(() => {
            deleteTabByIds({
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
        changeApidoc(res.data);
        changeOriginApidoc()
        const cachedServer = httpNodeCache.getPreviousServer(payload.projectId);
        const { path } = apidoc.value.item.url
        if (cachedServer && !path.startsWith('http') && !path.startsWith('https')) {
          changeApidocPrefix(cachedServer)
        }
        resolve()
      }).catch((err) => {
        console.error(err);
        reject(err);
      }).finally(() => {
        changeApidocLoading(false)
      })
    });
  }
  //保存接口
  const saveApidoc = (): Promise<void> => {
    const { tabs } = storeToRefs(useApidocTas());
    const { changeTabInfoById } = useApidocTas();
    const { changeHttpBannerInfoById } = useApidocBanner()
    return new Promise(async (resolve, reject) => {
      //todo
      // const projectId = router.currentRoute.value.query.id as string || shareRouter.currentRoute.value.query.id as string;
      const projectId = router.currentRoute.value.query.id as string;
      const currentTabs = tabs.value[projectId];
      const currentSelectTab = currentTabs?.find((tab) => tab.selected) || null;
      if (!currentSelectTab) {
        console.warn('缺少tab信息');
        return;
      }
      changeApidocSaveLoading(true);
      const apidocDetail = cloneDeep(apidoc.value);
      //todo
      // context.dispatch('saveMindParams');
      //删除_error字段
      apidocDetail.item.requestBody.formdata.forEach(v => {
        delete v._error;
      })
      const params = {
        _id: currentSelectTab._id,
        projectId,
        info: apidocDetail.info,
        item: apidocDetail.item,
        preRequest: apidocDetail.preRequest,
        afterRequest: apidocDetail.afterRequest,
        mockInfo: apidocDetail.mockInfo,
      };
      if (__STANDALONE__) {
        apidocDetail.updatedAt = new Date().toISOString();
        await standaloneCache.updateDoc(apidocDetail);
        //改变tab请求方法
        changeTabInfoById({
          id: currentSelectTab._id,
          field: 'head',
          value: {
            icon: params.item.method,
            color: '',
          },
        })
        //改变banner请求方法
        changeHttpBannerInfoById({
          id: currentSelectTab._id,
          field: 'method',
          value: params.item.method,
        })
        //改变origindoc的值
        changeOriginApidoc();
        //改变tab未保存小圆点
        changeTabInfoById({
          id: currentSelectTab._id,
          field: 'saved',
          value: true,
        })
        // 添加0.2秒的saveLoading效果
        setTimeout(() => {
          changeApidocSaveLoading(false);
        }, 100);
        return
      }

      axiosInstance.post('/api/project/fill_doc', params).then(() => {
        //改变tab请求方法
        changeTabInfoById({
          id: currentSelectTab._id,
          field: 'head',
          value: {
            icon: params.item.method,
            color: '',
          },
        })

        //改变banner请求方法
        changeHttpBannerInfoById({
          id: currentSelectTab._id,
          field: 'method',
          value: params.item.method,
        })
        //改变origindoc的值
        changeOriginApidoc();
        //改变tab未保存小圆点
        changeTabInfoById({
          id: currentSelectTab._id,
          field: 'saved',
          value: true,
        })
        //todo 新增一个mock映射
        // store.commit('apidoc/mock/addMockUrl', {
        //   id: currentSelectTab._id,
        //   projectId,
        //   url: apidocDetail.item.url.path,
        //   method: apidocDetail.item.method,
        // })
        resolve();
      }).catch((err) => {
        //改变tab未保存小圆点
        changeTabInfoById({
          id: currentSelectTab._id,
          field: 'saved',
          value: false,
        })
        console.error(err);
        reject(err);
      }).finally(() => {
        changeApidocSaveLoading(false)
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
        event.on('tabs/saveTabSuccess', () => {
          resolve('save');
        })
        event.on('tabs/cancelSaveTab', () => {
          resolve('cancel');
        })
      } catch (error) {
        reject(error)
      }
    })
  }
  /*
    |--------------------------------------------------------------------------
    | mock相关
    |--------------------------------------------------------------------------
    |
  */
  //改变mock地址
  const changeMockPath = (path: string): void => {
    apidoc.value.mockInfo.path = path;
  }
  //改变http状态码
  const changeMockHttpStatusCode = (code: number): void => {
    apidoc.value.mockInfo.httpStatusCode = code;
  }
  //改变返回延时
  const changeMockResponseDelay = (delay: number): void => {
    apidoc.value.mockInfo.responseDelay = delay;
  }
  //更改返回数据类型
  const changeMockResponseType = (responseType: HttpNode['mockInfo']['responseType']): void => {
    apidoc.value.mockInfo.responseType = responseType;
  }
  //改变json数据
  const changeMockJsonValue = (jsonData: string): void => {
    apidoc.value.mockInfo.json = jsonData;
  }
  //改变图片类型
  const changeMockImageType = (type: HttpNode['mockInfo']['image']['type']): void => {
    apidoc.value.mockInfo.image.type = type;
  }
  //改变图片宽度
  const changeMockImageWidth = (width: number): void => {
    apidoc.value.mockInfo.image.width = width;
  }
  //改变图片高度
  const changeMockImageHeight = (height: number): void => {
    apidoc.value.mockInfo.image.height = height;
  }
  //改变图片size
  const changeMockImageSize = (size: number): void => {
    apidoc.value.mockInfo.image.size = size;
  }
  //改变文字颜色
  const changeMockImageColor = (color: string): void => {
    apidoc.value.mockInfo.image.color = color;
  }
  //改变图片背景颜色
  const changeMockImageBackgroundColor = (backgroundColor: string): void => {
    apidoc.value.mockInfo.image.backgroundColor = backgroundColor;
  }
  //改变图片背景颜色
  const changeMockImageFontSize = (fontSize: number): void => {
    apidoc.value.mockInfo.image.fontSize = fontSize;
  }
  //改变返回文件类型
  const changeMockFileType = (type: HttpNode['mockInfo']['file']['type']): void => {
    apidoc.value.mockInfo.file.type = type;
  }
  //改变返回text类型数据
  const changeMockTextValue = (text: string): void => {
    apidoc.value.mockInfo.text = text;
  }
  //改变自定义返回脚本数据
  const changeCustomResponseScript = (text: string): void => {
    apidoc.value.mockInfo.customResponseScript = text;
  }
  //改变自定义文件数据
  const changeCustomFile = (filePath: string): void => {
    apidoc.value.mockInfo.file.filePath = filePath;
  }
  return {
    apidoc,
    originApidoc,
    loading,
    defaultHeaders,
    saveLoading,
    responseBodyLoading,
    saveDocDialogVisible,
    savedDocId,
    changeResponseBodyLoading,
    getApidocDetail,
    changeApidocSaveLoading,
    addProperty,
    deleteProperty,
    changeApidoc,
    changeOriginApidoc,
    changeApidocLoading,
    changeSaveDocDialogVisible,
    changeSavedDocId,
    changePropertyValue,
    changePathParams,
    unshiftQueryParams,
    changeBodyMode,
    changeBodyRawType,
    changeApidocPrefix,
    changeBodyRawValue,
    changeContentType,
    changeApidocUrl,
    changeApidocMethod,
    changeApidocName,
    changeApidocId,
    changeDescription,
    changeRawJson,
    changeResponseParamsTitleByIndex,
    changeResponseParamsCodeByIndex,
    changeResponseParamsDataTypeByIndex,
    changeResponseParamsTextValueByIndex,
    changeResponseByIndex,
    changeResponseStrJsonByIndex,
    changeResponseMockByIndex,
    addResponseParam,
    deleteResponseByIndex,
    saveApidoc,
    openSaveDocDialog,
    changePreRequest,
    changeAfterRequest,
    changeMockPath,
    changeMockHttpStatusCode,
    changeMockResponseDelay,
    changeMockResponseType,
    changeMockJsonValue,
    changeMockImageType,
    changeMockImageWidth,
    changeMockImageHeight,
    changeMockImageSize,
    changeMockImageColor,
    changeMockImageBackgroundColor,
    changeMockImageFontSize,
    changeMockFileType,
    changeMockTextValue,
    changeCustomResponseScript,
    changeCustomFile,
    changeFormDataErrorInfoById,
    handleChangeBinaryInfo
  }
})