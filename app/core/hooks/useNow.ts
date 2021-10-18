import { useEffect, useState } from "react"

let listeners: Array<ReturnType<typeof useState>[1]> = []
let now = new Date()

setInterval(() => {
  now = new Date()
  listeners.forEach((l) => l(now))
}, 1000)

export const useNow = () => {
  const newListener = useState()[1]
  useEffect(() => {
    listeners.push(newListener)
    return () => {
      listeners = listeners.filter((l) => l !== newListener)
    }
  }, [newListener])

  return now
}
