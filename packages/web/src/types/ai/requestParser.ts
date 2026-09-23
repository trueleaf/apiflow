import type { HttpNode } from '../httpNode/httpNode'

export type RequestParseMode = 'request' | 'json'
export type RequestSnapshot = Pick<HttpNode['item'], 'method' | 'url' | 'queryParams' | 'paths' | 'headers' | 'requestBody' | 'contentType'>
