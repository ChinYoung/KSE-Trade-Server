import { random } from "lodash";

type TEmitter<T> = (updates: T) => void
type TUpdateFactory<T> = () => T | Promise<T>

export async function generateUpdates<T>(emitter: TEmitter<T>, newItemFactory: TUpdateFactory<T>, setTimer: (timer: NodeJS.Timeout) => void) {
  // emit new updates
  const updates = await newItemFactory()
  emitter(updates)
  // set a new timer for next updates
  setTimer(setTimeout(() => {
    generateUpdates(emitter, newItemFactory, setTimer)
  }, random(100, 1000)))
}

export function createInfinityMock<T>(emitter: TEmitter<T>, newItemFactory: TUpdateFactory<T>) {
  let timer: null | NodeJS.Timeout = null
  return {
    startToMock: () => {
      generateUpdates(emitter, newItemFactory, (newTimer) => timer = newTimer)
    },
    endMock: () => {
      timer && clearTimeout(timer)
    }
  }
}
