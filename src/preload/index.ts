import type { ContextBridgeApiType } from '@/types/contextBridge'
import type { ConfigType } from '@/defaultConfig'
import { contextBridge, ipcRenderer } from 'electron'
import { slug } from '@/manifest'
import { Utils } from '@/utils'

const contextBridgeApi: ContextBridgeApiType = {
  configUpdate(config: ConfigType) {
    ipcRenderer.send(Utils.updateEventName, config)
  }
}

contextBridge.exposeInMainWorld(slug, contextBridgeApi)
