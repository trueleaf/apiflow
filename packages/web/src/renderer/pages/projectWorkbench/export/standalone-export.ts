import type { StandaloneExportHtmlParams } from '@src/types/standalone'
import { Packer } from 'docx'
import { buildStandaloneWordDocument } from '@src/shared/export/standalone-word'

// 构建离线导出HTML内容
export const buildStandaloneShareHtml = async (params: StandaloneExportHtmlParams): Promise<string> => {
  const baseUrl = import.meta.env.BASE_URL || '/'
  const shareUrl = new URL(`${baseUrl.replace(/\/?$/, '/')}share.html`, window.location.origin)
  const response = await fetch(shareUrl.toString(), { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Fetch share.html failed: ${response.status}`)
  }
  let htmlContent = await response.text()
  htmlContent = htmlContent.replace(
    /<title>[^<]*<\/title>/,
    `<title>${params.projectInfo.projectName}</title>`
  )
  let strParams = JSON.stringify(params)
  strParams = strParams.replace(/<\/script>/gi, '\\\\u003c/script>')
  const injected = htmlContent.replace(
    /window\s*\.\s*SHARE_DATA\s*=\s*null\s*;?/g,
    `window.SHARE_DATA = ${strParams}`
  )
  if (injected === htmlContent) {
    throw new Error('share.html 注入点未匹配')
  }
  return injected
}
// 构建离线导出Word Blob
export const buildStandaloneWordBlob = async (params: StandaloneExportHtmlParams): Promise<Blob> => {
  const doc = buildStandaloneWordDocument(params)
  return await Packer.toBlob(doc)
}

