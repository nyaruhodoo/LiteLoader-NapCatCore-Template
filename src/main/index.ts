import { hookWrapper } from '@/main/hook/hookWrapper'
import { eventEmitter } from '@/main/eventEmitter'
import { Events } from './enum/eventsEnum'
;(async () => {
  const NTCore = await hookWrapper({
    log: false,
    eventBlacklist: [Events.sendLog, Events.requestTianshuAdv],
    waitLogin: true,
    eventEmitter
  })

  // 做你想做的事...
  NTCore
})()
