export type EchoResponse = {
  method: string
  url: string
  headers: Record<string, string | string[] | undefined>
  query: Record<string, string | string[]>
  body: unknown
  timestamp: string
}

export type MockUser = {
  id: number
  name: string
  email: string
  age: number
}

export type UploadFileInfo = {
  fieldName: string
  fileName: string
  mimeType: string
  size: number
  encoding: string
}

export type ServerConfig = {
  port: number
  host: string
}
