import type {
  IPCMessageArgsType,
  IPCMessageRequestType,
  SendArgsType,
  SendRequestType,
  SendResponseType
} from '@/types/ipc'
import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { ipcMain } from 'electron'

export const ipcEmitter = new EventEmitter()
const callbackMap = new Map<string, string>()

interface hookIPCConfigType {
  log?: 'all' | 'send' | 'message'
  // 需要忽略的黑名单事件
  eventBlacklist?: string[]
  // 拦截事件，可以修改参数
  eventInterceptors?: Record<string, (args: any) => any>
}

export const hookIPC = (window: Electron.CrossProcessExports.BrowserWindow, config: hookIPCConfigType) => {
  window.webContents.send = new Proxy(window.webContents.send, {
    apply(target, thisArg, args: SendArgsType) {
      const [ipcName] = args
      if (!ipcName.includes('IPC')) return Reflect.apply(target, thisArg, args)

      let hookArgs: SendArgsType | undefined

      if (args[1].type === 'request') {
        const [, , [{ cmdName, payload }]] = args as SendRequestType
        if (config.eventBlacklist?.includes(cmdName)) return
        hookArgs = config.eventInterceptors?.[cmdName](args)
        const hookPayload = (hookArgs as SendRequestType | undefined)?.[2][0].payload
        ipcEmitter.emit(cmdName, hookPayload ?? payload)
      } else {
        const [, { callbackId }, data] = args as SendResponseType
        const responseEventName = callbackMap.get(callbackId)
        if (responseEventName && config.eventInterceptors?.[responseEventName]) {
          callbackMap.delete(callbackId)
          hookArgs = config.eventInterceptors?.[responseEventName](args)
        }
        const hookData = (hookArgs as SendResponseType | undefined)?.[2]

        ipcEmitter.emit(callbackId, hookData ?? data)
      }

      if (config.log && config.log !== 'message') {
        console.log('--------------------主线程发送的消息-----------------------')
        console.log(args)
      }

      return Reflect.apply(target, thisArg, hookArgs ?? args)
    }
  })

  window.webContents._events['-ipc-message'] = new Proxy(window.webContents._events['-ipc-message'], {
    apply(target, thisArg, args: IPCMessageArgsType) {
      const [, , , [{ type }]] = args

      let hookArgs: IPCMessageArgsType | undefined

      if (type === 'request') {
        const [, , , [{ callbackId, eventName }, [ntapiName]]] = args as IPCMessageRequestType
        // 默认屏蔽log
        if (eventName.includes('ns-LoggerApi')) return
        const emitName = typeof ntapiName === 'string' ? ntapiName : eventName
        if (config.eventBlacklist?.includes(emitName)) return
        callbackMap.set(callbackId, emitName)
        hookArgs = config.eventInterceptors?.[emitName](args)
        ipcEmitter.once(callbackId, (data) => {
          ipcEmitter.emit(emitName, data)
        })
      }

      if (config.log && config.log !== 'send') {
        console.log('--------------------渲染层发送的消息-----------------------')
        console.log(args)
      }

      return Reflect.apply(target, thisArg, hookArgs ?? args)
    }
  })
}

/**
 * 调用 QQ 底层函数
 */
export const invokeNative = ({
  ipcName = 'IPC_UP_2',
  eventName,
  eventType = 'requert',
  cmdName,
  args
}: {
  ipcName: string
  eventName: string
  eventType: 'requert' | 'response'
  cmdName: string
  args: any[]
}) => {
  const callbackId = randomUUID()

  return new Promise((resolve) => {
    ipcMain.emit(ipcName, {}, { type: eventType, callbackId, eventName }, [cmdName, ...args])
    ipcEmitter.once(callbackId, resolve)
  })
}
