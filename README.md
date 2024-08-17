# 写在最前

由于官方针对 Hook Wrapper 的围堵，**9.9.15-26909** 是最后一个可用的版本  
如果你喜欢该模板那么可以去除掉相关调用，待我有空时我会替换为 Hook IPC 版本，所以影响不是很大

# LiteLoader-NapCatCore-Template

自用插件开发模板，会尽可能实现开发插件时所需要的基础功能，使开发者焦距核心功能

当前提供的功能如下

- 快速创建插件配置页面
- 默认 Hook Wrapper ，创建 NTCore 实例

## 待办事项

- [ ] 修复 watch 打包
- [ ] 支持更多组件用于丰富配置选项
- [ ] 支持账号独立配置文件
- [ ] 使用其他构建工具替换 Vite，目前所用的这一套还是太笨重了，在很多地方都存在不少问题
- [ ] 集成插件自更新功能
- [ ] 为 NapCatCore API提供更多 TS 类型，~~不靠十雪难道靠我吗？~~

~~仓库是早上建的，坑是晚上弃的~~

## 使用教程？文档？胡言乱语？

### Hook Wrapper

可以先了解下 [NapCatCore](https://github.com/NapNeko/LiteLoader-NapCatCore)  
该模板并不只是单纯的创建了 `NTCore` 实例，而是对 Wrapper 中的函数都进行了一层拦截用于做到更多事情，比如拦截事件、额外的 eventEmitter  
如果你不喜欢可以参考 [NapCatExample](https://github.com/NapNeko/LiteLoader-NapCatExample) 使用非侵入式的方式创建 NTCore  
~~我不觉得会有很大区别就是了~~

```ts
interface hookWarpperConfigType {
  // 是否打印日志
  log: boolean
  // 需要忽略的黑名单事件
  eventBlacklist?: string[]
  // 拦截事件，可以修改参数
  eventInterceptors?: Record<string, (params: any[]) => any[]>
  // 如果指定独立的 eventEmitter 则会额外派发事件
  eventEmitter?: EventEmitter
  // 内置的事件监听器
  eventListeners?: Record<string, (event: { ret: any; params: any[] }) => void>
  // 是否等待登录
  waitLogin?: boolean
}
```

`hookWrapper` 提供的参数也非常有限，需要注意的是 `waitLogin` 以及事件名  
`NTCore` 中的大多数 API 都需要登陆后才可调用，一些工具类则没有这个要求，所以通常情况下建议配置 `waitLogin` 为 `true`，监听登录的方式还有很多，比如 LL 就提供了 `onLogin` 函数，我想应该可以满足你的特殊需求

至于事件名你可以参考 `eventsEnum` 会从父级拼接到子级，你可以开启 `log` 功能，打印什么名字复制什么名字就是

### 修改 manifest & defaultConfig & createConfigViewConfig

没什么好说的，你总得有自己的插件名字和插件配置不是？  
需要注意的是 `manifest.json` 中的 `slug` 属性，代码中依赖了该属性，对于命名也有一些要求，需要符合 `customElements.define()` 的参数

### 实时更新配置文件

虽然代码保证了你在配置页面修改配置时同步本地文件，但你的插件如何及时同步则需要你自己进行处理  
配置文件更新后会向主线程使用 `send` 派发 `${slug}:update` 事件，向渲染层使用 [BC](https://developer.mozilla.org/zh-CN/docs/Web/API/BroadcastChannel) 派发 `${slug}` 频道事件

```ts
// 主线程
ipcMain.on(`${slug}:update`, (_, config) => {
  // 初始化你的插件逻辑
})

// 渲染层
const bc = new BroadcastChannel(slug)
bc.addEventListener('message', (event) => {
  // 初始化你的插件逻辑
})
```

### 新旧配置合并策略

在调用 `Utils.initConfig` 时，会基于当前 `defaultConfig` 与用户的本地配置进行一次深度合并

```ts
static mergeConfig(oldConfig: Record<string, any>, newConfig: ConfigType) {
    const targetObj = structuredClone(newConfig)

    for (const [key, value] of Object.entries(oldConfig)) {
      // 废弃的属性
      if (!Object.hasOwn(targetObj, key)) continue
      // 类型已更新
      if (Object.prototype.toString.call(value) !== Object.prototype.toString.call(targetObj[key])) continue
      // 合并数组
      if (Array.isArray(value)) {
        targetObj[key] = [...new Set([...value, ...targetObj[key]])]
        continue
      }
      // 处理对象类型，进行深层合并
      if (typeof value === 'object' && value) {
        targetObj[key] = this.mergeConfig(value, targetObj[key])
        continue
      }
      // 基本值以本地配置为准
      targetObj[key] = value
    }

    return targetObj
  }
```

我想看源码比我打字应该更好理解一些

## 构建相关

因基于 electron-vite 进行构建，所以功能大差不差，只是做了略微修改  
main、preload、renderer 3个文件都是独立打包不会存在共同引用，但不妨碍你在开发时引用共同的代码，在打包后会分别复制到3个文件中

**node_modules 中的文件也会跟随打包，目的是为了它人使用插件时不需要在安装依赖**  
**唯一的注意事项是不要在渲染层引用 node 环境下的依赖**

### 类型

- 全局注入了 `global.d.ts` 暴露 `LiteLoader` 相关API (类型可能有误)
- 增加了 `contextBridge.d.ts` 用于在 `preload` 与 `renderer` 之间暴露接口时同步类型

### 路径

- 增加了常用的 `@` 来引用 `src` 目录
- 增加了 `@/manifest` 来引用 `manifest.json` 文件

### 引用静态资源

```ts
import styleUrl from './index.scss?url'

const linkEl = document.createElement('link')
linkEl.rel = 'stylesheet'
linkEl.href = styleUrl
shadow.append(linkEl)
```

这些功能都是 `vite` 提供的，你也可以使用 `raw`、`base64` 等格式
