import { random } from "lodash"

export type TThresholdVal<T> = {
  value: T,
  // the number should >= 0 and <= 1, ts can not limit the range of value now
  threshold: number
}

export function randomFactory<T>(configList: TThresholdVal<T>[]) {
  const random = Math.random()
  let i = 0
  while (i < configList.length - 1 && random > configList[i].threshold) {
    i++
  }
  return configList[i].value
}

export function randomBoolean() {
  const random = Math.random()
  return random > 0.5
  // return false
}

export function createIdSet(toPickCount: number, allItem: number[]) {
  const listLength = allItem.length
  const maxIndex = listLength - 1
  for (let i = 0; i < toPickCount; i++) {
    const pickedIndex = random(maxIndex - i)
    const pickedValue = allItem[pickedIndex]
    const toSwitchIndex = maxIndex - i
    allItem[pickedIndex] = allItem[toSwitchIndex]
    allItem[toSwitchIndex] = pickedValue
  }
  return allItem.slice(listLength - toPickCount)
}
