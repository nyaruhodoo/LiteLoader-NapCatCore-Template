export const enum IPCEventsEnum {
  // 收到新消息(只会收到已激活窗口消息)
  onRecvActiveMsg = 'nodeIKernelMsgListener/onRecvActiveMsg',
  // 激活聊天窗口
  activeMsg = 'nodeIKernelMsgService/getAioFirstViewLatestMsgsAndAddActiveChat'
}
