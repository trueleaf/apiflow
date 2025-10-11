/**
 * 将数组参数转换为json语法树
 */

import { ApidocProperty, ApidocASTInfo } from '@src/types'

//生成语法树基本数据结构
function generateAstInfo(): ApidocASTInfo {
  return {
    id: '',
    indent: 4, //缩进
    line: 0, //行号
    path: { //键
      value: '', //值
      widthQuote: true, //是否存在双引号
    },
    value: '', //值
    valueType: '', //值类型
    colon: '', //冒号
    comma: '', //逗号
    description: '', //备注信息
    required: true, //是否必填
    leftCurlBrace: { //左花括号
      pairId: '', //与之相匹配的另一个括号id
      value: '', //值
    },
    rightCurlBrace: { //右花括号
      pairId: '', //与之相匹配的另一个括号id
      value: '', //值
    },
    leftBracket: { //左中括号
      pairId: '', //与之相匹配的另一个括号id
      value: '', //值
    },
    rightBracket: { //右中括号
      pairId: '', //与之相匹配的另一个括号id
      value: '', //值
    },
  };
}

export const astJson = (data: ApidocProperty[], indent = 4): ApidocASTInfo[] => {
  if (!Array.isArray(data)) {
    return [];
  }
  const result: ApidocASTInfo[] = [];
  const foo = (arrayData: ApidocProperty[], level: number, _: number, parent: null | ApidocProperty) => {
    const parentIsArray = (parent && parent.type === 'array');
    for (let i = 0; i < arrayData.length; i += 1) {
      const item = arrayData[i];
      const itemValue = item.value;
      const itemType = item.type;
      const hasItemValue = (itemType === 'string' && item.value != null) || item.value; //字符串可以为空""
      const itemPath = item.key;
      const isSimpleType = ((itemType === 'string') || (itemType === 'boolean') || (itemType === 'number') || (itemType === 'file'));
      const astInfo = generateAstInfo();
      astInfo.id = item._id;
      if (isSimpleType && !itemValue && !itemPath) {
        // eslint-disable-next-line no-continue
        continue;
      }
      astInfo.description = item.description;
      astInfo.required = item.required;
      if (isSimpleType) { //简单类型数据 x: 1
        astInfo.indent = indent * level;
        astInfo.path.value = itemPath;
        astInfo.colon = parentIsArray ? '' : ':';
        // astInfo.value = itemType === "string" ? `"${itemValue}"` : itemValue;
        if (hasItemValue && itemType === 'string') {
          astInfo.value = `"${itemValue}"`;
        } else if (hasItemValue && itemType !== 'string') {
          astInfo.value = itemValue;
        } else {
          astInfo.value = item.type.replace(/./, ($1) => $1.toUpperCase())
        }
        astInfo.valueType = itemType;
        astInfo.comma = ',';
        result.push(astInfo);
        // wordNum += 1;
      }
      if (parentIsArray) {
        break;
      }
    }
  }
  foo(data, 0, 1, null);
  result.forEach((astItem, index) => {
    astItem.line = index + 1;
  });
  return result;
}
