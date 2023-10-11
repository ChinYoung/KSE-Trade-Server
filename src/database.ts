import { PrismaClient } from '@prisma/client'
let conn: PrismaClient | null = null

export function getDbConn(): PrismaClient {
  if (!conn) {
    conn = new PrismaClient()
  }
  return conn
}
