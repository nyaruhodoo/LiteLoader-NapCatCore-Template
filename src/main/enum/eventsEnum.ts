export enum Events {
  // QQ的日志
  sendLog = 'NodeIQQNTWrapperSession.getNodeMiscService.sendLog',

  // 请求广告?
  requestTianshuAdv = 'NodeIQQNTWrapperSession.getMsgService.requestTianshuAdv',

  // 登录成功，能拿到 uin,uid
  onQRCodeLoginSucceed = 'NodeIKernelLoginListener.onQRCodeLoginSucceed',

  // 个人信息发生变更，能拿到完整的用户数据
  onUserDetailInfoChanged = 'NodeIKernelProfileListener.onUserDetailInfoChanged',

  // 初始化获取个人数据(无nickName)
  onSelfStatusChanged = 'NodeIKernelProfileListener.onSelfStatusChanged',

  // 本地登陆过的用户(uid，uid，nickname全拿得到)
  getLoginList = 'NodeIKernelLoginService.getLoginList',

  // 收到新消息
  onRecvMsg = 'NodeIKernelMsgListener.onRecvMsg',
  // 最近联系人更改
  onRecentContactListChangedVer2 = 'NodeIKernelRecentContactListener.onRecentContactListChangedVer2',
  // 收到新消息后的系统通知
  onRecentContactNotification = 'NodeIKernelRecentContactListener.onRecentContactNotification',
  // 未读消息更新
  onContactUnreadCntUpdate = 'NodeIKernelMsgListener.onContactUnreadCntUpdate'
}
