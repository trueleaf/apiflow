const listeners = new Set<(stores: string[], external: boolean) => void>()
const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('apiflow-workspace-data')
const pendingStores = new Set<string>()
let publishTimer: ReturnType<typeof setTimeout> | undefined
// 通知当前窗口中的数据订阅者
const dispatchChange = (stores: string[], external: boolean) => {
  listeners.forEach(listener => listener(stores, external))
}
if (channel) {
  channel.onmessage = (event: MessageEvent<unknown>) => {
    if (!Array.isArray(event.data) || !event.data.every(store => typeof store === 'string')) return
    dispatchChange(event.data, true)
  }
}
// 广播已提交的业务数据变更
export const publishWorkspaceChange = (stores: string[]): void => {
  dispatchChange(stores, false)
  stores.forEach(store => pendingStores.add(store))
  if (publishTimer) return
  publishTimer = setTimeout(() => {
    channel?.postMessage([...pendingStores])
    pendingStores.clear()
    publishTimer = undefined
  }, 50)
}
// 订阅业务数据变更
export const onWorkspaceDataChange = (listener: (stores: string[], external: boolean) => void): (() => void) => {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}
// 监听原生事务提交以覆盖所有缓存写入入口
export const observeWorkspaceTransactions = (database: IDBDatabase): void => {
  database.transaction = new Proxy(database.transaction, {
    apply(target, thisArg, args: [string | string[], IDBTransactionMode?, IDBTransactionOptions?]) {
      const transaction = Reflect.apply(target, thisArg, args) as IDBTransaction
      if (transaction.mode === 'readwrite') {
        transaction.addEventListener('complete', () => {
          const stores = Array.from(transaction.objectStoreNames).filter(store => ['projects', 'httpNodeList', 'variables', 'commonHeaders'].includes(store))
          if (stores.length) publishWorkspaceChange(stores)
        }, { once: true })
      }
      return transaction
    },
  })
}
