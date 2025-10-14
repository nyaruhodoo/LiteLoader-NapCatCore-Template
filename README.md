# 写在最前

鸽了鸽了，本仓库会迁移到 [StarWand](https://github.com/nyaruhodoo/LiteLoader-StarWand)
可以理解为二合一，将不再考虑单独使用模板的维护，之后的所有功能将围绕自身使用需求添加

测试版本 **9.9.15-29271**

由于 26909 版本后 wrapper 本体有很大改动，导致该模板并不能同时支持之前版本(懒得做)  
如果你一定要用可以参考历史版本，具体哪个commit我也忘了

**本项目只会保证兼容最新版 QQ，对于任何历史版本将不会过多考虑兼容**

# LiteLoader-Wrapper-Template

自用插件开发模板，与其他模板不同的是提供了一些 hook 功能 (从头hook到脚，侵入式很强)  
或许能避免一些新手开发者走弯路，借助该模板大部分初级功能均可在几十行代码左右实现，只需要你具备一些 JS 相关基础，比如屏蔽更新一行就够了  
~~如果没写出来不关我事啊，电报找一个叫il的，他亲口说的~~

## 一些待办事项

- [ ] 提供更完整的 wrapper 类型
- [ ] 修复 watch 打包
- [ ] 支持账号独立配置文件
- [ ] 使用其他构建工具替换 Vite，目前所用的这一套还是太笨重了，在很多地方都存在不少问题
- [ ] 集成插件自更新功能

~~仓库是早上建的，坑是晚上弃的~~  

## 它具体可以做些什么？

- 使用 `eventBlacklist` 禁止 QQ 执行某些逻辑
- 使用 `eventInterceptors` 修改 QQ 调用内部函数时的参数以及返回值
- 使用 `wrapperEmitter` 监听 QQ 内部的所有事件，拦截器也可以做到只不过 emitter 更加易用
- 使用 `Session` 调用 QQ 内部 API
- 使用 `dispatchListener` 调用 QQ 内部的监听器事件
- 使用 `Vue` `tailwindcss` 快速搭建 UI

## 一个不怎么样的文档

如果你比起看文档更喜欢看代码那么可以跳转 [StarWand](https://github.com/nyaruhodoo/LiteLoader-StarWand) 其中包含了一些基本使用

首选我要说明一件事 `StarWand` 插件和下面的 `StarWand` 没有什么关系！  
仅仅是我个人很喜欢这个名字所以复用了而已

### StarWand

当在主线程执行 `hookWrapper` 后会返回一个 `starWand` 实例  
它本身并没有什么复杂的，仅仅是存放了一些变量便于引用

```ts
class StarWand {
  #listenerMap = new Map<string, Set<Record<string, (...args: unknown[]) => void>>>()
  wrapperEmitter = new EventEmitter<WrapperEventMap>()
  constructor(
    public Wrapper?: Wrapper,
    public Session?: NodeIQQNTWrapperSession,
    public config: ConfigType = {}
  ) {}
}
```

我们需要关注的是 `config` ，这里直接给出类型定义

```ts
interface ConfigType {
  /**
   * 是否开启log
   */
  log?: boolean | RegExp
  /**
   * 调整 inspect 模式下的打印深度
   */
  logDepth?: number
  /**
   * json 可以完整打印，inspect 格式更好看
   */
  logType?: 'inspect' | 'json'
  /**
   * 需要中断的黑名单事件
   */
  eventBlacklist?: (WrapperPaths | RegExp)[]
  /**
   * 事件拦截器，可以拦截请求参数以及返回值
   */
  eventInterceptors?: WrapperInterceptors
}
```

或许你会觉得我什么都没说，但请放心，我已经添加了相关类型定义 TS 会指引你前进

### Wrapper 是什么

我已经在[新手文档](https://github.com/nyaruhodoo/LiteLoader-BeginnerTutorial?tab=readme-ov-file#%E5%9C%A8-wrapper-%E5%81%9A%E7%82%B9%E4%BB%80%E4%B9%88)中进行了一些说明，如无特别需求一般情况下是不需要直接访问该属性的

### Session 是什么

其中保存了 QQ 内部封装好的一系列 API，所有需要与服务端交互的逻辑都是通过它实现的

```ts
// 实际使用起来就是这个样子
import { hookWrapper, starWand } from '@/main/hook/hookWrapper'

// main 中可以直接拿返回值，其他文件中可通过 import 拿
const starWand = await hookWrapper()
starWand.Session?.getMsgService().sendMsg()
```

本模板只会为这些函数提供一些类型支持，但不会进行额外封装(至少短期内不会)  
你所调用的 API 都是原汁原味的

你可能注意到 hookWrapper 会返回一个 promise，这是因为大多数 API 都需要登陆后调用，所以 await 实际上是在等待登录

### eventInterceptors 的一些注意事项

在拦截函数参数时使用 `NodeIQQNTWrapperSession/create/getMsgService/sendMsg`  
在拦截响应时使用 `NodeIQQNTWrapperSession/create/getMsgService/sendMsg:response`

返回值是可选的，如果没有指定返回值那么会通过 `??` 默认返回原参数  
同时你需要额外注意返回值的类型，虽然我已经在类型上限制了你，但一定会有人尝试跳过  
如果说依赖了某些异步行为生成参数，那么最好的做法是中断本次调用，之后通过 session 再次还原逻辑

```ts
export const videoFileEventInterceptors = {
  [EventEnum.sendMsg](msg) {
    // 另起一个函数准备好参数后通过 Session 再次还原本次逻辑
    file2Video(msg)

    // 即时中断
    throw new Error('喵喵喵')
  }
}
```

### Vue

为了便于开发该模板已集成 Vue ，并且封装了一些[基础组件](https://github.com/nyaruhodoo/LiteLoader-Wrapper-Template/blob/master/src/renderer/configView/App.vue)  
代码很简单，仅仅是将LL提供的一些组件进行二次封装便于直接使用`v-model`  
如果你觉得满足不了你，完全可以安装其他基于 Vue 的组件库进行开发

#### 组件样式的一些注意事项

个人建议使用 tailwindcss 添加样式  
或许你会更喜欢 Vue 的 `scoped-style` 但很遗憾当前有一些 BUG，因为使用了库模式导致无法自动注入 CSS ，为了解决这个问题我使用了 `vite-plugin-vue-style-bundler` 来把 CSS 和 JS 编译到同一个文件中
```vue
<style scoped bundle></style>
```
使用很简单，但是它无法和 `Web Components` 同时存在(会导致编译错误)，想解决的话需要从社区找到代替插件或者**不直接使用 LL 提供的组件**  

## 类型(很很很很重要)

- 增加了 `Wrapper` 类型便于开发者调用相关 API (类型必然有误)
- 全局注入了 `global.d.ts` 暴露 `LiteLoader` 相关API (类型可能有误)
- 增加了 `contextBridge.d.ts` 用于在 `preload` 与 `renderer` 之间暴露接口时同步类型

**StarWand 中所有类型，都是基于 Wrapper 类型通过小学生广播体操实现的**  
**Wrapper 类型本身又是通过 ChatGPT 自动生成额外加上人工修正**

基于以上两点，请不要盲目依赖类型，在调用相关函数时务必要先通过 `log` 提前确认好参数是否有误，然后再进行调用  
或许你会觉得很鸡肋，但很抱歉本项目处于一个十分初级的阶段，我个人也并无太多精力去收集所有类型  
如果你在开发时遇到了不如意的类型问题也请不要直接忽略或者进行断言，请直接进行 PR 来帮助完善 Wrapper 类型，这样本项目才能减轻更多开发者的开发成本

## IPC

具体也请查看[新手文档](https://github.com/nyaruhodoo/LiteLoader-BeginnerTutorial?tab=readme-ov-file#%E5%9C%A8-ipc-%E5%81%9A%E7%82%B9%E4%BB%80%E4%B9%88)  
项目里保留了一部分 IPC 相关的内容，因为我更喜欢 wrapper 所以是属于废弃部分，但难免还是有人会用所以就放在那里了  
除非 wrapper 彻底挂壁那么我可能会考虑再捡回来...

## 使用时的一些杂项内容

### 修改 manifest & defaultConfig

没什么好说的，你总得有自己的插件名字和插件配置不是？

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

在调用 `Utils.getConfig` 时，会基于当前 `defaultConfig` 与用户的本地配置进行一次深度合并  
或许意义不是很大，但要不要用取决于你自己

### 构建相关

因基于 electron-vite 进行构建，所以功能大差不差，只是做了略微修改  
main、preload、renderer 3个文件都是独立打包不会存在共同引用，但不妨碍你在开发时引用共同的代码，在打包后会分别复制到3个文件中

**node_modules 中的文件也会跟随打包，目的是为了它人使用插件时不需要在安装依赖**  
**唯一的注意事项是不要在渲染层引用 node 环境下的依赖**

### 路径相关

- 增加了常用的 `@` 来引用 `src` 目录
- 增加了 `@/manifest` 来引用 `manifest.json` 文件

### 静态资源相关

```ts
import styleUrl from './index.scss?url'

const linkEl = document.createElement('link')
linkEl.rel = 'stylesheet'
linkEl.href = styleUrl
shadow.append(linkEl)
```

这些功能都是 `vite` 提供的，你也可以使用 `raw`、`base64` 等格式  
~~其实BUG蛮多的，也就处理CSS可以简单用一下，其他资源还是建议自己通过LL的API去拼接路径~~
