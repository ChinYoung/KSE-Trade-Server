import { TTradeRecord } from "../TradeManager"

export enum ERequestType {
  REQUEST_RENDER_LIST = 'request-render-list',
  DELETE = 'delete',
  INIT = 'init'
}

export type TRequestRenderListInput = {
  startIndex: number
  endIndex: number,
}

export type TRequestDeleteINput = string

export enum EResponseType {
  SYNC_TRADES = 'sync-trades',
  UPDATE_TOTAL_COUNT = 'update-total-count',
  RENDER_LIST = 'response-render-list'
}

export type TRenderListPayload = {
  startIndex: number
  endIndex: number
  trades: TTradeRecord[]
}

export type TUpdateTotalCountPayload = number
