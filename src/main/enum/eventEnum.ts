export const enum EventEnum {
  //----------------- * Wrapper 部分 * -----------------

  // QQ的日志
  sendLog = 'NodeIQQNTWrapperSession.getNodeMiscService.sendLog',

  // 请求广告?
  requestTianshuAdv = 'NodeIQQNTWrapperSession.getMsgService.requestTianshuAdv',

  // 登录成功，能拿到 uin,uid
  onQRCodeLoginSucceed = 'NodeIKernelLoginListener.onQRCodeLoginSucceed',

  // 个人信息发生变更，能拿到完整的用户数据
  onUserDetailInfoChanged = 'NodeIKernelProfileListener.onUserDetailInfoChanged',

  // 本地登陆过的用户(uid，uid，nickname全拿得到)
  getLoginList = 'NodeIKernelLoginService.getLoginList',

  // 收到新消息
  onRecvMsg = 'NodeIKernelMsgListener.onRecvMsg',

  // 检测更新
  onUnitedConfigUpdate = `NodeIKernelUnitedConfigListener.onUnitedConfigUpdate`,

  //----------------- * IPC 部分 * -----------------

  // 收到新消息(只会收到已激活窗口消息)
  onRecvActiveMsg = 'nodeIKernelMsgListener/onRecvActiveMsg'
}
