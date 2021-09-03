import { getNextActivityLength } from "../getCurrentActivity"

describe("getNextActivityLength", () => {
  describe("when there are no pomodoros or breaks", () => {
    const set = []
    it("returns the target pomodoro length", () => {
      expect(getNextActivityLength(set)).toEqual(25)
    })
  })
  describe("when there is one pomodoro, no breaks", () => {
    const set = [35]
    it("returns an adjusted break length", () => {
      expect(getNextActivityLength(set)).toEqual(7)
    })
  })
  describe("when there is one pomodoro, one break", () => {
    const set = [35, 10]
    it("returns an adjusted pomodoro length", () => {
      expect(getNextActivityLength(set)).toEqual(20)
    })
  })
  describe("when there is two pomodoro, one break", () => {
    const set = [35, 10, 25]
    it("returns adjusted break length", () => {
      expect(getNextActivityLength(set)).toEqual(5)
    })
  })
  describe("when there is two pomodoro, two break", () => {
    const set = [35, 10, 25, 6]
    it("returns adjusted pomodoro length", () => {
      expect(getNextActivityLength(set)).toEqual(15)
    })
  })
  describe("when there is three pomodoro, two breaks", () => {
    const set = [35, 10, 25, 6, 27]
    it("returns adjusted break length", () => {
      expect(getNextActivityLength(set)).toEqual(13) // (25 * 87 / 75) - 10 - 6
    })
  })
  describe("sticking to target", () => {
    it("should suggest target lengths", () => {
      let set: number[] = []
      let nextActivityLength = getNextActivityLength(set)
      expect(nextActivityLength).toEqual(25)
      set = [nextActivityLength]
      nextActivityLength = getNextActivityLength(set)
      expect(nextActivityLength).toEqual(5)
      set = [...set, nextActivityLength]
      nextActivityLength = getNextActivityLength(set)
      expect(nextActivityLength).toEqual(25)
      set = [...set, nextActivityLength]
      nextActivityLength = getNextActivityLength(set)
      expect(nextActivityLength).toEqual(5)
      set = [...set, nextActivityLength]
      nextActivityLength = getNextActivityLength(set)
      expect(nextActivityLength).toEqual(25)
      set = [...set, nextActivityLength]
      nextActivityLength = getNextActivityLength(set)
      expect(nextActivityLength).toEqual(15)
    })
  })
})
