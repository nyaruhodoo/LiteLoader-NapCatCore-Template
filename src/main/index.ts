import { hookWrapper } from '@/main/hook/hookWrapper'
import { EventEnum } from './enum/eventEnum'
;(async () => {
  await hookWrapper({
    eventBlacklist: [EventEnum.sendLog, EventEnum.requestTianshuAdv],
    log: false
  })
})()
