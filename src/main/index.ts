import { hookWrapper } from '@/main/hook/hookWrapper'
import { eventEmitter } from '@/main/eventEmitter'
import { WrapperEvents } from './enum/wrapperEventsEnum'
import { hookIPC, ipcEmitter } from './hook/hookIPC'
;(async () => {
  const NTCore = await hookWrapper({
    log: false,
    eventBlacklist: [WrapperEvents.sendLog, WrapperEvents.requestTianshuAdv, WrapperEvents.onUnitedConfigUpdate],
    waitLogin: true,
    eventEmitter
  })

  // 做你想做的事...
  NTCore
})()

exports.onBrowserWindowCreated = (window) => {
  hookIPC(window, {
    log: 'all'
  })
}

ipcEmitter.addListener('nodeIKernelMsgListener/onRecvActiveMsg', () => {
  // console.log(data)
})
