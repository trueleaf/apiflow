//遍历树结构数据
function forEachForest(forest, fn, options = { }) {
    if (!Array.isArray(forest)) {
        console.error("第一个参数必须为数组类型");
        return
    }
    const childrenKey = options?.childrenKey || "children";
    const foo = (forestData, hook) => {
        for (let i = 0; i < forestData.length; i += 1) {
            const currentData = forestData[i];
            hook(currentData);
            if (!currentData[childrenKey]) {
                continue;
            }
            if (!Array.isArray(currentData[childrenKey])) {
                continue;
            }
            if (currentData[childrenKey].length > 0) {
                foo(currentData[childrenKey], hook);
            }
        }
    };
    foo(forest, fn);
}
// 转换queryString
function getQueryStringFromQueryParams(queryParams) {
    let queryString = "";
    queryParams.forEach((v) => {
        if (v.key && v.select) {
            queryString += `${v.key}=${convertPlaceholder(v.value)}&`
        }
    })
    queryString = queryString.replace(/&$/, "");
    if (queryString) {
        queryString = `?${queryString}`;
    }
    return queryString;
}
//转换path路径参数
function getPathParamsMap(pathParams) {
    const pathMap = {};
    pathParams.forEach((v) => {
        if (v.key) {
            pathMap[v.key] = convertPlaceholder(v.value);
        }
    })
    return pathMap;
}
//将{{ 参数 }}转换为真实值
function convertPlaceholder(value) {
    const matchdVariable = value.toString().match(/\{\{\s*([^} ]+)\s*\}\}/);
    const allVariables = Object.assign({}, JSON.parse(JSON.stringify(collectionVariables)), JSON.parse(JSON.stringify(tempVariables)));
    let convertValue = value;
    if (matchdVariable) {
        const realValue = allVariables[matchdVariable[1]];
        if (realValue != null) {
            convertValue = realValue
        }
    }
    return convertValue;
}
// 将数组参数转换为json对象
function convertToJson(properties, options = {}) {
    const { result, parent, jumpChecked, valueHook } = options;
    for (let i = 0; i < properties.length; i += 1) {
        const property = properties[i];
        const { type, value, key, children } = property;
        const isParentArray = (parent && parent.type === "array");
        const isComplex = (type === "object" || type === "array" || type === "file");
        const keyValIsEmpty = key === "" && value === ""
        if (!isComplex && jumpChecked && !property.select) { //过滤掉_select属性为false的值
            continue;
        }  else if (isComplex && jumpChecked && !property.select) { //复杂类型，子元素全部为空
            let halfChecked = false;
            forEachForest(property.children, (p) => {
                if (p.select) {
                    halfChecked = true;
                }
            })
            if (!halfChecked) {
                continue;
            }
        }
        if (!isParentArray && !isComplex && (key === "")) { //父元素不为数组并且也不是复杂数据类型
            continue
        }
        if (!isParentArray && isComplex && (key === "")) { //对象下面对象必须具备key
            continue
        }
        if (isParentArray && keyValIsEmpty && type === "number") { //数组下面为数字
            continue
        }
        if (isParentArray && keyValIsEmpty && type === "boolean") { //数组下面为布尔值
            continue
        }
        const convertValue = valueHook ? valueHook(property) : convertPlaceholder(value);
        if (isParentArray) { //父元素为数组
            if (type === "boolean") {
                result.push(convertValue === "true");
            } else if (type === "string") {
                result.push(convertValue);
            } else if (type === "number") {
                const isNumber = !Number.isNaN(Number(convertValue));
                if (isNumber) {
                    result.push(Number(convertValue));
                } else {
                    console.warn("参数无法被转换为数字类型，默认为0");
                    result.push(0);
                }
            } else if (type === "file") {
                console.warn("不允许为file类型");
                result.push(convertValue);
            } else if (type === "object") {
                const pushData = {};
                result.push(pushData);
                convertToJson(children, {
                    result: pushData,
                    valueHook,
                    jumpChecked,
                    parent: property
                })
            } else if (type === "array") {
                const pushData = [];
                result.push(pushData);
                convertToJson(children, {
                    result: pushData,
                    valueHook,
                    jumpChecked,
                    parent: property
                })
            }
        } else { //父元素为对象
            if (type === "boolean") {
                result[key] = convertValue === "true";
            } else if (type === "string") {
                result[key] = convertValue;
            } else if (type === "number") {
                const isNumber = !Number.isNaN(Number(convertValue));
                if (isNumber) {
                    result[key] = Number(convertValue);
                } else {
                    console.warn("参数无法被转换为数字类型，默认为0");
                    result[key] = 0;
                }
            } else if (type === "file") {
                console.warn("不允许为file类型");
                result[key] = convertValue;
            } else if (type === "object") {
                result[key] = {};
                convertToJson(children, {
                    result: result[key],
                    valueHook,
                    jumpChecked,
                    parent: property
                })
            } else if (type === "array") {
                result[key] = [];
                convertToJson(children, {
                    result: result[key],
                    valueHook,
                    jumpChecked,
                    parent: property
                })
            }
        }
    }
}
function apidocConvertParamsToJsonData(properties, jumpChecked, valueHook) {
    if (properties.length === 0) {
        if (process.env.NODE_ENV === "development") {
            console.warn("无任何参数值")
        }
        return null;
    }
    const rootType = properties[0].type;
    const rootValue = properties[0].value;

    if (rootType === "boolean") {
        return rootValue === "true";
    }
    if (rootType === "string") {
        return rootValue;
    }
    if (rootType === "number") {
        const isNumber = !Number.isNaN(Number(rootValue));
        if (isNumber) {
            return Number(rootValue);
        }
        console.warn("参数无法被转换为数字类型，默认为0");
        return 0;
    }
    if (rootType === "file") {
        console.warn("根元素不允许为file");
        return null;
    }
    if (rootType === "object") {
        const resultJson = {};
        const data = properties[0].children;
        if (data.every((p) => !p.key)) {
            return null;
        }
        convertToJson(properties[0].children, {
            result: resultJson,
            valueHook,
            jumpChecked,
            parent: properties[0]
        });
        return resultJson
    }
    if (rootType === "array") {
        const resultJson = [];
        const data = properties[0].children;
        if (data.every((p) => ((p.type === "number" && p.value === "") || (p.type === "boolean" && p.value === "")))) {
            return null;
        }
        convertToJson(properties[0].children, {
            result: resultJson,
            valueHook,
            jumpChecked,
            parent: properties[0]
        });
        return resultJson
    }
    return {};
}