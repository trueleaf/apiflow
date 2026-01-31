import * as docx from 'docx'
import type { Paragraph as ParagraphType, Table as TableType } from 'docx'
import type { StandaloneExportHtmlParams } from '@src/types/standalone'
import type { HttpNode, FolderNode } from '@src/types/httpNode/httpNode'
import type { WebSocketNode } from '@src/types/websocketNode'
import type { HttpMockNode, WebSocketMockNode } from '@src/types/mockNode'
import type { ApidocProperty } from '@src/types/httpNode/types'

type ExportNode = HttpNode | WebSocketNode | HttpMockNode | WebSocketMockNode | FolderNode
type TreeNode<T> = T & { children: TreeNode<T>[] }
type DocxComponents = {
  Document: typeof docx.Document;
  TextRun: typeof docx.TextRun;
  ShadingType: typeof docx.ShadingType;
  TabStopType: typeof docx.TabStopType;
  Table: typeof docx.Table;
  Paragraph: typeof docx.Paragraph;
  TableRow: typeof docx.TableRow;
  TableCell: typeof docx.TableCell;
  VerticalAlign: typeof docx.VerticalAlign;
  WidthType: typeof docx.WidthType;
  HeadingLevel: typeof docx.HeadingLevel;
  AlignmentType: typeof docx.AlignmentType;
}

// 构建离线导出Word文档
export const buildStandaloneWordDocument = (exportHtmlParams: StandaloneExportHtmlParams): docx.Document => {
  const { projectInfo, nodes } = exportHtmlParams
  const {
    Document,
    TextRun,
    ShadingType,
    TabStopType,
    Table,
    Paragraph,
    TableRow,
    TableCell,
    VerticalAlign,
    WidthType,
    HeadingLevel,
    AlignmentType,
  } = docx
  const document: {
    sections: {
      children: (ParagraphType | TableType)[];
    }[];
  } = {
    sections: [
      {
        children: [
          new Paragraph({
            text: `${projectInfo.projectName}`,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  }
  const components: DocxComponents = {
    Document,
    TextRun,
    ShadingType,
    TabStopType,
    Table,
    Paragraph,
    TableRow,
    TableCell,
    VerticalAlign,
    WidthType,
    HeadingLevel,
    AlignmentType,
  }
  const nestDocs = arrayToTree(nodes as ExportNode[])
  dfsForest(nestDocs, (item, level) => {
    const data = item as unknown as ExportNode
    let content: (ParagraphType | TableType)[] = []
    switch (data.info.type) {
      case 'folder':
        content = generateFolderNodeContent(data as FolderNode, level, components)
        break
      case 'http':
        content = generateHttpNodeContent(data as HttpNode, components)
        break
      case 'websocket':
        content = generateWebSocketNodeContent(data as WebSocketNode, components)
        break
      case 'httpMock':
        content = generateHttpMockNodeContent(data as HttpMockNode, components)
        break
      case 'websocketMock':
        content = generateWebSocketMockNodeContent(data as WebSocketMockNode, components)
        break
      default:
        break
    }
    document.sections[0].children.push(...content)
  })
  return new Document(document)
}

// 将数组转换为树形结构
const arrayToTree = <T extends { _id: string; pid: string }>(list: T[]): TreeNode<T>[] => {
  const map = new Map<string, TreeNode<T>>()
  const roots: TreeNode<T>[] = []
  list.forEach((item) => {
    map.set(item._id, { ...item, children: [] } as TreeNode<T>)
  })
  map.forEach((node) => {
    if (node.pid && map.has(node.pid)) {
      map.get(node.pid)!.children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}
// 遍历树形数据
const dfsForest = <T extends { children: T[] }>(forestData: T[], fn: (item: T, level: number) => void): void => {
  if (!Array.isArray(forestData)) {
    throw new Error('第一个参数必须为数组类型')
  }
  const walk = (data: T[], hook: (item: T, level: number) => void, level: number): void => {
    for (let i = 0; i < data.length; i += 1) {
      const currentData = data[i]
      hook(currentData, level)
      if (!Array.isArray(currentData.children)) {
        continue
      }
      if (currentData.children.length > 0) {
        walk(currentData.children, hook, level + 1)
      }
    }
  }
  walk(forestData, fn, 1)
}

// 创建参数表格
const createParamsTable = (params: ApidocProperty[], components: DocxComponents): TableType => {
  const { Table, TableRow, TableCell, Paragraph, VerticalAlign, WidthType } = components
  const paramsRows = params
    .filter((v) => v.key)
    .map((v) => {
      return new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph(v.key)],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph(v.value)],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph(v.required ? "必填" : "非必填")],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph(v.description)],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      })
    })
  return new Table({
    width: {
      size: 9638,
      type: WidthType.DXA,
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            children: [new Paragraph("参数名称")],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph("参数值")],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph("是否必填")],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph("备注")],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
      ...paramsRows,
    ],
  })
}
// 尝试格式化JSON字符串
const formatJsonIfPossible = (str: string): string => {
  if (!str || typeof str !== 'string') {
    return str
  }
  const trimmed = str.trim()
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      const parsed = JSON.parse(trimmed) as unknown
      return JSON.stringify(parsed, null, 2)
    } catch {
      return str
    }
  }
  return str
}
// 创建代码块段落
const createCodeBlock = (code: string, components: DocxComponents): ParagraphType => {
  const { Paragraph, TextRun, ShadingType } = components
  const formattedCode = formatJsonIfPossible(code)
  return new Paragraph({
    shading: {
      type: ShadingType.SOLID,
      color: "f3f3f3",
    },
    children: [
      new TextRun({
        text: formattedCode,
        font: "Consolas",
      }),
    ],
  })
}

// 生成Folder节点内容
const generateFolderNodeContent = (
  data: FolderNode,
  level: number,
  components: DocxComponents
): (ParagraphType | TableType)[] => {
  const { Paragraph, HeadingLevel } = components
  const result: (ParagraphType | TableType)[] = []
  let headingLevel: typeof HeadingLevel.HEADING_1 | typeof HeadingLevel.HEADING_2 = HeadingLevel.HEADING_1
  switch (level) {
    case 1:
      headingLevel = HeadingLevel.HEADING_1
      break
    case 2:
      headingLevel = HeadingLevel.HEADING_2
      break
    default:
      headingLevel = HeadingLevel.HEADING_2
      break
  }
  const title = new Paragraph({
    text: `${data.info.name}`,
    heading: headingLevel,
    spacing: {
      before: 400,
    },
  })
  result.push(title)
  if (data.commonHeaders && Array.isArray(data.commonHeaders) && data.commonHeaders.length > 0) {
    result.push(
      new Paragraph({
        text: "公共请求头",
        spacing: { before: 150, after: 30 },
      })
    )
    result.push(createParamsTable(data.commonHeaders, components))
  }
  return result
}
// 生成HTTP节点内容
const generateHttpNodeContent = (
  data: HttpNode,
  components: DocxComponents
): (ParagraphType | TableType)[] => {
  const { Paragraph, TextRun, HeadingLevel, TabStopType } = components
  const result: (ParagraphType | TableType)[] = []
  const docName = new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [
      new TextRun({
        text: `${data.info.name}`,
        size: 26,
      }),
    ],
    spacing: {
      before: 250,
      after: 30,
    },
  })
  const requestMethod = data.item.method
  const methodText = new TextRun({
    text: `${requestMethod}`,
    color:
      requestMethod === "GET"
        ? "28a745"
        : requestMethod === "POST"
          ? "ffc107"
          : requestMethod === "PUT"
            ? "#ff4400"
            : requestMethod === "DELETE"
              ? "f56c6c"
              : "444444",
  })
  const method = new Paragraph({
    children: [new TextRun({ text: "请求方法：" }), methodText],
  })
  const url = new Paragraph({
    text: `请求地址：${data.item.url.prefix + data.item.url.path}`,
  })
  const contentType = new Paragraph({
    text: `参数类型：${data.item.contentType}`,
  })
  result.push(docName)
  result.push(method)
  result.push(url)
  if (contentType) {
    result.push(contentType)
  }
  result.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "请求参数",
          bold: true,
        }),
      ],
      spacing: {
        before: 250,
      },
    })
  )
  const queryParamsOfDoc = data.item.queryParams.filter((v) => v.key)
  if (queryParamsOfDoc.length > 0) {
    result.push(
      new Paragraph({
        text: "Query参数",
        spacing: { before: 150, after: 30 },
        tabStops: [
          {
            type: TabStopType.CENTER,
            position: 2268,
          },
        ],
      })
    )
    result.push(createParamsTable(queryParamsOfDoc, components))
  }
  const pathParamsOfDoc = data.item.paths.filter((v) => v.key)
  if (pathParamsOfDoc.length > 0) {
    result.push(
      new Paragraph({
        text: "Path参数",
        spacing: { before: 150, after: 30 },
      })
    )
    result.push(createParamsTable(pathParamsOfDoc, components))
  }
  if (data.item.contentType === "application/json") {
    result.push(
      new Paragraph({
        text: "Body参数(JSON)",
        spacing: { before: 150, after: 30 },
      })
    )
    result.push(createCodeBlock((data.item.requestBody as unknown as { rawJson: string }).rawJson, components))
  } else if (data.item.contentType === "multipart/form-data") {
    const formDataParams = (data.item.requestBody as unknown as { formdata: ApidocProperty[] }).formdata.filter((v) => v.key)
    if (formDataParams.length > 0) {
      result.push(
        new Paragraph({
          text: "Body参数(multipart/*)",
          spacing: { before: 150, after: 30 },
        })
      )
      result.push(createParamsTable(formDataParams, components))
    }
  } else if (data.item.contentType === "application/x-www-form-urlencoded") {
    const urlencodedParams = (data.item.requestBody as unknown as { urlencoded: ApidocProperty[] }).urlencoded.filter((v) => v.key)
    if (urlencodedParams.length > 0) {
      result.push(
        new Paragraph({
          text: "Body参数(x-www-form-urlencoded)",
          spacing: { before: 150, after: 30 },
        })
      )
      result.push(createParamsTable(urlencodedParams, components))
    }
  } else if (data.item.contentType) {
    result.push(
      new Paragraph({
        text: `Body参数(${data.item.contentType})`,
        spacing: { before: 150, after: 30 },
      })
    )
    result.push(new Paragraph({ text: (data.item.requestBody as unknown as { raw: { data: string } }).raw.data }))
  }
  const headerParams = data.item.headers.filter((v) => v.key)
  if (headerParams.length > 0) {
    result.push(
      new Paragraph({
        text: "请求头",
        spacing: { before: 150, after: 30 },
      })
    )
    result.push(createParamsTable(headerParams, components))
  }
  result.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "返回参数",
          bold: true,
        }),
      ],
      spacing: {
        before: 250,
      },
    })
  )
  data.item.responseParams.forEach((res) => {
    result.push(
      new Paragraph({
        text: `名称：${res.title}`,
        spacing: {
          before: 200,
        },
      })
    )
    result.push(
      new Paragraph({
        text: `状态码：${(res as unknown as { statusCode: string | number }).statusCode}`,
      })
    )
    result.push(
      new Paragraph({
        text: `参数类型：${(res as unknown as { value: { dataType: string } }).value.dataType}`,
      })
    )
    const value = (res as unknown as { value: { dataType: string; strJson: string; text: string } }).value
    if (value.dataType === "application/json") {
      result.push(createCodeBlock(value.strJson, components))
    } else {
      result.push(new Paragraph({ text: value.text }))
    }
  })
  return result
}
// 生成WebSocket节点内容
const generateWebSocketNodeContent = (
  data: WebSocketNode,
  components: DocxComponents
): (ParagraphType | TableType)[] => {
  const { Paragraph, TextRun, HeadingLevel } = components
  const result: (ParagraphType | TableType)[] = []
  const docName = new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [
      new TextRun({
        text: `${data.info.name}`,
        size: 26,
      }),
    ],
    spacing: {
      before: 250,
      after: 30,
    },
  })
  const protocol = new Paragraph({
    children: [
      new TextRun({ text: "协议类型：" }),
      new TextRun({
        text: data.item.protocol.toUpperCase(),
        color: "0070c0",
      }),
    ],
  })
  const url = new Paragraph({
    text: `连接地址：${data.item.url.prefix + data.item.url.path}`,
  })
  result.push(docName)
  result.push(
    new Paragraph({
      text: "节点类型：WebSocket",
      spacing: {
        after: 200,
      },
    })
  )
  result.push(protocol)
  result.push(url)
  result.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "连接参数",
          bold: true,
        }),
      ],
      spacing: {
        before: 250,
      },
    })
  )
  const queryParams = data.item.queryParams.filter((v) => v.key)
  if (queryParams.length > 0) {
    result.push(
      new Paragraph({
        text: "请求参数",
        spacing: { before: 150, after: 30 },
      })
    )
    result.push(createParamsTable(queryParams, components))
  }
  const headerParams = data.item.headers.filter((v) => v.key)
  if (headerParams.length > 0) {
    result.push(
      new Paragraph({
        text: "请求头",
        spacing: { before: 150, after: 30 },
      })
    )
    result.push(createParamsTable(headerParams, components))
  }
  result.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "连接配置",
          bold: true,
        }),
      ],
      spacing: {
        before: 250,
      },
    })
  )
  result.push(
    new Paragraph({
      text: `自动发送：${data.config.autoSend ? "是" : "否"}`,
    })
  )
  if (data.config.autoSend) {
    result.push(
      new Paragraph({
        text: `发送间隔：${data.config.autoSendInterval}ms`,
      })
    )
    result.push(
      new Paragraph({
        text: `消息类型：${data.config.autoSendMessageType}`,
      })
    )
  }
  result.push(
    new Paragraph({
      text: `自动重连：${data.config.autoReconnect ? "是" : "否"}`,
    })
  )
  return result
}
// 生成HttpMock节点内容
const generateHttpMockNodeContent = (
  data: HttpMockNode,
  components: DocxComponents
): (ParagraphType | TableType)[] => {
  const { Paragraph, TextRun, HeadingLevel } = components
  const result: (ParagraphType | TableType)[] = []
  const docName = new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [
      new TextRun({
        text: `${data.info.name}`,
        size: 26,
      }),
    ],
    spacing: {
      before: 250,
      after: 30,
    },
  })
  result.push(docName)
  result.push(
    new Paragraph({
      text: "节点类型：HTTP Mock",
      spacing: {
        after: 200,
      },
    })
  )
  result.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "匹配条件",
          bold: true,
        }),
      ],
      spacing: {
        before: 250,
      },
    })
  )
  result.push(
    new Paragraph({
      text: `请求方法：${data.requestCondition.method.join(", ")}`,
    })
  )
  result.push(
    new Paragraph({
      text: `匹配路径：${data.requestCondition.url}`,
    })
  )
  result.push(
    new Paragraph({
      text: `监听端口：${data.requestCondition.port}`,
    })
  )
  result.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Mock 配置",
          bold: true,
        }),
      ],
      spacing: {
        before: 250,
      },
    })
  )
  result.push(
    new Paragraph({
      text: `延迟时间：${data.config.delay}ms`,
    })
  )
  result.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "响应配置",
          bold: true,
        }),
      ],
      spacing: {
        before: 250,
      },
    })
  )
  data.response.forEach((res, index) => {
    result.push(
      new Paragraph({
        text: `响应 ${index + 1}：${res.name}${res.isDefault ? " (默认)" : ""}`,
        spacing: {
          before: 200,
        },
      })
    )
    if (res.conditions.scriptCode) {
      result.push(
        new Paragraph({
          text: "条件脚本：",
          spacing: {
            before: 100,
          },
        })
      )
      result.push(createCodeBlock(res.conditions.scriptCode, components))
    }
    result.push(
      new Paragraph({
        text: `状态码：${res.statusCode}`,
      })
    )
    const enabledHeaders = [
      ...res.headers.defaultHeaders.filter((h) => res.headers.enabled && h.key),
      ...res.headers.customHeaders.filter((h) => h.key),
    ]
    if (enabledHeaders.length > 0) {
      result.push(
        new Paragraph({
          text: "响应头：",
        })
      )
      result.push(createParamsTable(enabledHeaders, components))
    }
    result.push(
      new Paragraph({
        text: `数据类型：${res.dataType}`,
      })
    )
    if (res.dataType === "json" && res.jsonConfig.mode === "fixed") {
      result.push(
        new Paragraph({
          text: "响应数据：",
        })
      )
      result.push(createCodeBlock(res.jsonConfig.fixedData, components))
    } else if (res.dataType === "text" && res.textConfig.mode === "fixed") {
      result.push(
        new Paragraph({
          text: "响应数据：",
        })
      )
      result.push(createCodeBlock(res.textConfig.fixedData, components))
    }
  })
  return result
}
// 生成WebSocketMock节点内容
const generateWebSocketMockNodeContent = (
  data: WebSocketMockNode,
  components: DocxComponents
): (ParagraphType | TableType)[] => {
  const { Paragraph, TextRun, HeadingLevel } = components
  const result: (ParagraphType | TableType)[] = []
  const docName = new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [
      new TextRun({
        text: `${data.info.name}`,
        size: 26,
      }),
    ],
    spacing: {
      before: 250,
      after: 30,
    },
  })
  result.push(docName)
  result.push(
    new Paragraph({
      text: "节点类型：WebSocket Mock",
      spacing: {
        after: 200,
      },
    })
  )
  result.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "匹配条件",
          bold: true,
        }),
      ],
      spacing: {
        before: 250,
      },
    })
  )
  result.push(
    new Paragraph({
      text: `匹配路径：${data.requestCondition.path}`,
    })
  )
  result.push(
    new Paragraph({
      text: `监听端口：${data.requestCondition.port}`,
    })
  )
  result.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Mock 配置",
          bold: true,
        }),
      ],
      spacing: {
        before: 250,
      },
    })
  )
  result.push(
    new Paragraph({
      text: `延迟时间：${data.config.delay}ms`,
    })
  )
  result.push(
    new Paragraph({
      text: `回显模式：${data.config.echoMode ? "开启" : "关闭"}`,
    })
  )
  result.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "响应配置",
          bold: true,
        }),
      ],
      spacing: {
        before: 250,
      },
    })
  )
  if (data.response.content) {
    result.push(
      new Paragraph({
        text: "响应内容：",
      })
    )
    result.push(createCodeBlock(data.response.content, components))
  }
  return result
}

