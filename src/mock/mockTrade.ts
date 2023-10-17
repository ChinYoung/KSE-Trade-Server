import { TTradePayload } from "../TradeManager"
import { nanoid } from "nanoid"
import { Decimal } from "@prisma/client/runtime/library"
import { createIdSet as pickFromList, randomBoolean, randomFactory } from "./utils"
import { random } from "lodash";
import { getDbConn } from "../database"

export function randomPrice(): Decimal {
  return new Decimal(Math.random())
}

export function randomTrade(): TTradePayload {
  const id = nanoid()
  return {
    tradeId: id,
    name: id,
    price: randomPrice(),
    status: randomFactory([{ threshold: 0.5, value: 'VALID' }, { threshold: 1, value: 'INVALID' }]),
    symbol: '¥',
    trader: 'random',
  }
}

const MAX_MOCK_COUNT: number = parseInt(process.env.MAX_MOCK_COUNT || '10')

export function mockNew<T>(factory: () => T): T[] {
  if (!randomBoolean()) {
    return []
  }
  const number = random(MAX_MOCK_COUNT)
  return Array.from({ length: number }).map(() => factory())
}

export async function pickTrades(count: number) {
  const [allId, total] = await Promise.all([
    getDbConn().trade.findMany({
      select: { id: true }
    }),
    getDbConn().trade.count()
  ])
  if (!(allId.length && total)) {
    return []
  }
  const toPickCount = random(count > total ? total : count)
  const pickedIdList = pickFromList(toPickCount, allId.map(_i => _i.id))
  return await getDbConn().trade.findMany({
    where: {
      id: {
        in: pickedIdList
      }
    },
    select: {
      id: true,
      tradeId: true,
      name: true,
      symbol: true,
      trader: true,
      price: true,
      status: true,
    }
  })
}

export function mockUpdates<T>(toUpdateList: T[], factory: (oldItem: T) => T): T[] {
  return toUpdateList.map(i => factory(i))
}

export async function mockBatchTrade() {
  const newItems = mockNew<TTradePayload>(randomTrade)
  // const newItems: TTradePayload[] = []
  const toUpdateItems = await pickTrades(MAX_MOCK_COUNT - newItems.length)
  const updatedItems = mockUpdates<TTradePayload>(
    toUpdateItems,
    (oldItem) => {
      const newItem = randomTrade()
      return {
        ...oldItem,
        price: newItem.price,
        status: newItem.status
      }
    }
  )
  return {
    newItems,
    updatedItems
  }
}
