import { hookWrapper } from '@/main/hook/hookWrapper'
import { WrapperEvents } from './enum/wrapperEventsEnum'
import { hookIPC } from './hook/hookIPC'
;(async () => {
  const NTCore = await hookWrapper({
    log: false,
    eventBlacklist: [WrapperEvents.sendLog, WrapperEvents.requestTianshuAdv, WrapperEvents.onUnitedConfigUpdate],
    waitLogin: true
  })

  // 做你想做的事...
  NTCore
})()

exports.onBrowserWindowCreated = (window: Electron.CrossProcessExports.BrowserWindow) => {
  hookIPC(window, {
    log: 'all'
  })
}
