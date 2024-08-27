import { hookWrapper } from '@/main/hook/hookWrapper'
import { eventEmitter } from '@/main/eventEmitter'
import { Events } from './enum/eventsEnum'
import { hookIPC } from './hook/hookIPC'
;(async () => {
  const NTCore = await hookWrapper({
    log: false,
    eventBlacklist: [Events.sendLog, Events.requestTianshuAdv, Events.onUnitedConfigUpdate],
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
