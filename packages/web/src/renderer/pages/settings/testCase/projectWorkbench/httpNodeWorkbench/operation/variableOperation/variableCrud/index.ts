import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "variableCrud",
  description: "变量增删改查",
  children: [],
  atomicFunc: [
  {
    "purpose": "新增string类型变量,输入变量名和值后保存成功",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已打开变量管理弹窗"
    ],
    "operationSteps": [
      "1. 点击新增变量按钮",
      "2. 选择变量类型为string",
      "3. 输入变量名:testString",
      "4. 输入变量值:hello world",
      "5. 点击保存按钮",
      "6. 检查变量是否添加到列表"
    ],
    "expectedResults": [
      "新增弹窗打开",
      "可以选择string类型",
      "变量名和值正确输入",
      "保存成功",
      "新增的变量显示在列表中",
      "变量可以被正常使用"
    ],
    "checkpoints": [
      "验证变量添加成功",
      "验证变量名正确",
      "验证变量值正确",
      "验证变量类型正确"
    ],
    "notes": [
      "此测试验证字符串类型变量的创建"
    ]
  },
  {
    "purpose": "新增number类型变量,输入变量名和数字值后保存成功",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已打开变量管理弹窗"
    ],
    "operationSteps": [
      "1. 点击新增变量按钮",
      "2. 选择变量类型为number",
      "3. 输入变量名:testNumber",
      "4. 输入数字值:12345",
      "5. 点击保存按钮",
      "6. 检查变量添加结果"
    ],
    "expectedResults": [
      "新增弹窗打开",
      "可以选择number类型",
      "数字值被正确解析",
      "保存成功",
      "新增的数字变量显示在列表",
      "变量值显示为数字而非字符串"
    ],
    "checkpoints": [
      "验证number类型变量创建",
      "验证数值类型识别"
    ],
    "notes": [
      "此测试验证数字类型变量的创建"
    ]
  },
  {
    "purpose": "新增boolean类型变量,选择true或false后保存成功",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已打开变量管理弹窗"
    ],
    "operationSteps": [
      "1. 点击新增变量按钮",
      "2. 选择变量类型为boolean",
      "3. 输入变量名:testBool",
      "4. 选择值为true",
      "5. 点击保存按钮",
      "6. 再添加一个false值的boolean变量验证"
    ],
    "expectedResults": [
      "新增弹窗打开",
      "可以选择boolean类型",
      "布尔值选择器可用",
      "true和false都能正确保存",
      "保存成功",
      "变量显示在列表中"
    ],
    "checkpoints": [
      "验证boolean类型创建",
      "验证true值保存",
      "验证false值保存"
    ],
    "notes": [
      "此测试验证布尔类型变量的创建"
    ]
  },
  {
    "purpose": "新增file类型变量,选择文件后保存成功",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已打开变量管理弹窗",
      "系统中存在可上传的文件"
    ],
    "operationSteps": [
      "1. 点击新增变量按钮",
      "2. 选择变量类型为file",
      "3. 输入变量名:testFile",
      "4. 点击选择文件",
      "5. 选择一个本地文件",
      "6. 点击保存按钮"
    ],
    "expectedResults": [
      "新增弹窗打开",
      "可以选择file类型",
      "文件选择器可用",
      "文件被正确选择",
      "保存成功",
      "文件变量显示在列表中"
    ],
    "checkpoints": [
      "验证file类型创建",
      "验证文件选择",
      "验证文件信息保存"
    ],
    "notes": [
      "此测试验证文件类型变量的创建"
    ]
  },
  {
    "purpose": "新增any类型变量,输入JavaScript表达式后保存成功",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已打开变量管理弹窗"
    ],
    "operationSteps": [
      "1. 点击新增变量按钮",
      "2. 选择变量类型为any",
      "3. 输入变量名:testAny",
      "4. 输入JavaScript表达式:{name: \"test\", age: 20}",
      "5. 点击保存按钮",
      "6. 检查变量是否保存成功"
    ],
    "expectedResults": [
      "新增弹窗打开",
      "可以选择any类型",
      "JavaScript表达式被输入",
      "表达式被保存",
      "变量显示在列表中",
      "表达式被正确解析和执行"
    ],
    "checkpoints": [
      "验证any类型创建",
      "验证JavaScript执行",
      "验证复杂对象保存"
    ],
    "notes": [
      "此测试验证any类型变量(复杂JavaScript对象)的创建"
    ]
  },
  {
    "purpose": "变量名重复时提示错误,不允许保存",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已打开变量管理弹窗",
      "已在项目中创建变量:testVar"
    ],
    "operationSteps": [
      "1. 点击新增变量按钮",
      "2. 输入与已有变量相同的名称:testVar",
      "3. 输入值",
      "4. 尝试保存",
      "5. 观察错误提示"
    ],
    "expectedResults": [
      "保存时显示错误提示",
      "错误信息明确说明变量名重复",
      "保存被阻止",
      "变量未被添加到列表",
      "弹窗仍保持打开状态"
    ],
    "checkpoints": [
      "验证重复名称检测",
      "验证错误提示",
      "验证保存被阻止"
    ],
    "notes": [
      "此测试验证变量名唯一性验证"
    ]
  },
  {
    "purpose": "修改已存在变量的值,保存后变量值更新",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已打开变量管理弹窗",
      "已在项目中创建变量:testVar=old_value"
    ],
    "operationSteps": [
      "1. 在变量列表中找到testVar变量",
      "2. 点击编辑按钮",
      "3. 修改变量值为:new_value",
      "4. 点击保存按钮",
      "5. 检查变量值是否更新"
    ],
    "expectedResults": [
      "编辑弹窗打开",
      "原始值显示在表单中",
      "值被正确修改",
      "保存成功",
      "列表中的变量值已更新",
      "新值可以被使用"
    ],
    "checkpoints": [
      "验证编辑功能",
      "验证值更新",
      "验证新值生效"
    ],
    "notes": [
      "此测试验证变量的修改功能"
    ]
  },
  {
    "purpose": "删除变量后,变量从列表中移除",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已打开变量管理弹窗",
      "已在项目中创建变量:testVar"
    ],
    "operationSteps": [
      "1. 在变量列表中找到testVar变量",
      "2. 点击删除按钮",
      "3. 在确认对话框中确认删除",
      "4. 检查变量是否被移除",
      "5. 验证变量不能再被使用"
    ],
    "expectedResults": [
      "删除确认对话框显示",
      "确认后变量被删除",
      "变量从列表中移除",
      "保存成功",
      "删除后变量不可用",
      "使用该变量会提示未定义"
    ],
    "checkpoints": [
      "验证删除功能",
      "验证列表更新",
      "验证变量不可用"
    ],
    "notes": [
      "此测试验证变量的删除功能"
    ]
  }
],
}

export default node
