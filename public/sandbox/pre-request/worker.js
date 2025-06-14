importScripts("../common/json5.js");
importScripts("./global/global.js"); //暴露 GlobalData(全局数据)   
importScripts("./helper/helper.js"); //helper在global后面引入，因为helper会使用到global里面数据
importScripts("./variables/variables.js")
importScripts("./request/headers.js")
importScripts("./request/query.js")
importScripts("./request/path.js")
importScripts("./request/formdata.js")
importScripts("./request/urlencoded.js")
importScripts("./request/json.js")
importScripts("./request/raw.js")
importScripts("./global/import-script.js")
importScripts("./send-request/send-request.js")
importScripts("../state/state.js")

const bodyData = new Proxy({}, {
    get(target, key) {
        if (key === "formdata") {
            return formdata
        } else if (key === "urlencoded") {
            return urlencoded
        } else if (key === "json") {
            return json
        } else if (key === "raw") {
            return raw
        }
    },
    set(obj, prop, value) {
        if (prop === "raw") {
            rawData.value = value;
            return true;
        }
    }
})

const pm = {
    request: {
        headers,
        queryParams,
        pathParams,
        body: bodyData,
    },
    response: {},
    variables,
    sendRequest,
    sendRequestById,
    http,
    sessionState,
    localState,
    remoteState,
};

self.addEventListener("message", async (e) => {
    try {
        //初始化所有请求信息
        if (e.data && e.data.type === "pre-request-init-apidoc") {
            const data = e.data.value;
            // console.log("data", data)
            GlobalData.apidocInfo = data.apidocInfo;
            GlobalData.commonHeaders = data.commonHeaders;
            GlobalData.currentEnv = data.currentEnv;
            GlobalData.projectName = data.projectName;
            GlobalData.packages = data.packages || [];
            GlobalData._id = data._id;
            GlobalData.projectVaribles = data.projectVaribles;
            //=====================================header转换====================================//
            const objHeaders = {};
            data.apidocInfo.item.headers.concat(data.commonHeaders).forEach(v => {
                if (v.key) {
                    objHeaders[v.key] = v.value;
                }
            })
            Object.assign(_headers, objHeaders);
            //=====================================query参数转换====================================//
            const objQueryParams = {};
            data.apidocInfo.item.queryParams.forEach(v => {
                if (v.key) {
                    objQueryParams[v.key] = v.value;
                }
            })
            Object.assign(_queryParams, objQueryParams);
            //=====================================path参数转换====================================//
            const objPathParams = {};
            data.apidocInfo.item.paths.forEach(v => {
                if (v.key) {
                    objPathParams[v.key] = v.value;
                }
            })
            Object.assign(_pathParams, objPathParams);
            //=====================================formdata参数====================================//
            const objFormdataParams = {};
            data.apidocInfo.item.requestBody.formdata.forEach(v => {
                if (v.key) {
                    objFormdataParams[v.key] = v.value;
                }
            })
            Object.assign(_formdata, objFormdataParams);
            //=====================================urlencoded参数====================================//
            const objUrlencodedParams = {};
            data.apidocInfo.item.requestBody.urlencoded.forEach(v => {
                if (v.key) {
                    objUrlencodedParams[v.key] = v.value;
                }
            })
            Object.assign(_urlencoded, objUrlencodedParams);
            //=====================================json参数====================================//
            if (data.apidocInfo.item.requestBody.rawJson) {

                const parsedJson = JSON5.parse(data.apidocInfo.item.requestBody.rawJson);
                if (Array.isArray(parsedJson)) {
                    parsedJson.forEach(data => {
                        json.push(data);
                    })
                } else {
                    Object.assign(json, parsedJson);
                }
                
            }
            //=====================================raw参数====================================//
            rawData.value = data.apidocInfo.item.requestBody.raw.data;
            //=====================================请求url、环境等====================================//
            const { host, path } = data.apidocInfo.item.url;
            pm.request.url = {
                prefix: host,
                path: path,
                url: `${host}${path}`
            }
            pm.request.currentEnv = data.currentEnv;
            pm.request.envs = data.envs;
            //=====================================替换url====================================//
            pm.request.replaceUrl = (url) => {
                self.postMessage({
                    type: "pre-request-change-url",
                    value: url,
                });
            }
            //=====================================全局变量====================================//
            const objVariable = {};
            data.projectVaribles.forEach(v => {
                if (v.name) {
                    objVariable[v.name] = v.value;
                }
            })
            Object.assign(variables, objVariable);
            //=====================================worker状态====================================//
            Object.assign(_sessionState, data.sessionState);
            Object.assign(_localState, data.localState);
            Object.assign(_remoteState, data.remoteState);
        }
        //发送请求
        if (e.data && e.data.type === "pre-request-request") {
            const replacedCode = `(async function(pm) { 
                ${e.data.value}
            })(pm)`.replace(/((?<!https?:)\/\/[^\n]*)|(\/\*(\s|.)*\*\/)/g, ""); //去掉单行和多行注释
            const importScriptList = replacedCode.match(/importScript\([^)]+\)/g);
            const requestUrls = [];
            let remoteScriptStr = ""
            importScriptList?.forEach(scriptStr => {
                const matchedStr = scriptStr.match(/(?<=")[^"]+(?=")/g);
                if (matchedStr) {
                    requestUrls.push(matchedStr[0])
                }
            })
            for (let i = 0; i < requestUrls.length; i++) {
                const result = await importScript(requestUrls[i]);
                remoteScriptStr = remoteScriptStr + result + ";"
            }
            const evalPromise = eval(`
                ${remoteScriptStr}
                ${replacedCode}
            `);
            evalPromise.then(() => {
                if (isSendRequest) {
                    return;
                }
                self.postMessage({
                    type: "pre-request-finish",
                })
            }).catch(error => {
                console.error(error);
                self.postMessage({
                    type: "pre-request-error",
                    value: error,
                });
            })
        }
        //请求成功
        if (e.data && e.data.type === "pre-request-request-success") {
            requestCb(null, e.data.value);
            self.postMessage({
                type: "pre-request-finish",
            })
        }
        //请求失败
        if (e.data && e.data.type === "pre-request-request-error") {
            requestCb(e.data.value, null);
            self.postMessage({
                type: "pre-request-finish",
            })
        }
        //返回参数赋值
        if (e.data && e.data.type === "after-request-init-response") {
            const objCookie = {};
            e.data.value.cookies.forEach(v => {
                objCookie[v.name] = v.value;
            })
            pm.response.cookie = objCookie;
            pm.response.cookies = e.data.value.cookies;
            pm.response.headers = e.data.value.headers;
            pm.response.httpVersion = e.data.value.httpVersion;
            pm.response.ip = e.data.value.ip;
            pm.response.rt = e.data.value.rt;
            pm.response.size = e.data.value.size;
            pm.response.statusCode = e.data.value.statusCode;
            pm.response.statusMessage = e.data.value.statusMessage;
        }
        //after request
        if (e.data && e.data.type === "after-request-request") {
            const replacedCode = `(async function(pm) { 
                ${e.data.value}
            })(pm)`.replace(/((?<!https?:)\/\/[^\n]*)|(\/\*(\s|.)*\*\/)/g, ""); //去掉单行和多行注释
            const importScriptList = replacedCode.match(/importScript\([^)]+\)/g);
            const requestUrls = [];
            let remoteScriptStr = ""
            importScriptList?.forEach(scriptStr => {
                const matchedStr = scriptStr.match(/(?<=")[^"]+(?=")/g);
                if (matchedStr) {
                    requestUrls.push(matchedStr[0])
                }
            })
            for (let i = 0; i < requestUrls.length; i++) {
                const result = await importScript(requestUrls[i]);
                remoteScriptStr = remoteScriptStr + result + ";"
            }
            const evalPromise = eval(`
                ${remoteScriptStr}
                ${replacedCode}
            `);
            evalPromise.then(() => {
                if (isSendRequest) {
                    return;
                }
                self.postMessage({
                    type: "after-request-finish",
                })
            }).catch(error => {
                console.error(error);
                self.postMessage({
                    type: "after-request-error",
                    value: error,
                });
            })
        }
    } catch (error) {
        self.postMessage({
            type: "pre-request-error",
            value: error,
        });
    }
});
