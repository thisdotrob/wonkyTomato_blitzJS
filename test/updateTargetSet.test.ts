import { TARGET, updateTargetSet } from "./updateTargetSet"

const sum = (arr) => arr.reduce((acc, elem) => acc + elem, 0)

describe("updateTargetSet", () => {
  describe("when there are no pomodoros or breaks", () => {
    const set = { pomodoros: [], breaks: [] }
    it("returns the target", () => {
      expect(updateTargetSet(set)).toEqual(TARGET)
    })
  })
  describe("when there is one pomodoro, no breaks", () => {
    const set = { pomodoros: [35], breaks: [] }
    it("adjusts the second and third pomodoros", () => {
      const newTarget = updateTargetSet(set)
      expect(newTarget.pomodoros).toEqual([35, 20, 20])
    })
    it("adjusts the breaks", () => {
      const newTarget = updateTargetSet(set)
      expect(newTarget.breaks[0]).toEqual(7) // 5 * 35 / 25
      expect(newTarget.breaks[1]).toEqual(4) // 5 * 20 / 25
      expect(newTarget.breaks[2]).toEqual(14) // 25 - 7 - 4
    })
    it("has totals equal to the target", () => {
      const newTarget = updateTargetSet(set)
      expect(sum(newTarget.pomodoros)).toEqual(sum(TARGET.pomodoros))
      expect(sum(newTarget.breaks)).toEqual(sum(TARGET.breaks))
    })
  })
  describe("when there is one pomodoro, one break", () => {
    const set = { pomodoros: [35], breaks: [10] }
    it("returns the same pomodoros", () => {
      const newTarget = updateTargetSet(set)
      expect(newTarget.pomodoros).toEqual([35, 20, 20])
    })
    it("adjusts the breaks", () => {
      const newTarget = updateTargetSet(set)
      expect(newTarget.breaks[0]).toEqual(10)
      expect(newTarget.breaks[1]).toEqual(4)
      expect(newTarget.breaks[2]).toEqual(11) // 25 - 10 - 4
    })
    it("has totals equal to the target", () => {
      const newTarget = updateTargetSet(set)
      expect(sum(newTarget.pomodoros)).toEqual(sum(TARGET.pomodoros))
      expect(sum(newTarget.breaks)).toEqual(sum(TARGET.breaks))
    })
  })
  describe("when there is two pomodoro, one break", () => {
    const set = { pomodoros: [35, 25], breaks: [10] }
    it("adjusts the pomodoros", () => {
      const newTarget = updateTargetSet(set)
      expect(newTarget.pomodoros[0]).toEqual(35)
      expect(newTarget.pomodoros[1]).toEqual(25)
      expect(newTarget.pomodoros[2]).toEqual(15) // (35 + 20 + 20) - (35 + 25)
    })
    it("adjusts the breaks", () => {
      const newTarget = updateTargetSet(set)
      expect(newTarget.breaks[0]).toEqual(10)
      expect(newTarget.breaks[1]).toEqual(5) // 4 * 25 / 20
      expect(newTarget.breaks[2]).toEqual(10) // 25 - 10 - 5
    })
    it("has totals equal to the target", () => {
      const newTarget = updateTargetSet(set)
      expect(sum(newTarget.pomodoros)).toEqual(sum(TARGET.pomodoros))
      expect(sum(newTarget.breaks)).toEqual(sum(TARGET.breaks))
    })
  })
  describe("when there is two pomodoro, two break", () => {
    const set = { pomodoros: [35, 25], breaks: [10, 6] }
    it("returns the same pomodoros", () => {
      const newTarget = updateTargetSet(set)
      expect(newTarget.pomodoros).toEqual([35, 25, 15])
    })
    it("adjusts the breaks", () => {
      const newTarget = updateTargetSet(set)
      expect(newTarget.breaks[0]).toEqual(10)
      expect(newTarget.breaks[1]).toEqual(6)
      expect(newTarget.breaks[2]).toEqual(9) // 25 - 10 - 6
    })
    it("has totals equal to the target", () => {
      const newTarget = updateTargetSet(set)
      expect(sum(newTarget.pomodoros)).toEqual(sum(TARGET.pomodoros))
      expect(sum(newTarget.breaks)).toEqual(sum(TARGET.breaks))
    })
  })
  describe("when there is three pomodoro, two breaks", () => {
    const set = { pomodoros: [35, 25, 27], breaks: [10, 6] }
    it("returns the same pomodoros", () => {
      const newTarget = updateTargetSet(set)
      expect(newTarget.pomodoros).toEqual(set.pomodoros)
    })
    it("adjusts the breaks", () => {
      const newTarget = updateTargetSet(set)
      expect(newTarget.breaks[0]).toEqual(10)
      expect(newTarget.breaks[1]).toEqual(6)
      expect(newTarget.breaks[2]).toEqual(13) // (25 * 87 / 75) - 10 - 6
    })
  })
})
