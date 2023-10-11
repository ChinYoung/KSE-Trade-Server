import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { Subject } from "rxjs";
import { getDbConn } from "../database";

export const tradeSelector = {
  tradeId: true,
  name: true,
  symbol: true,
  trader: true,
  price: true,
  status: true,
} satisfies Prisma.TradeSelect

export type TTradePayload = Prisma.TradeGetPayload<{ select: typeof tradeSelector }>

export const tradeRecordSelector = {
  id: true,
  tradeId: true,
  name: true,
  symbol: true,
  trader: true,
  prevPrice: true,
  price: true,
  status: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.TradeSelect

export type TTradeRecord = Prisma.TradeGetPayload<{ select: typeof tradeRecordSelector }>

export type TradeChangeEvent = {
  updated: TTradePayload[],
  added: TTradePayload[],
  deleted: TTradePayload[]
}

export class TradeManager {
  tradeChanges = new Subject<TradeChangeEvent>()
  private dbConn = getDbConn()

  async blendedUpdate(updates: TradeChangeEvent) {
    const { added, deleted, updated } = updates
    const settleResults = await Promise.allSettled([
      this.update(updated),
      this.addMany(added),
      this.deleteMany(deleted)
    ])
    settleResults.filter(_i => _i.status === 'rejected').forEach((i) => {
      // handle failed result here
      console.log(i)
    })
    const [updateResult, addResult, deleteResult] = settleResults
    this.tradeChanges.next({
      updated: updateResult.status === 'fulfilled' ? updated : [],
      added: addResult.status === 'fulfilled' ? added : [],
      deleted: deleteResult.status === 'fulfilled' ? deleted : []
    })
  }

  async update(updatedTrades: TTradePayload[]) {
    if (!updatedTrades.length) {
      return 0
    }
    const now = dayjs().format()
    return await this.dbConn.$executeRaw`
    INSERT INTO Trade (symbol, tradeId, name, trader, price, status, updatedAt)
    VALUES ${Prisma.join(updatedTrades.map(_u => Prisma.sql`(${_u.symbol}, ${_u.tradeId}, ${_u.name} ,${_u.trader}, ${_u.price}, ${_u.status}, ${now})`))}
    AS NewTrade ON DUPLICATE KEY UPDATE
      prevPrice=Trade.price,
      price=NewTrade.price,
      status=NewTrade.status,
      updatedAt=NewTrade.updatedAt
    `
  }

  async addMany(newTrades: TTradePayload[]) {
    return await this.dbConn.trade.createMany({
      data: newTrades
    })
  }

  async deleteMany(deletedTrades: TTradePayload[]) {
    return await this.dbConn.trade.deleteMany({
      where: {
        tradeId: {
          in: deletedTrades.map(_i => _i.tradeId)
        }
      },
    })
  }

  async deleteById(tradeId: string) {
    return await this.dbConn.trade.delete({
      where: {
        tradeId
      }
    })
  }

  async getMany(startIndex: number, endIndex: number) {
    return await this.dbConn.trade.findMany({
      skip: startIndex,
      take: endIndex - startIndex,
      select: tradeRecordSelector
    })
  }

  async count() {
    return await this.dbConn.trade.count()
  }

}
