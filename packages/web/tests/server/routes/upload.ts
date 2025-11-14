import type { Context } from 'koa'
import type Router from '@koa/router'
import multer from '@koa/multer'
import type { UploadFileInfo } from '../types'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
})

export function registerUploadRoutes(router: Router) {
  router.post('/upload', upload.single('file'), (ctx: Context) => {
    const file = ctx.file

    if (!file) {
      ctx.status = 400
      ctx.body = {
        error: 'No file uploaded',
      }
      return
    }

    const fileInfo: UploadFileInfo = {
      fieldName: file.fieldname,
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      encoding: file.encoding,
    }

    ctx.status = 200
    ctx.body = {
      success: true,
      message: 'File uploaded successfully',
      file: fileInfo,
    }
  })

  router.post('/upload/multiple', upload.array('files', 5), (ctx: Context) => {
    const files = ctx.files as Express.Multer.File[]

    if (!files || files.length === 0) {
      ctx.status = 400
      ctx.body = {
        error: 'No files uploaded',
      }
      return
    }

    const filesInfo: UploadFileInfo[] = files.map((file) => ({
      fieldName: file.fieldname,
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      encoding: file.encoding,
    }))

    ctx.status = 200
    ctx.body = {
      success: true,
      message: `${files.length} files uploaded successfully`,
      files: filesInfo,
    }
  })

  router.post('/upload/formdata', upload.fields([{ name: 'file' }, { name: 'avatar' }]), (ctx: Context) => {
    const files = ctx.files as { [fieldname: string]: Express.Multer.File[] }
    const body = ctx.request.body as Record<string, unknown>

    const fileDetails: Record<string, UploadFileInfo[]> = {}

    for (const [fieldName, fieldFiles] of Object.entries(files)) {
      fileDetails[fieldName] = fieldFiles.map((file) => ({
        fieldName: file.fieldname,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        encoding: file.encoding,
      }))
    }

    ctx.status = 200
    ctx.body = {
      success: true,
      message: 'Form data with files uploaded successfully',
      files: fileDetails,
      fields: body,
    }
  })
}
