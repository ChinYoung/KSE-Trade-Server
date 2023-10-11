import { Server } from "socket.io";
import { ERequestType, EResponseType } from "./types/trade";
import { TradeChangeEvent, TradeManager } from "./TradeManager";

export type TResponse<T extends EResponseType, D> = {
  eventName: T,
  data: D
}

export type TTradeContext = {
  startIndex: number
  endIndex: number
  tradeManager: TradeManager
}

type THandlerInput<T> = {
  context: TTradeContext
  eventData: T
}

export type TTradeEventHandler<I, R = undefined, D = undefined> = (props: THandlerInput<I>) => R extends EResponseType ? (undefined | TResponse<R, D> | Promise<TResponse<R, D> | undefined>) : undefined


interface ITradeServer {
  context: TTradeContext
  on<I, R extends EResponseType | undefined, D = undefined>(requestEventName: ERequestType, handler: TTradeEventHandler<I, R, D>): void
  emit<T extends EResponseType, D>(responseConfig: TResponse<T, D>): void
}

export class TradeServer implements ITradeServer {
  private serverInstance: Server = new Server({ cors: { origin: '*' } })
  context = {
    startIndex: 0,
    endIndex: 0,
    tradeManager: new TradeManager()
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handlerMap: Record<ERequestType, TTradeEventHandler<any, any, any>> | null = null
  // TODO: read by env
  private port = 888

  constructor() {
    this.serverInstance.on('connection', (socket) => {
      this.handlerMap && Object.entries(this.handlerMap).forEach(([eventName, handler]) => {
        socket.on(eventName, async (ev) => {
          const res = await handler({ eventData: ev, context: this.context })
          if (!res) {
            return
          }
          const { data, eventName } = res
          this.serverInstance.sockets.emit(eventName, data)
        })
      })
    })
  }

  start() {
    this.serverInstance.listen(this.port)
    this.context.tradeManager.tradeChanges.subscribe(this.tradeChangeHandler.bind(this))
    console.log('server started')
  }

  private async tradeChangeHandler({ added, deleted }: TradeChangeEvent) {
    const { endIndex, startIndex } = this.context
    const trades = await this.context.tradeManager.getMany(startIndex, endIndex)
    this.emit({ eventName: EResponseType.RENDER_LIST, data: { startIndex, endIndex, trades } })
    if (added.length || deleted.length) {
      const totalCount = await this.context.tradeManager.count()
      this.emit({ eventName: EResponseType.UPDATE_TOTAL_COUNT, data: totalCount })
    }
  }

  on<I = undefined, T = undefined, D = undefined>(eventName: ERequestType, handler: TTradeEventHandler<I, T, D>) {
    this.handlerMap = {
      ...this.handlerMap ?? {},
      [eventName]: handler
    }
  }

  emit<T extends EResponseType, D>({ eventName, data }: TResponse<T, D>) {
    this.serverInstance.emit(eventName, data)
  }
}
