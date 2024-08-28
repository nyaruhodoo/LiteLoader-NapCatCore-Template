type SendRequestType<T = any> = [
  string,
  {
    type: 'request'
    eventName: string
  },
  [
    {
      cmdName: string
      cmdType: string
      payload: T
    }
  ]
]
type SendResponseType<T = any> = [
  string,
  {
    callbackId: string
    promiseStatue: 'full' | 'fail'
    type: 'response'
    eventName: string
  },
  T
]

export type SendArgsType = SendRequestType | SendResponseType

type IPCMessageRequestType<T = [...any]> = [
  {
    frameId: number
    processId: number
  },
  boolean,
  string,
  [
    {
      type: 'request'
      callbackId: string
      eventName: string
    },
    [string?, ...T]
  ]
]
type IPCMessageResponseType<T = any> = [
  IPCMessageRequestType[0],
  IPCMessageRequestType[1],
  IPCMessageRequestType[2],
  [SendResponseType[1], T]
]

export type IPCMessageArgsType = IPCMessageRequestType | IPCMessageResponseType
