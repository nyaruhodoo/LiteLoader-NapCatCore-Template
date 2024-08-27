type SendRequestType = [
  string,
  {
    type: 'request'
    eventName: string
  },
  [
    {
      cmdName: string
      cmdType: string
      payload: any
    }
  ]
]
type SendResponseType = [
  string,
  {
    callbackId: string
    promiseStatue: 'full' | 'fail'
    type: 'response'
    eventName: string
  },
  any
]

export type SendArgsType = SendRequestType | SendResponseType

type IPCMessageRequestType = [
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
    [string?, ...any]
  ]
]
type IPCMessageResponseType = [
  IPCMessageRequestType[0],
  IPCMessageRequestType[1],
  IPCMessageRequestType[2],
  [SendResponseType[1], any]
]

export type IPCMessageArgsType = IPCMessageRequestType | IPCMessageResponseType
