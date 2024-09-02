import { wrapperEmitter } from './hook/hookWrapper'

export const initForward = () => {
  wrapperEmitter.addListener(
    'NodeIQQNTWrapperSession/create/getMsgService/addKernelMsgListener/onAddSendMsg',
    (data) => {
      console.log(JSON.stringify(data))
    }
  )
}
