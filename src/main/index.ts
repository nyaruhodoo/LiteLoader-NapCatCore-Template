import { hookWrapper } from '@/main/hook/hookWrapper'
import { hookIPC } from './hook/hookIPC'
import { EventEnum } from './enum/eventEnum'
;(async () => {
  await hookWrapper({
    eventBlacklist: [EventEnum.sendLog]
  })
})()

// hookIPC 必须在这里调用
exports.onBrowserWindowCreated = (window: Electron.CrossProcessExports.BrowserWindow) => {
  hookIPC(window)
}
