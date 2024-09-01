import { hookWrapper } from '@/main/hook/hookWrapper'
import { EventEnum } from './enum/eventEnum'
;(async () => {
  await hookWrapper({
    eventBlacklist: [EventEnum.sendLog, EventEnum.requestTianshuAdv],
    log: false
  })
})()

// Hook IPC 必须在 onBrowserWindowCreated 中调用
// exports.onBrowserWindowCreated = (window: Electron.CrossProcessExports.BrowserWindow) => {
//   // window 为 Electron 的 BrowserWindow 实例
//   hookIPC(window)
// }
