import { contextBridge, ipcRenderer } from 'electron'
import { slug } from '@/manifest'
import { ConfigType } from '@/defaultConfig'
import { Utils } from '@/utils'
import type { ContextBridgeApiType } from '@/types/contextBridge'

const contextBridgeApi: ContextBridgeApiType = {
  configUpdate(config: ConfigType) {
    ipcRenderer.send(Utils.updateEventName, config)
  }
}

contextBridge.exposeInMainWorld(slug, contextBridgeApi)
