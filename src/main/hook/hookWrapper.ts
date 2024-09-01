import { EventEmitter } from 'node:events'
import type { NTWrapperNodeApi, NodeIQQNTWrapperSession } from 'napcat.core'
import { NTCoreWrapper } from 'napcat.core'
import Process from 'node:process'
import { EventEnum } from '../enum/eventEnum'
export const wrapperEmitter = new EventEmitter()

interface hookWarpperConfigType {
  // 是否打印日志
  log: boolean
  // 需要忽略的黑名单事件
  eventBlacklist?: string[]
}

/**
 * 打印函数调用相关参数
 */
const logFn = ({ argArray, ret, key }: { argArray: any[]; ret: any; key: string }) => {
  if ((key.endsWith('Service') && serviceMap.has(key)) || !hookConfig?.log) return
  key.endsWith('Service') && serviceMap.set(key, true)

  console.log('-----------------------------------------------')
  console.log(`${key} 被调用`)
  argArray.length && console.log(`参数: `, argArray)
  console.log(`返回值: `, ret)

  if (typeof ret === 'object' && ret) {
    const retPropertyNames = Object.getOwnPropertyNames(ret)
    retPropertyNames.length && console.log(`返回值 keys: `, retPropertyNames)

    console.log(`原型 keys: `, Object.getOwnPropertyNames(Object.getPrototypeOf(ret)))
  }
}

/**
 * hook 实例的原型方法
 */
const hookInstance = ({ instance, rootKey }: { instance: Record<string, any>; rootKey: string }) => {
  return new Proxy(instance, {
    get(_, p: string, receiver) {
      const targetProperty = Reflect.get(instance, p, receiver)
      if (typeof targetProperty !== 'function') return targetProperty

      // 先生真乃盖世神医
      // return Reflect.get(target, p, receiver).bind(instance)

      const key = `${rootKey}/${p}`

      return (...args) => {
        // 拦截黑名单事件
        if (hookConfig?.eventBlacklist?.includes(key)) return

        // 对于监听器参数也进行hook
        if (key.endsWith('Listener')) {
          args[0] = hookInstance({
            instance: args[0],
            rootKey: key
          })
        }

        let applyRet = instance[p](...args)

        // Service 需要额外处理一次
        if (key.endsWith('Service')) {
          applyRet = hookInstance({
            instance: applyRet,
            rootKey: key
          })
        }

        logFn({
          argArray: args,
          ret: applyRet,
          key: key
        })

        // 额外派发事件方便监听处理
        wrapperEmitter.emit(key, {
          applyRet,
          args
        })

        return applyRet
      }
    }
  })
}

/**
 * 获取 NTCoreWrapper 实例
 */
export const getNTcore = () => {
  if (!NTcore) throw new Error('NTcore 未初始化成功')

  return NTcore
}
let NTcore: NTCoreWrapper | undefined

let NodeIQQNTWrapperSession: NodeIQQNTWrapperSession | undefined
let NTWrapperNodeApi: NTWrapperNodeApi | undefined

/**
 * 用于避免多次调用 getService 造成的打印
 */
const serviceMap = new Map<string, boolean>()

/**
 * 配置对象
 */
let hookConfig: hookWarpperConfigType | undefined

/**
 * hook wrapper
 */
export const hookWrapper = (config?: hookWarpperConfigType): Promise<NTCoreWrapper> => {
  hookConfig = config

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
        const [, fileName] = argArray
        const nodeMod = Reflect.apply(target, thisArg, argArray)

        // hook 所有 wrapper 导出模块
        if (fileName.includes('wrapper.node')) {
          const wrapper = argArray[0].exports as NTWrapperNodeApi
          const hookWrapper = new Proxy(wrapper, {
            get(_, wrapperApiName: string, receiver) {
              const wrapperApi: unknown = Reflect.get(wrapper, wrapperApiName, receiver)
              if (typeof wrapperApi !== 'function') return wrapperApi

              return new Proxy(
                function () {
                  // 由于所有属性都被添加了 configurable ，必须更改父级来做到 proxy
                },
                {
                  /**
                   * 拦截 get 和拦截 construct 的意义是一样的，新版QQ均是 xxx.get/xxx.create 进行构造实例
                   * 当然还有一些静态属性，不过不再射程内
                   */
                  get(_, p: string, receiver) {
                    const targetProperty: unknown = Reflect.get(wrapperApi, p, receiver)
                    if (typeof targetProperty !== 'function') return targetProperty

                    return new Proxy(targetProperty, {
                      apply(target, thisArg, argArray) {
                        const applyRet = Reflect.apply(target, thisArg, argArray)
                        const key = `${wrapperApiName}/${p}`

                        logFn({
                          argArray,
                          ret: applyRet,
                          key
                        })

                        if (key === 'NodeIQQNTWrapperSession/create') {
                          NodeIQQNTWrapperSession = applyRet
                        }

                        if (typeof applyRet !== 'object') return applyRet

                        return hookInstance({
                          instance: applyRet,
                          rootKey: key
                        })
                      }
                    })
                  },

                  // 拦截构造器已无任何意义，观察下来只有 NodeQQNTWrapperUtil 但也没什么实际意义，但我也懒得删了
                  construct(_, argArray, newTarget) {
                    const instance = Reflect.construct(wrapperApi, argArray, newTarget)

                    logFn({
                      key: wrapperApiName,
                      ret: instance,
                      argArray
                    })

                    return hookInstance({
                      instance: instance,
                      rootKey: wrapperApiName
                    })
                  }
                }
              )
            }
          })
          NTWrapperNodeApi = argArray[0].exports = hookWrapper
        }

        return nodeMod
      }
    })

    // 等待登录
    wrapperEmitter.once(EventEnum.onQRCodeLoginSucceed, () => {
      res(new NTCoreWrapper(NTWrapperNodeApi!, NodeIQQNTWrapperSession!))
    })
  })
}
