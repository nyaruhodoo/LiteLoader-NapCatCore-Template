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

interface hookIPCConfigType {
  log?: 'all' | 'send' | 'message'
  // 需要忽略的黑名单事件
  eventBlacklist?: string[]
  // 拦截事件，可以修改参数
  eventInterceptors?: Record<string, (params: any[]) => any[]>
}

export const hookIPC = (window: Electron.CrossProcessExports.BrowserWindow, config: hookIPCConfigType) => {
  window.webContents.send = new Proxy(window.webContents.send, {
    apply(target, thisArg, args: SendArgsType) {
      const [ipcName] = args
      if (!ipcName.includes('IPC')) return Reflect.apply(target, thisArg, args)

      if (args[1].type === 'request') {
        const [, , [{ cmdName, payload }]] = args as SendRequestType
        if (config.eventBlacklist?.includes(cmdName)) return
        ipcEmitter.emit(cmdName, payload)
      } else {
        const [, { callbackId }, data] = args as SendResponseType
        ipcEmitter.emit(callbackId, data)
      }

      if (config.log && config.log !== 'message') {
        console.log('--------------------主线程发送的消息-----------------------')
        console.log(args)
      }

      return Reflect.apply(target, thisArg, args)
    }
  })

  window.webContents._events['-ipc-message'] = new Proxy(window.webContents._events['-ipc-message'], {
    apply(target, thisArg, args: IPCMessageArgsType) {
      const [, , , [{ type, eventName }]] = args

      // 默认屏蔽log
      if (eventName.includes('ns-LoggerApi')) return

      if (type === 'request') {
        const [, , , [{ callbackId, eventName }, [ntapiName]]] = args as IPCMessageRequestType
        const emitName = typeof ntapiName === 'string' ? ntapiName : eventName
        if (config.eventBlacklist?.includes(emitName)) return
        ipcEmitter.once(callbackId, (data) => {
          ipcEmitter.emit(emitName, data)
        })
      }

      if (config.log && config.log !== 'send') {
        console.log('--------------------渲染层发送的消息-----------------------')
        console.log(args)
      }

      return Reflect.apply(target, thisArg, args)
    }
  })
}

/**
 * 调用 QQ 底层函数
 */
export const invokeNative = ({
  ipcName,
  eventName,
  cmdName,
  args
}: {
  ipcName: string
  eventName: string
  cmdName: string
  args: any[]
}) => {
  const callbackId = randomUUID()

  return new Promise((resolve) => {
    ipcMain.emit(ipcName, {}, { type: 'request', callbackId, eventName }, [cmdName, ...args])
    ipcEmitter.once(callbackId, resolve)
  })
}
