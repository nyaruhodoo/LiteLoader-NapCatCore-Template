import type { ConfigType } from '@/defaultConfig'
import type { ContextBridgeApiType } from '@/types/contextBridge'
import { Utils } from '@/utils'
import { slug } from '@/manifest'
import { createConfigViewList } from './createConfigViewList'
import styleUrl from './index.scss?url'

const contextBridgeApi: ContextBridgeApiType = window[slug]

/**
 * 生成响应式配置对象
 */
const createResponsiveConfig = async (onUpdate?: (responsiveConfig: ConfigType) => void) => {
  const config = await Utils.initConfig()
  const responsiveConfig = Utils.createDeepProxy<ConfigType>(config, {
    set(target, prop, val) {
      target[prop as string] = val
      // 走ipc不能传递proxy对象
      const copyConfig = JSON.parse(JSON.stringify(responsiveConfig))
      Utils.updateConfig(copyConfig)
      onUpdate?.(copyConfig)
      return true
    }
  })
  return responsiveConfig
}

class ConfigElement extends HTMLElement {
  async connectedCallback() {
    // 每次配置更新后通知主线程和渲染线程
    const responsiveConfig = await createResponsiveConfig((config) => {
      contextBridgeApi.configUpdate(config)

      // BroadcastChannel 用于通知渲染层
      const bc = new BroadcastChannel(slug)
      bc.postMessage(config)
    })

    // 添加页面
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.append(...createConfigViewList(responsiveConfig))

    const linkEl = document.createElement('link')
    linkEl.rel = 'stylesheet'
    linkEl.href = styleUrl
    shadow.append(linkEl)
  }
}
customElements.define('config-element', ConfigElement)

export const onSettingWindowCreated = (view: HTMLElement) => {
  view.innerHTML = `<config-element></config-element>`
}
