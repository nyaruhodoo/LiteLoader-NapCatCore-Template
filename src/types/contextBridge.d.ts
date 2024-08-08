import { ConfigType } from '../defaultConfig'

export interface ContextBridgeApiType {
  configUpdate: (config: ConfigType) => void
}
