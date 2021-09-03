import { useQuery } from "blitz"
import getCurrentPomodoro from "app/pomodoros/queries/getCurrentPomodoro"
import getPomodoros from "app/pomodoros/queries/getPomodoros"
import getCurrentBreakTime from "app/break-times/queries/getCurrentBreakTime"
import { BreakTime, Pomodoro, Task } from "db"
import getBreakTimes from "app/break-times/queries/getBreakTimes"

type SetQuery = (newData: {
  currentPomodoro?:
    | (Pomodoro & {
        tasks: Task[]
      })
    | null
  currentBreakTime?: BreakTime | null
}) => Promise<void>

type QueryCacheFunctions = {
  setQuery: SetQuery
}

type CurrentActivity = {
  currentPomodoro:
    | (Pomodoro & {
        tasks: Task[]
      })
    | null
  currentBreakTime: BreakTime | null
}

export const useCurrentActivity = (): [CurrentActivity, QueryCacheFunctions] => {
  const [currentPomodoro, { setQueryData: setCurrentPomodoroQueryData }] = useQuery(
    getCurrentPomodoro,
    null
  )

  const [currentBreakTime, { setQueryData: setCurrentBreakTimeQueryData }] = useQuery(
    getCurrentBreakTime,
    null
  )

  const setQuery: SetQuery = async ({ currentPomodoro, currentBreakTime }) => {
    if (currentPomodoro !== undefined) {
      await setCurrentPomodoroQueryData(currentPomodoro)
    }

    if (currentBreakTime !== undefined) {
      await setCurrentBreakTimeQueryData(currentBreakTime)
    }
  }
  return [{ currentPomodoro, currentBreakTime }, { setQuery }]
}

export const useCurrentActivityB = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [{ pomodoros: todaysPomodoros }] = useQuery(getPomodoros, {
    where: { createdAt: { gte: today } },
    orderBy: { createdAt: "asc" },
  })

  const [{ breakTimes: todaysBreaks }] = useQuery(getBreakTimes, {
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
    const latestActivity = currentSet[currentSet.length - 1]
    if (latestActivity!.stoppedAt) {
      return null
    } else if (currentSet.length % 2) {
      return {
        type: "pomodoro" as const,
        activity: latestActivity as Pomodoro,
      }
    } else {
      return {
        type: "break" as const,
        activity: latestActivity as BreakTime,
      }
    }
  }
}
