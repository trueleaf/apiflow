export type RuntimeNetworkMode = 'local' | 'remote'

export type RuntimeState = {
  networkMode: RuntimeNetworkMode
}

export const RUNTIME_STORAGE_KEY = 'runtime/networkMode'

