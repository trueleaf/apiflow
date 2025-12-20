import { nanoid } from 'nanoid/non-secure'
import type { HttpNode, ApidocProperty, HttpNodeRequestMethod } from '@src/types'
//生成空的参数行，方便用户输入
const createEmptyProperty = (): ApidocProperty<'string'> => ({
  _id: nanoid(),
  key: '',
  value: '',
  type: 'string',
  required: true,
  description: '',
  select: true
})
//检测是否为 curl 命令
export const isCurlCommand = (text: string): boolean => {
  const trimmedText = text.trim()
  return /^curl\s+/i.test(trimmedText)
}
//解析 curl 命令中的参数
const parseCurlArgs = (curlString: string): { args: string[], url: string } => {
  const cleaned = curlString.trim().replace(/^curl\s+/i, '').replace(/\\\n\s*/g, ' ')
  const tokens: string[] = []
  let current = ''
  let inQuote: string | null = null
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i]
    if ((char === '"' || char === "'") && (i === 0 || cleaned[i - 1] !== '\\')) {
      if (inQuote === char) {
        inQuote = null
      } else if (!inQuote) {
        inQuote = char
      } else {
        current += char
      }
    } else if (char === ' ' && !inQuote) {
      if (current) {
        tokens.push(current)
        current = ''
      }
    } else {
      current += char
    }
  }
  if (current) tokens.push(current)
  let url = ''
  const args: string[] = []
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.startsWith('-')) {
      args.push(token)
      if (i + 1 < tokens.length && !tokens[i + 1].startsWith('-')) {
        args.push(tokens[i + 1])
        i++
      }
    } else if (!url) {
      url = token
    }
  }
  return { args, url }
}
//解析 curl 命令为 HttpNode 部分数据
export const parseCurlToHttpNode = (curlString: string): Partial<HttpNode> | null => {
  try {
    const { args, url: rawUrl } = parseCurlArgs(curlString)
    if (!rawUrl) return null
    let method: HttpNodeRequestMethod = 'GET'
    const headers: ApidocProperty<'string'>[] = []
    let bodyData = ''
    let isFormData = false
    for (let i = 0; i < args.length; i += 2) {
      const flag = args[i]
      const value = args[i + 1] || ''
      if (flag === '-X' || flag === '--request') {
        method = value.toUpperCase() as HttpNodeRequestMethod
      } else if (flag === '-H' || flag === '--header') {
        const colonIndex = value.indexOf(':')
        if (colonIndex > 0) {
          headers.push({
            _id: nanoid(),
            key: value.substring(0, colonIndex).trim(),
            value: value.substring(colonIndex + 1).trim(),
            type: 'string',
            required: true,
            description: '',
            select: true
          })
        }
      } else if (flag === '-d' || flag === '--data' || flag === '--data-raw' || flag === '--data-binary') {
        bodyData = value
      } else if (flag === '-F' || flag === '--form') {
        bodyData = value
        isFormData = true
      }
    }
    const urlParts = rawUrl.split('?')
    const baseUrl = urlParts[0]
    const queryString = urlParts[1] || ''
    const queryParams: ApidocProperty<'string'>[] = []
    if (queryString) {
      const params = new URLSearchParams(queryString)
      params.forEach((value, key) => {
        queryParams.push({
          _id: nanoid(),
          key,
          value,
          type: 'string',
          required: true,
          description: '',
          select: true
        })
      })
    }
    queryParams.push(createEmptyProperty())
    headers.push(createEmptyProperty())
    const httpNodeUpdate: Partial<HttpNode> = {
      item: {
        method,
        url: {
          prefix: '',
          path: baseUrl
        },
        queryParams,
        headers,
        paths: [],
        requestBody: {
          mode: 'none',
          rawJson: '',
          formdata: [],
          urlencoded: [],
          raw: {
            data: '',
            dataType: 'text/plain'
          },
          binary: {
            mode: 'file',
            varValue: '',
            binaryValue: {
              path: '',
              raw: '',
              id: ''
            }
          }
        },
        contentType: '',
        responseParams: []
      }
    }
    if (bodyData && httpNodeUpdate.item) {
      if (isFormData) {
        const formItems: ApidocProperty<'string'>[] = []
        const equalIndex = bodyData.indexOf('=')
        if (equalIndex > 0) {
          formItems.push({
            _id: nanoid(),
            key: bodyData.substring(0, equalIndex),
            value: bodyData.substring(equalIndex + 1),
            type: 'string',
            required: true,
            description: '',
            select: true
          })
        }
        formItems.push(createEmptyProperty())
        httpNodeUpdate.item.requestBody.mode = 'formdata'
        httpNodeUpdate.item.requestBody.formdata = formItems
        httpNodeUpdate.item.contentType = 'multipart/form-data'
      } else {
        try {
          const jsonData = JSON.parse(bodyData)
          httpNodeUpdate.item.requestBody.mode = 'json'
          httpNodeUpdate.item.requestBody.rawJson = JSON.stringify(jsonData, null, 2)
          httpNodeUpdate.item.contentType = 'application/json'
        } catch {
          if (bodyData.includes('=') && bodyData.includes('&')) {
            const params = new URLSearchParams(bodyData)
            const urlencodedItems: ApidocProperty<'string'>[] = []
            params.forEach((value, key) => {
              urlencodedItems.push({
                _id: nanoid(),
                key,
                value,
                type: 'string',
                required: true,
                description: '',
                select: true
              })
            })
            urlencodedItems.push(createEmptyProperty())
            httpNodeUpdate.item.requestBody.mode = 'urlencoded'
            httpNodeUpdate.item.requestBody.urlencoded = urlencodedItems
            httpNodeUpdate.item.contentType = 'application/x-www-form-urlencoded'
          } else {
            httpNodeUpdate.item.requestBody.mode = 'raw'
            httpNodeUpdate.item.requestBody.raw = {
              data: bodyData,
              dataType: 'text/plain'
            }
            httpNodeUpdate.item.contentType = 'text/plain'
          }
        }
      }
    }
    return httpNodeUpdate
  } catch (error) {
    return null
  }
}
