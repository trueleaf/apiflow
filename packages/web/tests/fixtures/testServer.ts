import type { Server } from 'http'
import { startServer, stopServer } from '../server'

let testServer: Server | null = null

export async function startTestServer(port = 3100): Promise<Server> {
  if (testServer) {
    return testServer
  }

  try {
    testServer = await startServer({ port, host: 'localhost' })
    return testServer
  } catch (error) {
    console.error('[Test Server] Failed to start:', error)
    throw error
  }
}

export async function stopTestServer(): Promise<void> {
  if (!testServer) {
    return
  }

  try {
    await stopServer(testServer)
    testServer = null
  } catch (error) {
    console.error('[Test Server] Failed to stop:', error)
    throw error
  }
}

export function getTestServerUrl(port = 3100): string {
  return `http://localhost:${port}`
}

export function isTestServerRunning(): boolean {
  return testServer !== null
}
