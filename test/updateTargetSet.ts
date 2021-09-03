export const TARGET = { pomodoros: [25, 25, 25], breaks: [5, 5, 15] } as const

const sum = (arr) => arr.reduce((acc, elem) => acc + elem, 0)

export function updateTargetSet(set) {
  if (set.pomodoros.length === 0) {
    return TARGET
  }

  if (set.pomodoros.length === 1 && set.breaks.length === 0) {
    const remainingTarget = {
      pomodoros: sum(TARGET.pomodoros) - sum(set.pomodoros),
      breaks: sum(TARGET.breaks) - sum(set.breaks),
    }
    const pomodoros = [
      set.pomodoros[0],
      remainingTarget.pomodoros *
        (TARGET.pomodoros[1] / (TARGET.pomodoros[1] + TARGET.pomodoros[2])),
      remainingTarget.pomodoros *
        (TARGET.pomodoros[2] / (TARGET.pomodoros[1] + TARGET.pomodoros[2])),
    ]
    return {
      pomodoros,
      breaks: [
        (TARGET.breaks[0] * pomodoros[0]) / TARGET.pomodoros[0],
        (TARGET.breaks[1] * pomodoros[1]) / TARGET.pomodoros[1],
        sum(TARGET.breaks) -
          ((TARGET.breaks[0] + TARGET.breaks[1]) * (pomodoros[0] + pomodoros[1])) /
            (TARGET.pomodoros[0] + TARGET.pomodoros[1]),
      ],
    }
  }

  if (set.pomodoros.length === 1 && set.breaks.length === 1) {
    const target = updateTargetSet({ pomodoros: set.pomodoros, breaks: [] })
    return {
      pomodoros: target.pomodoros,
      breaks: [
        set.breaks[0],
        target.breaks[1],
        sum(target.breaks) - set.breaks[0] - target.breaks[1],
      ],
    }
  }

  if (set.pomodoros.length === 2 && set.breaks.length === 1) {
    const target = updateTargetSet({ pomodoros: [set.pomodoros[0]], breaks: [set.breaks[0]] })
    const remainingTarget = {
      pomodoros: sum(target.pomodoros) - sum(set.pomodoros),
      breaks: sum(target.breaks) - sum(set.breaks),
    }
    return {
      pomodoros: [set.pomodoros[0], set.pomodoros[1], remainingTarget.pomodoros],
      breaks: [
        set.breaks[0],
        (target.breaks[1] * set.pomodoros[1]) / target.pomodoros[1],
        sum(target.breaks) -
          set.breaks[0] -
          (target.breaks[1] * set.pomodoros[1]) / target.pomodoros[1],
      ],
    }
  }

  if (set.pomodoros.length === 2 && set.breaks.length === 2) {
    const target = updateTargetSet({ pomodoros: set.pomodoros, breaks: [set.breaks[0]] })
    const remainingTarget = {
      pomodoros: sum(target.pomodoros) - sum(set.pomodoros),
      breaks: sum(target.breaks) - sum(set.breaks),
    }
    return {
      pomodoros: target.pomodoros,
      breaks: [set.breaks[0], set.breaks[1], remainingTarget.breaks],
    }
  }

  if (set.pomodoros.length === 3 && set.breaks.length === 2) {
    const target = updateTargetSet({
      pomodoros: [set.pomodoros[0], set.pomodoros[1]],
      breaks: set.breaks,
    })
    return {
      pomodoros: set.pomodoros,
      breaks: [
        set.breaks[0],
        set.breaks[1],
        (sum(target.breaks) * sum(set.pomodoros)) / sum(target.pomodoros) - sum(set.breaks),
      ],
    }
  }
}

// Start day:
//  Create PomodoroA
//  Create set: { pomodoros: [], breaks: [] }
//  Create target: { pomodoros: [25,25,25]. breaks: [5,5,15] }
//  Display suggested length of 25
//
// Finish 1st Pomodoro (35 mins):
//  Update PomodoroA with stoppedAt
//  Update set: { pomodoros: ['pomodoroA_ID'], breaks: [] }
//  Update target: { pomodoros: [30,20,20], breaks: [7, 4, 14] }
//  Create BreakA
//  Display suggested length of 7
//
// Finish 1st Break (10 mins):
//  Update BreakA with stoppedAt
//  Update set: { pomodoros: ['pomodoroA_ID'], breaks: ['breakA_ID'] }
//  Update target: { pomodoros: [30,20,20], breaks: [10, 4, 11] }
//  Create PomodoroB
//  Display suggested length of 20
