import { Suspense, useState } from "react"
import { useMutation } from "blitz"
import {
  Box,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Text,
  VStack,
  HStack,
  Button,
} from "@chakra-ui/react"
import updatePomodoro from "app/pomodoros/mutations/updatePomodoro"
import { BreakTime, Pomodoro } from "db"

type EditActivityDurationProps = {
  onCancel: () => void
  onSave: () => void
  activity: Pomodoro | BreakTime
}

export const EditActivityDuration = (props: EditActivityDurationProps) => {
  const [updatePomodoroMutation] = useMutation(updatePomodoro)
  const { onCancel, onSave, activity } = props

  const rangeStartDate = new Date(activity.createdAt)
  rangeStartDate.setMilliseconds(0)
  rangeStartDate.setSeconds(0)
  const rangeStart = rangeStartDate.getTime() - 1000 * 60 * 30 // 30 mins

  const rangeEndDate = new Date(activity.stoppedAt!)
  rangeEndDate.setMilliseconds(0)
  rangeEndDate.setSeconds(0)
  const rangeEnd = rangeEndDate.getTime() + 1000 * 60 * 30

  const normalisedCreatedAt = new Date(activity.createdAt)
  normalisedCreatedAt.setMilliseconds(0)
  normalisedCreatedAt.setSeconds(0)

  const normalisedStoppedAt = new Date(activity.stoppedAt!)
  normalisedStoppedAt.setMilliseconds(0)
  normalisedStoppedAt.setSeconds(0)

  const [[start, end], setStartEnd] = useState([normalisedCreatedAt, normalisedStoppedAt])

  const save = async () => {
    await updatePomodoroMutation({ id: activity.id, createdAt: start, stoppedAt: end })
    onSave()
  }

  const defaultValue = [activity.createdAt.getTime(), activity.stoppedAt!.getTime()]

  const hasChanges = defaultValue[0] !== start.getTime() || defaultValue[1] !== end.getTime()

  return (
    <VStack width={400}>
      <RangeSlider
        step={1000 * 60} // minute
        onChange={(val: [number, number]) => setStartEnd([new Date(val[0]), new Date(val[1])])}
        min={rangeStart}
        max={rangeEnd}
        defaultValue={defaultValue}
        marginBottom={3}
      >
        <RangeSliderTrack>
          <RangeSliderFilledTrack />
        </RangeSliderTrack>
        <RangeSliderThumb boxSize={10} index={0}>
          <Box>
            <Text fontSize="xs">{start.toLocaleTimeString().substring(0, 5)}</Text>
          </Box>
        </RangeSliderThumb>
        <RangeSliderThumb boxSize={10} index={1}>
          <Box>
            <Text fontSize="xs">{end.toLocaleTimeString().substring(0, 5)}</Text>
          </Box>
        </RangeSliderThumb>
      </RangeSlider>
      <HStack>
        <Button size="sm" disabled={!hasChanges} onClick={save}>
          Save
        </Button>
        <Button size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </HStack>
    </VStack>
  )
}
