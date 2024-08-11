import Process from 'node:process'
import type { EventEmitter } from 'node:events'
import type { NTWrapperNodeApi } from 'napcat.core'
import { NTCoreWrapper } from 'napcat.core'

interface hookWarpperConfigType {
  // 是否打印日志
  isLog: boolean
  // 需要忽略的黑名单事件
  eventBlacklist?: string[]
  // 拦截事件，可以修改参数
  eventInterceptors?: Record<string, (params: any[]) => any[]>
  // 如果指定独立的 eventEmitter 则会额外派发事件
  eventEmitter?: EventEmitter
  // 内置的事件监听器
  eventListeners?: Record<string, (event: { ret: any; params: any[] }) => void>
}

/**
 * 全局唯一 NTCoreWrapper 实例
 */
let NTcore: NTCoreWrapper | undefined
/**
 * 获取 NTCoreWrapper 实例
 */
export const getNTcore = () => {
  if (!NTcore) throw new Error('NTcore 未初始化成功')

  return NTcore
}

/**
 * 打印函数参数
 */
const log = (ret: unknown, args: unknown[], fnName?: string) => {
  if (fnName) {
    console.log(`==============${fnName}被调用=============`)
  }

  if (args.length) {
    console.log(`参数:`)
    console.log(JSON.stringify(args))
  }

  console.log(`返回值:`)
  console.log(JSON.stringify(ret))

  if (typeof ret === 'object') {
    console.log('原型对象:')
    console.log(Object.getPrototypeOf(ret))
  }
}

/**
 * hook 实例的原型方法
 */
const hookInstance = ({
  instance,
  rootName,
  isLog,
  eventBlacklist,
  eventListeners,
  eventEmitter,
  eventInterceptors
}: {
  instance: object
  rootName: string
} & hookWarpperConfigType) => {
  const protoType: Record<string, any> = Object.getPrototypeOf(instance)

  for (const key of Object.getOwnPropertyNames(protoType)) {
    if (typeof protoType[key] !== 'function') continue

    const rootKey = `${rootName}.${key}`

    instance[key] = function (...args) {
      // 拦截黑名单事件
      if (eventBlacklist?.includes(rootKey)) {
        // isLog && console.log(`${rootKey} 调用已被拦截`)
        return
      }

      // 拦截参数
      const hookArgs = eventInterceptors?.[rootKey]?.(args) ?? args

      const ret = protoType[key].apply(this, hookArgs)

      if (ret instanceof Promise) {
        ret.then((asyncRet) => {
          isLog && log(asyncRet, args, rootKey)
          eventListeners?.[rootKey]?.({
            ret: asyncRet,
            params: args
          })
          eventEmitter?.emit(rootKey, {
            ret: asyncRet,
            params: args
          })
        })
      } else {
        isLog && log(ret, args, rootKey)
        eventListeners?.[rootKey]?.({
          ret: ret,
          params: args
        })
        eventEmitter?.emit(rootKey, {
          ret: ret,
          params: args
        })
      }

      /**
       * 对于 Service 相关函数，需要额外覆盖一次函数
       */
      if (key.includes('Service')) {
        hookInstance({
          instance: ret,
          rootName: `${rootKey}`,
          isLog,
          eventBlacklist,
          eventListeners,
          eventInterceptors,
          eventEmitter
        })
      }

      return ret
    }
  }

  return instance
}

/**
 * hook wrapper
 */
export const hookWrapper = (config: hookWarpperConfigType): Promise<NTCoreWrapper> => {
  let WrapperNodeApi: NTWrapperNodeApi

  // 存放构建的实例
  const wrapperMpa = new Map()

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
            get(target, p: string, receiver) {
              if (typeof target[p] !== 'function') return Reflect.get(target, p, receiver)

              // 使用自定义函数覆盖构造函数
              return new Proxy(target[p], {
                construct(target, argArray) {
                  // 保证只打印一次构造，避免污染log
                  const isNew = wrapperMpa.get(p)
                  const isLog = !isNew && config.isLog

                  // hook函数的公共参数
                  const baseConfig = {
                    rootName: p,
                    isLog: config.isLog,
                    eventBlacklist: config.eventBlacklist,
                    eventListeners: config.eventListeners,
                    eventEmitter: config.eventEmitter,
                    eventInterceptors: config.eventInterceptors
                  }

                  if (isLog) console.log(`--------------------- ${p}被构造 ---------------------`)

                  // hook args
                  if (argArray.length) {
                    if (isLog) {
                      console.log('构造参数:')
                      console.log(argArray)
                    }

                    // 如果参数是对象，大概率是绑定的监听器
                    if (typeof argArray[0] === 'object' && argArray[0]) {
                      argArray[0] = hookInstance({
                        ...baseConfig,
                        instance: Object.create(argArray[0])
                      })
                    }
                  }

                  const ret: any = Reflect.construct(target, argArray)

                  // 构造参数单独打印，这里仅打印返回值
                  isLog && log(ret, [])

                  // hook ret
                  if (Object.getOwnPropertyNames(ret).length === 0) {
                    hookInstance({
                      ...baseConfig,
                      instance: ret
                    })
                  }

                  if (p === 'NodeIQQNTWrapperSession') {
                    const NTcore = new NTCoreWrapper(WrapperNodeApi, ret)

                    res(NTcore)
                  }

                  !isNew && wrapperMpa.set(p, ret)

                  return ret
                }
              })
            }
          })

          WrapperNodeApi = exports
        }

        return ret
      }
    })
  })
}
