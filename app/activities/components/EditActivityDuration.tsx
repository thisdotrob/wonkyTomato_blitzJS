import { useState } from "react"
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
  useColorModeValue,
} from "@chakra-ui/react"
import updatePomodoro from "app/pomodoros/mutations/updatePomodoro"
import updateBreakTime from "app/break-times/mutations/updateBreakTime"
import { BreakTime, Pomodoro, Task } from "db"

const MINUTE = 1000 * 60

const calcRange = ({
  prevRange,
  duration,
}: {
  prevRange: [number, number]
  duration: [number, number]
}): [number, number] => {
  const prevRangeLength = prevRange[1] - prevRange[0]

  const gaps = [duration[0] - prevRange[0], prevRange[1] - duration[1]]

  if (gaps.some((g) => g < 0.1 * prevRangeLength)) {
    if (prevRangeLength === 15 * MINUTE) {
      return [prevRange[0] - 7.5 * MINUTE, prevRange[1] + 7.5 * MINUTE]
    } else if (prevRangeLength === 30 * MINUTE) {
      return [prevRange[0] - 45 * MINUTE, prevRange[1] + 45 * MINUTE]
    } else if (prevRangeLength === 120 * MINUTE) {
      return [prevRange[0] - 60 * MINUTE, prevRange[1] + 60 * MINUTE]
    } else {
      return prevRange
    }
  } else if (gaps.some((g) => g > 0.4 * prevRangeLength)) {
    if (prevRangeLength === 240 * MINUTE) {
      return [prevRange[0] + 60 * MINUTE, prevRange[1] - 60 * MINUTE]
    } else if (prevRangeLength === 120 * MINUTE) {
      return [prevRange[0] + 45 * MINUTE, prevRange[1] - 45 * MINUTE]
    } else if (prevRangeLength === 30 * MINUTE) {
      return [prevRange[0] + 7.5 * MINUTE, prevRange[1] - 7.5 * MINUTE]
    } else {
      return prevRange
    }
  } else {
    return prevRange
  }
}

const calcInitialRange = ({ duration }) => {
  let range: [number, number] | null = null
  const midpoint = (duration[0] + duration[1]) / 2
  let nextRange: [number, number] = [midpoint - 15 * MINUTE, midpoint + 15 * MINUTE]
  while (range !== nextRange) {
    range = nextRange
    nextRange = calcRange({ prevRange: range, duration })
  }
  return range
}

const RangeSliderThumbFixed = (props: Parameters<typeof RangeSliderThumb>[0]) => {
  const bg = useColorModeValue("white", "gray.700")
  return <RangeSliderThumb bg={bg} {...props} />
}

type EditActivityDurationProps = {
  onCancel?: () => void
  onSave?: () => void
  activity: (Pomodoro & { tasks: Task[] }) | BreakTime
  spacing: number
}

export const EditActivityDuration = (props: EditActivityDurationProps) => {
  const { onCancel, onSave, activity, spacing } = props

  const [updatePomodoroMutation] = useMutation(updatePomodoro)
  const [updateBreakTimeMutation] = useMutation(updateBreakTime)

  const defaultValue: [number, number] = [
    activity.createdAt.getTime(),
    activity.stoppedAt!.getTime(),
  ]

  const [duration, setDuration] = useState(defaultValue)

  const hasChanges = defaultValue[0] !== duration[0] || defaultValue[1] !== duration[1]

  const getInitialRange = () => {
    return calcInitialRange({ duration: defaultValue })
  }

  const [range, setRange] = useState(getInitialRange())

  const updateRange = (newDuration: [number, number]) => {
    setRange(calcRange({ prevRange: range, duration: newDuration }))
  }

  const save = async () => {
    const data = {
      id: activity.id,
      createdAt: new Date(duration[0]),
      stoppedAt: new Date(duration[1]),
    }
    if ("tasks" in activity) {
      await updatePomodoroMutation(data)
    } else {
      await updateBreakTimeMutation(data)
    }
    if (onSave) {
      onSave()
    }
  }

  return (
    <VStack width={400} spacing={spacing}>
      <RangeSlider
        step={1000 * 60} // minute
        onChange={(val: [number, number]) => setDuration(val)}
        onChangeEnd={(val: [number, number]) => {
          updateRange(val)
        }}
        min={range[0]}
        max={range[1]}
        defaultValue={defaultValue}
      >
        <RangeSliderTrack>
          <RangeSliderFilledTrack />
        </RangeSliderTrack>
        <RangeSliderThumbFixed boxSize={10} index={0}>
          <Text fontSize="xs">{new Date(duration[0]).toLocaleTimeString().substring(0, 5)}</Text>
        </RangeSliderThumbFixed>
        <RangeSliderThumbFixed boxSize={10} index={1}>
          <Box>
            <Text fontSize="xs">{new Date(duration[1]).toLocaleTimeString().substring(0, 5)}</Text>
          </Box>
        </RangeSliderThumbFixed>
      </RangeSlider>
      <HStack>
        <Button size="sm" disabled={!hasChanges} onClick={save}>
          Save
        </Button>
        {onCancel ? (
          <Button size="sm" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </HStack>
    </VStack>
  )
}
