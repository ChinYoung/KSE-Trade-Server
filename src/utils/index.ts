import dayjs from "dayjs";

export async function logTime<T = undefined>(fn: () => T | Promise<T>): Promise<T | undefined> {
  const now = dayjs().valueOf()
  try {
    const res = await fn()
    console.log('cost in total: ', dayjs().valueOf() - now, 'ms', '\n')
    return res
  } catch (err) {
    console.log("🚀 ~ file: index.ts:9 ~ logTime ~ err:", err)
  }
}
