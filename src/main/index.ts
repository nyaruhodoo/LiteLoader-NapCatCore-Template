import { hookWrapper } from '@/main/hook/hookWrapper'
import { eventEmitter } from '@/main/eventEmitter'
import { Events } from './enum/eventsEnum'
;(async () => {
  const NTCore = await hookWrapper({
    log: true,
    eventBlacklist: [Events.sendLog, Events.requestTianshuAdv, Events.onUnitedConfigUpdate],
    waitLogin: true,
    eventEmitter
  })

  // 做你想做的事...
  NTCore
})()
