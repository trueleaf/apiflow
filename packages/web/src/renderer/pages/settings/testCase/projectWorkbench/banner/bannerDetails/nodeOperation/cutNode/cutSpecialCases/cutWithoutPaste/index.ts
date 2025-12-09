import { type ModelNode } from '../../../../../../../types'

const node: ModelNode = {
  modelName: "cutWithoutPaste",
  description: "剪切后未粘贴操作",
  children: [],
  atomicFunc: [
  {
    "purpose": "剪切节点后,在其它位置进行复制操作,原剪切内容被覆盖,无法粘贴之前剪切的内容",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少2个httpNode节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "剪切第一个httpNode节点(添加cut-node类名)"
      },
      {
        "id": "2",
        "name": "复制第二个httpNode节点"
      },
      {
        "id": "3",
        "name": "尝试粘贴剪贴板内容"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴的是第二个httpNode(复制的内容),不是第一个httpNode(剪切的内容)"
      },
      {
        "id": "2",
        "name": "cutNodes数组被清空(Banner.vue:537)"
      },
      {
        "id": "3",
        "name": "第一个httpNode的cut-node类名消失"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleCopyNode方法清空cutNodes.value数组(Banner.vue:537)"
      },
      {
        "id": "2",
        "name": "剪贴板内容被复制操作覆盖,type仍为\"apiflow-apidoc-node\"但data更新为复制的节点"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "复制操作会清空cutNodes数组,使剪切状态失效"
      }
    ]
  },
  {
    "purpose": "剪切节点后,关闭项目再打开,剪切板内容保留,可以正常粘贴",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少1个httpNode节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "剪切httpNode节点"
      },
      {
        "id": "2",
        "name": "关闭项目(不刷新浏览器)"
      },
      {
        "id": "3",
        "name": "重新打开项目"
      },
      {
        "id": "4",
        "name": "在banner空白区域粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,剪贴板内容(clipboard API)保留"
      },
      {
        "id": "2",
        "name": "但cutNodes数组为空,粘贴后原节点不会被删除(因为cutNodes被重置)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "navigator.clipboard内容跨会话保留"
      },
      {
        "id": "2",
        "name": "cutNodes为ref数据,组件重新加载后重置为空数组"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "剪贴板内容由浏览器Clipboard API管理,跨会话保留,但cutNodes状态会丢失"
      }
    ]
  },
  {
    "purpose": "剪切folder节点到其自身子节点下,操作被阻止并给出错误提示",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含1个folder节点,该folder内包含至少1个子folder"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "剪切父folder节点"
      },
      {
        "id": "2",
        "name": "展开该folder,右键点击其子folder,尝试粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴操作被阻止,不会执行"
      },
      {
        "id": "2",
        "name": "系统显示错误提示:\"不能将folder移动到其自身子节点下\"或类似提示"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pasteNodes方法中应包含循环依赖检测逻辑"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "该功能需要在pasteNodes方法中添加父子关系检测,防止循环嵌套"
      }
    ]
  }
],
}

export default node
