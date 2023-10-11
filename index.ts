import { getDbConn } from './src/database';
import { createInfinityMock } from './src/mock';
import { mockBatchTrade } from './src/mock/mockTrade';
import { TradeServer } from './src/server';
import { logTime } from './src/utils';
import { ERequestType, EResponseType, TRenderListPayload, TRequestDeleteINput as TRequestDeleteInput, TRequestRenderListInput, TUpdateTotalCountPayload } from './src/types/trade';

function startUp() {
  const server = new TradeServer()
  server.on<
    TRequestRenderListInput,
    EResponseType.RENDER_LIST,
    TRenderListPayload
  >(ERequestType.REQUEST_RENDER_LIST, async ({ context, eventData }) => {
    const { tradeManager } = context
    const { startIndex, endIndex } = eventData
    context.startIndex = startIndex
    context.endIndex = endIndex
    const trades = await tradeManager.getMany(startIndex, endIndex)
    return {
      eventName: EResponseType.RENDER_LIST,
      data: {
        trades,
        startIndex,
        endIndex
      },
    }
  })

  server.on<
    TRequestDeleteInput,
    EResponseType.RENDER_LIST,
    TRenderListPayload
  >(ERequestType.DELETE, async ({ context, eventData }) => {
    const { tradeManager, startIndex, endIndex } = context
    await tradeManager.deleteById(eventData)
    const trades = await tradeManager.getMany(startIndex, endIndex)
    return {
      eventName: EResponseType.RENDER_LIST,
      data: {
        trades,
        startIndex,
        endIndex
      },
    }
  })

  server.on<
    undefined,
    EResponseType.UPDATE_TOTAL_COUNT,
    TUpdateTotalCountPayload
  >(ERequestType.INIT, async ({ context }) => {
    const { tradeManager } = context
    const total = await tradeManager.count()
    return {
      eventName: EResponseType.UPDATE_TOTAL_COUNT,
      data: total,
    }
  })

  // mock to trigger changes
  const { startToMock, endMock } = createInfinityMock<Awaited<ReturnType<typeof mockBatchTrade>>>(
    async ({ newItems, updatedItems }) => {
      try {
        await logTime(
          async () => {
            const { startIndex, endIndex, tradeManager } = server.context
            const trades = await tradeManager.getMany(startIndex, endIndex)
            trades[10] && updatedItems[0] && (updatedItems[0].tradeId = trades[10].tradeId)
            trades[11] && updatedItems[1] && (updatedItems[1].tradeId = trades[11].tradeId)
            trades[12] && updatedItems[2] && (updatedItems[2].tradeId = trades[12].tradeId)
            trades[13] && updatedItems[3] && (updatedItems[3].tradeId = trades[13].tradeId)
            trades[14] && updatedItems[4] && (updatedItems[4].tradeId = trades[14].tradeId)
            await server.context.tradeManager.blendedUpdate({
              added: newItems,
              deleted: [],
              updated: updatedItems
            })
          },
        )
      } catch (err) {
        // err handler
      }
    },
    mockBatchTrade
  )
  startToMock()
  server.start()

  process.on('beforeExit', () => {
    endMock()
    getDbConn().$disconnect()
  })
}

startUp()
