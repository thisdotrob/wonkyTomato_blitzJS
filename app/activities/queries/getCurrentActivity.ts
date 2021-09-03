import { resolver } from "blitz"
import { BreakTime, Pomodoro } from "db"
import db from "db"
import { z } from "zod"

const TARGET = [25, 5, 25, 5, 25, 15] as const

const sumPomodoros = (arr) =>
  arr.reduce((acc, elem, i) => {
    if (!(i % 2)) {
      return acc + elem
    } else {
      return acc
    }
  }, 0)

const sumBreaks = (arr) =>
  arr.reduce((acc, elem, i) => {
    if (i % 2) {
      return acc + elem
    } else {
      return acc
    }
  }, 0)

export function getNextActivityLength(set) {
  if (set.length === 0) {
    return TARGET[0]
  }

  if (set.length === 1) {
    return (TARGET[1] * set[0]) / TARGET[0]
  }

  if (set.length === 2) {
    return (sumPomodoros(TARGET) - set[0]) * (TARGET[2] / (TARGET[2] + TARGET[4]))
  }

  if (set.length === 3) {
    const targetPomodoro1 = (sumPomodoros(TARGET) - set[0]) * (TARGET[2] / (TARGET[2] + TARGET[4]))

    return (((TARGET[3] * targetPomodoro1) / TARGET[2]) * set[2]) / targetPomodoro1
  }

  if (set.length === 4) {
    return sumPomodoros(TARGET) - sumPomodoros(set)
  }

  return (sumBreaks(TARGET) * sumPomodoros(set)) / sumPomodoros(TARGET) - sumBreaks(set)
}

const GetCurrentActivity = z.any()

export default resolver.pipe(resolver.zod(GetCurrentActivity), resolver.authorize(), async () => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaysPomodoros = await db.pomodoro.findMany({
    where: { createdAt: { gte: today } },
    orderBy: { createdAt: "asc" },
  })

  const todaysBreaks = await db.breakTime.findMany({
    where: { createdAt: { gte: today } },
    orderBy: { createdAt: "asc" },
  })

  const interspersed: (Pomodoro | BreakTime)[] = []

  for (let i = 0; i < todaysPomodoros.length; i++) {
    interspersed.push(todaysPomodoros[i]!)
    if (todaysBreaks[i]) {
      interspersed.push(todaysBreaks[i]!)
    }
  }

  const setLength = 6

  const sets: (Pomodoro | BreakTime)[][] = []

  for (let i = 0; i < interspersed.length; i += setLength) {
    sets.push(interspersed.slice(i, i + setLength))
  }

  const currentSet = sets[sets.length - 1]

  if (!currentSet) {
    return null
  } else {
    const currentSetDurations = currentSet
      .filter((activity) => !!activity.stoppedAt)
      .map((activity) => (activity.stoppedAt!.getTime() - activity.createdAt.getTime()) / 1000 / 60)

    const suggestedLength = getNextActivityLength(currentSetDurations).toFixed()

    const latestActivity = currentSet[currentSet.length - 1]

    if (latestActivity!.stoppedAt) {
      return null
    } else if (currentSet.length % 2) {
      return {
        type: "pomodoro" as const,
        activity: latestActivity as Pomodoro,
        suggestedLength,
      }
    } else {
      return {
        type: "break" as const,
        activity: latestActivity as BreakTime,
        suggestedLength,
      }
    }
  }
})
