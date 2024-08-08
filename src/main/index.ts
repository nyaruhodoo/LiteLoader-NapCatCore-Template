import { hookWrapper } from '@/main/hook/hookWrapper'
import { eventEmitter } from '@/main/eventEmitter'
import { Events } from './enum/eventsEnum'
;(async () => {
  await hookWrapper({
    isLog: false,
    eventBlacklist: [Events.sendLog, Events.requestTianshuAdv],
    eventEmitter
  })

  // 做你想做的事...
})()
