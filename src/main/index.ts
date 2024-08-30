import { hookWrapper } from '@/main/hook/hookWrapper'
import { hookIPC } from './hook/hookIPC'

// 用于初始化 NTcore
;(async () => {
  await hookWrapper()
})()

// hookIPC 必须在这里调用
exports.onBrowserWindowCreated = (window: Electron.CrossProcessExports.BrowserWindow) => {
  hookIPC(window)
}
