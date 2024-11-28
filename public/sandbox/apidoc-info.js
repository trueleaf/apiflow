
/*
|--------------------------------------------------------------------------
| apidoc属性与方法
|--------------------------------------------------------------------------
| 属性参考： src/@types/global.d.ts/ApidocDetail
*/

const apidocInfo = {};
Object.setPrototypeOf(apidocInfo, {
    /**
     * 获取url信息
     */
    getUrlInfo() {
        const { url, queryParams, paths, } = apidocInfo.item;
        const queryString = getQueryStringFromQueryParams(queryParams);
        const pathMap = getPathParamsMap(paths)
        const validPath = url.path.replace(/\{([^\\}]+)\}/g, ($1, $2) => pathMap[$2] || $2);
        const fullUrl = url.host + validPath + queryString;
        return {
            host: url.host,
            path: url.path,
            url: url.host + validPath,
            fullUrl: replacedUrl ? replacedUrl : fullUrl,
        }
    },
    /**
     * 获取请求方法
     */
    getMethod() {
        return apidocInfo.item.method;
    },
    /**
     * 初始化params参数
     */
    initParams() {
        const arrQueryParams = apidocInfo.item.queryParams.filter(v => v.key.trim() !== "").map(v => ({ key: v.key, value: v.value, type: v.type }));
        const objQueryParams = {};
        
        arrQueryParams.forEach(data => {
            if (data.type === "string") {
                objQueryParams[data.key] = data.value
            }
        })
        Object.assign(queryParams, objQueryParams)
    },
    /**
     * 初始化请求头
     */
    initHeaders() {
        const rawHeaders = apidocInfo.item.headers;
        rawHeaders.forEach((item) => {
            const itemKey = item.key.toLocaleLowerCase();
            if (item.select && itemKey) {
                headers[itemKey] = convertPlaceholder(item.value);
            }
        })
    },
    /**
     * 初始化请求body
     */
    initBody() {
        const { requestBody } = apidocInfo.item;
        const arrFormdata = requestBody.formdata.filter(v => v.key.trim() !== "").map(v => ({ key: v.key, value: v.value, type: v.type }));
        const arrUrlencoded = requestBody.urlencoded.filter(v => v.key.trim() !== "").map(v => ({ key: v.key, value: v.value, type: v.type }));
        const objFormData = {};
        const objUrlencodedData = {};
        arrFormdata.forEach(data => {
            if (data.type === "string") {
                objFormData[data.key] = data.value
            }
        })
        arrUrlencoded.forEach(data => {
            if (data.type === "string") {
                objUrlencodedData[data.key] = data.value
            }
        })
        const convertJsonData = JSON5.parse(requestBody.rawJson || "null");
        if (Array.isArray(convertJsonData)) {
            convertJsonData.forEach(data => {
                arrJsonBody.push(data);
            })
        } else {
            Object.assign(jsonBody, convertJsonData || {});
        }
        Object.assign(formdataBody, objFormData)
        Object.assign(urlencodedBody, objUrlencodedData)
        body.raw = requestBody.raw.data;
    },

    /**
     * 获取原始数据
     */
    getRaw() {
        return apidocInfo.item.requestBody.raw.data
    },
})