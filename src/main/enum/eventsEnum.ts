export enum Events {
  // QQ的日志
  sendLog = 'NodeIQQNTWrapperSession.getNodeMiscService.sendLog',

  // 请求广告?
  requestTianshuAdv = 'NodeIQQNTWrapperSession.getMsgService.requestTianshuAdv',

  // 个人信息发生变更，能拿到完整的用户数据
  onUserDetailInfoChanged = 'NodeIKernelProfileListener.onUserDetailInfoChanged',

  // 初始化获取个人数据(无nickName)
  onSelfStatusChanged = 'NodeIKernelProfileListener.onSelfStatusChanged',

  // 本地登陆过的用户
  getLoginList = 'NodeIKernelLoginService.getLoginList',

  // 初始化的时候可以获取到用户名(好像是qq小世界的...)
  onRefreshGuildUserProfileInfo = 'NodeIKernelGuildListener.onRefreshGuildUserProfileInfo',

  // 收到新消息
  onRecvMsg = 'NodeIKernelMsgListener.onRecvMsg'
}
