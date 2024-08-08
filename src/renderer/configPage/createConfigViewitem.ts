import { ConfigType } from '@/defaultConfig'
import { ConfigItemType } from './createConfigViewConfig'
import { Utils } from '@/utils'

export const createConfigViewItem = (item: ConfigItemType, responsiveConfig: ConfigType) => {
  // 初始化容器
  const configItemEl = document.createElement('setting-item')
  configItemEl.setAttribute('data-direction', 'row')
  configItemEl.innerHTML = '<div class="setting-item-text"></div>'

  // 创建标题
  {
    const textBoxEl = configItemEl.querySelector('.setting-item-text')
    const titleEl = document.createElement('setting-text')

    titleEl.innerHTML = item.title
    textBoxEl!.append(titleEl)

    if (item.description) {
      const descriptionEl = document.createElement('setting-text')
      descriptionEl.setAttribute('data-type', 'secondary')
      descriptionEl.innerHTML = item.description
      textBoxEl!.append(descriptionEl)
    }
  }

  // 创建控件
  {
    const settingItemControlEl: HTMLElement = document.createElement(item.type)
    configItemEl.append(settingItemControlEl)

    switch (item.type) {
      case 'setting-switch':
        if (item.value) {
          settingItemControlEl.setAttribute('is-active', 'true')
        }
        settingItemControlEl.addEventListener('click', function () {
          const isActive = settingItemControlEl.hasAttribute('is-active')
          settingItemControlEl.toggleAttribute('is-active')
          Utils.setProperty(responsiveConfig, item.keyPath, !isActive)
        })
        break
      case 'input':
        if (settingItemControlEl instanceof HTMLInputElement) {
          settingItemControlEl.type = item.inputType ?? 'text'
          settingItemControlEl.value = item.value

          settingItemControlEl.addEventListener('change', () => {
            const value = item.customStoreFormat
              ? item.customStoreFormat(settingItemControlEl.value)
              : settingItemControlEl.value

            Utils.setProperty(responsiveConfig, item.keyPath, value)
          })
        }
        break
      default:
        // eslint-disable-next-line no-case-declarations
        const _exhaustiveCheck: never = item.type
        return _exhaustiveCheck
    }
  }

  return configItemEl
}
