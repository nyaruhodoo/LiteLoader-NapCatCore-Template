import { EventEmitter } from 'node:events'
import type { NTWrapperNodeApi, NodeIQQNTWrapperSession } from 'napcat.core'
import { LoginListener, NTCoreWrapper } from 'napcat.core'
import Process from 'node:process'
export const eventEmitter = new EventEmitter()

interface hookWarpperConfigType {
  // 是否打印日志
  log: boolean
}

let NodeIQQNTWrapperSession: NodeIQQNTWrapperSession | undefined

/**
 * 获取 NTCoreWrapper 实例
 */
export const getNTcore = () => {
  if (!NTcore) throw new Error('NTcore 未初始化成功')

  return NTcore
}
let NTcore: NTCoreWrapper | undefined

/**
 * hook wrapper
 */
export const hookWrapper = (config?: hookWarpperConfigType): Promise<NTCoreWrapper> => {
  return new Promise((res) => {
    Process.dlopen = new Proxy(Process.dlopen, {
      apply(
        target,
        thisArg,
        argArray: [
          {
            id: number
            loaded: boolean
            exports: Record<string, any>
            paths: []
            children: []
          },
          string
        ]
      ) {
        const ret = Reflect.apply(target, thisArg, argArray)
        const [, fileName] = argArray

        if (fileName.includes('wrapper.node')) {
          const exports = argArray[0].exports as NTWrapperNodeApi

          // hook 所有导出模块
          argArray[0].exports = new Proxy(exports, {
            get(parentTarget, parentP: string, parentReceiver) {
              const parentRet = Reflect.get(parentTarget, parentP, parentReceiver)

              if (typeof parentTarget[parentP] !== 'function') return parentRet

              return new Proxy(
                function () {
                  //
                },
                {
                  // 新版本几乎不 construct，要么是静态属性，要么是 p.create()
                  construct(_, argArray, newTarget) {
                    return Reflect.construct(parentRet, argArray, newTarget)
                  },

                  get(_, p: string, receiver) {
                    return function (...args) {
                      const key = `${parentP}/${p}`
                      const ret = Reflect.get(parentRet, p, receiver)(...args)

                      if (config?.log) {
                        console.log(`${key}被调用`)
                        args.length && console.log(`参数: `, args)

                        if (ret instanceof Promise) {
                          ret.then(() => {
                            console.log(`${key}返回值: `, ret)
                          })
                        } else {
                          console.log('返回值: ', ret)
                          typeof ret === 'object' &&
                            console.log('原型', Object.getOwnPropertyNames(Object.getPrototypeOf(ret)))
                        }
                        console.log('---------------------------------------------')
                      }

                      if (key === 'NodeIQQNTWrapperSession/create') {
                        NodeIQQNTWrapperSession = ret
                      }

                      if (key === 'NodeIKernelLoginService/get') {
                        const NCLoginListener = new LoginListener()
                        NCLoginListener.onQRCodeLoginSucceed = () => {
                          res(new NTCoreWrapper(exports, NodeIQQNTWrapperSession!))
                        }
                        ret.addKernelLoginListener(NCLoginListener)
                      }

                      return ret
                    }
                  }
                }
              )
            }
          })
        }

        return ret
      }
    })
  })
}
